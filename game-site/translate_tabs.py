import json
import time
from deep_translator import GoogleTranslator

def run():
    print("Loading en_tabs.json...")
    with open('en_tabs.json', 'r', encoding='utf-8') as f:
        en_tabs = json.load(f)
        
    zh_tabs = []
    translator = GoogleTranslator(source='en', target='zh-CN')
    
    for tab in en_tabs:
        print(f"Translating Tab {tab['id']}...")
        new_tab = tab.copy()
        
        for attempt in range(3):
            try:
                new_tab['title'] = translator.translate(tab['title'])
                new_tab['content'] = translator.translate(tab['content'])
                
                # Custom logic for Tab 6
                if tab['id'] == 6:
                    # In English, it says "remember: 翻译". When translated, it becomes Chinese.
                    # We inject the answer into the Chinese translation.
                    new_tab['content'] = new_tab['content'].replace('翻译', 'random i guess')
                    
                break
            except Exception as e:
                print(f"Error: {e}, retrying...")
                time.sleep(2)
                
        zh_tabs.append(new_tab)
        time.sleep(1)
        
    with open('zh_tabs.json', 'w', encoding='utf-8') as f:
        json.dump(zh_tabs, f, ensure_ascii=False, indent=2)
    print("Done generating zh_tabs.json!")

if __name__ == '__main__':
    run()
