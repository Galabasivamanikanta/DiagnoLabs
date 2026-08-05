const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'frontend/src/pages/SampleCollectorDashboard.jsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace('const { user } = useContext(AuthContext);', 'const { user, updateUser } = useContext(AuthContext);');

const statesToAdd = `
    const [userForm, setUserForm] = useState({ name: '', email: '', phone: '' });
    const [savingUser, setSavingUser] = useState(false);

    useEffect(() => {
        if (user) {
            setUserForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleUserFormChange = (e) => {
        setUserForm({ ...userForm, [e.target.name]: e.target.value });
    };

    const handleUserFormSubmit = async (e) => {
        e.preventDefault();
        setSavingUser(true);
        try {
            const res = await axios.put(\`\${API_BASE_URL}/api/auth/\${user.id || user._id}\`, userForm, getHeaders());
            updateUser(res.data);
            alert("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update profile.");
        } finally {
            setSavingUser(false);
        }
    };
`;

content = content.replace('const [geocoding, setGeocoding] = useState(false);', 'const [geocoding, setGeocoding] = useState(false);\n' + statesToAdd);

const profileBlockOld = `<div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '800' }}>Personal Details</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Full Name</div>
                                            <div style={{ color: 'var(--text-main)', fontWeight: '600' }}>{user?.name}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Email Address</div>
                                            <div style={{ color: 'var(--text-main)', fontWeight: '600' }}>{user?.email}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Role</div>
                                            <div style={{ color: 'var(--text-main)', fontWeight: '600', textTransform: 'capitalize' }}>{user?.role}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Phone Number</div>
                                            <div style={{ color: 'var(--text-main)', fontWeight: '600' }}>{user?.phone || 'Not Provided'}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>Status</div>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', marginTop: '0.2rem' }}>
                                                <CheckCircle size={12} /> Active
                                            </div>
                                        </div>
                                    </div>
                                </div>`;

const profileBlockNew = `<div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '800' }}>Personal Details</h3>
                                    <form onSubmit={handleUserFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Name</label>
                                            <input type="text" name="name" value={userForm.name} onChange={handleUserFormChange} style={{ width: '100%', padding: '0.8rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email Address</label>
                                            <input type="email" name="email" value={userForm.email} onChange={handleUserFormChange} style={{ width: '100%', padding: '0.8rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number</label>
                                            <input type="text" name="phone" value={userForm.phone} onChange={handleUserFormChange} style={{ width: '100%', padding: '0.8rem 1rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', outline: 'none' }} required />
                                        </div>
                                        <button type="submit" disabled={savingUser} style={{ marginTop: '0.5rem', padding: '0.8rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', cursor: savingUser ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                            {savingUser ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                            {savingUser ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </form>
                                </div>`;

let linesOld = profileBlockOld.split('\\n').map(l => l.trim()).join('');
let contentNoSpaces = content.replace(/\\s+/g, ' ');

// Replacing via simple regex or exact match since whitespace might vary
let didReplace = false;

// Manual targeted string replacement
const startIndex = content.indexOf('<h3 style={{ margin: \\'0 0 1rem 0\\', color: \\'var(--text-main)\\', fontSize: \\'1.1rem\\', fontWeight: \\'800\\' }}>Personal Details</h3>');
if (startIndex !== -1) {
    const preContent = content.substring(0, startIndex);
    // Find the enclosing div
    const divStart = preContent.lastIndexOf('<div style={{ background: \\'var(--bg-main)\\'');
    const endIndex = content.indexOf('</div>', content.indexOf('<CheckCircle size={12} /> Active', startIndex)) + 28; // roughly where the block ends
    
    if (divStart !== -1 && endIndex !== -1) {
        const afterContent = content.substring(endIndex + 40); // add some padding to skip closing divs correctly
        
        // Simpler: use a regex that matches the whole chunk
    }
}

// Better way: Just replace the entire chunk with regex
content = content.replace(/<div style=\{\{ background: 'var\(--bg-main\)', padding: '1\.5rem', borderRadius: '16px', border: '1px solid var\(--border-light\)' \}\}>[\s\S]*?<CheckCircle size=\{12\} \/> Active\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, profileBlockNew);

fs.writeFileSync(file, content);
console.log('Successfully patched SampleCollectorDashboard.jsx');
