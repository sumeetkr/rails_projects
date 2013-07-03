source 'https://rubygems.org'

gem 'rails'
gem 'haml-rails'
gem 'jquery-rails'
gem 'jquery-ui-rails'
gem 'bootstrap-sass-rails'
gem 'date_validator'
gem 'devise'

# Used to generate sample data
gem 'factory_girl_rails'
gem "faker", '= 1.0.1' #Specific version required for heroku

gem 'heroku'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails', '3.2.5'
  gem 'coffee-rails'
  gem 'uglifier'
end

group :development, :test do
  gem 'sqlite3', '1.3.5'

  #Used to annotate models with the database schema
  gem 'annotate'

  #Gems for testing
  gem 'rspec-rails'
  gem 'shoulda-matchers'
  gem 'spork-rails'
  gem 'guard-rspec'
  gem 'guard-spork'

  #Guard dependencies
  gem 'rb-fsevent'
  gem 'growl'
  gem 'rails-erd'
end

group :test do
  #Integration
  gem 'capybara'
  # So that capybara can launch a browser
  gem 'launchy'

  #Code coverage
  gem 'simplecov'

  gem 'database_cleaner'
end

group :production do
  gem 'pg', '0.12.2'
end