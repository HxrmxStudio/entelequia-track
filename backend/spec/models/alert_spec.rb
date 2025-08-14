require "rails_helper"

RSpec.describe Alert, type: :model do
  it "upserts and merges data and updates last_detected_at" do
    courier = Courier.create!(code: "C300", name: "Merge Test")
    a1 = described_class.upsert_touch!(code: "gps_offline", kind: "courier", message: "m1", courier: courier, data: { a: 1 })
    last1 = a1.last_detected_at
    sleep 0.01
    a2 = described_class.upsert_touch!(code: "gps_offline", kind: "courier", message: "m2", courier: courier, data: { b: 2 })
    expect(a2.id).to eq(a1.id)
    expect(a2.data).to include("a" => 1, "b" => 2)
    expect(a2.last_detected_at).to be > last1
  end

  it "is unique under concurrency for same (code, courier) with open status" do
    courier = Courier.create!(code: "C301", name: "Race")
    errors = []
    threads = 2.times.map do
      Thread.new do
        begin
          Alert.upsert_touch!(code: "gps_offline", kind: "courier", message: "r", courier: courier, data: {})
        rescue => e
          errors << e
        end
      end
    end
    threads.each(&:join)
    # Expect only one open alert exists
    expect(Alert.where(code: "gps_offline", courier_id: courier.id, status: :open).count).to eq(1)
  end
end


