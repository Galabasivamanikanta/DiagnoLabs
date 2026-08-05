const fs = require('fs');
const path = require('path');

const directoriesToSearch = [
    path.join(__dirname, 'src', 'pages'),
    path.join(__dirname, 'src', 'components')
];

const colorMap = {
    '#3b82f6': 'var(--primary)',
    '#2563eb': 'var(--primary)',
    '#1e3a8a': 'var(--primary-hover)',
    '#1d4ed8': 'var(--primary-hover)',
    '#1e40af': 'var(--primary-hover)',
    '#60a5fa': 'var(--primary-light)',
    '#93c5fd': 'var(--primary-light)',
    '#bfdbfe': 'var(--primary-light)',
    '#eff6ff': 'var(--surface-alt)',
    '#f59e0b': 'var(--accent-gold)',
    '#d97706': 'var(--accent-gold-hover)',
    '#fbbf24': 'var(--accent-gold)',
    '#fef3c7': 'var(--accent-gold-light)',
    '#fffbeb': 'var(--surface-alt)',
    '#10b981': 'var(--success)',
    '#059669': 'var(--success)',
    '#d1fae5': '#dcfce7', // close enough for success light bg
    '#ef4444': 'var(--danger)',
    '#dc2626': 'var(--danger)',
    '#fee2e2': '#fef2f2', // danger light bg
    '#f97316': 'var(--warning)',
    '#ea580c': 'var(--warning)',
    '#ffedd5': '#fef3c7'
};

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            for (const [hex, variable] of Object.entries(colorMap)) {
                // Regex for exact case insensitive match of hex code
                const regex = new RegExp(hex, 'gi');
                if (regex.test(content)) {
                    content = content.replace(regex, variable);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated theme in: ' + fullPath);
            }
        }
    }
}

for (const dir of directoriesToSearch) {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
}
console.log('Theme application complete.');

