import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the blend mode and background color from body
html = html.replace("background-color: var(--bg-color);", "/* background-color: var(--bg-color); */")
html = html.replace("background-blend-mode: multiply;", "/* background-blend-mode: multiply; */")

# Add a glassmorphism background to content-box so text is readable
new_content_box = """        .content-box {
            max-width: 800px;
            margin: 0 auto;
            background-color: rgba(13, 17, 23, 0.7);
            padding: 40px;
            border-radius: 12px;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(48, 54, 61, 0.5);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }"""
html = re.sub(r'\.content-box\s*\{[^}]*\}', new_content_box, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("CSS fixed successfully")
