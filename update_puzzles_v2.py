import re
import json

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the hash
html = html.replace('24e5e1c2bbef565360c392851175f46821fc21d6725503a600353625b4c9209c', '61933d3774170c68e3ae3ab49f20ca22db83a6a202410ffa6475b25ab44bb4da')
html = html.replace('// sudo', '// singularity')

# Update elephants dream to be bold in all instances
html = html.replace('elephants dream,', '<strong>elephants dream</strong>,')
html = html.replace(' elephants dream ', ' <strong>elephants dream</strong> ')

tabs_en = {
    11: "<h1>Quantum Cryptography</h1><p>As classical computing reaches its physical limits, quantum computing threatens to shatter modern encryption standards. Algorithms like RSA rely on the difficulty of factoring large primes, a task that Shor's algorithm can theoretically solve in polynomial time on a quantum computer.</p><p>The transition to post-quantum cryptography is already underway. To secure the future, developers must think differently. The key to true security might simply be a <strong>lattice</strong>.</p><p>You are getting deeper into the archive. The surface is far behind you now.</p>",
    12: "<h1>Memory Fragmentation Warning</h1><p>[CRITICAL ERROR] System highly unstable. Dynamic memory allocation failed at virtual address 0x7FFA8B92. Page fault encountered during sector read operation.</p><p>[WARNING] Automated garbage collection protocol paused indefinitely to prevent cascade failure. Current heap fragmentation now exceeds 84%. Available continuous memory blocks are critically low.</p><p>The system is beginning to tear itself apart attempting to render these final partitions. The remaining data blocks are corrupted. The core dump yielded only a single unreadable string: <strong>digzcnecimr</strong></p>",
    13: "<h1>The Void</h1><p>...</p><p>...</p><p>There is almost nothing left here. You have collected all the fragments. It's time to assemble them into a cohesive whole.</p><p>To decrypt the final secret, you must shift the corrupted data using the post-quantum key. A classic polyalphabetic approach.</p>"
}

tabs_nl = {
    11: "<h1>Kwantumcryptografie</h1><p>Naarmate klassiek computergebruik de fysieke grenzen bereikt, dreigt kwantumcomputing moderne coderingsstandaarden te verbrijzelen. Algoritmen zoals RSA vertrouwen op de moeilijkheid om grote priemgetallen te ontbinden, een taak die het algoritme van Shor in theorie in polynomiale tijd op een kwantumcomputer kan oplossen.</p><p>De overgang naar post-kwantumcryptografie is al gaande. Om de toekomst veilig te stellen, moeten ontwikkelaars anders denken. De sleutel tot echte beveiliging is misschien wel een <strong>lattice</strong>.</p><p>Je raakt steeds dieper in het archief. De oppervlakte ligt nu ver achter je.</p>",
    12: "<h1>Waarschuwing Geheugenfragmentatie</h1><p>[KRITIEKE FOUT] Systeem zeer onstabiel. Dynamische geheugentoewijzing mislukt op virtueel adres 0x7FFA8B92. Paginafout opgetreden tijdens de leesbewerking van de sector.</p><p>[WAARSCHUWING] Geautomatiseerd garbage collection-protocol voor onbepaalde tijd gepauzeerd om cascadefalen te voorkomen. De huidige heapfragmentatie is nu groter dan 84%. Beschikbare aaneengesloten geheugenblokken zijn kritiek laag.</p><p>Het systeem begint zichzelf uit elkaar te trekken in een poging deze laatste partities te renderen. De overige datablokken zijn beschadigd. De core dump leverde slechts één onleesbare string op: <strong>digzcnecimr</strong></p>",
    13: "<h1>De Leegte</h1><p>...</p><p>...</p><p>Er is hier bijna niets meer over. Je hebt alle fragmenten verzameld. Het is tijd om ze tot een samenhangend geheel te smeden.</p><p>Om het laatste geheim te ontsleutelen, moet je de corrupte data verschuiven met behulp van de post-kwantumsleutel. Een klassieke polyalfabetische benadering.</p>"
}

