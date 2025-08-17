Rails.application.routes.draw do
  get "users/index"
  get "users/show"
  get "users/create"
  get "users/update"
  get "users/destroy"
  # Comment out ActionCable for now to avoid test environment issues
  mount ActionCable.server => "/cable"

  post "/auth/login", to: "auth#login"
  post "/auth/refresh", to: "auth#refresh"
  post "/auth/logout", to: "auth#logout"
  post "/auth/register", to: "auth#register"
  get "/auth/session", to: "auth#session"
  get "/health", to: "health#show"

  post "/imports/orders/dry_run", to: "imports#dry_run"
  post "/imports/orders/commit",  to: "imports#commit"

  resources :orders, only: [:index, :show, :create, :update]

  resources :locations, only: [:create]
  resources :couriers
  resources :users, only: [:index, :show, :create, :update, :destroy]
  get "/realtime/stream", to: "realtime#stream"

  resources :shipments, only: [:index, :show, :create, :update] do
    member do
      post :assign
      post :otp
    end
    resources :proofs, only: [:create], module: :shipments
    resources :events, only: [:create], module: :shipments
  end
  
  namespace :public do
    get "track/:code", to: "track#show"
  end

  namespace :api do
    namespace :v1 do
      # Alerts top-level API
      resources :alerts, only: [:index, :show] do
        member do
          post :resolve
        end
      end

      resources :routes, only: [:index, :show, :create, :update, :destroy] do
        member do
          patch :assign_courier   # { courier_id }
          patch :start            # opcional: marcar en curso
          patch :complete         # opcional: marcar finalizada
        end
        resources :stops, only: [:index, :show, :create, :update, :destroy] do
          collection do
            patch :resequence     # { order: [stop_id,...] }
          end
          resources :alerts, only: [:index, :update] do
            member do
              post :resolve # alternativa a PATCH status
            end
          end
          member do
            patch :complete       # marcar stop completada (ej. delivered)
            patch :fail           # marcar stop fallida (ej. attempt)
          end
        end
      end

      post "/proofs/presign", to: "proofs#presign"
      post "/proofs", to: "proofs#create"
      get "/proofs/:id/signed_url", to: "proofs#signed_url"
    end
  end

end
