require "csv"

module Imports
  class OrdersImporter
    Result = Struct.new(:rows_total, :rows_valid, :rows_invalid, :errors, keyword_init: true)

    REQUIRED = %i[external_ref amount_cents].freeze

    def initialize(io:, format:, creator_id:, dry_run: true)
      @io = io
      @format = format.to_sym
      @parser = Imports::FileParserFactory.create(io: io, format: format)
      @mapper = Imports::OrderRowMapper.new(format: @format)
      @creator_id = creator_id
      @dry_run = dry_run
      @errors = []
      @valid = 0
      @invalid = 0
      @total = 0
    end

    def run!
      ActiveRecord::Base.transaction do
        @parser.each_row do |row, row_number|
          @total += 1
          mapped = @mapper.call(row)
          if valid_row?(mapped)
            @valid += 1
            persist_row(mapped) unless @dry_run
          else
            @invalid += 1
            @errors << { row_number: row_number, message: "Campos requeridos faltantes o inválidos" }
          end
        end
        raise ActiveRecord::Rollback if @dry_run
      end

      Result.new(rows_total: @total, rows_valid: @valid, rows_invalid: @invalid, errors: @errors)
    end

    private

    def valid_row?(mapped)
      REQUIRED.all? { |k| mapped[k].present? } && mapped[:amount_cents].to_i >= 0
    end

    def persist_row(m)
      customer = Customer.find_or_create_by!(name: m[:customer_name].presence || "Sin nombre")
      address  = if m[:address_line].present?
                   Address.create!(line1: m[:address_line], city: m[:city], province_state: m[:province_state], postal_code: m[:postal_code])
                 else
                   nil
                 end

      order = Order.find_or_initialize_by(external_ref: m[:external_ref])
      order.assign_attributes(
        customer: customer,
        address: address,
        channel: m[:channel] || "web",
        status: m[:status] || "received",
        amount_cents: m[:amount_cents],
        currency: "ARS",
        metadata: { imported_at: Time.current, source: @format.to_s }
      )
      order.save!

      Shipment.find_or_create_by!(order_id: order.id) do |s|
        s.status = "queued"
        s.delivery_method = m[:delivery_method] || "courier"
        s.qr_token = SecureRandom.uuid
        s.sla_due_at = 2.hours.from_now
      end
    end
  end
end
