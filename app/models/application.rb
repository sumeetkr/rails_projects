class Application < ActiveRecord::Base
  attr_accessible :description, :mobile_url, :name, :web_url, :logo_url
end
