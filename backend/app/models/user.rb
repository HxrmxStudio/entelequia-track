class User < ApplicationRecord
  has_secure_password
  enum :role, { admin: "admin", ops: "ops", courier: "courier" }
  has_one :courier

  validates :email, presence: true, uniqueness: { case_sensitive: false }, length: { maximum: 255 }, format: { with: /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/ }
  validates :role, inclusion: { in: roles.keys }

  before_validation :normalize_email

  private

  def normalize_email
    self.email = email.to_s.strip.downcase if email.present?
  end
end
  