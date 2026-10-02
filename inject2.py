import base64
import re
import os

img_path = r'c:\Projecten\Thijs cadaeu\background.jpg'

# Read the image
with open(img_path, 'rb') as img_file:
    raw_data = img_file.read()
    b64_string = base64.b64encode(raw_data).decode('utf-8')

# Detect if it's actually a gif despite the .jpg extension
mime_type = 'image/jpeg'
if raw_data.startswith(b'GIF87a') or raw_data.startswith(b'GIF89a'):
    mime_type = 'image/gif'

print(f"Detected mime type: {mime_type}")

# Read the HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the background image URL in the CSS
new_html = re.sub(
    r"background-image:\s*url\('data:image/[^;]+;base64,[^']+'\);", 
    f"background-image: url('data:{mime_type};base64,{b64_string}');", 
    html
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print('Successfully injected new background image')
