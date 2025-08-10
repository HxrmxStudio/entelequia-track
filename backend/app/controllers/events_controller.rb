module Shipments
    class EventsController < ApplicationController
      before_action :authenticate_user!
  
      # POST /shipments/:shipment_id/events { type_key, payload? }
      def create
        s = Shipment.find(params[:shipment_id])
        type_key = params.require(:type_key)
        ev = Event.create!(
          type_key: type_key,
          subject_id: s.id,
          actor_kind: @current_user.role,
          actor_id: @current_user.id,
          payload: params[:payload] || {},
          occurred_at: Time.current
        )
        RealtimeBus.publish("shipment.event", ev.as_json)
        render json: ev, status: :created
      rescue ActiveRecord::RecordNotFound
        render json: { error: "shipment_not_found" }, status: :not_found
      end
    end
  end

  # Adapter at top-level to satisfy routes autoload without moving files
  class EventsController < Shipments::EventsController; end
  