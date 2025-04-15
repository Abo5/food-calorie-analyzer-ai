require 'net/http'
require 'uri'
require 'json'
require 'tempfile'
require 'securerandom'
require 'fileutils'

# --------------------------------------------------
# Utility: make a **byte‑wise unique** copy of an image so the API
# generates a new hash/filename even if the visual content is identical.
# --------------------------------------------------
# Strategy: نضيف ذيل (tail) عشوائي بعد نهاية الملف. هذا لا يؤثر على عرض
# الصورة لكن يغيّر تجزئة المحتوى (hash) وبالتالي يجبر السيرفر على إنشاء
# ID مختلف.
# يعمل مع JPEG/PNG/… لأن معالجات الصور عادةً تتجاهل البيانات بعد نهاية الملف.
# --------------------------------------------------

def make_file_unique(original_path)
  data = File.binread(original_path)
  random_tail = SecureRandom.hex(20)            # 40‑char random string
  unique_data = data + random_tail              # append after EOF

  tmp = Tempfile.new(['unique', File.extname(original_path)], binmode: true)
  tmp.write(unique_data)
  tmp.close
  tmp.path                                      # return path to unique copy
end

# --------------------------------------------------
# Upload image and return filename issued by the API
# --------------------------------------------------

def upload_image(file_path)
  uri = URI.parse('https://api.gr8api.com/v1/file/public/upload')

  params = {
    'app_package'       => 'net.appedietInformation.appediet@1.36.52504031126',
    'appstore_country'  => 'SAU',
    'country'           => 'us',
    'device_id'         => '8e172e2130acd995bb17d2e21a842fdc',
    'language'          => 'ar-ar',
    'machine_datetime'  => Time.now.strftime('%Y-%m-%d'),
    'os_version'        => '18.3.1',
    'platform'          => 'iOS',
    'request_id'        => '',
    'seconds_from_gmt'  => '10800',
    'time_zone'         => '3'
  }

  uri.query = URI.encode_www_form(params)

  file_data = File.binread(file_path)
  puts "File size: #{file_data.bytesize} bytes"

  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true

  request = Net::HTTP::Post.new(uri.request_uri)

  content_type = case File.extname(file_path).downcase
                 when '.jpg', '.jpeg' then 'image/jpeg'
                 when '.png'          then 'image/png'
                 when '.heic'         then 'image/heic'
                 else                     'application/octet-stream'
                 end

  request['Content-Type']     = content_type
  request['Accept']           = '*/*'
  request['Accept-Encoding']  = 'gzip, deflate, br'
  request['User-Agent']       = 'Appediet/1.36.5 (net.appedietInformation.appediet; build:1.36.52504031126; iOS 18.3.1) Alamofire/5.10.2'
  request['Accept-Language']  = 'ar-US;q=1.0, en-US;q=0.9'

  request.body = file_data

  puts 'Sending image to server…'
  response = http.request(request)
  puts "Response code: #{response.code}"

  # decompress if the server gzips the body
  temp_file = Tempfile.new('compressed', binmode: true)
  temp_file.write(response.body)
  temp_file.close

  decompressed_file = Tempfile.new('decompressed')
  decompressed_file.close
  system("gunzip -c #{temp_file.path} > #{decompressed_file.path} 2>/dev/null")

  decompressed_data = File.read(decompressed_file.path)
  temp_file.unlink
  decompressed_file.unlink

  begin
    json_data = JSON.parse(decompressed_data)
    if json_data.dig('data', 'filename')
      filename = json_data['data']['filename']
      puts "Filename from API: #{filename}"
      return filename
    else
      puts 'No filename found in response'
      nil
    end
  rescue JSON::ParserError => e
    puts "Failed to parse response as JSON: #{e.message}"
    nil
  end
end

# --------------------------------------------------
# Call food recognition endpoint
# --------------------------------------------------

