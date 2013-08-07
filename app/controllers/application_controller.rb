class ApplicationController < ActionController::Base
  before_filter :set_x_frame_options
  #protect_from_forgery

  def set_x_frame_options
    response.headers["X-Frame-Options"] = "ALLOWALL"
  end
end
