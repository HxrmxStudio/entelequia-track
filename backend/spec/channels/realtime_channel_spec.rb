require 'rails_helper'

RSpec.describe RealtimeChannel, type: :channel do
  it "subscribes and receives broadcast" do
    subscribe
    expect(subscription).to be_confirmed

    expect {
      RealtimeBus.publish("test.event", { ok: true })
    }.to have_broadcasted_to("realtime").with(hash_including(type: "test.event", data: { ok: true }))
  end

  it "streams public tracking topic when provided" do
    code = "XCODE"
    subscribe(topics: ["public:track:#{code}"])
    expect(subscription).to be_confirmed

    payload = { type: "public.location", data: { code: code, lat: 1.0, lon: 2.0, recorded_at: Time.current.iso8601 } }
    expect {
      ActionCable.server.broadcast("public:track:#{code}", payload)
    }.to have_broadcasted_to("public:track:#{code}").with(hash_including(type: "public.location", data: hash_including(code: code)))
  end
end
