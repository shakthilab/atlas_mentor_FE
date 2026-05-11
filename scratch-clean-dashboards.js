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

const files = walk('src/app/features/dashboards');

const classesToRemove = [
  '.dashboard-wrapper',
  '.breadcrumb-nav',
  '.breadcrumb-icon',
  '.breadcrumb-sep',
  '.welcome-header',
  '.welcome-title',
  '.welcome-subtitle',
  '.stats-grid',
  '.stat-card',
  '.stat-card:hover',
  '.stat-label',
  '.stat-value',
  '.stat-trend',
  '.stat-trend i',
  '.stat-trend.up',
  '.stat-trend.down',
  '.trend-label',
  '.stat-icon-wrap',
  '.stat-icon-wrap i',
  '.charts-grid-tp',
  '.chart-card-tp',
  '.card-tp-header',
  '.card-tp-title',
  '.chart-container-tp',
  '.data-grid-tp',
  '.data-card-tp',
  '.status-badge-tp',
  '.status-badge-tp.registered',
  '.status-badge-tp.lead',
  '.status-badge-tp.lost'
];

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Find the styles array
  const stylesRegex = /styles:\s*\[\s*`([\s\S]*?)`\s*\]/g;
  
  content = content.replace(stylesRegex, (match, stylesContent) => {
    let newStyles = stylesContent;
    
    // Remove individual class blocks
    classesToRemove.forEach(cls => {
      const escapedCls = escapeRegExp(cls);
      const blockRegex = new RegExp(`(^|\\s)${escapedCls}(?::[a-zA-Z-]+)?\\s*\\{[^}]*\\}`, 'g');
      newStyles = newStyles.replace(blockRegex, '');
    });
    
    // Attempt to remove empty media queries
    const emptyMediaRegex = /@media\s*\([^)]+\)\s*\{\s*\}/g;
    newStyles = newStyles.replace(emptyMediaRegex, '');
    newStyles = newStyles.replace(emptyMediaRegex, '');

    return `styles: [\`${newStyles}\`]`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log('Cleaned CSS in:', file);
  }
});

console.log('Total dashboard files cleaned:', changedCount);
