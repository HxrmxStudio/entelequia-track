Rails.application.config.middleware.insert_before 0, Rack::Cors do
  # Vercel deployment origins (covers all possible Vercel domains)
  allow do
    origins /^https?:\/\/.*\.vercel\.app$/

    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head],
             expose: ["Authorization", "Set-Cookie", "Content-Type"],
             credentials: true
  end

  # Specific Vercel app domains
  allow do
    origins "https://entelequia-track-420.vercel.app"

    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head],
             expose: ["Authorization", "Set-Cookie", "Content-Type"],
             credentials: true
  end

  # Development origins
  allow do
    origins "http://localhost:3001"

    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head],
             expose: ["Authorization", "Set-Cookie", "Content-Type"],
             credentials: true
  end
end
  