def recognize_food(filename)
  uri = URI.parse('https://api.gr8api.com/v1/algorithm/food_recognition_v3')

  params = {
    'app_package'       => 'net.appedietInformation.appediet@1.36.52504031126',
    'appstore_country'  => 'SAU',
    'country'           => 'us',
    'device_id'         => '8e172e2130acd995bb17d2e21a842fdc',
    'filename'          => filename,
    'language'          => 'ar-ar',
    'machine_datetime'  => Time.now.strftime('%Y-%m-%d'),
    'os_version'        => '18.3.1',
    'platform'          => 'iOS',
    'request_id'        => SecureRandom.uuid,
    'seconds_from_gmt'  => '10800',
    'time_zone'         => '3'
  }

  uri.query = URI.encode_www_form(params)
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Post.new(uri.request_uri)
  request['Content-Type']    = 'application/json'
  request['Accept']          = '*/*'
  request['Accept-Encoding'] = 'gzip, deflate, br'
  request['User-Agent']      = 'Appediet/1.36.5 (net.appedietInformation.appediet; build:1.36.52504031126; iOS 18.3.1) Alamofire/5.10.2'
  request['Accept-Language'] = 'ar-US;q=1.0, en-US;q=0.9'
  request.body = '{}'

  puts 'Sending food recognition request…'
  response = http.request(request)
  puts "Response code: #{response.code}"

  temp_file = Tempfile.new('compressed', binmode: true)
  temp_file.write(response.body)
  temp_file.close

  decompressed_file = Tempfile.new('decompressed')
  decompressed_file.close
  system("gunzip -c #{temp_file.path} > #{decompressed_file.path} 2>/dev/null")

  decompressed_data = File.read(decompressed_file.path)
  temp_file.unlink
  decompressed_file.unlink

  JSON.parse(decompressed_data) rescue nil
end

# --------------------------------------------------
# Pretty‑print nutrition data
# --------------------------------------------------

def display_nutrition_data(json_data)
  food_data = json_data.dig('data', 'components', 0, 'list', 0) rescue nil
  unless food_data
    puts 'Error: Could not find food data in the response'
    return false
  end

  puts "\n===================== FOOD ANALYSIS ====================="
  puts "Food name:        #{food_data['brief_name']}"
  puts "Serving size:     #{food_data['food_unit']}"
  puts "Calories:         #{food_data['kcal']} kcal"
  puts "Protein:          #{food_data['protein']}"
  puts "Carbs:            #{food_data['carbs']}"
  puts "Fat:              #{food_data['fat']}"
  puts "Sugar:            #{food_data['sugar']}"
  puts "Fiber:            #{food_data['dietary_fiber']}"
  puts "Sodium:           #{food_data['sodium']}"
  puts "Cholesterol:      #{food_data['cholesterol']}"
  puts "Saturated fat:    #{food_data['saturated']}"
  puts "Trans fat:        #{food_data['trans']}"
  puts "Calcium:          #{food_data['calcium']}"
  puts "Iron:             #{food_data['iron']}"
  puts "Vitamin A:        #{food_data['vitamins_a']}"
  puts "Vitamin C:        #{food_data['vitamins_c']}"
  puts "Vitamin D:        #{food_data['vitamins_d']}"
  puts "Caffeine:         #{food_data['caffeine']}"
  puts "Confidence score: #{food_data['score']}%"
  puts "=========================================================="
  true
end

# --------------------------------------------------
# Main program
# --------------------------------------------------

puts 'Enter the path to your food image:'
image_path = STDIN.gets.chomp
abort 'Error: File not found!' unless File.exist?(image_path)

puts "Processing food image at: #{image_path}"
unique_path = make_file_unique(image_path)
puts "Generated unique copy: #{unique_path}"

filename = upload_image(unique_path)
if filename
  recognition_data = recognize_food(filename)
  recognition_data ? display_nutrition_data(recognition_data) : (puts 'Failed to get recognition data')
else
  puts 'Failed to upload image'
end
