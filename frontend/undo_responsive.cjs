const fs = require('fs');
const path = require('path');

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

            // Undo gridTemplateColumns
            if (content.includes("gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'")) {
                content = content.replace(/gridTemplateColumns:\s*'repeat\(auto-fit,\s*minmax\(280px,\s*1fr\)\)'/g, "gridTemplateColumns: 'minmax(300px, 600px)'");
                modified = true;
            }

            // Undo maxWidth/width
            const maxWidthRegex = /maxWidth:\s*'(\d+px)',\s*width:\s*'100%'/g;
            if (maxWidthRegex.test(content)) {
                content = content.replace(maxWidthRegex, (match, p1) => {
                    return `width: '${p1}'`;
                });
                modified = true;
            }

            // Also undo the tables wrapper if it caused issues (some tables might break)
            if (content.includes('<div className="table-responsive-wrapper"><table ')) {
                content = content.replace(/<div className="table-responsive-wrapper"><table /g, '<table ');
                content = content.replace(/<\/table><\/div>/g, '</table>');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Undid responsiveness in: ' + fullPath);
            }
        }
    }
}

for (const dir of directoriesToSearch) {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
}
console.log('Undo complete.');
