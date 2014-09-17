# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :beacon do
    identifier "MyString"
    location "MyString"
    lat "9.99"
    lng "9.99"
  end
end
