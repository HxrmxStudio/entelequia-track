require "rails_helper"

RSpec.describe Imports::OrdersImporter do
  let(:csv_content) do
    "Pedido #,Cliente,Fecha,Monto,Entrega,Estado\n" \
    "12345,John Doe,09/08/2025,ARS 1000.00,Envío - Moto,En preparación\n" \
    "12346,Jane Smith,09/08/2025,ARS 1500.00,Envío - Correo,Pendiente de pago"
  end

  let(:user) { create(:user) }

  describe "#run!" do
    context "with CSV format" do
      let(:importer) do
        described_class.new(
          io: StringIO.new(csv_content),
          format: :exact,
          creator_id: user.id,
          dry_run: true
        )
      end

      it "validates all rows without persisting" do
        result = importer.run!
        expect(result.total).to eq(2)
        expect(result.errors).to be_empty
      end

      it "does not create any records" do
        expect { importer.run! }.not_to change { Order.count }
      end
    end

    context "with dry_run: false" do
      let(:importer) do
        described_class.new(
          io: StringIO.new(csv_content),
          format: :exact,
          creator_id: user.id,
          dry_run: false
        )
      end

      it "creates orders with correct mappings" do
        expect { importer.run! }.to change { Order.count }.by(2)
        
        order = Order.last
        expect(order.external_ref).to eq("12346")
        expect(order.amount_cents).to eq(150000)
        expect(order.currency).to eq("ARS")
      end

      it "creates customers correctly" do
        expect { importer.run! }.to change { Customer.count }.by(2)
        
        customer = Customer.last
        expect(customer.name).to eq("Jane Smith")
      end

      it "maps delivery types to channels correctly" do
        importer.run!
        
        moto_order = Order.find_by(external_ref: "12345")
        expect(moto_order.channel).to eq("moto")
        
        correo_order = Order.find_by(external_ref: "12346")
        expect(correo_order.channel).to eq("correo")
      end

      it "maps statuses correctly" do
        importer.run!
        
        preparing_order = Order.find_by(external_ref: "12345")
        expect(preparing_order.status).to eq("preparing")
        
        pending_order = Order.find_by(external_ref: "12346")
        expect(pending_order.status).to eq("pending_payment")
      end

      it "handles different currencies correctly" do
        usd_content = "Pedido #,Cliente,Fecha,Monto,Entrega,Estado\n" \
                     "12347,USD User,09/08/2025,USD 50.00,Envío - Moto,En preparación"
        
        usd_importer = described_class.new(
          io: StringIO.new(usd_content),
          format: :exact,
          creator_id: user.id,
          dry_run: false
        )
        
        usd_importer.run!
        order = Order.find_by(external_ref: "12347")
        expect(order.amount_cents).to eq(5000)
      end
    end

    context "with invalid data" do
      let(:invalid_content) do
        "Pedido #,Cliente,Fecha,Monto,Entrega,Estado\n" \
        ",John Doe,09/08/2025,ARS 1000.00,Envío - Moto,En preparación\n" \
        "12348,,09/08/2025,ARS 1000.00,Envío - Moto,En preparación\n" \
        "12349,John Doe,09/08/2025,invalid,Envío - Moto,En preparación"
      end

      let(:importer) do
        described_class.new(
          io: StringIO.new(invalid_content),
          format: :exact,
          creator_id: user.id,
          dry_run: false
        )
      end

      it "handles invalid rows gracefully" do
        result = importer.run!
        expect(result.errors.length).to eq(1) # Only truly invalid amount format
        
        # Missing customer name and zero amounts are now handled gracefully
        expect(result.errors.map { |e| e[:message] }).to include("Invalid amount format")
      end

      it "creates orders with missing customer names using default" do
        # Test that orders with missing customer names are processed
        missing_customer_content = "Pedido #,Cliente,Fecha,Monto,Entrega,Estado\n" \
                                  "12350,,09/08/2025,ARS 1000.00,Envío - Moto,En preparación"
        
        missing_customer_importer = described_class.new(
          io: StringIO.new(missing_customer_content),
          format: :exact,
          creator_id: user.id,
          dry_run: false
        )
        
        expect { missing_customer_importer.run! }.to change { Order.count }.by(1)
        
        order = Order.find_by(external_ref: "12350")
        expect(order.customer.name).to eq("Cliente sin nombre")
        expect(order.metadata["notes"]).to include("Customer name was empty")
      end

      it "creates orders with zero amounts" do
        # Test that orders with zero amounts are processed
        zero_amount_content = "Pedido #,Cliente,Fecha,Monto,Entrega,Estado\n" \
                             "12351,Free Customer,09/08/2025,ARS 0.00,Envío - Moto,En preparación"
        
        zero_amount_importer = described_class.new(
          io: StringIO.new(zero_amount_content),
          format: :exact,
          creator_id: user.id,
          dry_run: false
        )
        
        expect { zero_amount_importer.run! }.to change { Order.count }.by(1)
        
        order = Order.find_by(external_ref: "12351")
        expect(order.amount_cents).to eq(0)
        expect(order.metadata["notes"]).to include("Amount is zero")
      end
    end

    context "with duplicate external_ref" do
      let!(:existing_order) { create(:order, external_ref: "12345") }
      
      let(:importer) do
        described_class.new(
          io: StringIO.new(csv_content),
          format: :exact,
          creator_id: user.id,
          dry_run: false
        )
      end

      it "updates existing order instead of creating new one" do
        expect { importer.run! }.to change { Order.count }.by(1) # Only 1 new order
        
        updated_order = Order.find_by(external_ref: "12345")
        expect(updated_order.id).to eq(existing_order.id)
        expect(updated_order.customer.name).to eq("John Doe")
      end
    end
  end
end
