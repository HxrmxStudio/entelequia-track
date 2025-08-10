require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_mailbox/engine"
require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Backend
  class Application < Rails::Application
    config.load_defaults 7.1
    config.time_zone = "America/Argentina/Buenos_Aires"
    config.active_record.schema_format = :sql
    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
      g.test_framework :rspec
      g.helper false
      g.assets false
    end
  end
end
