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

const classesToRemove = [
  '.module-container',
  '.module-header',
  '.header-left h1',
  '.page-title',
  '.page-subtitle',
  '.header-actions',
  '.view-switcher',
  '.switcher-btn',
  '.switcher-btn.active',
  '.btn-light',
  '.btn-light:hover',
  '.filters-card',
  '.search-bar',
  '.search-bar input',
  '.search-icon',
  '.filter-actions',
  '.filter-dropdown',
  '.filter-select',
  '.dropdown-chevron',
  '.advanced-filters-panel',
  '.advanced-filters-panel.show',
  '.filters-grid',
  '.filter-group',
  '.filter-group label',
  '.filter-group input',
  '.filter-group select',
  '.table-card',
  '.table-card-header',
  '.table-header-title',
  '.table-header-title h2',
  '.count-badge',
  '.premium-table',
  '.premium-table th',
  '.premium-table td',
  '.premium-table tr:last-child td',
  '.premium-table tr.clickable-row:hover',
  '.table-card-footer',
  '.pagination-btn',
  '.pagination-btn:hover:not(:disabled)',
  '.pagination-btn:disabled',
  '.pagination-pages',
  '.page-num',
  '.page-num:hover',
  '.page-num.active',
  '.page-dots'
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
      // Regex matches: the class name, followed by optional pseudo-classes, followed by `{`, then anything except `}`, then `}`
      // Note: this might fail on nested braces like media queries. We'll handle simple blocks.
      const escapedCls = escapeRegExp(cls);
      const blockRegex = new RegExp(`(^|\\s)${escapedCls}(?::[a-zA-Z-]+)?\\s*\\{[^}]*\\}`, 'g');
      newStyles = newStyles.replace(blockRegex, '');
    });
    
    // Attempt to remove empty media queries or media queries that only contained removed blocks
    // Since we just removed blocks inside media queries, we might have `@media (...) { }`
    // We can do a simple pass to remove them.
    const emptyMediaRegex = /@media\s*\([^)]+\)\s*\{\s*\}/g;
    newStyles = newStyles.replace(emptyMediaRegex, '');
    newStyles = newStyles.replace(emptyMediaRegex, ''); // Run twice for nested? Media queries usually aren't nested in this codebase.

    return `styles: [\`${newStyles}\`]`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log('Cleaned CSS in:', file);
  }
});

console.log('Total files cleaned:', changedCount);
