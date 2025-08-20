namespace :dev do
  desc "Seed development database with realistic test data"
  task :seed, [:scale] => :environment do |t, args|
    unless Rails.env.development?
      puts "🚫 This task is only available in development environment"
      exit 1
    end

    scale = args[:scale]&.to_i || ENV.fetch("SEED_SCALE", "1").to_i
    
    puts "🌱 Seeding development database..."
    puts "Scale: #{scale}x"
    puts "Use CTRL+C to cancel if this is not what you want"
    puts
    
    # Give user a moment to cancel
    sleep 2
    
    # Load and run the seeder
    require_relative "../../db/seeds/entelequia_seeder"
    
    seeder = EntelequiaSeeder.new(scale)
    seeder.run!
  end

  desc "Reset and seed development database"
  task :reset_seed, [:scale] => :environment do |t, args|
    unless Rails.env.development?
      puts "🚫 This task is only available in development environment"
      exit 1
    end

    puts "⚠️  This will DESTROY all data and reseed the database!"
    puts "Type 'yes' to continue:"
    
    input = STDIN.gets.chomp
    unless input.downcase == "yes"
      puts "Cancelled."
      exit 0
    end

    scale = args[:scale]&.to_i || ENV.fetch("SEED_SCALE", "1").to_i
    
    puts "🗑️  Resetting database..."
    Rake::Task["db:drop"].invoke
    Rake::Task["db:create"].invoke
    Rake::Task["db:migrate"].invoke
    
    puts "🌱 Seeding fresh database..."
    require_relative "../../db/seeds/entelequia_seeder"
    
    seeder = EntelequiaSeeder.new(scale)
    seeder.run!
  end

  desc "Clean seed-generated data (keeps manually created records)"
  task :clean_seed => :environment do
    unless Rails.env.development?
      puts "🚫 This task is only available in development environment"
      exit 1
    end

    puts "🧹 Cleaning seed-generated data..."
    
    # Remove records that match seeding patterns
    Event.where("type_key LIKE 'shipment.%'").delete_all
    Alert.where("message LIKE '%GPS signal lost%' OR message LIKE '%running behind%'").delete_all
    Proof.where("photo_key LIKE 'proofs/%' OR device_hash LIKE '%device_%'").delete_all
    Location.where(app_version: ["1.0.0", "1.0.1", "1.1.0"]).delete_all
    
    # Remove routes and stops for seeded couriers
    seeded_couriers = Courier.where("code LIKE 'C-%'")
    Route.where(courier: seeded_couriers).destroy_all
    
    # Remove shipments for seeded orders
    seeded_orders = Order.where("external_ref LIKE 'ORD-%'")
    Shipment.where(order: seeded_orders).destroy_all
    seeded_orders.destroy_all
    
    # Remove seeded customers and addresses
    Customer.where("email LIKE '%@entelequia.test' OR email LIKE 'cliente%@%'").delete_all
    Address.where("line1 LIKE 'Palermo %' OR line1 LIKE 'Recoleta %' OR line1 LIKE 'San Telmo %'").delete_all
    
    # Remove seeded couriers and users
    seeded_couriers.destroy_all
    User.where("email LIKE '%@entelequia.local'").where.not(email: "admin@entelequia.local").delete_all
    
    puts "✅ Seed data cleaned!"
    puts "Note: Admin user was preserved"
  end
end
