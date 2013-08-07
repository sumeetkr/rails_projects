require 'spec_helper'

describe "applications/edit" do
  before(:each) do
    @application = assign(:application, stub_model(Application,
      :name => "MyString",
      :description => "MyText",
      :web_url => "MyString",
      :mobile_url => "MyString"
    ))
  end

  it "renders the edit application form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => applications_path(@application), :method => "post" do
      assert_select "input#application_name", :name => "application[name]"
      assert_select "textarea#application_description", :name => "application[description]"
      assert_select "input#application_web_url", :name => "application[web_url]"
      assert_select "input#application_mobile_url", :name => "application[mobile_url]"
    end
  end
end
