class Api::V1::RoutesController < ApplicationController
  before_action :set_route, only: [:show, :update, :destroy, :assign_courier, :start, :complete]

  # GET /api/v1/routes?date=2025-08-14&courier_id=...&status=planned
  def index
    routes = Route.includes(:courier, :stops)

    if params[:date].present?
      parsed_date = begin
        Date.parse(params[:date].to_s)
      rescue ArgumentError
        nil
      end
      routes = routes.where(service_date: parsed_date) if parsed_date
    end

    routes = routes.where(courier_id: params[:courier_id]) if params[:courier_id].present?
    routes = routes.where(status: params[:status]) if params[:status].present?

    render json: serialize_routes(routes)
  end

  # GET /api/v1/routes/:id
  def show
    render json: serialize_route(@route)
  end

  # POST /api/v1/routes
  # { route: { service_date: "2025-08-14", courier_id: "...", status: "planned" } }
  def create
    route = Route.new(route_params)
    if route.save
      render json: serialize_route(route), status: :created
    else
      render json: { errors: route.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/routes/:id
  def update
    if @route.update(route_params)
      render json: serialize_route(@route)
    else
      render json: { errors: @route.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/routes/:id
  def destroy
    @route.destroy!
    head :no_content
  end

  # PATCH /api/v1/routes/:id/assign_courier { courier_id: "..." }
  def assign_courier
    courier_id = params.require(:courier_id)
    courier = Courier.find(courier_id)

    if @route.update(courier: courier)
      render json: serialize_route(@route)
    else
      render json: { errors: @route.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Courier not found"] }, status: :not_found
  rescue ActiveRecord::RecordNotUnique
    render json: { errors: ["Courier already has a route for this service_date"] }, status: :unprocessable_entity
  end

  # PATCH /api/v1/routes/:id/start
  def start
    current_status = @route.status.to_s
    if current_status == "completed"
      return render json: { errors: ["Route already completed"] }, status: :unprocessable_entity
    end

    attributes = { status: "in_progress" }

    if @route.update(attributes)
      render json: serialize_route(@route)
    else
      render json: { errors: @route.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/routes/:id/complete
  def complete
    if @route.status.to_s == "completed"
      return render json: serialize_route(@route)
    end

    attributes = { status: "completed" }

    if @route.update(attributes)
      render json: serialize_route(@route)
    else
      render json: { errors: @route.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_route
    @route = Route.includes(:stops, :courier).find(params[:id])
  end

  def route_params
    params.require(:route).permit(:service_date, :courier_id, :status)
  end

  # Simple JSON serializer to keep controller output stable
  def serialize_routes(routes)
    routes.order(:service_date, :id).map { |r| serialize_route(r) }
  end

  def serialize_route(r)
    ordered_stops = if r.association(:stops).loaded?
      r.stops
    else
      r.stops.order(:sequence)
    end

    {
      id: r.id,
      service_date: r.service_date&.to_date,
      status: r.status,
      courier: r.courier && { id: r.courier.id, name: r.courier.name },
      stops: ordered_stops.map { |s|
        {
          id: s.id,
          sequence: s.sequence,
          status: s.status,
          shipment_id: s.shipment_id
        }
      }
    }
  end
end


