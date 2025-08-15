class RefreshToken < ApplicationRecord
  belongs_to :user

  validates :token_digest, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where(revoked_at: nil).where("expires_at > ?", Time.current) }
  scope :expired, -> { where("expires_at <= ?", Time.current) }
  scope :revoked, -> { where.not(revoked_at: nil) }

  # This is a temporary attribute that gets set during creation
  # It's not stored in the database, only used for the initial response
  attr_accessor :_temp_token

  def expired?
    expires_at <= Time.current
  end

  def revoked?
    revoked_at.present?
  end

  def active?
    !expired? && !revoked?
  end

  def revoke!
    update!(revoked_at: Time.current)
  end

  def self.create_for_user(user, client: nil, device: nil)
    token = SecureRandom.hex(32)
    digest = Digest::SHA256.hexdigest(token)
    
    refresh_token = create!(
      user: user,
      token_digest: digest,
      expires_at: ENV.fetch("REFRESH_TOKEN_TTL_DAYS", "30").to_i.days.from_now,
      client: client,
      device: device
    )
    
    # Set the temporary token attribute for return
    refresh_token._temp_token = token
    refresh_token
  end

  def self.find_by_token(token)
    digest = Digest::SHA256.hexdigest(token)
    find_by(token_digest: digest)
  end

  # Method to get the original token (only available on newly created instances)
  def original_token
    _temp_token
  end
end
