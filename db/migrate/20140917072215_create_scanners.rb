class CreateScanners < ActiveRecord::Migration
  def change
    create_table :scanners do |t|
      t.string :identifier
      t.integer :beconId

      t.timestamps
    end
  end
end
