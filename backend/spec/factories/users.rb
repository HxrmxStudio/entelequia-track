FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    name { "Test User" }
    role { "ops" }

    trait :admin do
      role { "admin" }
    end

    trait :courier do
      role { "courier" }
    end

    trait :ops do
      role { "ops" }
    end

    trait :with_courier do
      after(:create) do |user|
        create(:courier, user: user) if user.courier?
      end
    end
  end
end
