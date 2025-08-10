class OrdersController < ApplicationController
    before_action :authenticate_user!
    before_action -> { require_role!("admin", "ops") }, except: [:index, :show]
  
    def index
      scope = Order.all
      scope = scope.where(status: params[:status]) if params[:status].present?
      render json: scope.order(created_at: :desc).limit(100)
    end
  
    def show
      render json: Order.find(params[:id])
    end
  
    def create
      o = Order.create!(order_params)
      render json: o, status: :created
    end
  
    def update
      o = Order.find(params[:id])
      o.update!(order_params)
      render json: o
    end
  
    private
  
    def order_params
      params.permit(:external_ref, :status, :amount_cents, :currency, :channel, metadata: {})
    end
  end
  