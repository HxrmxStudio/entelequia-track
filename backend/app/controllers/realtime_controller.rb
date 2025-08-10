require "json"

class RealtimeController < ApplicationController
  include ActionController::Live
  before_action :authenticate_user!

  def stream
    response.headers["Content-Type"] = "text/event-stream"
    sse = SSE.new(response.stream, retry: 3000)

    subscriber = RealtimeBus.subscribe do |event|
      sse.write(event[:data], event: event[:type])
    end

    # Mensaje inicial
    sse.write({ hello: true, time: Time.current }, event: "hello")

    loop { sleep 1 } # mantener abierto

  rescue IOError
    # cliente cerró
  ensure
    RealtimeBus.unsubscribe(subscriber) if subscriber
    sse.close rescue nil
  end
end
