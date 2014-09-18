class Scanner < ActiveRecord::Base
  attr_accessible :beconId, :identifier
  attr_accessor :lat, :lng
end
