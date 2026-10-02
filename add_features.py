import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Replace gift URL
html = html.replace('const giftUrl = "[INSERT_GIFT_URL_HERE]";', 'const giftUrl = "https://youtu.be/mSigbsMH5lk";')

# 2. Add Reset Button
button_html = """                <select id="lang-select" onchange="changeLanguage(this.value)">
                    <option value="en">EN</option>
                    <option value="nl">NL</option>
                    <option value="fr">FR</option>
                    <option value="zh">ZH</option>
                </select>
                <button onclick="resetProgress()" style="background: transparent; border: 1px solid var(--error); color: var(--error); border-radius: 4px; padding: 2px 6px; cursor: pointer; font-size: 0.75rem; margin-left: 8px; font-family: 'Roboto Mono', monospace; transition: all 0.2s;" onmouseover="this.style.background='var(--error)'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='var(--error)';">RESET</button>"""
                
html = re.sub(r'<select id="lang-select" onchange="changeLanguage\(this\.value\)">\s*<option value="en">EN</option>\s*<option value="nl">NL</option>\s*<option value="fr">FR</option>\s*<option value="zh">ZH</option>\s*</select>', button_html, html)

# 3. Add JS Function
reset_js = """        function resetProgress() {
            if (confirm("Are you sure you want to completely reset the archive? All decrypted data will be lost.")) {
                localStorage.removeItem('solvedHashes');
                solvedHashes.clear();
                currentTabId = 1;
                searchInput.value = '';
                // Hide QR code if it was rendered
                const qrDiv = document.querySelector('#qrcode');
                if (qrDiv) qrDiv.innerHTML = '';
                renderSidebar();
                selectTab(1);
            }
        }

        // Initialize"""

html = html.replace('// Initialize', reset_js)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Added Reset button and injected Gift URL")
