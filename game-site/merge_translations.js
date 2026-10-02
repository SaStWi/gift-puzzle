import fs from 'fs';
import { TABS_DATA } from './games/puzzle/puzzle-data.js';

const zhTabs = JSON.parse(fs.readFileSync('zh_tabs.json', 'utf8'));

// Read original file as string to preserve hashes and structure above TABS_DATA
let content = fs.readFileSync('./games/puzzle/puzzle-data.js', 'utf8');

// Find the start of TABS_DATA
const exportIndex = content.indexOf('export const TABS_DATA');
if (exportIndex === -1) throw new Error('Could not find TABS_DATA');

// We will recreate the TABS_DATA portion
let topContent = content.substring(0, exportIndex);

let newDataStr = `export const TABS_DATA = {\n`;
newDataStr += `  en: ${JSON.stringify(TABS_DATA.en, null, 4)},\n`;
newDataStr += `  zh: ${JSON.stringify(zhTabs, null, 4)}\n`;
newDataStr += `};\n`;

fs.writeFileSync('./games/puzzle/puzzle-data.js', topContent + newDataStr);
console.log('Successfully updated puzzle-data.js with zh translations');
