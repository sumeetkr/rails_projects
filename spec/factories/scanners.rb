# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :scanner do
    identifier "MyString"
    beconId 1
  end
end
