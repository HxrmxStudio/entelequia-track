Rails.application.routes.draw do
  post "/auth/login", to: "auth#login"
  get "/health", to: "health#show"

  post "/imports/orders/dry_run", to: "imports#dry_run"
  post "/imports/orders/commit",  to: "imports#commit"

  resources :orders, only: [:index, :show, :create, :update]
  resources :shipments, only: [:index, :show, :create, :update] do
    member do
      post :assign
      post :otp
    end
  end

  resources :locations, only: [:create]
  get "/realtime/stream", to: "realtime#stream"
end
