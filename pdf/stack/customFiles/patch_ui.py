import zipfile
import os

jar_path = '/app/app.jar'
css_path = '/customFiles/static/css/hide-pro.css'
out_dir = '/customFiles/static'
out_html = os.path.join(out_dir, 'index.html')

print('Extracting and patching index.html...')

# 1. Read the original index.html from JAR
with zipfile.ZipFile(jar_path, 'r') as z:
    html_content = z.read('static/index.html').decode('utf-8')

# 2. Read custom CSS
if os.path.exists(css_path):
    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
else:
    css_content = ''
    print('Warning: hide-pro.css not found at', css_path)

if css_content:
    style_tag = f'\n    <!-- Stirling PDF Clean UI Patch -->\n    <style>\n{css_content}\n    </style>\n  </head>'
    # Replace </head> with the style tag + </head>
    html_content = html_content.replace('</head>', style_tag)
    print('CSS styles injected.')
else:
    print('No CSS injected.')

# 3. Write to /customFiles/static/index.html
os.makedirs(out_dir, exist_ok=True)
with open(out_html, 'w', encoding='utf-8') as f:
    f.write(html_content)

print('Patch applied successfully to:', out_html)
