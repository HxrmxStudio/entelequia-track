require "rails_helper"

RSpec.describe "Service Loading Debug" do
  it "can load Auth::JwtService" do
    expect { Auth::JwtService }.not_to raise_error
    expect(Auth::JwtService).to be_a(Class)
  end

  it "can load Auth::RefreshTokenService" do
    expect { Auth::RefreshTokenService }.not_to raise_error
    expect(Auth::RefreshTokenService).to be_a(Class)
  end

  it "can load Auth::TokenService" do
    expect { Auth::TokenService }.not_to raise_error
    expect(Auth::TokenService).to be_a(Class)
  end

  it "can load Auth::AuthService" do
    expect { Auth::AuthService }.not_to raise_error
    expect(Auth::AuthService).to be_a(Class)
  end
end
