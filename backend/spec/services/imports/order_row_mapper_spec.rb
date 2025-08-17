require "rails_helper"

RSpec.describe Imports::OrderRowMapper do
  let(:csv_row) do
    {
      "Pedido #" => "12345",
      "Cliente" => "John Doe",
      "Fecha" => "09/08/2025",
      "Monto" => "ARS 1000.00",
      "Entrega" => "Envío - Moto",
      "Estado" => "En preparación"
    }
  end

  let(:normalized_row) do
    {
      "external_ref" => "12345",
      "customer_name" => "John Doe",
      "date" => "09/08/2025",
      "amount_cents" => "1000.00",
      "channel" => "Envío - Moto",
      "delivery_method" => "Envío - Moto",
      "status" => "En preparación"
    }
  end

  describe "#call" do
    context "with exact format" do
      let(:mapper) { described_class.new(format: :exact) }

      it "maps CSV row with original headers" do
        result = mapper.call(csv_row)
        
        expect(result[:external_ref]).to eq("12345")
        expect(result[:customer_name]).to eq("John Doe")
        expect(result[:date]).to eq(Date.parse("09/08/2025"))
        expect(result[:amount_cents]).to eq(100000)
        expect(result[:channel]).to eq("moto")
        expect(result[:delivery_method]).to eq("courier")
        expect(result[:status]).to eq("preparing")
      end
    end

    context "with normalized format" do
      let(:mapper) { described_class.new(format: :normalized) }

      it "maps normalized row with fallback to original headers" do
        result = mapper.call(normalized_row)
        
        expect(result[:external_ref]).to eq("12345")
        expect(result[:customer_name]).to eq("John Doe")
        expect(result[:date]).to eq(Date.parse("09/08/2025"))
        expect(result[:amount_cents]).to eq(100000)
        expect(result[:channel]).to eq("moto")
        expect(result[:delivery_method]).to eq("courier")
        expect(result[:status]).to eq("preparing")
      end

      it "falls back to original headers when normalized fields are missing" do
        mixed_row = { "external_ref" => "12345", "Cliente" => "John Doe" }
        result = mapper.call(mixed_row)
        
        expect(result[:external_ref]).to eq("12345")
        expect(result[:customer_name]).to eq("John Doe")
      end
    end

    context "with unsupported format" do
      it "raises an error" do
        mapper = described_class.new(format: :unsupported)
        expect { mapper.call(csv_row) }.to raise_error("Unsupported format: unsupported. Use :exact or :normalized")
      end
    end
  end

  describe "#parse_amount" do
    let(:mapper) { described_class.new(format: :exact) }

    it "parses ARS currency correctly" do
      expect(mapper.send(:parse_amount, "ARS 1000.00")).to eq(100000)
      expect(mapper.send(:parse_amount, "ARS 1,500.50")).to eq(150050)
    end

    it "parses USD currency correctly" do
      expect(mapper.send(:parse_amount, "USD 50.00")).to eq(5000)
    end

    it "handles amounts without currency prefix" do
      expect(mapper.send(:parse_amount, "1000.00")).to eq(100000)
      expect(mapper.send(:parse_amount, "1,500.50")).to eq(150050)
    end

    it "returns 0 for invalid amounts" do
      expect(mapper.send(:parse_amount, "invalid")).to eq(0)
      expect(mapper.send(:parse_amount, nil)).to eq(0)
    end
  end

  describe "#map_delivery_to_channel" do
    let(:mapper) { described_class.new(format: :exact) }

    it "maps delivery methods to channels correctly" do
      expect(mapper.send(:map_delivery_to_channel, "Envío - Moto")).to eq("moto")
      expect(mapper.send(:map_delivery_to_channel, "Envío - Correo")).to eq("correo")
      expect(mapper.send(:map_delivery_to_channel, "DHL")).to eq("dhl")
      expect(mapper.send(:map_delivery_to_channel, "Retiro en sucursal Belgrano")).to eq("sucursal_belgrano")
    end

    it "returns web for unknown delivery methods" do
      expect(mapper.send(:map_delivery_to_channel, "Unknown Method")).to eq("web")
    end
  end

  describe "#map_status" do
    let(:mapper) { described_class.new(format: :exact) }

    it "maps statuses correctly" do
      expect(mapper.send(:map_status, "En preparación")).to eq("preparing")
      expect(mapper.send(:map_status, "Pendiente de pago")).to eq("pending_payment")
      expect(mapper.send(:map_status, "Completado")).to eq("completed")
      expect(mapper.send(:map_status, "En camino")).to eq("in_transit")
    end

    it "returns received for unknown statuses" do
      expect(mapper.send(:map_status, "Unknown Status")).to eq("received")
    end
  end

  describe "#parse_date" do
    let(:mapper) { described_class.new(format: :exact) }

    it "parses dates correctly" do
      expect(mapper.send(:parse_date, "09/08/2025")).to eq(Date.parse("09/08/2025"))
      expect(mapper.send(:parse_date, "2025-08-09")).to eq(Date.parse("2025-08-09"))
    end

    it "returns nil for invalid dates" do
      expect(mapper.send(:parse_date, "invalid")).to be_nil
      expect(mapper.send(:parse_date, nil)).to be_nil
    end
  end
end
