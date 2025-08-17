FactoryBot.define do
  factory :customer do
    name { "Test Customer #{SecureRandom.hex(4)}" }
    email { "customer#{SecureRandom.hex(4)}@example.com" }
    phone { "+54 9 11 #{SecureRandom.rand(10000000..99999999)}" }
  end
end
