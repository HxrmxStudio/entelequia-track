# CI/CD Schema Setup Guide

## Overview

This document explains how to properly set up CI/CD pipelines for a Rails application using PostGIS with `schema.rb` as the canonical schema format, leveraging the modern `activerecord-postgis-adapter`.

## Key Requirements

1. **Use `schema.rb`** - Modern PostGIS adapter supports spatial types in Ruby DSL
2. **Load schema with `rails db:schema:load`** - Not `rails db:migrate` in CI
3. **Verify schema integrity** - Ensure no drift between schema file and database

## GitHub Actions Example

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgis/postgis:17-3.4
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: entelequia_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.4.4
          bundler-cache: true
      
      - name: Set up database
        env:
          RAILS_ENV: test
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/entelequia_test
        run: |
          # Create database and load schema from schema.rb
          bundle exec rails db:create
          bundle exec rails db:schema:load
          
          # Verify schema integrity
          bundle exec rails dev:schema:verify
      
      - name: Run tests
        env:
          RAILS_ENV: test
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/entelequia_test
        run: bundle exec rspec
```

## GitLab CI Example

```yaml
stages:
  - test

variables:
  POSTGRES_DB: entelequia_test
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  DATABASE_URL: postgres://postgres:postgres@postgres:5432/entelequia_test

test:
  stage: test
  image: ruby:3.4.4
  
  services:
    - name: postgis/postgis:17-3.4
      alias: postgres
    - redis:alpine
  
  before_script:
    - apt-get update -qq && apt-get install -y postgresql-client
    - bundle install
    
  script:
    - RAILS_ENV=test bundle exec rails db:create
    - RAILS_ENV=test bundle exec rails db:schema:load
    - RAILS_ENV=test bundle exec rails dev:schema:verify
    - bundle exec rspec
```

## Docker Compose for Local Development

```yaml
version: '3.8'
services:
  db:
    image: postgis/postgis:17-3.4
    environment:
      POSTGRES_DB: entelequia
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  app:
    build: .
    command: bundle exec rails server -b 0.0.0.0
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/entelequia
      REDIS_URL: redis://redis:6379/0

volumes:
  postgres_data:
```

## Important Commands for CI

```bash
# ✅ CORRECT - Load schema from structure.sql
rails db:schema:load

# ✅ CORRECT - Verify schema integrity
rails dev:schema:verify

# ❌ WRONG - Don't run migrations in CI
rails db:migrate

# ❌ WRONG - Don't use schema.rb with PostGIS
# (This is handled by configuration, but worth noting)
```

## Schema Validation in Pull Requests

Add this step to validate schema changes in PRs:

```yaml
- name: Validate schema changes
  run: |
    # Check if schema file changed
    if git diff --name-only origin/main...HEAD | grep -q "db/structure.sql"; then
      echo "Schema changes detected - validating..."
      
      # Ensure schema file is properly formatted
      bundle exec rails dev:schema:verify
      
      # Check for common schema issues
      if git diff origin/main...HEAD db/structure.sql | grep -q "CREATE TABLE.*ar_internal_metadata"; then
        echo "❌ ar_internal_metadata should not be in schema changes"
        exit 1
      fi
      
      echo "✅ Schema changes look good"
    fi
```

## Troubleshooting

### Schema verification fails in CI
- Ensure PostGIS extensions are enabled in test database
- Check that `structure.sql` includes all necessary extensions
- Verify database user has permission to create extensions

### Missing tables in structure.sql
- Run `rails dev:schema:diagnose` to identify issues
- Regenerate schema with `rails dev:schema:regenerate`
- Commit the updated `structure.sql`

### PostGIS system tables in schema
- This is normal - PostGIS creates system tables automatically
- Our verification excludes these tables from comparison
- Focus on application tables only

## Best Practices

1. **Always commit `structure.sql`** changes with migrations
2. **Run schema verification** before merging PRs
3. **Use PostGIS-enabled PostgreSQL** in all environments
4. **Keep schema cache updated** after schema changes
5. **Document spatial features** and their requirements
