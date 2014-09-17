require 'spec_helper'

describe "Scanners" do
  describe "GET /scanners" do
    it "works! (now write some real specs)" do
      # Run the generator again with the --webrat flag if you want to use webrat methods/matchers
      get scanners_path
      response.status.should be(200)
    end
  end
end
