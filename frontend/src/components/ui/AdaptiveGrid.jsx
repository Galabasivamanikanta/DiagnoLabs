/**
 * AdaptiveGrid
 *
 * Automatically scales column count based on screen size.
 * Desktop: desktopCols columns (default 3)
 * Tablet:  tabletCols  columns (default 2)
 * Mobile:  mobileCols  columns (default 1)
 *
 * Usage:
 *   <AdaptiveGrid desktopCols={4} tabletCols={2} mobileCols={1} gap="1.5rem">
 *     <Card /> <Card /> <Card /> ...
 *   </AdaptiveGrid>
 */
import useDevice from '../../hooks/useDevice';

const AdaptiveGrid = ({
    children,
    desktopCols = 3,
    tabletCols = 2,
    mobileCols = 1,
    gap = '1.5rem',
    style = {},
}) => {
    const { isMobile, isTablet } = useDevice();
    const cols = isMobile ? mobileCols : isTablet ? tabletCols : desktopCols;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap,
            width: '100%',
            ...style,
        }}>
            {children}
        </div>
    );
};

export default AdaptiveGrid;
