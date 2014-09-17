class Beacon < ActiveRecord::Base
  attr_accessible :identifier, :lat, :lng, :location
end
