require 'spec_helper'

describe "applications/index" do
  before(:each) do
    assign(:applications, [
      stub_model(Application,
        :name => "Name",
        :description => "MyText",
        :web_url => "Web Url",
        :mobile_url => "Mobile Url"
      ),
      stub_model(Application,
        :name => "Name",
        :description => "MyText",
        :web_url => "Web Url",
        :mobile_url => "Mobile Url"
      )
    ])
  end

  it "renders a list of applications" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "tr>td", :text => "Name".to_s, :count => 2
    assert_select "tr>td", :text => "MyText".to_s, :count => 2
    assert_select "tr>td", :text => "Web Url".to_s, :count => 2
    assert_select "tr>td", :text => "Mobile Url".to_s, :count => 2
  end
end
