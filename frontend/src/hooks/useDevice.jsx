import { useState, useEffect } from 'react';

/**
 * useDevice — Centralized Device Awareness Hook
 * Returns breakpoint flags updated in real-time as the screen resizes.
 *
 * Usage:
 *   const { isMobile, isTablet, isDesktop } = useDevice();
 */
const useDevice = () => {
    const getFlags = () => {
        const w = window.innerWidth;
        return {
            isMobile:    w < 640,
            isTablet:    w >= 640 && w < 1024,
            isDesktop:   w >= 1024,
            isSmallMobile: w < 400,
            screenWidth: w,
        };
    };

    const [device, setDevice] = useState(getFlags);

    useEffect(() => {
        let raf;
        const handler = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => setDevice(getFlags()));
        };
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('resize', handler);
            cancelAnimationFrame(raf);
        };
    }, []);

    return device;
};

export default useDevice;
