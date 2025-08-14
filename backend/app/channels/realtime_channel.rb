class RealtimeChannel < ApplicationCable::Channel
  def subscribed
    stream_from "realtime"
    # Allow subscribing to public tracking streams if topic provided
    if params["topics"].is_a?(Array)
      params["topics"].each do |topic|
        if topic.to_s.start_with?("public:track:")
          stream_from topic
        end
      end
    end
    transmit({ type: "hello", data: { time: Time.current } })
  end

  def unsubscribed; end
end
