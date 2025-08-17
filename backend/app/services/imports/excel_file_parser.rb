require "roo"

module Imports
  class ExcelFileParser < BaseFileParser
    def each_row
      spreadsheet = Roo::Spreadsheet.open(@io)
      sheet = spreadsheet.sheet(0) # Use first sheet
      
      Rails.logger.info "Import: Excel file has #{sheet.last_row} rows"
      Rails.logger.info "Import: Headers: #{sheet.row(1)}"
      
      # Skip header row
      (2..sheet.last_row).each do |row_num|
        row_data = {}
        sheet.row(row_num).each_with_index do |cell_value, col_idx|
          header = sheet.row(1)[col_idx]&.to_s&.strip
          next unless header.present?
          row_data[header] = cell_value&.to_s&.strip
        end
        
        Rails.logger.info "Import: Row #{row_num} data: #{row_data}"
        yield row_data, row_num
      end
    end

    def headers
      spreadsheet = Roo::Spreadsheet.open(@io)
      sheet = spreadsheet.sheet(0)
      sheet.row(1).map { |header| header&.to_s&.strip }.compact
    end
  end
end
