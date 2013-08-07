class AddLogoToApplications < ActiveRecord::Migration
  def change
    add_column :applications, :logo_url, :string
  end
end
