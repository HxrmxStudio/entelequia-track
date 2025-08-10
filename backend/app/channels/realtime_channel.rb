class RealtimeChannel < ApplicationCable::Channel
  def subscribed
    stream_from "realtime"
    transmit(type: "hello", data: { time: Time.current })
  end

  def unsubscribed; end
end
