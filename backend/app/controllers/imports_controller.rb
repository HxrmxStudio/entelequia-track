module Imports
  module Orders
    class ImportsController < ApplicationController
      before_action :authenticate_user!
      before_action -> { require_role!("admin", "ops") }

      def dry_run
        return render json: { error: "file_missing" }, status: :bad_request unless params[:file].present?
        format = params[:format] || "exact"
        
        result = Imports::OrdersImporter.new(
          io: params[:file].tempfile,
          format: format,
          creator_id: @current_user.id,
          dry_run: true
        ).run!

        # Separate warnings from errors
        warnings = result.errors.select { |e| e[:message].include?("will use default") || e[:message].include?("may be") }
        errors = result.errors.reject { |e| e[:message].include?("will use default") || e[:message].include?("may be") }

        render json: {
          rows_total: result.total,
          rows_valid: result.total - errors.length,
          rows_invalid: errors.length,
          warnings: warnings.map { |e| { row_number: e[:row], message: e[:message] } },
          errors: errors.map { |e| { row_number: e[:row], message: e[:message] } }
        }
      end

      def commit
        return render json: { error: "file_missing" }, status: :bad_request unless params[:file].present?
        format = params[:format] || "exact"
        
        result = Imports::OrdersImporter.new(
          io: params[:file].tempfile,
          format: format,
          creator_id: @current_user.id,
          dry_run: false
        ).run!

        # Count warnings vs errors
        warnings = result.errors.select { |e| e[:message].include?("will use default") || e[:message].include?("may be") }
        errors = result.errors.reject { |e| e[:message].include?("will use default") || e[:message].include?("may be") }

        render json: {
          message: "Import completed successfully",
          total: result.total,
          created: result.created,
          updated: result.updated,
          warnings: warnings.length,
          errors: errors.length
        }, status: :accepted
      end
    end
  end
end

# Adapter for routing: map top-level ImportsController to namespaced implementation
class ImportsController < Imports::Orders::ImportsController; end
