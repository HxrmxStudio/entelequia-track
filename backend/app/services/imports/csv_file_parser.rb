require "csv"

module Imports
  class CsvFileParser < BaseFileParser
    def each_row
      csv = CSV.new(@io, headers: true, return_headers: false)
      csv.each_with_index do |row, idx|
        yield row.to_h, idx + 2 # +2 because CSV is 1-indexed and we skip header
      end
    end

    def headers
      csv = CSV.new(@io, headers: true, return_headers: false)
      csv.shift # Move to first data row
      csv.headers
    end
  end
end
