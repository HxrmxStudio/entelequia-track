FactoryBot.define do
  factory :refresh_token do
    user
    expires_at { 30.days.from_now }
    revoked_at { nil }
    client { "test-client" }
    device { "test-device" }
    
    # Generate a token and its corresponding digest
    _temp_token { SecureRandom.hex(32) }
    
    # Set the token_digest to match the _temp_token
    token_digest { Digest::SHA256.hexdigest(_temp_token) }

    trait :revoked do
      revoked_at { Time.current }
    end

    trait :expired do
      expires_at { 1.day.ago }
    end

    trait :old_revoked do
      revoked_at { 31.days.ago }
    end

    trait :recent_revoked do
      revoked_at { 15.days.ago }
    end
  end
end
