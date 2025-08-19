# Entelequia Track - Backend API

Rails 8 API backend for the Entelequia Track logistics platform with PostGIS support.

## Requirements

- Ruby 3.4.4
- PostgreSQL 17 with PostGIS extension
- Redis (for Sidekiq background jobs)

## PostGIS Schema Management

This application uses **`schema.rb`** with the modern **`activerecord-postgis-adapter`** gem, which properly handles PostGIS spatial types in Ruby DSL format. This follows Rails best practices while supporting:

- Spatial data types (`t.geography`, `t.geometry`)
- PostGIS extensions and schemas
- Spatial indexes (GiST)
- Check constraints for spatial data
- All standard Rails schema features

### Developer Commands

```bash
# Set up the project (includes database preparation)
bin/setup

# Load database schema from schema.rb
rails db:schema:load

# Dump current database structure to schema.rb
rails db:schema:dump

# Verify schema file matches database state
rails dev:schema:verify

# Diagnose schema and database status
rails dev:schema:diagnose
```

### Important Notes

- **Never edit `schema.rb` manually** - always use migrations
- **Always run `rails db:schema:dump`** after creating migrations
- The schema includes application tables and PostGIS system tables as needed
- PostGIS extensions are properly managed in the schema file
- CI should use `rails db:schema:load` to set up test databases

## Development Setup

1. Clone the repository
2. Install dependencies: `bundle install`
3. Setup database: `bin/setup`
4. Run tests: `bundle exec rspec`
5. Start server: `bin/rails server`

## Database Schema

The application manages these core entities:

- **Users** - Panel operators and couriers
- **Couriers** - Delivery personnel with spatial tracking
- **Orders** - Customer orders with delivery requirements
- **Shipments** - Individual delivery units with OTP/QR codes
- **Routes** - Daily delivery routes for couriers
- **Stops** - Individual delivery stops on routes
- **Addresses** - Geocoded delivery locations
- **Proofs** - Delivery confirmations (photos, signatures, geolocation)
- **Events** - Audit trail and tracking events
- **Alerts** - System notifications and SLA warnings

## Spatial Features

- Real-time courier location tracking
- Geofenced delivery confirmations
- Address geocoding and normalization
- Route optimization support
- Spatial proximity queries

## API Documentation

The API follows RESTful conventions with JSON responses. Authentication uses JWT tokens for couriers and session-based auth for panel users.
