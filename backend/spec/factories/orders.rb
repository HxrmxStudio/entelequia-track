FactoryBot.define do
  factory :order do
    external_ref { "ORDER-#{SecureRandom.hex(4)}" }
    status { "received" }
    amount_cents { 10000 }
    currency { "ARS" }
    channel { "web" }
    
    association :customer
    
    trait :with_address do
      association :address
    end
    
    trait :preparing do
      status { "preparing" }
    end
    
    trait :ready_for_dispatch do
      status { "ready_for_dispatch" }
    end
    
    trait :completed do
      status { "completed" }
    end
    
    trait :canceled do
      status { "canceled" }
    end
  end
end
