class OrdersController < ApplicationController
    before_action :authenticate_user!
    before_action -> { require_role!("admin", "ops") }, except: [:index, :show]
  
      def index
    scope = Order.all
    
    # Apply status filter
    scope = scope.where(status: params[:status]) if params[:status].present?
    
    # Apply channel filter
    scope = scope.where(channel: params[:channel]) if params[:channel].present?
    
    # Apply amount range filter
    if params[:amount_range].present?
      case params[:amount_range]
      when 'low'
        scope = scope.where('amount_cents < ?', 10000) # Less than $100
      when 'medium'
        scope = scope.where('amount_cents >= ? AND amount_cents <= ?', 10000, 50000) # $100 - $500
      when 'high'
        scope = scope.where('amount_cents > ?', 50000) # More than $500
      end
    end
    
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
  