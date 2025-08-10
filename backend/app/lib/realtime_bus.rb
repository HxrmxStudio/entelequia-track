class RealtimeBus
    @subscribers = []
  
    class << self
      def subscribe(&blk)
        @subscribers << blk
        blk
      end
  
      def unsubscribe(blk)
        @subscribers.delete(blk)
      end
  
      def publish(type, data)
        payload = { type: type, data: data }
        @subscribers.each { |blk| blk.call(payload) }
        # Also fan-out to ActionCable default realtime stream
        ActionCable.server.broadcast("realtime", payload)
      end
    end
  end
  