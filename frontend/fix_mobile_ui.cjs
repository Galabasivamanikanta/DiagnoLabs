const fs = require('fs');
const path = require('path');

// Fix UserProfile.jsx
let upFile = path.join(__dirname, 'src/pages/UserProfile.jsx');
let upContent = fs.readFileSync(upFile, 'utf8');

upContent = upContent.replace(
    /style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}/,
    "style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}"
);
fs.writeFileSync(upFile, upContent);

// Fix NearbySearch.jsx
let nsFile = path.join(__dirname, 'src/pages/NearbySearch.jsx');
let nsContent = fs.readFileSync(nsFile, 'utf8');

// Fix Accuracy Score placement (ensure card container has position: relative)
nsContent = nsContent.replace(
    /boxShadow: 'var\(--shadow-md\)',\s*transition: 'all 0.3s'\s*}}/,
    "boxShadow: 'var(--shadow-md)', transition: 'all 0.3s', position: 'relative' }}"
);

// Fix AI Recommender button flex wrap
nsContent = nsContent.replace(
    /alignItems: 'center',\s*gap: '0.75rem'\s*}}>\s*<div style={{ width: '28px'/g,
    "alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>\n                              <div style={{ width: '28px'"
);

// Fix Rating decimals
nsContent = nsContent.replace(
    /\{lab\.rating\s*\|\|\s*'4\.8'\}/g,
    "{Number(lab.rating || 4.8).toFixed(1)}"
);
nsContent = nsContent.replace(
    /\{lab\.rating\s*\|\|\s*4\.8\}/g,
    "{Number(lab.rating || 4.8).toFixed(1)}"
);

// Fix NearbySearch search bar stacking (remove mobile-stack so they stay inline, or make button normal)
nsContent = nsContent.replace(
    /<div className="mobile-stack" style={{/g,
    '<div className="search-bar-wrapper" style={{'
);

fs.writeFileSync(nsFile, nsContent);

// Fix IndiaLabsFinder.jsx
let ilFile = path.join(__dirname, 'src/pages/IndiaLabsFinder.jsx');
let ilContent = fs.readFileSync(ilFile, 'utf8');

ilContent = ilContent.replace(
    /boxShadow: 'var\(--shadow-md\)',\s*transition: 'all 0.3s'\s*}}/,
    "boxShadow: 'var(--shadow-md)', transition: 'all 0.3s', position: 'relative' }}"
);
ilContent = ilContent.replace(
    /\{lab\.rating\s*\|\|\s*'4\.8'\}/g,
    "{Number(lab.rating || 4.8).toFixed(1)}"
);
ilContent = ilContent.replace(
    /<div className="mobile-stack" style={{/g,
    '<div className="search-bar-wrapper" style={{'
);
fs.writeFileSync(ilFile, ilContent);

console.log('Fixed Mobile UI issues');
