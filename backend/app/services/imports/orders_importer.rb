require "csv"

module Imports
  class OrdersImporter
    attr_reader :total, :created, :updated, :errors

    def initialize(io:, format:, creator_id:, dry_run: true)
      @io = io
      @format = format.to_sym
      @parser = Imports::FileParserFactory.create(io: io, format: format)
      @mapper = Imports::OrderRowMapper.new(format: @format)
      @creator_id = creator_id
      @dry_run = dry_run
      @total = 0
      @created = 0
      @updated = 0
      @errors = []
    end

    def run!
      # Process each row individually to prevent transaction abortion
      @parser.each_row do |row, row_number|
        @total += 1
        mapped = @mapper.call(row)
        
        if mapped[:external_ref].blank?
          @errors << { row: row_number, message: "Missing external reference" }
          next
        end

        if @dry_run
          validate_row(mapped, row_number)
        else
          # Process each row in its own transaction
          ActiveRecord::Base.transaction do
            process_row(mapped, row_number)
          end
        end
      end

      self
    end

    private

    def validate_row(mapped, row_number)
      # Basic validation for dry run - be more lenient with business cases
      if mapped[:customer_name].blank?
        @errors << { row: row_number, message: "Missing customer name - will use default customer" }
      end
      
      # Allow zero amounts (could be free orders, promotions, etc.)
      if mapped[:amount_cents].nil?
        @errors << { row: row_number, message: "Invalid amount format" }
      end
    end

    def process_row(mapped, row_number)
      begin
        Rails.logger.info "Import: Starting to process row #{row_number} for order #{mapped[:external_ref]}"
        
        order = Order.find_or_initialize_by(external_ref: mapped[:external_ref])
        
        if order.new_record?
          @created += 1
          Rails.logger.info "Import: Creating new order #{mapped[:external_ref]}"
        else
          @updated += 1
          Rails.logger.info "Import: Updating existing order #{mapped[:external_ref]}"
        end

        # Handle missing customer name by creating a default customer
        customer_name = mapped[:customer_name].presence || "Cliente sin nombre"
        Rails.logger.info "Import: Looking for customer with name: '#{customer_name}'"
        
        customer = Customer.find_or_create_by(name: customer_name)
        Rails.logger.info "Import: Customer found/created: #{customer.id} (#{customer.name})"
        
        if customer.errors.any?
          Rails.logger.error "Import: Customer validation errors: #{customer.errors.full_messages}"
          @errors << { row: row_number, message: "Customer validation failed: #{customer.errors.full_messages.join(', ')}" }
          return
        end

        # Find or create address (basic for now)
        Rails.logger.info "Import: Creating address for order"
        address = Address.find_or_create_by(line1: "Imported address", country: "Argentina") do |a|
          a.city = "Buenos Aires"
          a.province_state = "Buenos Aires"
        end
        Rails.logger.info "Import: Address found/created: #{address.id}"
        
        if address.errors.any?
          Rails.logger.error "Import: Address validation errors: #{address.errors.full_messages}"
          @errors << { row: row_number, message: "Address validation failed: #{address.errors.full_messages.join(', ')}" }
          return
        end

        order.assign_attributes(
          customer: customer,
          address: address,
          channel: mapped[:channel] || "web",
          status: mapped[:status] || "received",
          amount_cents: mapped[:amount_cents] || 0, # Allow zero amounts
          currency: "ARS",
          metadata: { 
            imported_at: Time.current, 
            source: @format.to_s,
            notes: build_import_notes(mapped)
          }
        )

        # Debug: Log what we're trying to save
        Rails.logger.info "Import: Attempting to save order #{mapped[:external_ref]} with attributes: #{order.attributes.slice('external_ref', 'customer_id', 'address_id', 'channel', 'status', 'amount_cents')}"
        
        # Check validation before saving
        unless order.valid?
          Rails.logger.error "Import: Validation failed for order #{mapped[:external_ref]}: #{order.errors.full_messages}"
          @errors << { row: row_number, message: "Validation failed: #{order.errors.full_messages.join(', ')}" }
          return
        end
        
        if order.save!
          Rails.logger.info "Import: Successfully saved order #{mapped[:external_ref]}"
        else
          Rails.logger.error "Import: Failed to save order #{mapped[:external_ref]}: #{order.errors.full_messages}"
          @errors << { row: row_number, message: "Save failed: #{order.errors.full_messages.join(', ')}" }
        end
      rescue => e
        Rails.logger.error "Import: Exception processing row #{row_number}: #{e.class} - #{e.message}"
        Rails.logger.error "Import: Backtrace: #{e.backtrace.first(5).join("\n")}"
        @errors << { row: row_number, message: "Error processing row: #{e.message}" }
      end
    end

    def build_import_notes(mapped)
      notes = []
      notes << "Customer name was empty - using default" if mapped[:customer_name].blank?
      notes << "Amount is zero - may be free order" if mapped[:amount_cents]&.zero?
      notes.join("; ") if notes.any?
    end
  end
end
