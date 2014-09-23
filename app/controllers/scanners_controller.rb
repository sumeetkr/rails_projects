class ScannersController < ApplicationController
  # GET /scanners
  # GET /scanners.json
  def index
    @scanners = Scanner.all

    @scanners_with_lat_lan = []
    @scanners.each do |scanner|
      @beacon = Beacon.find_by_identifier(scanner.beconId)
      unless(@beacon.nil?)
        @scanners_with_lat_lan << {
                           beacon_id: scanner.beconId,
                           scanner_identifier: scanner.identifier,
                           latitude: @beacon.lat,
                           longitude: @beacon.lng
          }
      end
    end

    puts json: @scanner_with_lat_lan
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @scanners_with_lat_lan }
    end
  end

  # GET /scanners/1
  # GET /scanners/1.json
  def show
    @scanner = Scanner.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @scanner }
    end
  end

  # GET /scanners/new
  # GET /scanners/new.json
  def new
    @scanner = Scanner.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @scanner }
    end
  end

  # GET /scanners/1/edit
  def edit
    @scanner = Scanner.find(params[:id])
  end

  # POST /scanners
  # POST /scanners.json
  def create
    @scanner = Scanner.new(params[:scanner])

    respond_to do |format|
      if @scanner.save
        format.html { redirect_to @scanner, notice: 'Scanner was successfully created.' }
        format.json { render json: @scanner, status: :created, location: @scanner }
      else
        format.html { render action: "new" }
        format.json { render json: @scanner.errors, status: :unprocessable_entity }
      end
    end
  end

  def update_scanner_beacon

    # {
    #     "identifier": "SumeetsPhone",
    #     "beconId": "1071619057806538345"
    # }

    identifier = params[:identifier]
    becon_id = params[:beconId]

    if identifier.nil? || becon_id.nil?
      format.json { render :nothing => true, :status => 503 }
    else
      @scanner = Scanner.find_by_identifier(params[:identifier])
      if @scanner 
        @scanner[:beconId] = params[:beconId]
      else
        @scanner = Scanner.new(:identifier => params[:identifier])
      end

      respond_to do |format|
        if @scanner.update_attributes(params[:scanner])
          format.html { redirect_to @scanner, notice: 'Scanner was successfully updated.' }
          format.json { head :no_content }
        else
          format.html { render action: "edit" }
          format.json { render json: @scanner.errors, status: :unprocessable_entity }
        end
      end
    end
  end

  # PUT /scanners/1
  # PUT /scanners/1.json
  def update
    @scanner = Scanner.find(params[:id])

    respond_to do |format|
      if @scanner.update_attributes(params[:scanner])
        format.html { redirect_to @scanner, notice: 'Scanner was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @scanner.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /scanners/1
  # DELETE /scanners/1.json
  def destroy
    @scanner = Scanner.find(params[:id])
    @scanner.destroy

    respond_to do |format|
      format.html { redirect_to scanners_url }
      format.json { head :no_content }
    end
  end
end
