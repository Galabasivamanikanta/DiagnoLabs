const fs = require('fs');
const path = require('path');

// 1. Add CSS to index.css
let cssFile = path.join(__dirname, 'src/index.css');
let cssContent = fs.readFileSync(cssFile, 'utf8');

const tableCardCSS = `
/* --- Mobile Responsive Table Cards --- */
@media (max-width: 768px) {
  .responsive-table-cards, .responsive-table-cards tbody, .responsive-table-cards tr, .responsive-table-cards td {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }
  .responsive-table-cards thead {
    display: none;
  }
  .responsive-table-cards tr {
    margin-bottom: 1.5rem;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 0.5rem 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    background: white;
  }
  .responsive-table-cards td {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: right;
    padding: 1rem 0 !important;
    border-bottom: 1px dashed var(--border) !important;
    gap: 1rem;
  }
  .responsive-table-cards td:last-child {
    border-bottom: none !important;
    padding-bottom: 0.5rem !important;
  }
  .responsive-table-cards td::before {
    content: attr(data-label);
    font-weight: 800;
    color: var(--text-muted);
    font-size: 0.75rem;
    text-transform: uppercase;
    text-align: left;
    flex-shrink: 0;
  }
  .responsive-table-cards td > div {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    text-align: right;
  }
}
`;

if (!cssContent.includes('Mobile Responsive Table Cards')) {
    cssContent += '\n' + tableCardCSS;
    fs.writeFileSync(cssFile, cssContent);
}

// 2. Fix BookingHistory.jsx
let bhFile = path.join(__dirname, 'src/pages/BookingHistory.jsx');
let bhContent = fs.readFileSync(bhFile, 'utf8');

// Replace standard table with the new class
bhContent = bhContent.replace(/<table style={{/, '<table className="responsive-table-cards" style={{');
bhContent = bhContent.replace(/<div className="table-responsive-wrapper"><table /g, '<table ');
bhContent = bhContent.replace(/<\/table><\/div>/g, '</table>');
// Ensure wrapping for buttons
bhContent = bhContent.replace(/<div style={{ display: 'flex', gap: '0.5rem' }}>\s*<button/g, "<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>\n                                                            <button");

fs.writeFileSync(bhFile, bhContent);
console.log('Fixed tables to vertical cards');
