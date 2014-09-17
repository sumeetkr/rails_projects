class CreateBeacons < ActiveRecord::Migration
  def change
    create_table :beacons do |t|
      t.string :identifier
      t.string :location
      t.decimal :lat, {:precision=>10, :scale=>6}
      t.decimal :lng, {:precision=>10, :scale=>6}

      t.timestamps
    end
  end
end
