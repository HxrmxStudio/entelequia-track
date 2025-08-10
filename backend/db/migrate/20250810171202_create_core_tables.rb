class CreateCoreTables < ActiveRecord::Migration[7.1]
  def change
    # Usuarios del panel y app (roles)
    create_table :users, id: :uuid do |t|
      t.string  :email, null: false
      t.string  :password_digest, null: false
      t.string  :role, null: false, default: "ops" # admin | ops | courier
      t.string  :name
      t.string  :device_hash # para courier device binding
      t.timestamps
    end
    add_index :users, :email, unique: true
    add_index :users, :role

    # Repartidores (si prefieres separar de users; si no, puedes usar role=courier)
    create_table :couriers, id: :uuid do |t|
      t.string :code, null: false # identificador interno
      t.string :name, null: false
      t.uuid   :user_id # opcional: vincular a user
      t.boolean :active, default: true, null: false
      t.timestamps
    end
    add_index :couriers, :code, unique: true
    add_index :couriers, :user_id

    # Direcciones (normalizadas)
    create_table :addresses, id: :uuid do |t|
      t.string :line1, null: false
      t.string :line2
      t.string :city
      t.string :province_state
      t.string :country, default: "AR", null: false
      t.string :postal_code # 4 dígitos o CPA completo
      t.st_point :geom, geographic: true # GEOGRAPHY(Point,4326)
      t.timestamps
    end
    add_index :addresses, :geom, using: :gist

    # Clientes (para contacto)
    create_table :customers, id: :uuid do |t|
      t.string :name, null: false
      t.string :phone
      t.string :email
      t.timestamps
    end
    add_index :customers, :email

    # Órdenes (ventas)
    create_table :orders, id: :uuid do |t|
      t.string :external_ref # Pedido # de tu CSV
      t.uuid   :customer_id
      t.uuid   :address_id
      t.string :channel, default: "web", null: false # web | mercado_libre | tienda
      t.string :status, default: "received", null: false
      t.integer :amount_cents, default: 0, null: false
      t.string  :currency, default: "ARS", null: false
      t.tstzrange :delivery_window # ventana opcional
      t.jsonb  :metadata, default: {}
      t.timestamps
    end
    add_index :orders, :external_ref, unique: true
    add_index :orders, :status
    add_index :orders, :channel

    # Envíos (unidad operativa de entrega)
    create_table :shipments, id: :uuid do |t|
      t.uuid :order_id, null: false
      t.uuid :assigned_courier_id
      t.string :status, null: false, default: "queued" # queued|out_for_delivery|delivered|failed|canceled
      t.string :delivery_method, default: "courier", null: false # courier|pickup|carrier|other
      t.string :otp_code_hash # almacenamos hash, no el OTP llano
      t.string :qr_token # token opaco
      t.datetime :eta
      t.datetime :sla_due_at
      t.jsonb :metadata, default: {}
      t.timestamps
    end
    add_index :shipments, :order_id
    add_index :shipments, :assigned_courier_id
    add_index :shipments, :status
    add_index :shipments, :qr_token, unique: true

    # Rutas (agrupan paradas)
    create_table :routes, id: :uuid do |t|
      t.uuid :courier_id, null: false
      t.date :service_date, null: false
      t.string :status, default: "planned", null: false # planned|in_progress|completed
      t.timestamps
    end
    add_index :routes, [:courier_id, :service_date], unique: true

    # Paradas (Stops)
    create_table :stops, id: :uuid do |t|
      t.uuid :route_id, null: false
      t.uuid :shipment_id, null: false
      t.integer :sequence, null: false, default: 0
      t.string :status, null: false, default: "pending" # pending|arrived|completed|failed|skipped
      t.datetime :planned_at
      t.datetime :arrived_at
      t.datetime :completed_at
      t.jsonb :notes, default: {}
      t.timestamps
    end
    add_index :stops, [:route_id, :sequence], unique: true
    add_index :stops, :status

    # Pings de ubicación
    create_table :locations, id: false do |t|
      t.uuid :courier_id, null: false
      t.datetime :recorded_at, null: false
      t.st_point :geom, geographic: true, null: false
      t.float :accuracy_m
      t.float :speed_mps
      t.integer :battery_pct
      t.string :app_version
      t.timestamps
    end
    execute "ALTER TABLE locations ADD PRIMARY KEY (courier_id, recorded_at);"
    add_index :locations, :geom, using: :gist

    # Pruebas de entrega (POD)
    create_table :proofs, id: :uuid do |t|
      t.uuid :shipment_id, null: false
      t.string :method, null: false # otp|qr|photo|signature
      t.string :photo_url
      t.text   :signature_svg
      t.string :otp_last4 # opcional para auditoría NO sensible
      t.string :qr_payload_hash
      t.st_point :geom, geographic: true
      t.datetime :captured_at, null: false
      t.string :device_hash
      t.string :hash_chain # tamper-evident
      t.jsonb :metadata, default: {}
      t.timestamps
    end
    add_index :proofs, :shipment_id
    add_index :proofs, :method
    add_index :proofs, :geom, using: :gist

    # Eventos (timeline)
    create_table :events, id: :uuid do |t|
      t.string :type_key, null: false # picked_up|on_route|delivered|failed|eta_updated|...
      t.uuid   :subject_id, null: false # shipment_id u otros
      t.string :actor_kind # system|courier|ops
      t.uuid   :actor_id
      t.jsonb  :payload, default: {}
      t.datetime :occurred_at, null: false
      t.timestamps
    end
    add_index :events, :type_key
    add_index :events, :subject_id
    add_index :events, :occurred_at
    add_index :events, :payload, using: :gin

    # Importaciones CSV (lotes)
    create_table :imports, id: :uuid do |t|
      t.string :source, null: false # csv_exact|csv_normalized|api|webhook
      t.string :status, null: false, default: "pending" # pending|dry_run|committed|failed
      t.uuid   :created_by
      t.integer :rows_total, default: 0
      t.integer :rows_valid, default: 0
      t.integer :rows_invalid, default: 0
      t.string  :checksum # para idempotencia (hash del archivo)
      t.text    :error_report_url
      t.timestamps
    end
    add_index :imports, :status
    add_index :imports, :checksum, unique: true
  end
end
