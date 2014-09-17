require 'spec_helper'

describe "beacons/show" do
  before(:each) do
    @beacon = assign(:beacon, stub_model(Beacon,
      :identifier => "Identifier",
      :location => "Location",
      :lat => "9.99",
      :lng => "9.99"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Identifier/)
    rendered.should match(/Location/)
    rendered.should match(/9.99/)
    rendered.should match(/9.99/)
  end
end
