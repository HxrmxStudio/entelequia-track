module Imports
  class FileParserFactory
    def self.create(io:, format:)
      # Auto-detect file type from content
      file_type = detect_file_type(io)
      
      case file_type
      when :excel
        ExcelFileParser.new(io: io, format: format)
      when :csv
        CsvFileParser.new(io: io, format: format)
      else
        raise "Unable to detect file type. Please ensure the file is a valid CSV or Excel file."
      end
    end

    private

    def self.detect_file_type(io)
      # Reset IO position to beginning
      io.rewind
      
      # Try to detect as Excel first
      begin
        # Read first few bytes to check for Excel signature
        header = io.read(8)
        io.rewind
        
        if header.start_with?("\x50\x4B\x03\x04") || header.start_with?("\x50\x4B\x05\x06") || header.start_with?("\x50\x4B\x07\x08")
          # This is a ZIP-based format (Excel .xlsx, .xlsm, etc.)
          return :excel
        end
      rescue
        # If reading fails, continue to CSV detection
      end
      
      # Try to detect as CSV
      begin
        io.rewind
        first_line = io.readline
        io.rewind
        
        # More strict CSV detection: check if first line contains commas and looks like text
        if first_line.include?(',') && first_line.bytes.all? { |b| b < 128 } && first_line.strip.length > 0
          return :csv
        end
      rescue
        # If reading fails, we can't determine the type
      end
      
      # If we can't determine, raise an error instead of defaulting
      raise "Unable to detect file type. Please ensure the file is a valid CSV or Excel file."
    end
  end
end
