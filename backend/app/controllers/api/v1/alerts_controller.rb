module Api
  module V1
    class AlertsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_alert, only: [:show, :update, :resolve]

      # GET /api/v1/alerts?status=open&type=gps_offline&since=2025-08-14T00:00:00Z
      def index
        scope = Alert.order(created_at: :desc)
        scope = scope.where(status: params[:status]) if params[:status].present?
        scope = scope.where(code: params[:type]) if params[:type].present?
        if params[:resource_type].present?
          case params[:resource_type]
          when "Courier"
            scope = scope.where.not(courier_id: nil)
          when "Shipment"
            scope = scope.where.not(shipment_id: nil)
          when "Route"
            scope = scope.where.not(route_id: nil)
          end
        end
        if params[:resource_id].present?
          scope = scope.where("courier_id = :id OR shipment_id = :id OR route_id = :id", id: params[:resource_id])
        end
        scope = scope.where("last_detected_at >= ?", Time.iso8601(params[:since])) if params[:since].present?
        scope = scope.limit([params.fetch(:limit, 100).to_i, 500].min)
        render json: scope.map { |a| serialize(a) }
      end

      def show
        render json: serialize(@alert)
      end

      # PATCH /api/v1/alerts/:id  { status: "resolved", note: "ok" }
      def update
        if params[:status] == "resolved"
          @alert.resolve!(note: params[:note])
          publish_resolution(@alert)
        end
        render json: serialize(@alert)
      end

      # POST /api/v1/alerts/:id/resolve { note: "..." }
      def resolve
        @alert.resolve!(note: params[:note])
        publish_resolution(@alert)
        render json: serialize(@alert)
      end

      private

      def set_alert
        @alert = Alert.find(params[:id])
      end

      def serialize(a)
        {
          id: a.id,
          type: a.code,
          status: a.status,
          resource: resource_ref(a),
          payload: a.data,
          created_at: a.created_at&.iso8601,
          resolved_at: a.status == "resolved" ? (a.data["resolved_at"] || a.updated_at&.iso8601) : nil
        }
      end

      def resource_ref(a)
        if a.courier_id
          { type: "Courier", id: a.courier_id }
        elsif a.shipment_id
          { type: "Shipment", id: a.shipment_id }
        elsif a.route_id
          { type: "Route", id: a.route_id }
        else
          { type: "Unknown", id: nil }
        end
      end

      def publish_resolution(alert)
        RealtimeBus.publish("alert.resolved", { id: alert.id, type: alert.code, resolved_at: Time.current.iso8601 })
      end
    end
  end
end
