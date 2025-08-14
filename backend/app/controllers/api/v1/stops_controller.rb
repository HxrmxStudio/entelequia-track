class Api::V1::StopsController < ApplicationController
  before_action :set_route
  before_action :set_stop, only: [:show, :update, :destroy, :complete, :fail]

  # GET /api/v1/routes/:route_id/stops
  def index
    render json: serialize_stops(@route.stops.order(:sequence))
  end

  # GET /api/v1/routes/:route_id/stops/:id
  def show
    render json: serialize_stop(@stop)
  end

  # POST /api/v1/routes/:route_id/stops
  # { stop: { shipment_id, sequence } }
  def create
    stop = @route.stops.new(stop_params)
    stop.sequence ||= (@route.stops.maximum(:sequence) || 0) + 1
    if stop.save
      render json: serialize_stop(stop), status: :created
    else
      render json: { errors: stop.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/routes/:route_id/stops/:id
  def update
    if @stop.update(stop_params)
      render json: serialize_stop(@stop)
    else
      render json: { errors: @stop.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/routes/:route_id/stops/:id
  def destroy
    @stop.destroy!
    head :no_content
  end

  # PATCH /api/v1/routes/:route_id/stops/resequence
  # { order: [stop_id_1, stop_id_2, ...] }
  def resequence
    ids = params.require(:order)
    return render json: { errors: ["order must be an array"] }, status: :unprocessable_entity unless ids.is_a?(Array)

    route_stop_ids = @route.stops.pluck(:id)
    unless ids.map(&:to_s).sort == route_stop_ids.map(&:to_s).sort
      return render json: { errors: ["order must include exactly the route's stop ids"] }, status: :unprocessable_entity
    end

    ActiveRecord::Base.transaction do
      # Two-phase update to avoid unique index collision (route_id, sequence)
      ids.each_with_index do |id, idx|
        stop = @route.stops.find(id)
        stop.update!(sequence: 100000 + idx)
      end
      ids.each_with_index do |id, idx|
        stop = @route.stops.find(id)
        stop.update!(sequence: idx + 1)
      end
    end

    render json: serialize_stops(@route.stops.order(:sequence))
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["One or more stops do not belong to the route"] }, status: :unprocessable_entity
  end

  def complete
    if @stop.status.to_s == "completed"
      return render json: serialize_stop(@stop)
    end

    attributes = { status: "completed" }

    if @stop.update(attributes)
      render json: serialize_stop(@stop)
    else
      render json: { errors: @stop.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def fail
    return render json: { errors: ["reason is required"] }, status: :unprocessable_entity if fail_params[:reason].blank?

    merged_notes = {}
    if @stop.respond_to?(:notes) && @stop.notes.is_a?(Hash)
      merged_notes = @stop.notes.merge("fail_reason" => fail_params[:reason])
    else
      merged_notes = { "fail_reason" => fail_params[:reason] }
    end

    attributes = { status: "failed", notes: merged_notes }
    if @stop.update(attributes)
      render json: serialize_stop(@stop)
    else
      render json: { errors: @stop.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_route
    @route = Route.find(params[:route_id])
  end

  def set_stop
    @stop = @route.stops.find(params[:id])
  end

  def stop_params
    params.require(:stop).permit(:shipment_id, :sequence)
  end

  def fail_params
    params.permit(:reason)
  end

  def serialize_stops(stops)
    stops.map { |s| serialize_stop(s) }
  end

  def serialize_stop(s)
    {
      id: s.id,
      route_id: s.route_id,
      shipment_id: s.shipment_id,
      sequence: s.sequence,
      status: s.status,
      completed_at: s.completed_at,
      notes: s.respond_to?(:notes) ? s.notes : nil
    }
  end
end


