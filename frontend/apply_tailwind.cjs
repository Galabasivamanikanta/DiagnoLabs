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

            // text-blue replacements
            const textBlueRegex = /text-blue-[4-9]00/g;
            if (textBlueRegex.test(content)) {
                content = content.replace(textBlueRegex, 'text-navy');
                modified = true;
            }

            // bg-blue replacements (dark)
            const bgBlueRegex = /bg-blue-[4-9]00/g;
            if (bgBlueRegex.test(content)) {
                content = content.replace(bgBlueRegex, 'bg-navy');
                modified = true;
            }

            // bg-blue replacements (light)
            const bgBlueLightRegex = /bg-blue-[5]0/g;
            if (bgBlueLightRegex.test(content)) {
                content = content.replace(bgBlueLightRegex, 'bg-slate-50');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated tailwind classes in: ' + fullPath);
            }
        }
    }
}

for (const dir of directoriesToSearch) {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
}
console.log('Tailwind class update complete.');

