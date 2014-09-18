require 'spec_helper'

describe IpsController do

  describe "GET 'scanner_locations'" do
    it "returns http success" do
      get 'scanner_locations'
      response.should be_success
    end
  end

end
