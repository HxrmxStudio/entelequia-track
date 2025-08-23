Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "https://entelequia-track-420.vercel.app"

    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head],
             expose: ["Authorization"],
             credentials: true
  end

  # Development origins
  allow do
    origins "http://localhost:3001"

    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head],
             expose: ["Authorization"],
             credentials: true
  end
end
  