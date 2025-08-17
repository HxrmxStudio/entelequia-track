module Imports
  class BaseFileParser
    def initialize(io:, format:)
      @io = io
      @format = format.to_sym
    end

    def each_row
      raise NotImplementedError, "Subclasses must implement #each_row"
    end

    def headers
      raise NotImplementedError, "Subclasses must implement #headers"
    end

    private

    def detect_file_format
      case @format
      when :csv_exact, :csv_normalized
        :csv
      when :xlsx_exact, :xlsx_normalized
        :xlsx
      else
        raise "Unknown format: #{@format}"
      end
    end
  end
end
