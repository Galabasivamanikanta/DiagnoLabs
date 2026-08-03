/**
 * StatCard
 *
 * A single metric tile — used in all dashboards.
 * Automatically scales font and padding per device.
 *
 * Props:
 *   icon    — JSX icon element
 *   label   — string label
 *   value   — number or string
 *   color   — accent color (default primary)
 *   bg      — background for icon area
 *   desc    — optional subtitle
 */
import useDevice from '../../hooks/useDevice';

const StatCard = ({
    icon,
    label,
    value,
    color = 'var(--primary)',
    bg = 'var(--primary-light)',
    desc,
}) => {
    const { isMobile } = useDevice();

    return (
        <div style={{
            background: 'white',
            borderRadius: isMobile ? '14px' : '18px',
            border: '1px solid var(--border)',
            padding: isMobile ? '1rem' : '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '0.85rem' : '1rem',
            boxShadow: 'var(--shadow-sm)',
            width: '100%',
        }}>
            <div style={{
                width: isMobile ? '40px' : '48px',
                height: isMobile ? '40px' : '48px',
                borderRadius: '12px',
                background: bg,
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: isMobile ? '1.5rem' : '1.85rem',
                    fontWeight: '900',
                    color,
                    lineHeight: 1.1,
                }}>
                    {value}
                </div>
                <div style={{
                    fontSize: isMobile ? '0.78rem' : '0.85rem',
                    fontWeight: '700',
                    color: 'var(--text-muted)',
                    marginTop: '0.15rem',
                }}>
                    {label}
                </div>
                {desc && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.1rem' }}>
                        {desc}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