tabs_fr = {
    11: "<h1>Cryptographie Quantique</h1><p>Alors que l'informatique classique atteint ses limites physiques, l'informatique quantique menace de briser les normes de chiffrement modernes. Des algorithmes comme RSA reposent sur la difficulté de factoriser de grands nombres premiers, une tâche que l'algorithme de Shor peut théoriquement résoudre en temps polynomial sur un ordinateur quantique.</p><p>La transition vers la cryptographie post-quantique est déjà en cours. Pour sécuriser l'avenir, les développeurs doivent penser différemment. La clé d'une véritable sécurité pourrait bien être un <strong>lattice</strong>.</p><p>Vous vous enfoncez plus profondément dans les archives. La surface est loin derrière vous maintenant.</p>",
    12: "<h1>Avertissement de Fragmentation de la Mémoire</h1><p>[ERREUR CRITIQUE] Système très instable. L'allocation de mémoire dynamique a échoué à l'adresse virtuelle 0x7FFA8B92. Défaut de page rencontré lors de l'opération de lecture de secteur.</p><p>[AVERTISSEMENT] Le protocole de ramassage de miettes automatisé a été suspendu indéfiniment pour éviter une défaillance en cascade. La fragmentation actuelle du tas dépasse maintenant 84 %. Les blocs de mémoire continue disponibles sont à un niveau critique.</p><p>Le système commence à se déchirer en tentant de rendre ces dernières partitions. Les blocs de données restants sont corrompus. Le vidage de mémoire n'a donné qu'une seule chaîne illisible: <strong>digzcnecimr</strong></p>",
    13: "<h1>Le Vide</h1><p>...</p><p>...</p><p>Il ne reste presque plus rien ici. Vous avez rassemblé tous les fragments. Il est temps de les assembler en un tout cohérent.</p><p>Pour décrypter le secret final, vous devez décaler les données corrompues à l'aide de la clé post-quantique. Une approche polyalphabétique classique.</p>"
}

tabs_zh = {
    11: "<h1>量子密码学</h1><p>随着经典计算达到其物理极限，量子计算威胁要打破现代加密标准。像 RSA 这样的算法依赖于分解大素数的困难，而 Shor 算法理论上可以在量子计算机上以多项式时间解决这一任务。</p><p>向后量子密码学的过渡已经在进行中。为了确保未来的安全，开发人员必须改变思维。真正安全的密钥可能只是一个 <strong>lattice</strong>。</p><p>你正在深入档案。表面现在已经远远落后于你。</p>",
    12: "<h1>内存碎片警告</h1><p>[严重错误] 系统高度不稳定。在虚拟地址 0x7FFA8B92 动态内存分配失败。在扇区读取操作期间遇到页面错误。</p><p>[警告] 自动垃圾收集协议已无限期暂停以防止级联故障。当前的堆碎片现已超过 84%。可用的连续内存块极度不足。</p><p>系统正在开始崩溃，试图渲染这些最后的物理分区。剩余的数据块已损坏。核心转储仅产生了一个不可读的字符串：<strong>digzcnecimr</strong></p>",
    13: "<h1>虚空</h1><p>...</p><p>...</p><p>这里几乎什么都没有剩下。你已经收集了所有片段。是时候将它们组装成一个连贯的整体了。</p><p>要解密最终的秘密，你必须使用后量子密钥来移位损坏的数据。一种经典的多表替换方法。</p>"
}

def replace_tab(html, lang, id, new_text):
    lang_pattern = f'"{lang}": \\['
    lang_start = html.find(lang_pattern)
    if lang_start == -1: return html
    
    id_pattern = f'"id": {id},'
    id_start = html.find(id_pattern, lang_start)
    
    content_start = html.find('"content": "', id_start) + len('"content": "')
    content_end = html.find('"', content_start)
    
    new_html = html[:content_start] + new_text.replace('"', '\\"') + html[content_end:]
    return new_html

for i in [11, 12, 13]:
    html = replace_tab(html, 'en', i, tabs_en[i])
    html = replace_tab(html, 'nl', i, tabs_nl[i])
    html = replace_tab(html, 'fr', i, tabs_fr[i])
    html = replace_tab(html, 'zh', i, tabs_zh[i])

html = re.sub(r'console\.log\("Authority required\. Password: sudo"\);', 'console.log("Authority required.");', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html")
