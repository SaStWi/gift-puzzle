const fs = require('fs');
let content = fs.readFileSync('src/main.js', 'utf8');

const level3Ids = [
  'arch_c1_1', 'arch_c1_2', 'arch_c2_1', 'arch_c2_2',
  'b2_c1_1', 'b2_c1_2', 'b2_c2_1', 'b2_c2_2',
  'b3_c1_1', 'b3_c1_2', 'b3_c2_1', 'b3_c2_2'
];

let newNodesStr = '\n  // Level 4 Children\n';
let c = 100;
level3Ids.forEach(parent => {
  newNodesStr += `  { id: '${parent}_1', title: 'Project Alpha', desc: 'Classified.', cost: ${c}, reward: ${c*2}, url: '#', parent: '${parent}' },\n`;
  newNodesStr += `  { id: '${parent}_2', title: 'Project Beta', desc: 'Classified.', cost: ${c+10}, reward: ${(c+10)*2}, url: '#', parent: '${parent}' },\n`;
  c += 20;
});

const insertPoint = content.indexOf('];');
content = content.slice(0, insertPoint) + newNodesStr + content.slice(insertPoint);

fs.writeFileSync('src/main.js', content);
console.log('Added 24 nodes');
