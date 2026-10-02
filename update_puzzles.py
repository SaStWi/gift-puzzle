import time
import re
import json
from deep_translator import GoogleTranslator

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the hash
html = html.replace('24e5e1c2bbef565360c392851175f46821fc21d6725503a600353625b4c9209c', '61933d3774170c68e3ae3ab49f20ca22db83a6a202410ffa6475b25ab44bb4da')
html = html.replace('// sudo', '// singularity')

# Update elephants dream to be bold in all instances
html = html.replace('elephants dream,', '<strong>elephants dream</strong>,')
html = html.replace(' elephants dream ', ' <strong>elephants dream</strong> ')

# Translate new tab contents
tab11_en = "<h1>Quantum Cryptography</h1><p>As classical computing reaches its physical limits, quantum computing threatens to shatter modern encryption standards. Algorithms like RSA rely on the difficulty of factoring large primes, a task that Shor's algorithm can theoretically solve in polynomial time on a quantum computer.</p><p>The transition to post-quantum cryptography is already underway. To secure the future, developers must think differently. The key to true security might simply be a <strong>lattice</strong>.</p><p>You are getting deeper into the archive. The surface is far behind you now.</p>"

tab12_en = "<h1>Memory Fragmentation Warning</h1><p>[CRITICAL ERROR] System highly unstable. Dynamic memory allocation failed at virtual address 0x7FFA8B92. Page fault encountered during sector read operation.</p><p>[WARNING] Automated garbage collection protocol paused indefinitely to prevent cascade failure. Current heap fragmentation now exceeds 84%. Available continuous memory blocks are critically low.</p><p>The system is beginning to tear itself apart attempting to render these final partitions. The remaining data blocks are corrupted. The core dump yielded only a single unreadable string: <strong>digzcnecimr</strong></p>"

tab13_en = "<h1>The Void</h1><p>...</p><p>...</p><p>There is almost nothing left here. You have collected all the fragments. It's time to assemble them into a cohesive whole.</p><p>To decrypt the final secret, you must shift the corrupted data using the post-quantum key. A classic polyalphabetic approach.</p>"

t_nl = GoogleTranslator(source='en', target='nl')
t_fr = GoogleTranslator(source='en', target='fr')
t_zh = GoogleTranslator(source='en', target='zh-CN')

def replace_tab(html, lang, id, old_en, new_en):
    if lang == 'en':
        new_text = new_en
    elif lang == 'nl':
        time.sleep(2); new_text = t_nl.translate(new_en)
    elif lang == 'fr':
        time.sleep(2); new_text = t_fr.translate(new_en)
    elif lang == 'zh':
        time.sleep(2); new_text = t_zh.translate(new_en)
        
    lang_pattern = f'"{lang}": \\['
    lang_start = html.find(lang_pattern)
    if lang_start == -1: return html
    
    id_pattern = f'"id": {id},'
    id_start = html.find(id_pattern, lang_start)
    
    content_start = html.find('"content": "', id_start) + len('"content": "')
    content_end = html.find('"', content_start)
    
    new_html = html[:content_start] + new_text.replace('"', '\\"') + html[content_end:]
    return new_html

for lang in ['en', 'nl', 'fr', 'zh']:
    html = replace_tab(html, lang, 11, "", tab11_en)
    html = replace_tab(html, lang, 12, "", tab12_en)
    html = replace_tab(html, lang, 13, "", tab13_en)

html = re.sub(r'console\.log\("Authority required\. Password: sudo"\);', 'console.log("Authority required.");', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html")
