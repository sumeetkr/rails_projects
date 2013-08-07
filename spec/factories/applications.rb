# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :application do
    name "MyString"
    description "MyText"
    web_url "MyString"
    mobile_url "MyString"
  end
end
