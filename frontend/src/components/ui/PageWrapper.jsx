/**
 * PageWrapper
 *
 * The universal page container used by every page.
 * Handles:
 *   - Top padding for navbar height
 *   - Bottom breathing room
 *   - Horizontal padding that scales per device
 *   - Max-width centering
 *   - Background color
 *
 * Usage:
 *   <PageWrapper>
 *     <YourPageContent />
 *   </PageWrapper>
 *
 * Props:
 *   maxWidth  — max content width (default '1200px')
 *   noPadTop  — skip top padding (for full-bleed hero pages)
 */
import useDevice from '../../hooks/useDevice';

const PageWrapper = ({
    children,
    maxWidth = '1200px',
    noPadTop = false,
    style = {},
}) => {
    const { isMobile, isTablet } = useDevice();

    const hPad = isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem';
    const vPadTop = noPadTop ? '0' : isMobile ? '6rem' : '8rem';

    return (
        <div style={{
            background: 'var(--background)',
            minHeight: '100vh',
            paddingTop: vPadTop,
            paddingBottom: '5rem',
            width: '100%',
            overflowX: 'hidden',
            ...style,
        }}>
            <div style={{
                maxWidth,
                margin: '0 auto',
                paddingLeft: hPad,
                paddingRight: hPad,
                width: '100%',
                boxSizing: 'border-box',
            }}>
                {children}
            </div>
        </div>
    );
};

export default PageWrapper;
