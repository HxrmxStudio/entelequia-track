Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Allow multiple origins for development and production
    origins(
      "http://localhost:3001",        # Development panel
      "http://localhost:3000",        # Development alternatives
      "https://entelequia-track-420.vercel.app",  # Production Vercel domain
      "https://entelequia-track.vercel.app",       # Alternative Vercel domain
      ENV.fetch("PANEL_ORIGIN", nil)   # Custom origin from environment
    ).compact

    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head],
             expose: ["Authorization"],
             credentials: true
  end
end
  