const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, './src/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('Dashboard.jsx'));

const skipped = [];
const updated = [];

for (const file of files) {
    if (['FinanceDashboard.jsx', 'PatientDashboard.jsx', 'AdminDashboard.jsx', 'SampleCollectorDashboard.jsx', 'SampleCollectorDashboardBackup.jsx', 'LabDashboard.jsx'].includes(file)) {
        continue;
    }
    
    let content = fs.readFileSync(path.join(pagesDir, file), 'utf8');

    // Extract default name and role from the current file to use in the new template
    let defaultName = 'Employee';
    let defaultRole = 'Staff Member';
    
    const nameMatch = content.match(/\{user\?\.name \|\| '([^']+)'\}/);
    if (nameMatch) {
        defaultName = nameMatch[1];
    }
    
    // Find the string inside the div under user name
    const roleMatch = content.match(/<div[^>]*color:\s*'#64748b'[^>]*>([^<]+)<\/div>/);
    if (roleMatch && roleMatch[1] && !roleMatch[1].includes('{')) {
        defaultRole = roleMatch[1].trim();
    }

    const newProfileBlock = `          <div style={{ padding: '16px', marginBottom: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#003366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 }}>
                {(user?.name || '${defaultName}').charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || '${defaultName}'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || '${defaultName.split(' ')[0].toLowerCase()}@diagnolabs.com'}</div>
              </div>
            </div>
            <div style={{ background: '#f0f7ff', color: '#003366', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ${defaultRole}
            </div>
            <button onClick={() => ${file === 'ReceptionDashboard.jsx' ? "window.location.href = '/admin/profile'" : "navigate('/admin/profile')"}} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              View Full Profile ${file === 'ReceptionDashboard.jsx' ? '' : '<ChevronRight size={14} />'}
            </button>
          </div>
`;

    // Attempt to replace the block.
    // In most files it looks like:
    // <div style={{ padding: '8px 12px', marginBottom: '12px', background: '#f1f5f9', borderRadius: '10px' }}>
    // ...
    // </button> (the old view profile button)

    // Let's use a regex that matches from the grey profile div up to the old view full profile button.
    const replaceRegex1 = /<div style={{ padding: '8px 12px', marginBottom: '12px', background: '#f1f5f9', borderRadius: '10px' }}>[\s\S]*?(?:View Full Profile(?: <ChevronRight size=\{14\} \/>)?\s*<\/button>|<\/div>\s*(?:<div|<button)[^>]*View Full Profile[^>]*>(?:View Full Profile)?\s*<\/(?:div|button)>)/;
    
    // Also support ReceptionDashboard which has:
    // <div onClick={() => window.location.href = '/admin/profile'} ... >View Full Profile</div>
    const replaceRegex2 = /<div onClick=\{\(\) => window\.location\.href = '\/admin\/profile'\}[^>]*>[\s\S]*?View Full Profile[\s\S]*?<\/div>/;

    if (replaceRegex1.test(content)) {
        content = content.replace(replaceRegex1, newProfileBlock.trim());
        
        // Add ChevronRight to imports if needed
        if (!content.includes('ChevronRight') && file !== 'ReceptionDashboard.jsx') {
            content = content.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
                return `import { ChevronRight, ${p1.trim()} } from 'lucide-react';`;
            });
        }
        
        fs.writeFileSync(path.join(pagesDir, file), content, 'utf8');
        updated.push(file);
    } else if (file === 'ReceptionDashboard.jsx') {
       // Reception dashboard doesn't have the grey box, it just has the view profile button above logout.
       // We'll replace the View Profile button with the new card.
       content = content.replace(replaceRegex2, newProfileBlock.trim());
       fs.writeFileSync(path.join(pagesDir, file), content, 'utf8');
       updated.push(file);
    } else {
        skipped.push(file);
    }
}

console.log('Updated:', updated);
console.log('Skipped:', skipped);
