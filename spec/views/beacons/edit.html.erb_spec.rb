require 'spec_helper'

describe "beacons/edit" do
  before(:each) do
    @beacon = assign(:beacon, stub_model(Beacon,
      :identifier => "MyString",
      :location => "MyString",
      :lat => "9.99",
      :lng => "9.99"
    ))
  end

  it "renders the edit beacon form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => beacons_path(@beacon), :method => "post" do
      assert_select "input#beacon_identifier", :name => "beacon[identifier]"
      assert_select "input#beacon_location", :name => "beacon[location]"
      assert_select "input#beacon_lat", :name => "beacon[lat]"
      assert_select "input#beacon_lng", :name => "beacon[lng]"
    end
  end
end
