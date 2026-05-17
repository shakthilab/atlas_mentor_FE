const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/app/features');
let changedFiles = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // We want to replace the `.module-container` block completely if it has a background.
  // Actually, to make them all like employee-list, we should remove the redundant layout styles.
  // But maybe it's safer to just replace `background: var(--color-gray-50);` with `background: transparent;` or completely remove it.
  // Also `background-color: var(--color-gray-50);`
  // To specifically target `.module-container`, we can use regex.
  
  // Let's just remove `background: var(--color-gray-50);` and `background-color: var(--color-gray-50);` 
  // from within `.module-container` and `body`.
  
  const regex1 = /\.module-container\s*\{[^}]*background(-color)?:\s*var\(--color-gray-50\);[^}]*\}/g;
  
  content = content.replace(regex1, match => {
    return match.replace(/background(-color)?:\s*var\(--color-gray-50\);/g, '');
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles.push(file);
  }
});

console.log('Changed files:', changedFiles);
