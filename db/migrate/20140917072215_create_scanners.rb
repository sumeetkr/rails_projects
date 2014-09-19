class CreateScanners < ActiveRecord::Migration
  def change
    create_table :scanners do |t|
      t.string :identifier
      t.string :beconId, :limit => 8

      t.timestamps
    end
  end
end
