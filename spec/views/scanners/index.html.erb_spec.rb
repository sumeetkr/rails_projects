require 'spec_helper'

describe "scanners/index" do
  before(:each) do
    assign(:scanners, [
      stub_model(Scanner,
        :identifier => "Identifier",
        :beconId => 1
      ),
      stub_model(Scanner,
        :identifier => "Identifier",
        :beconId => 1
      )
    ])
  end

  it "renders a list of scanners" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Identifier".to_s, :count => 2
    assert_select "tr>td", :text => 1.to_s, :count => 2
  end
end
