'use client';

import { useEffect } from 'react';

export default function StyleChecker() {
  useEffect(() => {
    // Check if Tailwind CSS is loaded by testing a known class
    const testDiv = document.createElement('div');
    testDiv.className = 'hidden';
    testDiv.style.cssText = '';
    document.body.appendChild(testDiv);
    
    const computedStyle = window.getComputedStyle(testDiv);
    const isHidden = computedStyle.display === 'none';
    
    document.body.removeChild(testDiv);
    
    if (!isHidden) {
      console.error('Tailwind CSS not loaded! Attempting reload...');
      
      // Try to reload stylesheets
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          link.setAttribute('href', href + (href.includes('?') ? '&' : '?') + 'reload=' + Date.now());
        }
      });
      
      // If still not working after 2 seconds, force page reload
      setTimeout(() => {
        const testDiv2 = document.createElement('div');
        testDiv2.className = 'hidden';
        document.body.appendChild(testDiv2);
        const computedStyle2 = window.getComputedStyle(testDiv2);
        const isHidden2 = computedStyle2.display === 'none';
        document.body.removeChild(testDiv2);
        
        if (!isHidden2) {
          console.error('CSS still not loaded. Reloading page...');
          window.location.reload();
        }
      }, 2000);
    } else {
      console.log('✅ Tailwind CSS loaded successfully');
    }
  }, []);

  return null;
}

