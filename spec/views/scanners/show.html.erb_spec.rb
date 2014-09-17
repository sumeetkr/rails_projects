require 'spec_helper'

describe "scanners/show" do
  before(:each) do
    @scanner = assign(:scanner, stub_model(Scanner,
      :identifier => "Identifier",
      :beconId => 1
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Identifier/)
    rendered.should match(/1/)
  end
end
