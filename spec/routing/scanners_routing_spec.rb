require "spec_helper"

describe ScannersController do
  describe "routing" do

    it "routes to #index" do
      get("/scanners").should route_to("scanners#index")
    end

    it "routes to #new" do
      get("/scanners/new").should route_to("scanners#new")
    end

    it "routes to #show" do
      get("/scanners/1").should route_to("scanners#show", :id => "1")
    end

    it "routes to #edit" do
      get("/scanners/1/edit").should route_to("scanners#edit", :id => "1")
    end

    it "routes to #create" do
      post("/scanners").should route_to("scanners#create")
    end

    it "routes to #update" do
      put("/scanners/1").should route_to("scanners#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/scanners/1").should route_to("scanners#destroy", :id => "1")
    end

  end
end
