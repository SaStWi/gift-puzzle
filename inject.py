import base64
import re

# Read the image
with open(r'C:\Users\wille\.gemini\antigravity-ide\brain\dc1ef6b0-15ad-4254-ae97-39b564b493b1\archive_background_1790495191571.jpg', 'rb') as img_file:
    b64_string = base64.b64encode(img_file.read()).decode('utf-8')

css_bg = f"""
        body {{
            background-color: var(--bg-color);
            background-image: url('data:image/jpeg;base64,{b64_string}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-blend-mode: multiply;
            background-attachment: fixed;
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
            margin: 0;
            display: flex;
            height: 100vh;
            overflow: hidden;
        }}
"""

# Read the HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the body CSS block
new_html = re.sub(r'body\s*\{[^}]*\}', css_bg.strip(), html, count=1)

# Ensure panels are slightly transparent to show the background
new_html = new_html.replace('background-color: var(--sidebar-bg);', 'background-color: rgba(22, 27, 34, 0.80); backdrop-filter: blur(8px); border-right: 1px solid rgba(48, 54, 61, 0.5);')
new_html = new_html.replace('background-color: rgba(139, 148, 158, 0.1);', 'background-color: rgba(255, 255, 255, 0.05);')
new_html = new_html.replace('background-color: rgba(88, 166, 255, 0.1);', 'background-color: rgba(88, 166, 255, 0.15); backdrop-filter: blur(4px);')
new_html = new_html.replace('background-color: rgba(0,0,0,0.2);', 'background-color: rgba(0, 0, 0, 0.4);')


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print('Successfully injected base64 background')
