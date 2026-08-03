/**
 * ScrollTabs
 *
 * A horizontal tab bar that:
 *   - On Desktop: shows all tabs in a row
 *   - On Mobile:  scrolls horizontally without breaking layout
 *
 * Props:
 *   tabs      — array of { id, label, icon? }
 *   activeTab — current active tab id
 *   onChange  — (tabId) => void
 */
import useDevice from '../../hooks/useDevice';

const ScrollTabs = ({ tabs = [], activeTab, onChange }) => {
    const { isMobile } = useDevice();

    return (
        <div style={{
            display: 'flex',
            gap: isMobile ? '0.4rem' : '0.5rem',
            overflowX: isMobile ? 'auto' : 'visible',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: isMobile ? '0.5rem' : '0',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            width: '100%',
            flexShrink: 0,
        }}>
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: isMobile ? '0.55rem 1rem' : '0.65rem 1.25rem',
                            borderRadius: '100px',
                            border: isActive ? 'none' : '1px solid var(--border)',
                            background: isActive ? 'var(--primary)' : 'white',
                            color: isActive ? 'white' : 'var(--text-muted)',
                            fontWeight: '700',
                            fontSize: isMobile ? '0.8rem' : '0.875rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            transition: 'all 0.2s ease',
                            boxShadow: isActive ? '0 4px 12px rgba(0,51,102,0.2)' : 'none',
                        }}
                    >
                        {tab.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{tab.icon}</span>}
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default ScrollTabs;
