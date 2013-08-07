require 'spec_helper'

describe "applications/new" do
  before(:each) do
    assign(:application, stub_model(Application,
      :name => "MyString",
      :description => "MyText",
      :web_url => "MyString",
      :mobile_url => "MyString"
    ).as_new_record)
  end

  it "renders new application form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => applications_path, :method => "post" do
      assert_select "input#application_name", :name => "application[name]"
      assert_select "textarea#application_description", :name => "application[description]"
      assert_select "input#application_web_url", :name => "application[web_url]"
      assert_select "input#application_mobile_url", :name => "application[mobile_url]"
    end
  end
end
