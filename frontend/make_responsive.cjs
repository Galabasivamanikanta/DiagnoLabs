const fs = require('fs');
const path = require('path');

const cssFile = path.join(__dirname, 'src', 'index.css');
let cssContent = fs.readFileSync(cssFile, 'utf8');
const responsiveCSS = `
/* --- Mobile Responsive Enhancements --- */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  /* Make all tables horizontally scrollable implicitly */
  .table-responsive-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Stack grid layouts that are using fixed columns */
  .mobile-stack {
    display: flex !important;
    flex-direction: column !important;
  }
  
  /* Prevent modals from overflowing */
  .mobile-modal {
    width: 95% !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
  }
}

/* Horizontal scrolling for tab containers */
.scroll-tabs {
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  width: 100%;
  -webkit-overflow-scrolling: touch;
}
.scroll-tabs::-webkit-scrollbar {
  height: 4px;
}
.scroll-tabs::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}
`;

if (!cssContent.includes('Mobile Responsive Enhancements')) {
    cssContent += '\n' + responsiveCSS;
    fs.writeFileSync(cssFile, cssContent);
    console.log('Updated index.css with responsive utilities.');
}

const directoriesToSearch = [
    path.join(__dirname, 'src', 'pages'),
    path.join(__dirname, 'src', 'components')
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // 1. Fix gridTemplateColumns static sizes to responsive auto-fit
            const gridRegex = /gridTemplateColumns:\s*'([^']+)'/g;
            content = content.replace(gridRegex, (match, p1) => {
                if (p1.includes('minmax') && !p1.includes('auto-fit') && !p1.includes('auto-fill')) {
                    modified = true;
                    return `gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'`;
                }
                return match;
            });
            
            const fixedWidthRegex = /width:\s*'([4-9]\d{2,}|1\d{3,})px'/g; 
            content = content.replace(fixedWidthRegex, (match, p1) => {
                modified = true;
                return `maxWidth: '${p1}px', width: '100%'`;
            });

            // 3. Wrap tables in responsive wrapper (basic heuristic)
            if (content.includes('<table ') && !content.includes('table-responsive-wrapper')) {
                 content = content.replace(/<table /g, '<div className="table-responsive-wrapper"><table ');
                 content = content.replace(/<\/table>/g, '</table></div>');
                 modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated responsiveness in: ' + fullPath);
            }
        }
    }
}

for (const dir of directoriesToSearch) {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
}
console.log('Responsive refactor complete.');
