require 'spec_helper'

describe "beacons/index" do
  before(:each) do
    assign(:beacons, [
      stub_model(Beacon,
        :identifier => "Identifier",
        :location => "Location",
        :lat => "9.99",
        :lng => "9.99"
      ),
      stub_model(Beacon,
        :identifier => "Identifier",
        :location => "Location",
        :lat => "9.99",
        :lng => "9.99"
      )
    ])
  end

  it "renders a list of beacons" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Identifier".to_s, :count => 2
    assert_select "tr>td", :text => "Location".to_s, :count => 2
    assert_select "tr>td", :text => "9.99".to_s, :count => 2
    assert_select "tr>td", :text => "9.99".to_s, :count => 2
  end
end
