FactoryBot.define do
  factory :address do
    line1 { "Test Street #{SecureRandom.hex(4)}" }
    city { "Buenos Aires" }
    province_state { "Buenos Aires" }
    country { "AR" }
    postal_code { "1000" }
  end
end
