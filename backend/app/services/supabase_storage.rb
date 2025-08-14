require "net/http"
require "uri"
require "json"
require "base64"

class SupabaseStorage
  class << self
    def base_url
      url = ENV["SUPABASE_URL"].to_s
      raise KeyError, "SUPABASE_URL is missing" if url.strip.empty?
      # Guard against misconfiguration using REST subpaths
      uri = URI.parse(url) rescue nil
      raise KeyError, "SUPABASE_URL is invalid" unless uri&.scheme && uri&.host
      url
    end

    # Service role key is REQUIRED for bucket admin and signing endpoints
    def service_key
      key = ENV["SUPABASE_SERVICE_ROLE"].presence || ENV["SUPABASE_SERVICE_KEY"].presence
      raise KeyError, "SUPABASE_SERVICE_KEY (or SUPABASE_SERVICE_ROLE) is missing" if key.to_s.strip.empty?
      # Diagnostics without calling base_url to avoid recursion
      env_url = ENV["SUPABASE_URL"].to_s
      validate_project_alignment_once!(key: key, env_url: env_url)
      log_runtime_once!(env_url: env_url, key: key)
      key
    end

    def bucket
      ENV.fetch("SUPABASE_BUCKET", "pod-photos")
    end

    def upload_ttl
      ENV.fetch("SUPABASE_UPLOAD_TTL_SECONDS", "900").to_i
    end

    def download_ttl
      ENV.fetch("SUPABASE_DOWNLOAD_TTL_SECONDS", "300").to_i
    end

    # Returns { upload_url, headers, key }
    def create_signed_upload(path, content_type:, upsert: true, expires_in: upload_ttl)
      ensure_bucket_exists!
      normalized_path = path.to_s.sub(%r{^/+}, "")
      signed = sign_upload_path(path: normalized_path, content_type: content_type.to_s, expires_in: expires_in, upsert: upsert)
      upload_url = absolute_url(signed[:path])
      headers = { "Content-Type" => content_type.to_s, "x-upsert" => (upsert ? "true" : "false") }
      headers["x-upload-token"] = signed[:token] if signed[:token].to_s.strip != ""
      { upload_url: upload_url, headers: headers, key: normalized_path, token: signed[:token] }
    end

    # Returns { url }
    def create_signed_download(path, expires_in: download_ttl)
      ensure_bucket_exists!
      signed_path = sign_download_path(path: path, expires_in: expires_in)
      { url: absolute_url(signed_path) }
    end

    private

    def common_headers
      token = service_key
      {
        "Authorization" => "Bearer #{token}",
        "apikey" => token,
        "Content-Type" => "application/json"
      }
    end

    # POST /storage/v1/object/upload/sign/{bucket}
    # Body: { objectName, contentType, expiresIn, upsert }
    # Response: { signedUrl, token }
    def sign_upload_path(path:, content_type:, expires_in:, upsert: true)
      endpoint = "/storage/v1/object/upload/sign/#{bucket}"
      uri = URI.join(base_url.end_with?("/") ? base_url : base_url + "/", endpoint.sub(%r{^/}, ""))
      Rails.logger.info("supabase upload_sign target=#{uri.host} bucket=#{bucket}")

      req = Net::HTTP::Post.new(uri)
      common_headers.each { |k, v| req[k] = v }
      req.body = { objectName: path, contentType: content_type, expiresIn: expires_in, upsert: upsert }.to_json

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      res = http.request(req)

      handle_non_success!(res, context: "upload_sign")

      data = JSON.parse(res.body) rescue {}
      signed_url_path = data["signedUrl"] || data["signedURL"] || data["url"]
      raise "supabase_sign_missing_url" if signed_url_path.to_s.strip.empty?
      { path: signed_url_path, token: data["token"] }
    end

    # POST /storage/v1/object/sign/{bucket}/{path}
    # Body: { expiresIn }
    # Response: { signedURL }
    def sign_download_path(path:, expires_in:)
      endpoint = "/storage/v1/object/sign/#{bucket}/#{path}"
      uri = URI.join(base_url.end_with?("/") ? base_url : base_url + "/", endpoint.sub(%r{^/}, ""))
      Rails.logger.info("supabase download_sign target=#{uri.host} bucket=#{bucket}")

      req = Net::HTTP::Post.new(uri)
      common_headers.each { |k, v| req[k] = v }
      req.body = { expiresIn: expires_in }.to_json

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      res = http.request(req)

      handle_non_success!(res, context: "download_sign")

      data = JSON.parse(res.body) rescue {}
      signed_url_path = data["signedURL"] || data["signedUrl"] || data["url"]
      raise "supabase_sign_missing_url" if signed_url_path.to_s.strip.empty?

      signed_url_path
    end

    # GET /storage/v1/bucket/{bucket}
    # If 404, optionally create via POST /storage/v1/bucket
    def ensure_bucket_exists!
      @checked_buckets ||= {}
      return if @checked_buckets[bucket]

      endpoint = "/storage/v1/bucket/#{bucket}"
      uri = URI.join(base_url.end_with?("/") ? base_url : base_url + "/", endpoint.sub(%r{^/}, ""))
      Rails.logger.info("supabase bucket_check target=#{uri.host} bucket=#{bucket}")
      req = Net::HTTP::Get.new(uri)
      common_headers.each { |k, v| req[k] = v }

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      res = http.request(req)

      case res
      when Net::HTTPSuccess
        @checked_buckets[bucket] = true
        return
      when Net::HTTPNotFound
        if auto_create_bucket?
          create_bucket!
          @checked_buckets[bucket] = true
          return
        end
        Rails.logger.error("supabase bucket missing: name=#{bucket} url=#{base_url}")
        raise "supabase_bucket_not_found: #{bucket}"
      else
        handle_non_success!(res, context: "bucket_check")
      end
    end

    def auto_create_bucket?
      ENV.fetch("SUPABASE_AUTO_CREATE_BUCKET", "false").to_s.downcase == "true"
    end

    def create_bucket!
      endpoint = "/storage/v1/bucket"
      uri = URI.join(base_url.end_with?("/") ? base_url : base_url + "/", endpoint.sub(%r{^/}, ""))
      req = Net::HTTP::Post.new(uri)
      common_headers.each { |k, v| req[k] = v }
      req.body = { name: bucket, public: false }.to_json

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      res = http.request(req)
      unless res.is_a?(Net::HTTPSuccess)
        Rails.logger.error("supabase bucket create failed: status=#{res.code} body=#{res.body}")
        raise "supabase_bucket_create_failed: #{res.code}"
      end
    end

    def absolute_url(path)
      return path if path.start_with?("http://", "https://")
      base = base_url.chomp("/")
      rel = path.start_with?("/") ? path : "/#{path}"
      base + rel
    end

    def handle_non_success!(res, context:)
      body = res.body.to_s
      code = res.code.to_s
      if body.include?("Bucket not found") || code == "404"
        Rails.logger.error("supabase #{context} failed: status=#{code} body=#{body}")
        raise "supabase_bucket_not_found: #{bucket}"
      elsif code == "401" || code == "403"
        Rails.logger.error("supabase #{context} unauthorized: status=#{code}")
        raise "supabase_unauthorized"
      else
        Rails.logger.error("supabase #{context} failed: status=#{code} body=#{body}")
        raise "supabase_#{context}_failed: #{code}"
      end
    end

    # Diagnostics & alignment checks (non-fatal logs)
    def log_runtime_once!(env_url:, key:)
      return if defined?(@@supabase_runtime_logged) && @@supabase_runtime_logged
      begin
        masked = mask_key(key)
        host = URI.parse(env_url).host rescue env_url
        Rails.logger.info("supabase runtime: base_url=#{host} service_key=#{masked}")
      ensure
        @@supabase_runtime_logged = true
      end
    end

    def validate_project_alignment_once!(key:, env_url:)
      return if defined?(@@supabase_alignment_checked) && @@supabase_alignment_checked
      begin
        ref_in_key = extract_ref_from_jwt(key)
        host = URI.parse(env_url).host rescue nil
        ref_in_url = host.to_s.split(".").first
        if ref_in_key && ref_in_url && ref_in_key != ref_in_url
          Rails.logger.error("supabase project ref mismatch: key.ref=#{ref_in_key} url.ref=#{ref_in_url}")
        else
          Rails.logger.info("supabase project ref aligned: #{ref_in_url}")
        end
      ensure
        @@supabase_alignment_checked = true
      end
    end

    def extract_ref_from_jwt(jwt)
      parts = jwt.to_s.split(".")
      return nil unless parts.size >= 2
      payload_b64 = parts[1]
      payload_json = Base64.urlsafe_decode64(pad_base64(payload_b64)) rescue nil
      data = JSON.parse(payload_json) rescue nil
      data.is_a?(Hash) ? data["ref"] : nil
    end

    def pad_base64(s)
      padding = (4 - s.length % 4) % 4
      s + ("=" * padding)
    end

    def mask_key(key)
      return "missing" if key.to_s.empty?
      k = key.to_s
      head = k[0,8] || ""
      tail = k[-8,8] || ""
      "#{head}...#{tail}"
    end
  end
end


