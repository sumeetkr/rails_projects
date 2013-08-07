class CreateApplications < ActiveRecord::Migration
  def change
    create_table :applications do |t|
      t.string :name
      t.text :description
      t.string :web_url
      t.string :mobile_url

      t.timestamps
    end
  end
end
