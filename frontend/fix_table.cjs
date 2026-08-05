const fs = require('fs');
const path = require('path');

// Fix BookingHistory.jsx
let bhFile = path.join(__dirname, 'src/pages/BookingHistory.jsx');
let bhContent = fs.readFileSync(bhFile, 'utf8');

bhContent = bhContent.replace('className="responsive-table"', '');

// Remove the internal style block completely
const styleStart = bhContent.indexOf('<style>');
const styleEnd = bhContent.indexOf('</style>') + 8;
if (styleStart !== -1 && styleEnd !== -1) {
    bhContent = bhContent.substring(0, styleStart) + bhContent.substring(styleEnd);
}

fs.writeFileSync(bhFile, bhContent);
console.log('Fixed BookingHistory.jsx');

// Fix index.css
let cssFile = path.join(__dirname, 'src/index.css');
let cssContent = fs.readFileSync(cssFile, 'utf8');

// Find Responsive Table section
const respTableStart = cssContent.indexOf('/* Responsive Table */');
if (respTableStart !== -1) {
    // Find the end of the media query block
    const mediaEnd = cssContent.indexOf('}', cssContent.indexOf('}', cssContent.indexOf('}', cssContent.indexOf('}', respTableStart) + 1) + 1) + 1);
    // Actually simpler: just remove anything with .responsive-table
    cssContent = cssContent.replace(/\.responsive-table[^}]+}/g, '');
    cssContent = cssContent.replace(/\/\* Responsive Table \*\//g, '');
    cssContent = cssContent.replace(/@media \(max-width: 768px\) {\s*}/g, '');
}

fs.writeFileSync(cssFile, cssContent);
console.log('Fixed index.css');
