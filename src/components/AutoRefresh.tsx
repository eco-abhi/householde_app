'use client';

import { useEffect } from 'react';

export default function AutoRefresh() {
    useEffect(() => {
        const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
        let lastActive = Date.now();

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // User has returned to the tab
                const timeSinceLastActive = Date.now() - lastActive;

                if (timeSinceLastActive > ONE_HOUR) {
                    console.log('Auto-refreshing: App was inactive for more than 1 hour');
                    window.location.reload();
                }

                lastActive = Date.now();
            }
        };

        // Track when user leaves the tab
        const handleBeforeUnload = () => {
            lastActive = Date.now();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return null; // This component doesn't render anything
}

