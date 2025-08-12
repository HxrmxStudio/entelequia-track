class GeofenceService
  Result = Struct.new(:inside, :distance_m, :radius_m, keyword_init: true)

  def self.check!(shipment:, lat:, lon:)
    radius = (shipment.geofence_radius_m || ENV.fetch("GEOFENCE_DEFAULT_M", "100").to_i).to_i
    destination_geom = shipment.order&.address&.geom
    return Result.new(inside: true, distance_m: nil, radius_m: radius) unless destination_geom

    # Compute distance in meters using geography with explicit SRID handling
    sql = <<~SQL
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        ST_SetSRID(ST_GeomFromText($3), 4326)::geography
      ) AS distance_meters
    SQL

    query = ActiveRecord::Base.send(
      :sanitize_sql_array,
      [sql, lon, lat, destination_geom.as_text]
    )

    row = ActiveRecord::Base.connection.exec_query(query).first
    distance = row && row["distance_meters"].to_f

    Result.new(inside: distance <= radius, distance_m: distance, radius_m: radius)
  end
end
