require "rails_helper"

RSpec.describe "Imports Orders", type: :request do
  let(:ops) { User.create!(email: "ops@x.com", password: "secret", role: "ops") }

  it "dry_run validates csv_exact" do
    csv = "Pedido #,Cliente,Fecha,Monto,Entrega,Estado\nA1,Juan,01/08/2025,1000,delivery,recibido\n"
    post "/imports/orders/dry_run",
      headers: auth_header_for(ops),
      params: { format: "csv_exact", file: Rack::Test::UploadedFile.new(StringIO.new(csv), "text/csv", original_filename: "x.csv") }

    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["rows_total"]).to eq(1)
    expect(body["rows_valid"]).to eq(1)
  end
end
