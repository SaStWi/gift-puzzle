import fs from 'fs';
import { TABS_DATA } from './games/puzzle/puzzle-data.js';

// Load expanded translations for the first 15 tabs for zh
const oldTrans = JSON.parse(fs.readFileSync('../expanded_translations.json', 'utf8'));
const zhOld = oldTrans['zh-CN'];

// Get tab 6 old translation
const tab6Zh = zhOld.find(t => t.id === 6);
let tab6Content = tab6Zh.content.replace('翻译', 'random i guess');

// Create zh tabs
const zhTabs = TABS_DATA.en.map(tab => {
  if (tab.id === 6) {
    return {
      ...tab,
      title: tab6Zh.title,
      content: tab6Content
    };
  }
  return { ...tab }; // fallback to en for others
});

// Other languages simply fallback to EN completely as per instruction to only reveal in ZH
const otherLangs = ['nl', 'sv', 'it', 'fr'];

let content = fs.readFileSync('./games/puzzle/puzzle-data.js', 'utf8');
const exportIndex = content.indexOf('export const TABS_DATA');
let topContent = content.substring(0, exportIndex);

let newDataStr = `export const TABS_DATA = {\n`;
newDataStr += `  en: ${JSON.stringify(TABS_DATA.en, null, 4)},\n`;
newDataStr += `  zh: ${JSON.stringify(zhTabs, null, 4)},\n`;
for (let i = 0; i < otherLangs.length; i++) {
  const lang = otherLangs[i];
  newDataStr += `  ${lang}: ${JSON.stringify(TABS_DATA.en, null, 4)}${i === otherLangs.length - 1 ? '' : ','}\n`;
}
newDataStr += `};\n`;

fs.writeFileSync('./games/puzzle/puzzle-data.js', topContent + newDataStr);
console.log('Successfully updated puzzle-data.js with new languages');
