require 'spec_helper'

# This spec was generated by rspec-rails when you ran the scaffold generator.
# It demonstrates how one might use RSpec to specify the controller code that
# was generated by Rails when you ran the scaffold generator.
#
# It assumes that the implementation code is generated by the rails scaffold
# generator.  If you are using any extension libraries to generate different
# controller code, this generated spec may or may not pass.
#
# It only uses APIs available in rails and/or rspec-rails.  There are a number
# of tools you can use to make these specs even more expressive, but we're
# sticking to rails and rspec-rails APIs to keep things simple and stable.
#
# Compared to earlier versions of this generator, there is very limited use of
# stubs and message expectations in this spec.  Stubs are only used when there
# is no simpler way to get a handle on the object needed for the example.
# Message expectations are only used when there is no simpler way to specify
# that an instance is receiving a specific message.

describe ScannersController do

  # This should return the minimal set of attributes required to create a valid
  # Scanner. As you add validations to Scanner, be sure to
  # update the return value of this method accordingly.
  def valid_attributes
    { "identifier" => "MyString" }
  end

  # This should return the minimal set of values that should be in the session
  # in order to pass any filters (e.g. authentication) defined in
  # ScannersController. Be sure to keep this updated too.
  def valid_session
    {}
  end

  describe "GET index" do
    it "assigns all scanners as @scanners" do
      scanner = Scanner.create! valid_attributes
      get :index, {}, valid_session
      assigns(:scanners).should eq([scanner])
    end
  end

  describe "GET show" do
    it "assigns the requested scanner as @scanner" do
      scanner = Scanner.create! valid_attributes
      get :show, {:id => scanner.to_param}, valid_session
      assigns(:scanner).should eq(scanner)
    end
  end

  describe "GET new" do
    it "assigns a new scanner as @scanner" do
      get :new, {}, valid_session
      assigns(:scanner).should be_a_new(Scanner)
    end
  end

  describe "GET edit" do
    it "assigns the requested scanner as @scanner" do
      scanner = Scanner.create! valid_attributes
      get :edit, {:id => scanner.to_param}, valid_session
      assigns(:scanner).should eq(scanner)
    end
  end

  describe "POST create" do
    describe "with valid params" do
      it "creates a new Scanner" do
        expect {
          post :create, {:scanner => valid_attributes}, valid_session
        }.to change(Scanner, :count).by(1)
      end

      it "assigns a newly created scanner as @scanner" do
        post :create, {:scanner => valid_attributes}, valid_session
        assigns(:scanner).should be_a(Scanner)
        assigns(:scanner).should be_persisted
      end

      it "redirects to the created scanner" do
        post :create, {:scanner => valid_attributes}, valid_session
        response.should redirect_to(Scanner.last)
      end
    end

    describe "with invalid params" do
      it "assigns a newly created but unsaved scanner as @scanner" do
        # Trigger the behavior that occurs when invalid params are submitted
        Scanner.any_instance.stub(:save).and_return(false)
        post :create, {:scanner => { "identifier" => "invalid value" }}, valid_session
        assigns(:scanner).should be_a_new(Scanner)
      end

      it "re-renders the 'new' template" do
        # Trigger the behavior that occurs when invalid params are submitted
        Scanner.any_instance.stub(:save).and_return(false)
        post :create, {:scanner => { "identifier" => "invalid value" }}, valid_session
        response.should render_template("new")
      end
    end
  end

  describe "PUT update" do
    describe "with valid params" do
      it "updates the requested scanner" do
        scanner = Scanner.create! valid_attributes
        # Assuming there are no other scanners in the database, this
        # specifies that the Scanner created on the previous line
        # receives the :update_attributes message with whatever params are
        # submitted in the request.
        Scanner.any_instance.should_receive(:update_attributes).with({ "identifier" => "MyString" })
        put :update, {:id => scanner.to_param, :scanner => { "identifier" => "MyString" }}, valid_session
      end

      it "assigns the requested scanner as @scanner" do
        scanner = Scanner.create! valid_attributes
        put :update, {:id => scanner.to_param, :scanner => valid_attributes}, valid_session
        assigns(:scanner).should eq(scanner)
      end

      it "redirects to the scanner" do
        scanner = Scanner.create! valid_attributes
        put :update, {:id => scanner.to_param, :scanner => valid_attributes}, valid_session
        response.should redirect_to(scanner)
      end
    end

    describe "with invalid params" do
      it "assigns the scanner as @scanner" do
        scanner = Scanner.create! valid_attributes
        # Trigger the behavior that occurs when invalid params are submitted
        Scanner.any_instance.stub(:save).and_return(false)
        put :update, {:id => scanner.to_param, :scanner => { "identifier" => "invalid value" }}, valid_session
        assigns(:scanner).should eq(scanner)
      end

      it "re-renders the 'edit' template" do
        scanner = Scanner.create! valid_attributes
        # Trigger the behavior that occurs when invalid params are submitted
        Scanner.any_instance.stub(:save).and_return(false)
        put :update, {:id => scanner.to_param, :scanner => { "identifier" => "invalid value" }}, valid_session
        response.should render_template("edit")
      end
    end
  end

  describe "DELETE destroy" do
    it "destroys the requested scanner" do
      scanner = Scanner.create! valid_attributes
      expect {
        delete :destroy, {:id => scanner.to_param}, valid_session
      }.to change(Scanner, :count).by(-1)
    end

    it "redirects to the scanners list" do
      scanner = Scanner.create! valid_attributes
      delete :destroy, {:id => scanner.to_param}, valid_session
      response.should redirect_to(scanners_url)
    end
  end

end
