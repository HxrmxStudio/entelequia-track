require "rails_helper"

RSpec.describe Imports::FileParserFactory do
  let(:csv_content) { "header1,header2\nvalue1,value2" }
  let(:excel_content) { "\x50\x4B\x03\x04\x14\x00\x00\x00\x08\x00" } # Excel signature

  describe ".create" do
    context "with CSV content" do
      let(:io) { StringIO.new(csv_content) }

      it "creates CsvFileParser for CSV content" do
        parser = described_class.create(io: io, format: :exact)
        expect(parser).to be_a(Imports::CsvFileParser)
      end

      it "creates CsvFileParser for CSV content with normalized format" do
        parser = described_class.create(io: io, format: :normalized)
        expect(parser).to be_a(Imports::CsvFileParser)
      end
    end

    context "with Excel content" do
      let(:io) { StringIO.new(excel_content) }

      it "creates ExcelFileParser for Excel content" do
        parser = described_class.create(io: io, format: :exact)
        expect(parser).to be_a(Imports::ExcelFileParser)
      end

      it "creates ExcelFileParser for Excel content with normalized format" do
        parser = described_class.create(io: io, format: :normalized)
        expect(parser).to be_a(Imports::ExcelFileParser)
      end
    end

    context "with unsupported content" do
      let(:io) { StringIO.new("binary\x00\x01\x02\x03") }

      it "raises an error for unrecognized content" do
        expect {
          described_class.create(io: io, format: :exact)
        }.to raise_error("Unable to detect file type. Please ensure the file is a valid CSV or Excel file.")
      end
    end
  end
end
