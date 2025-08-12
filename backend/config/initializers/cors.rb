Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # In development, explicitly allow the panel at http://localhost:3001
    origins "http://localhost:3001"
    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head],
             expose: ["Authorization"],
             credentials: false
  end

  # TIP: In production, restrict origins via ENV like:
  # allow do
  #   origins ENV.fetch("CORS_ORIGINS")
  #   resource "*", headers: :any, methods: %i[get post put patch delete options head]
  # end
end
  