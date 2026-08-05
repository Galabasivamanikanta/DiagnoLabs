const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, './src/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('Dashboard.jsx') && f !== 'PatientDashboard.jsx' && f !== 'AdminDashboard.jsx' && f !== 'FinanceDashboard.jsx');

const profileButtonSnippet = `              <button onClick={() => navigate('/admin/profile')} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                View Full Profile
              </button>
`;

let updatedCount = 0;

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if navigate is defined, if not, skip or we can try to inject it
    if (!content.includes('navigate(') && !content.includes('useNavigate')) {
        console.log(`Skipping ${file} because useNavigate is not present.`);
        continue; // e.g., ReceptionDashboard if it doesn't use it
    }

    if (content.includes("View Full Profile")) {
        console.log(`Skipping ${file} because it already has the profile button.`);
        continue;
    }
    
    // Find logout button
    // It usually looks like: <button onClick={handleLogout}
    const logoutIndex = content.lastIndexOf('<button onClick={handleLogout}');
    if (logoutIndex !== -1) {
        content = content.substring(0, logoutIndex) + profileButtonSnippet + content.substring(logoutIndex);
        fs.writeFileSync(filePath, content, 'utf8');
        updatedCount++;
        console.log(`Updated ${file}`);
    } else {
        const divLogoutIndex = content.lastIndexOf('<div onClick={handleLogout}');
        if (divLogoutIndex !== -1) {
            content = content.substring(0, divLogoutIndex) + profileButtonSnippet + content.substring(divLogoutIndex);
            fs.writeFileSync(filePath, content, 'utf8');
            updatedCount++;
            console.log(`Updated ${file}`);
        } else {
            console.log(`Could not find logout button in ${file}`);
        }
    }
}

console.log(`Updated ${updatedCount} files.`);
