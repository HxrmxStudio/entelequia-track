# Entelequia-Track Seeding Script
# 
# This script creates a realistic test environment for manual testing and QA.
# It's designed to be safe, idempotent, and deterministic.

require "securerandom"
require_relative "seeds/entelequia_seeder"

# Run the seeder
scale = ENV.fetch("SEED_SCALE", "1").to_i
seeder = EntelequiaSeeder.new(scale)
seeder.run!