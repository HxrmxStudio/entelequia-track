module Imports
    module Orders
      class ImportsController < ApplicationController
        before_action :authenticate_user!
        before_action -> { require_role!("admin", "ops") }
  
        def dry_run
          return render json: { error: "file_missing" }, status: :bad_request unless params[:file].present?
          format = params[:format] || "csv_exact"
          result = Imports::OrdersCsvImporter.new(
            io: params[:file].tempfile,
            format: format,
            creator_id: @current_user.id,
            dry_run: true
          ).run!
  
          render json: result.to_h
        end
  
        def commit
          return render json: { error: "file_missing" }, status: :bad_request unless params[:file].present?
          format = params[:format] || "csv_exact"
          result = Imports::OrdersCsvImporter.new(
            io: params[:file].tempfile,
            format: format,
            creator_id: @current_user.id,
            dry_run: false
          ).run!
  
          render json: result.to_h, status: :accepted
        end
      end
    end
  end
  
  # Adapter for routing: map top-level ImportsController to namespaced implementation
  class ImportsController < Imports::Orders::ImportsController; end
