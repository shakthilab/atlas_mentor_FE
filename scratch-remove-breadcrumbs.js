const fs = require('fs');

const files = [
  'src/app/features/admin/media/media-list/media-list.component.ts',
  'src/app/features/dashboards/branch-partner/branch-partner-dashboard.component.ts',
  'src/app/features/dashboards/admin/admin-dashboard.component.ts',
  'src/app/features/dashboards/manager/manager-dashboard.component.ts',
  'src/app/features/dashboards/referral/referral-dashboard.component.ts',
  'src/app/features/dashboards/company/company-dashboard.component.ts'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Use regex to remove the breadcrumbs nav block
    // It might be preceded by <!-- Breadcrumbs -->
    // We match from <!-- Breadcrumbs --> (optional) up to </nav>
    
    // First, let's just do a greedy match for the nav block:
    // It looks like:
    // <!-- Breadcrumbs -->
    // <nav class="breadcrumb-nav">
    //   ...
    // </nav>
    
    const breadcrumbRegex = /(?:\s*<!--\s*Breadcrumbs\s*-->\s*)?<nav\s+class="breadcrumb-nav"[\s\S]*?<\/nav>/g;
    
    content = content.replace(breadcrumbRegex, '');

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Removed breadcrumbs from:', file);
    }
  }
});
