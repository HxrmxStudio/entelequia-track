#!/usr/bin/env ruby

require_relative "../config/boot"
require_relative "../config/environment"

puts "Supabase URL: #{ENV["SUPABASE_URL"]}"
puts "Bucket: #{ENV["SUPABASE_BUCKET"] || "pod-photos"}"

begin
  # Ensure bucket exists
  SupabaseStorage.send(:ensure_bucket_exists!)
  puts "Bucket check: OK"

  # Create signed upload
  key = "diagnostics/#{Time.now.utc.strftime("%Y%m%d%H%M%S")}-#{SecureRandom.uuid}.txt"
  up = SupabaseStorage.create_signed_upload(key, content_type: "text/plain", upsert: true, expires_in: 300)
  puts "Signed upload URL: #{up[:upload_url]}"

  # Create signed download (will 404 until a file is uploaded to that key)
  dl = SupabaseStorage.create_signed_download(key, expires_in: 300)
  puts "Signed download URL: #{dl[:url]}"
rescue => e
  warn "ERROR: #{e.class}: #{e.message}"
  exit 1
end

puts "Done"


