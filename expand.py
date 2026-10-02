import json
import time
from deep_translator import GoogleTranslator

# 15 expanded English articles
tabs_en = [
    {
        "id": 1,
        "title": "Welcome to the Archive",
        "content": "<h1>Welcome to my Personal Archive</h1><p>This server acts as a digital repository for my most intimate thoughts, ongoing projects, and deeply technical research logs. Over the years, I've accumulated a massive amount of data regarding software development, hardware architectures, digital art, and philosophical musings on the nature of information itself. The sheer volume of this data became overwhelming, prompting me to build this custom indexing system to keep everything organized and accessible.</p><p>However, you'll immediately notice that the majority of the archives on the left navigation panel are locked. Due to the highly sensitive nature of some of my earlier experiments—some of which skirt the boundaries of conventional ethical guidelines—the system requires strict authorization to access deeper directories. I cannot afford to let this information fall into the wrong hands, nor do I want casual observers stumbling upon my unfinished algorithms.</p><p>You are welcome to navigate using the tabs on the left. The search bar located above the navigation pane acts as a global query terminal. If you manage to deduce the access codes from the context provided in these public logs, you can enter them there. Each correct code will systematically decrypt the next sequential partition in the archive. I have designed this security mechanism to be challenging but entirely solvable for someone with the right mindset.</p><p>Take your time. Read carefully. The answers are hidden in plain sight, woven into the fabric of my writings. Do not overlook the details.</p>"
    },
    {
        "id": 2,
        "title": "My Journey into Linux",
        "content": "<h1>My Journey into Linux</h1><p>I still remember the very first time I intentionally wiped my Windows partition. It was a terrifying moment, yet incredibly liberating. Transitioning to a Unix-like environment fundamentally changed how I interact with computers. Instead of hiding the system behind an opaque graphical user interface, Linux exposes the raw, unadulterated power of the kernel to anyone willing to learn how to wield it.</p><p>Learning the command line was undeniably a steep curve. I spent weeks just figuring out the intricacies of file permissions, piping terminal outputs between obscure utilities, and writing basic bash scripts to automate my daily workflows. But the philosophy of open-source software is what truly captivated my imagination. The idea that an operating system is a collaborative effort, continually refined by thousands of passionate developers worldwide, is a beautiful testament to human cooperation.</p><p>It's genuinely fascinating to think about the origins of this ecosystem. Linus Torvalds created something in his dorm room that essentially runs the modern world—from massive enterprise web servers handling global commerce to the smartphone in your pocket. The community's appreciation for his monumental contribution is so vast that the astronomical community even honored him. He literally has a main-belt asteroid named after him. I was reading about its numerical designation the other day and realized how historical it is. Knowing that number almost feels like holding a piece of computing history.</p><p>These days, I run Arch on my main workstation. The rolling release model means I'm always on the bleeding edge of software updates, even if it occasionally breaks my display server. But fixing those breaks is part of the fun.</p>"
    },
    {
        "id": 3,
        "title": "Exploring 3D with Blender",
        "content": "<h1>Exploring 3D with Blender</h1><p>Digital art has always been a side hobby of mine, but when I first discovered Blender, that casual interest rapidly blossomed into a full-blown obsession. The sheer fact that a completely free, open-source application can rival, and in many areas surpass, industry giants like Maya and Cinema4D is nothing short of astounding.</p><p>Looking back, my early projects were absolutely terrible. I struggled immensely with proper mesh topology, my lighting setups were incredibly flat and lifeless, and my render times were atrocious simply because I didn't understand how to optimize sample counts and light bounces in the Cycles render engine. But over time, through sheer persistence and hundreds of hours of tutorials, things finally clicked. I learned the incredible power of procedural texturing using node-based workflows, allowing me to create infinitely scalable, highly realistic materials without ever touching external software like Photoshop.</p><p>When setting up a completely new scene, especially when testing complex material shaders or intricate global illumination setups, I almost always spawn the default monkey head primitive. It is the perfect test subject due to its varied surface angles. I often forget the name of the original artist who modeled her all those years ago, but she is an absolute icon in the community. Her name is practically synonymous with Blender testing at this point, and every seasoned 3D artist has stared at her low-poly face for countless hours.</p><p>Currently, I'm diving deep into experimenting with Geometry Nodes. The ability to parametrically generate entire sprawling cities or dense, organic forests using strict mathematical rules feels less like traditional art and more like programming with visual blocks. It is the future of 3D creation.</p>"
    },
    {
        "id": 4,
        "title": "The Evolution of Processors",
        "content": "<h1>The Evolution of Processors</h1><p>Hardware is the physical manifestation of abstract logic. We often sit at our desks and completely take for granted the incredible, mind-boggling complexity happening right underneath the CPU heatsink. Billions of microscopic transistors are switching on and off billions of times per second, all perfectly orchestrated by the relentless pulsing of a tiny clock crystal.</p><p>I've been avidly collecting vintage computing hardware recently, trying to build a physical timeline of technological progress. It's truly amazing to trace the direct lineage of the x86 architecture. We've gone from simple, clunky single-core chips that could barely handle basic arithmetic operations to massive, multi-core behemoths equipped with dedicated neural processing units designed for artificial intelligence.</p><p>If you look all the way back to the year 1971, you can pinpoint the true genesis of modern, ubiquitous computing. That was the year Intel released the very first commercially produced microprocessor to the public. That specific 4-digit model number changed the trajectory of human history forever, kicking off the digital revolution. It was originally designed merely to power Japanese calculators, but its general-purpose, programmable nature meant it was capable of so much more than its creators initially envisioned.</p><p>I strongly believe that understanding hardware architecture makes you a fundamentally better software developer. When you actually know how CPU caches (L1, L2, L3) work, you start writing code that respects memory locality. You stop fighting the hardware and start working in tandem with it, which invariably results in massive, tangible performance gains for your applications.</p>"
    },
    {
        "id": 5,
        "title": "Procedural Generation in Games",
        "content": "<h1>Procedural Generation in Games</h1><p>The concept of generating virtually infinite, explorable worlds algorithmically is, without a doubt, one of the most elegant and captivating applications of mathematics in computer science. Sandbox games like Minecraft rely heavily on complex algorithms like Perlin noise, Simplex noise, and cellular automata to create sprawling terrain that feels organically chaotic yet undeniably structured and playable.</p><p>I've spent a frankly embarrassing amount of time analyzing the decompiled Java source code of early Minecraft beta versions. The specific way the terrain generator layers multiple different 2D and 3D noise maps to determine exact block elevation, regional temperature, and local humidity—which in turn cross-reference a table to determine the biome—is absolutely brilliant in its optimization and simplicity.</p><p>Beyond the core terrain generation, the entire codebase is full of fascinating quirks, undocumented features, and inside jokes left by the original development team. For example, there is a highly specific, intentional easter egg programmed into the main menu where the large title screen logo randomly misspells the game's own name as 'Minceraft'. Statistically speaking, the exact percentage chance of this happening (format: 0.00%) is incredibly low, but it's a wonderfully fun detail that perfectly showcases the developers' unique sense of humor and personality.</p><p>Inspired by this, I'm currently trying to write my own high-performance voxel engine from scratch in C++. Managing efficient chunk loading, handling frustum culling, and writing greedy meshing algorithms on a completely separate thread is proving to be quite the technical challenge, but the learning experience is unparalleled.</p>"
    },
    {
        "id": 6,
        "title": "Archive 06",
        "content": "<h1>Open Source Cinema</h1><p>The core concept of 'Open Movies' was completely revolutionary when it was first introduced. It wasn't just about gathering a group of people to make a short animated film; it was a grueling, public initiative to stress-test open-source software in a highly demanding production environment and prove its professional viability to a highly skeptical world.</p><p>Back in 2006, the newly formed Blender Institute set out to do exactly this. They gathered a small, dedicated team of talented artists and hardcore developers in Amsterdam and released their very first Open Movie project under the studio codename 'Orange'. The exact title of the final film is a brilliant masterclass in surrealist storytelling and stands as a monumental technical achievement for its era, pushing the boundaries of what free software could render.</p><p>The greatest legacy of these projects is that all production assets—every 3D model, texture, rig, animation file, and final composite—are released directly to the public domain. This allows absolutely anyone, from eager students to veteran professionals, to download the files and study exactly how the shots were constructed. It's the ultimate educational resource, democratizing high-end animation techniques.</p><br><br><br><p style='opacity: 0.1; font-size: 14px;'>The most vital pieces of information are rarely handed to you on a silver platter. Sometimes, the hardest things to find are the things you don't even know you should be looking for. When you reach a dead end and the path forward is obscured, remember: 翻译.</p>"
    },
    {
        "id": 7,
        "title": "Archive 07",
        "content": "<h1>Web Security Practices</h1><p>Building truly secure web applications in today's digital landscape is a constant, exhausting arms race. Every single time a new, seemingly impenetrable defense mechanism is conceptualized and deployed, a completely new and unexpected attack vector is discovered by malicious actors. Common vulnerabilities like Cross-Site Scripting (XSS), sophisticated SQL Injection attacks, and Cross-Site Request Forgery (CSRF) are just the highly visible tip of a very deep, very dangerous iceberg.</p><p>One of the absolute foundational tenets of modern cybersecurity is that 'security through obscurity is never, ever enough'. Simply hiding a decryption key, obfuscating your API endpoints, or minifying your source code doesn't make your system safe; it merely delays the inevitable breach by a few hours. True security requires cryptographic proofs, strict sanitization, and zero-trust architectures.</p><p>Even in this very document, right in front of your eyes, I've left a practical demonstration of this flawed philosophy. The next access key you need is completely invisible to the normal, casual eye, hidden deep within the structural DOM of this page. If you know how to use your browser's developer tools and look closely in the metadata of this document's raw source code, you'll find a meta tag explicitly named 'vault-key'. This glaring exposure is exactly why sensitive authentication data should never be sent to the client-side architecture, even if it's not rendered on the visible screen.</p>"
    },
    {
        "id": 8,
        "title": "Archive 08",
        "content": "<h1>Atmospheric Sound Design</h1><p>Audio engineering is, without a shadow of a doubt, the most consistently underappreciated and overlooked aspect of professional game development. While players obsess over frame rates and texture resolutions, good sound design does so much more than just provide basic auditory feedback; it creates profound subconscious immersion, builds tension, and establishes deep emotional resonance with the player.</p><p>Minecraft's audio design, created primarily by the incredibly talented composer Daniel Rosenfeld (better known as C418), is deeply and hauntingly atmospheric. The minimalist, melancholic ambient tracks perfectly capture the existential feeling of vast isolation and endless exploration that defines the game's core experience. The game also features physical collectibles that manage to tell a compelling narrative story through sound alone, without a single line of written dialogue.</p><p>The absolute rarest music disc in the entire game is notorious among players. It cannot even be crafted, traded for, or found in normal dungeon chests. You have to trick a skeleton into shooting a creeper just to obtain it. Interestingly, its internal ID name in the game files is simply a number, which heavily adds to its eerie, unsettling, unfinished, and broken vibe. Listening to its disjointed audio track feels like uncovering a dark, forbidden secret about the very nature of the world itself.</p>"
    },
    {
        "id": 9,
        "title": "Archive 09",
        "content": "<h1>Resource Management Mechanics</h1><p>In the vast genre of survival crafting games, the underlying tech tree essentially dictates the entire pacing and emotional arc of the player's journey. You inevitably start with nothing, desperately punching trees with your bare hands just to survive the first night, and eventually, after hours of labor, you are constructing incredibly complex, redstone-powered automated sorting systems and mob farms.</p><p>A universally common and highly satisfying game mechanic involves physically combining volatile elemental resources to yield sturdy tier-2 crafting materials. For example, in many prominent block-building games, there is a specific interaction involving fluid dynamics: when flowing water is forced to collide directly over a static source block of lava, an incredibly dense, nearly immovable object is violently born from the reaction.</p><p>This specific block represents a critical transformation and a massive milestone for the player, because mining it is usually the one and only way to construct a portal to access the dangerous next dimension, acting as a natural, hard-coded gateway in the game's overarching progression system.</p><p>Designing these strict gameplay bottlenecks requires incredibly careful balancing by the developers to ensure the player feels a genuine, earned sense of accomplishment without crossing the line into extreme, game-quitting frustration.</p>"
    },
    {
        "id": 10,
        "title": "Archive 10",
        "content": "<h1>System Administration and Control</h1><p>Successfully maintaining and securing a public-facing server requires an almost paranoid level of strict discipline, especially regarding user permissions and access control lists. The fundamental 'Principle of Least Privilege' explicitly dictates that users, automated scripts, and background services should only ever have the absolute minimum level of access necessary to perform their specific required tasks. This design philosophy effectively minimizes the potential 'blast radius' if a single account or service is eventually compromised by an external threat.</p><p>Because of this, normal user accounts on this system are heavily restricted for your own safety. You cannot modify core files, you cannot install new packages, and you certainly cannot access the encrypted data vaults. But occasionally, necessary administrative tasks require full, unrestricted system access to modify deep kernel configurations, restart critical daemons, or manage localized services.</p><p>For this final, ultimate access key, you must prove that you understand how to assume absolute, overriding control of a Unix environment. I am not going to give you a riddle or a trivia question. Check the developer console for a hidden, heavily encrypted system message that was recently dispatched directly from the elevated root environment. If you know the universal command to execute actions as the superuser, you know the code.</p>"
    },
    {
        "id": 11,
        "title": "Archive 11",
        "content": "<h1>Quantum Cryptography and the Future</h1><p>We are rapidly approaching a massive technological paradigm shift. As classical silicon-based computing finally reaches its absolute physical limits regarding transistor density and heat dissipation, the looming shadow of quantum computing threatens to completely shatter modern encryption standards overnight. Widely used algorithms like RSA and ECC fundamentally rely on the mathematical difficulty of factoring incredibly large prime numbers—a task that would take a classical supercomputer millennia, but one that Peter Shor's algorithm can theoretically solve in polynomial time on a sufficiently powerful quantum computer.</p><p>The desperate transition to post-quantum cryptography is already quietly underway in secure government facilities. Researchers are scrambling to implement Lattice-based cryptography, multivariate polynomials, and hash-based signature schemes, which are currently the leading candidates to secure the future infrastructure of the global internet against quantum decryption attacks.</p><p>You are getting significantly deeper into the archive now. The surface web is far behind you. The air down here is thin, and the data is heavy. Do not lose your focus.</p>"
    },
    {
        "id": 12,
        "title": "Archive 12",
        "content": "<h1>Memory Fragmentation Warning</h1><p>[CRITICAL ERROR] System highly unstable. Dynamic memory allocation failed at virtual address 0x7FFA8B92. Page fault encountered during sector read operation.</p><p>[WARNING] Automated garbage collection protocol paused indefinitely to prevent cascade failure. Current heap fragmentation now exceeds 84%. Available continuous memory blocks are critically low.</p><p>The system is beginning to tear itself apart attempting to render these final partitions. The architectural integrity of this server cannot be guaranteed for much longer. Keep searching the previous archives. The remaining data blocks in this directory are heavily corrupted and actively decaying.</p><p>Time is running out. Do not linger here. The void is expanding.</p>"
    },
    {
        "id": 13,
        "title": "Archive 13",
        "content": "<h1>The Void</h1><p>...</p><p>...</p><p>There is absolutely nothing left here. The data has been completely expunged. The sectors have been zeroed out.</p><p>You have successfully collected all the necessary fragments scattered across the preceding logs. It's time to assemble them into a cohesive whole. Trust your instincts.</p>"
    },
    {
        "id": 14,
        "title": "The Final Gate",
        "content": "<h1>The Final Gate</h1><p>You stand at the absolute edge of the system architecture. You have meticulously combed through the logs, deciphered the technical jargon, and found all the hidden clues scattered across my personal archives.</p><p>There is only one final lock remaining between you and the core directory. Enter the final access code you obtained from the root environment into the global search terminal to permanently unlock the payload and open the gift.</p>"
    },
    {
        "id": 15,
        "title": "The Gift",
        "content": "<h1>Congratulations!</h1><p>System fully decrypted. Core access granted. You have successfully navigated the entire archive, proving both your extreme technical persistence and your broad domain knowledge.</p><p>This archive was designed specifically for you. Your reward is ready for extraction. Scan the secure payload below.</p><div id='qrcode'></div>"
    }
]

print(f"Loaded {len(tabs_en)} english articles.")

def translate_articles():
    print("Starting translations. This will take a moment to avoid rate limits...")
    out = {"en": tabs_en}
    
    languages = ['nl', 'fr', 'zh-CN']
    for lang in languages:
        print(f"Translating to {lang}...")
        translator = GoogleTranslator(source='en', target=lang)
        translated_tabs = []
        for tab in tabs_en:
            new_tab = tab.copy()
            # Try to translate, with retries
            for attempt in range(3):
                try:
                    new_tab['title'] = translator.translate(tab['title'])
                    new_tab['content'] = translator.translate(tab['content'])
                    
                    if lang == 'zh-CN' and tab['id'] == 6:
                        new_tab['content'] = new_tab['content'].replace('翻译', 'Random I guess')
                    break
                except Exception as e:
                    print(f"Error on tab {tab['id']}: {e}. Retrying in 3 seconds...")
                    time.sleep(3)
            
            translated_tabs.append(new_tab)
            time.sleep(1) # delay to avoid rate limit
        out[lang] = translated_tabs

    with open('expanded_translations.json', 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print("All translations complete and saved to expanded_translations.json")

if __name__ == "__main__":
    translate_articles()
