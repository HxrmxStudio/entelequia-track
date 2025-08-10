require "aws-sdk-s3"

class PodUploader
  def initialize
    @s3 = Aws::S3::Resource.new(
      endpoint: ENV.fetch("S3_ENDPOINT", ENV.fetch("AWS_S3_ENDPOINT", "http://127.0.0.1:9000")),
      region:   ENV.fetch("S3_REGION", ENV.fetch("AWS_REGION", "us-east-1")),
      access_key_id: ENV.fetch("S3_ACCESS_KEY_ID", ENV["AWS_ACCESS_KEY_ID"]),
      secret_access_key: ENV.fetch("S3_SECRET_ACCESS_KEY", ENV["AWS_SECRET_ACCESS_KEY"]),
      force_path_style: true
    )
    @bucket = @s3.bucket(ENV.fetch("S3_BUCKET", "entelequia-pod"))
  end

  def upload!(file_param)
    original = File.basename(file_param.original_filename.to_s)
    safe = original.gsub(/[^a-zA-Z0-9._-]/, "_")
    key = "proofs/#{SecureRandom.uuid}-#{safe}"
    obj = @bucket.object(key)
    obj.upload_file(file_param.tempfile.path, content_type: file_param.content_type)
    obj.public_url
  end
end
