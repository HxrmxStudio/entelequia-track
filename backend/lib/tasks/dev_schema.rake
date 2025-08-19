namespace :dev do
  namespace :schema do
    desc "Diagnose database and schema state"
    task diagnose: :environment do
      puts "🔍 Database Schema Diagnostics"
      puts "=" * 50
      
      # Check actual tables in database
      puts "\n📊 Tables in database:"
      actual_tables = ActiveRecord::Base.connection.tables.sort
      puts actual_tables.map { |t| "  ✓ #{t}" }.join("\n")
      puts "\n📈 Total tables: #{actual_tables.size}"
      
      # Check migration status
      puts "\n🔄 Migration status:"
      begin
        migration_versions = ActiveRecord::Base.connection.select_values(
          "SELECT version FROM schema_migrations ORDER BY version"
        )
        puts "  Applied migrations: #{migration_versions.size}"
        puts "  Latest: #{migration_versions.last}"
      rescue => e
        puts "  ❌ Error checking migrations: #{e.message}"
      end
      
      # Check PostGIS
      puts "\n🌍 PostGIS status:"
      begin
        postgis_version = ActiveRecord::Base.connection.execute("SELECT postgis_full_version()").values.first.first
        puts "  ✓ #{postgis_version}"
      rescue => e
        puts "  ❌ PostGIS not available: #{e.message}"
      end
      
      # Check schema file status
      puts "\n📄 Schema files:"
      schema_rb_path = Rails.root.join("db", "schema.rb")
      structure_sql_path = Rails.root.join("db", "structure.sql")
      
      if File.exist?(schema_rb_path)
        schema_content = File.read(schema_rb_path)
        table_definitions = schema_content.scan(/create_table "([^"]+)"/).flatten
        puts "  📝 schema.rb exists"
        puts "    - Size: #{File.size(schema_rb_path)} bytes"
        puts "    - Tables defined: #{table_definitions.size}"
        puts "    - Table names: #{table_definitions.join(", ")}" if table_definitions.any?
      else
        puts "  ❌ schema.rb not found"
      end
      
      if File.exist?(structure_sql_path)
        structure_content = File.read(structure_sql_path)
        table_definitions = structure_content.scan(/CREATE TABLE [^.]*\.([^\s(]+)/).flatten
        puts "  📝 structure.sql exists"
        puts "    - Size: #{File.size(structure_sql_path)} bytes"
        puts "    - Tables defined: #{table_definitions.size}"
        puts "    - Table names: #{table_definitions.join(", ")}" if table_definitions.any?
      else
        puts "  ❌ structure.sql not found"
      end
      
      # Check configuration
      puts "\n⚙️  Configuration:"
      puts "  Schema format: #{Rails.application.config.active_record.schema_format}"
      puts "  Database adapter: #{ActiveRecord::Base.connection.adapter_name}"
      
      # Check for known tables from models
      puts "\n🧪 Model table verification:"
      model_tables = %w[shipments routes stops alerts users couriers orders customers addresses proofs events imports locations refresh_tokens]
      model_tables.each do |table|
        exists = ActiveRecord::Base.connection.table_exists?(table)
        status = exists ? "✓" : "❌"
        puts "  #{status} #{table}"
      end
      
      puts "\n" + "=" * 50
      puts "📋 Summary:"
      puts "  - Database has #{actual_tables.size} tables"
      puts "  - Schema format: #{Rails.application.config.active_record.schema_format}"
      puts "  - PostGIS: #{File.exist?(structure_sql_path) ? 'structure.sql exists' : 'needs structure.sql'}"
    end

    desc "Verify schema file matches database"
    task verify: :environment do
      puts "🔧 Schema Verification"
      puts "=" * 30
      
      # Filter out PostGIS system tables and focus on application tables
      postgis_system_tables = %w[
        spatial_ref_sys topology layer addr addrfeat bg county county_lookup 
        countysub_lookup cousub direction_lookup edges faces featnames
        geocode_settings geocode_settings_default loader_lookuptables 
        loader_platform loader_variables pagc_gaz pagc_lex pagc_rules
        place place_lookup secondary_unit_lookup state state_lookup
        street_type_lookup tabblock tabblock20 tract zcta5 zip_state_loc
        zip_lookup zip_lookup_all zip_lookup_base zip_state
      ]
      
      all_tables = ActiveRecord::Base.connection.tables.sort
      actual_tables = all_tables.reject { |t| 
        t.start_with?('ar_') || postgis_system_tables.include?(t) || t == 'schema_migrations'
      }
      
      schema_format = Rails.application.config.active_record.schema_format
      
      if schema_format == :sql
        structure_path = Rails.root.join("db", "structure.sql")
        if File.exist?(structure_path)
          content = File.read(structure_path)
          schema_tables = content.scan(/CREATE TABLE [^.]*\.([^\s(]+)/).flatten.sort.uniq
          schema_tables = schema_tables.reject { |t| 
            t.start_with?('ar_') || postgis_system_tables.include?(t) 
          }
          
          puts "✓ Using structure.sql format"
          puts "  Total DB tables: #{all_tables.size}"
          puts "  Application tables: #{actual_tables.size}"
          puts "  Schema tables: #{schema_tables.size}"
          
          missing_in_schema = actual_tables - schema_tables
          missing_in_db = schema_tables - actual_tables
          
          if missing_in_schema.any?
            puts "  ⚠️  Tables in DB but not in schema: #{missing_in_schema.join(', ')}"
          end
          
          if missing_in_db.any?
            puts "  ⚠️  Tables in schema but not in DB: #{missing_in_db.join(', ')}"
          end
          
          if missing_in_schema.empty? && missing_in_db.empty?
            puts "  ✅ Schema and database are in sync"
            exit 0
          else
            puts "  ❌ Schema drift detected"
            exit 1
          end
        else
          puts "❌ structure.sql not found"
          exit 1
        end
      else
        # Ruby format with PostGIS adapter
        schema_path = Rails.root.join("db", "schema.rb")
        if File.exist?(schema_path)
          content = File.read(schema_path)
          schema_tables = content.scan(/create_table "([^"]+)"/).flatten.sort.uniq
          schema_tables = schema_tables.reject { |t| 
            t.start_with?('ar_') || postgis_system_tables.include?(t) || t == 'schema_migrations'
          }
          
          puts "✓ Using schema.rb format with PostGIS support"
          puts "  Total DB tables: #{all_tables.size}"
          puts "  Application tables: #{actual_tables.size}"
          puts "  Schema tables: #{schema_tables.size}"
          
          missing_in_schema = actual_tables - schema_tables
          missing_in_db = schema_tables - actual_tables
          
          if missing_in_schema.any?
            puts "  ⚠️  Tables in DB but not in schema: #{missing_in_schema.join(', ')}"
          end
          
          if missing_in_db.any?
            puts "  ⚠️  Tables in schema but not in DB: #{missing_in_db.join(', ')}"
          end
          
          if missing_in_schema.empty? && missing_in_db.empty?
            puts "  ✅ Schema and database are in sync"
            exit 0
          else
            puts "  ❌ Schema drift detected"
            exit 1
          end
        else
          puts "❌ schema.rb not found"
          exit 1
        end
      end
    end

    desc "Force regenerate schema file"
    task regenerate: :environment do
      puts "🔧 Regenerating schema..."
      
      schema_format = Rails.application.config.active_record.schema_format
      
      if schema_format == :sql
        puts "Dumping structure.sql..."
        Rake::Task['db:schema:dump'].invoke
        puts "✅ structure.sql regenerated"
      else
        puts "Dumping schema.rb..."
        Rake::Task['db:schema:dump'].invoke
        puts "✅ schema.rb regenerated"
      end
      
      puts "Regenerating schema cache..."
      Rake::Task['db:schema:cache:dump'].invoke
      puts "✅ Schema cache regenerated"
      
      # Verify the regeneration
      Rake::Task['dev:schema:verify'].invoke
    end

    desc "Full schema maintenance - dump schema and regenerate cache"
    task maintain: :environment do
      puts "🔧 Performing full schema maintenance..."
      
      Rake::Task['dev:schema:regenerate'].invoke
      
      puts "\n📋 Schema maintenance completed"
      puts "✅ Schema file updated"
      puts "✅ Schema cache regenerated" 
      puts "✅ Verification passed"
    end

    desc "Post-migration hook - run after creating migrations"
    task post_migration: :environment do
      puts "🔧 Post-migration schema maintenance..."
      
      # Dump the new schema
      Rake::Task['db:schema:dump'].invoke
      puts "✅ Schema dumped"
      
      # Regenerate schema cache
      Rake::Task['db:schema:cache:dump'].invoke
      puts "✅ Schema cache updated"
      
      # Verify everything is in sync
      begin
        Rake::Task['dev:schema:verify'].invoke
        puts "✅ Schema verification passed"
      rescue SystemExit => e
        if e.status != 0
          puts "❌ Schema verification failed after migration"
          puts "This may indicate migration issues or schema dump problems"
          raise
        end
      end
    end
  end
end
