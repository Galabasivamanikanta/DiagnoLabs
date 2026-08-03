/**
 * SmartCard
 *
 * A premium container card that automatically adjusts its own
 * padding, shadow depth, and border-radius based on device.
 *
 * Props:
 *   children  — content
 *   style     — additional custom style overrides
 *   onClick   — optional click handler (adds hover cursor)
 *   noPadding — strip padding (for media or full-bleed content)
 */
import useDevice from '../../hooks/useDevice';

const SmartCard = ({
    children,
    style = {},
    onClick,
    noPadding = false,
    className = '',
}) => {
    const { isMobile } = useDevice();

    const base = {
        background: 'white',
        borderRadius: isMobile ? '16px' : '20px',
        border: '1px solid var(--border)',
        boxShadow: isMobile ? 'var(--shadow-sm)' : 'var(--shadow-md)',
        padding: noPadding ? 0 : isMobile ? '1rem' : '1.5rem',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'box-shadow 0.2s ease',
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...style,
    };

    return (
        <div
            className={className}
            style={base}
            onClick={onClick}
            onMouseEnter={onClick ? e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; } : undefined}
            onMouseLeave={onClick ? e => { e.currentTarget.style.boxShadow = isMobile ? 'var(--shadow-sm)' : 'var(--shadow-md)'; } : undefined}
        >
            {children}
        </div>
    );
};

export default SmartCard;
