require 'spec_helper'

describe "applications/show" do
  before(:each) do
    @application = assign(:application, stub_model(Application,
      :name => "Name",
      :description => "MyText",
      :web_url => "Web Url",
      :mobile_url => "Mobile Url"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Name/)
    rendered.should match(/MyText/)
    rendered.should match(/Web Url/)
    rendered.should match(/Mobile Url/)
  end
end
