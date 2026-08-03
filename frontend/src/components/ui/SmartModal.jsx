/**
 * SmartModal
 *
 * A device-aware modal/dialog overlay.
 *   - Desktop: Centered floating card with max-width
 *   - Mobile:  Bottom sheet that slides up, full width
 *
 * Props:
 *   isOpen    — boolean
 *   onClose   — () => void
 *   title     — string header
 *   children  — modal body content
 *   maxWidth  — desktop max width (default '560px')
 */
import useDevice from '../../hooks/useDevice';

const SmartModal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = '560px',
}) => {
    const { isMobile } = useDevice();

    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? '0' : '1rem',
    };

    const modalStyle = isMobile ? {
        background: 'white',
        borderRadius: '24px 24px 0 0',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.5rem 1.25rem',
        animation: 'slideUp 0.25s ease',
    } : {
        background: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        animation: 'scaleIn 0.2s ease',
        position: 'relative',
    };

    return (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div style={modalStyle} className="animate-fade-in">
                {/* Handle bar on mobile */}
                {isMobile && (
                    <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 1.25rem' }} />
                )}

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'var(--surface-alt)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '1rem' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                {children}
            </div>
        </div>
    );
};

export default SmartModal;
