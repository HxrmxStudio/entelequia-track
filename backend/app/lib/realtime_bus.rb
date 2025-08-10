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
        @subscribers.each { |blk| blk.call({ type:, data: }) }
      end
    end
  end
  