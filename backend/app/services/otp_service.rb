require "digest"

class OtpService
  class << self
    def generate!(shipment, length: 6)
      length_i = length.to_i
      raise ArgumentError, "invalid_length" unless length_i.between?(4, 8)
      raise "locked" if locked?(shipment)

      throttle_seconds = ENV.fetch("OTP_REGEN_THROTTLE_SECONDS", "60").to_i
      ttl_minutes = ENV.fetch("OTP_TTL_MINUTES", "10").to_i

      # Respect previous generation timestamps when available
      last_generated_at = shipment.try(:otp_generated_at)
      if last_generated_at && last_generated_at > throttle_seconds.seconds.ago
        raise "throttled"
      end

      code = rand(10**(length_i - 1)..(10**length_i - 1)).to_s

      attrs = {
        otp_code_hash: hash(code),
        otp_attempts: 0,
        otp_locked_until: nil
      }
      # Only set timestamp fields when they exist on the model
      if shipment.has_attribute?(:otp_generated_at)
        attrs[:otp_generated_at] = Time.current
      end
      if shipment.has_attribute?(:otp_expires_at)
        attrs[:otp_expires_at] = ttl_minutes.positive? ? ttl_minutes.minutes.from_now : nil
      end
      shipment.update!(attrs)
      code
    end

    def verify!(shipment, code)
      raise "locked" if locked?(shipment)
      raise "expired" if expired?(shipment)

      if secure_compare(shipment.otp_code_hash, hash(code))
        shipment.update!(otp_attempts: 0, otp_locked_until: nil)
        true
      else
        inc_attempt!(shipment)
        false
      end
    end

    def locked?(shipment)
      shipment.otp_locked_until.present? && shipment.otp_locked_until > Time.current
    end

    def expired?(shipment)
      shipment.respond_to?(:otp_expires_at) && shipment.otp_expires_at.present? && shipment.otp_expires_at <= Time.current
    end

    private

    def inc_attempt!(shipment)
      max = ENV.fetch("OTP_MAX_ATTEMPTS", "3").to_i
      lock_minutes = ENV.fetch("OTP_LOCK_MINUTES", "15").to_i
      attempts = shipment.otp_attempts.to_i + 1
      attrs = { otp_attempts: attempts }
      attrs[:otp_locked_until] = lock_minutes.minutes.from_now if attempts >= max && lock_minutes.positive?
      shipment.update!(attrs)
    end

    def hash(code)
      Digest::SHA256.hexdigest(code.to_s.strip)
    end

    def secure_compare(a, b)
      return false if a.blank? || b.blank?
      ActiveSupport::SecurityUtils.secure_compare(a, b)
    end
  end
end
