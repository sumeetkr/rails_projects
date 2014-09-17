require 'spec_helper'

describe "scanners/new" do
  before(:each) do
    assign(:scanner, stub_model(Scanner,
      :identifier => "MyString",
      :beconId => 1
    ).as_new_record)
  end

  it "renders new scanner form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => scanners_path, :method => "post" do
      assert_select "input#scanner_identifier", :name => "scanner[identifier]"
      assert_select "input#scanner_beconId", :name => "scanner[beconId]"
    end
  end
end
