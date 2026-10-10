import os
import re

directory = '/home/pro/Downloads/expiry/docs/architecture'

mapping = {
    '07-scenarios': '04-user-flows',
    '09-user-flows': '04-user-flows',
    '10-data-flows': '06-data-model',
    '11-data-dictionary': '06-data-model',
    '13-erd': '06-data-model',
    '14-system-architecture': '08-architecture',
    '15-backend-api': '07-api',
    '16-frontend-ui': '09-advanced-web',
    '18-auth-security': '07-api',
    '20-testing': '10-testing',
    '21-deployment': '08-architecture',
    '22-extension': '03-requirements-features',
    '23-implementation-plan': '12-process',
    'traceability': '11-traceability',
    'wireframes': '05-interaction-design'
}

def replace_links(match):
    full_match = match.group(0)
    prefix = match.group(1) or ""
    old_dir = match.group(2)
    rest = match.group(3)
    
    if old_dir in mapping:
        new_dir = mapping[old_dir]
        return f"{prefix}{new_dir}/{rest}"
    return full_match

pattern = re.compile(r'(\.\./)?([0-9a-zA-Z-]+)/([^)]+\.md)')

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if filepath.endswith('.json'):
        new_content = content
        for old, new in mapping.items():
            new_content = new_content.replace(f'"{old}/', f'"{new}/')
    else:
        new_content = pattern.sub(replace_links, content)
        for old, new in mapping.items():
            new_content = new_content.replace(f'../{old}/', f'../{new}/')
            new_content = new_content.replace(f']({old}/', f']({new}/')

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.md') or file.endswith('.json'):
            fix_file(os.path.join(root, file))

print("Done.")
