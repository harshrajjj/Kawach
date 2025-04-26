import React, { useEffect, useRef, useState } from 'react';
import customToast from '../utils/toast';
import '../styles/anti-screenshot.css';

const PrintPreview = ({ fileUrl }) => {
  const previewRef = useRef(null);
  const [isScreenshotBlocked, setIsScreenshotBlocked] = useState(false);

  useEffect(() => {
    // Activate global screenshot protection
    if (window.activateScreenshotProtection) {
      window.activateScreenshotProtection();
    }

    // Apply security measures to prevent right-click and keyboard shortcuts
    const handleContextMenu = (e) => {
      e.preventDefault();
      customToast.error('Right-click is disabled for security reasons');
      setIsScreenshotBlocked(true);
      setTimeout(() => setIsScreenshotBlocked(false), 2000);
      return false;
    };

    // Direct system-level approach to block Print Screen key
    const handleKeyDown = (e) => {
      // Check for Print Screen key specifically (keyCode 44)
      if (e.keyCode === 44 || e.key === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();

        // Show a more prominent message
        alert('Screenshots are disabled for security reasons');

        // Also show a toast notification
        customToast.error('Screenshots are not allowed for security reasons');

        // Show the blocking overlay
        setIsScreenshotBlocked(true);
        setTimeout(() => setIsScreenshotBlocked(false), 3000);

        return false;
      }

      // Detect and block all possible screenshot key combinations
      const isScreenshotAttempt =
        // Windows screenshot shortcuts
        (e.ctrlKey && e.key === 'PrintScreen') ||
        (e.altKey && e.key === 'PrintScreen') ||
        (e.shiftKey && e.key === 'PrintScreen') ||
        (e.ctrlKey && e.shiftKey && e.key === 's') ||
        // Windows Snipping Tool shortcuts
        (e.winKey && e.shiftKey && e.key === 's') ||
        (e.ctrlKey && e.winKey && e.key === 's') ||
        // Mac screenshot shortcuts
        (e.metaKey && e.shiftKey && e.key === '3') ||
        (e.metaKey && e.shiftKey && e.key === '4') ||
        (e.metaKey && e.shiftKey && e.key === '5') ||
        // Common save shortcuts
        (e.ctrlKey && e.key === 's') ||
        (e.metaKey && e.key === 's') ||
        // Copy shortcuts
        (e.ctrlKey && e.key === 'c') ||
        (e.metaKey && e.key === 'c') ||
        // Print shortcuts
        (e.ctrlKey && e.key === 'p') ||
        (e.metaKey && e.key === 'p');

      if (isScreenshotAttempt) {
        e.preventDefault();
        e.stopPropagation();
        customToast.error('Screenshots are not allowed for security reasons');
        setIsScreenshotBlocked(true);
        setTimeout(() => setIsScreenshotBlocked(false), 2000);
        return false;
      }
    };

    // Screenshot detection using visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User might be taking a screenshot or switching apps
        console.log('Visibility changed - possible screenshot attempt');
      }
    };

    // Screenshot detection using blur event
    const handleBlur = () => {
      console.log('Window blur - possible screenshot attempt');
    };

    // Screenshot detection using devtools
    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        customToast.error('Developer tools detected. Screenshots are not allowed.');
        setIsScreenshotBlocked(true);
        setTimeout(() => setIsScreenshotBlocked(false), 3000);
      }
    };

    // Screenshot detection using Canvas API
    const detectScreenshotUsingCanvas = () => {
      try {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = 1;
        canvas.height = 1;

        // Draw a pixel with a random color
        const randomColor = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
        ctx.fillStyle = randomColor;
        ctx.fillRect(0, 0, 1, 1);

        // Get the pixel data
        const imageData = ctx.getImageData(0, 0, 1, 1).data;

        // Store the current pixel data
        const currentPixel = `${imageData[0]},${imageData[1]},${imageData[2]},${imageData[3]}`;

        // Check if the pixel data has changed (indicating a possible screenshot)
        setTimeout(() => {
          const newImageData = ctx.getImageData(0, 0, 1, 1).data;
          const newPixel = `${newImageData[0]},${newImageData[1]},${newImageData[2]},${newImageData[3]}`;

          if (currentPixel !== newPixel) {
            console.log('Canvas pixel changed - possible screenshot attempt');
            customToast.error('Screenshot detected');
            setIsScreenshotBlocked(true);
            setTimeout(() => setIsScreenshotBlocked(false), 3000);
          }
        }, 500);
      } catch (error) {
        console.error('Error in canvas screenshot detection:', error);
      }
    };

    // Advanced screenshot detection using CSS properties
    const detectScreenshotUsingCSS = () => {
      try {
        // Get the honeypot element
        const honeypot = document.getElementById('screenshot-honeypot');
        if (!honeypot) return;

        // Set a random background color
        const randomColor = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
        honeypot.style.backgroundColor = randomColor;

        // Store the current computed style
        const computedStyle = window.getComputedStyle(honeypot);
        const currentBgColor = computedStyle.backgroundColor;

        // Check if the style has changed (indicating a possible screenshot)
        setTimeout(() => {
          const newComputedStyle = window.getComputedStyle(honeypot);
          const newBgColor = newComputedStyle.backgroundColor;

          if (currentBgColor !== newBgColor) {
            console.log('CSS property changed - possible screenshot attempt');
            customToast.error('Screenshot detected');
            setIsScreenshotBlocked(true);
            setTimeout(() => setIsScreenshotBlocked(false), 3000);
          }
        }, 300);
      } catch (error) {
        console.error('Error in CSS screenshot detection:', error);
      }
    };

    // Detect screenshots using the Clipboard API
    const detectScreenshotUsingClipboard = () => {
      try {
        // Check if the Clipboard API is available
        if (navigator.clipboard && navigator.clipboard.readText) {
          // Try to read the clipboard
          navigator.clipboard.readText()
            .then(text => {
              // If we can read the clipboard, it might be a screenshot
              console.log('Clipboard access detected - possible screenshot attempt');
              customToast.error('Clipboard access detected');
              setIsScreenshotBlocked(true);
              setTimeout(() => setIsScreenshotBlocked(false), 3000);
            })
            .catch(err => {
              // This is expected - we should not be able to read the clipboard
              console.log('Clipboard access denied - this is normal');
            });
        }
      } catch (error) {
        console.error('Error in clipboard screenshot detection:', error);
      }
    };

    // Detect screenshots using the Performance API
    const detectScreenshotUsingPerformance = () => {
      try {
        // Check if the Performance API is available
        if (window.performance && window.performance.memory) {
          // Get the current memory usage
          const currentMemory = window.performance.memory.usedJSHeapSize;

          // Store the current memory usage
          const memoryThreshold = currentMemory * 1.2; // 20% increase threshold

          // Check if the memory usage has increased significantly (indicating a possible screenshot)
          setTimeout(() => {
            const newMemory = window.performance.memory.usedJSHeapSize;

            if (newMemory > memoryThreshold) {
              console.log('Memory usage increased - possible screenshot attempt');
              customToast.error('Unusual activity detected');
              setIsScreenshotBlocked(true);
              setTimeout(() => setIsScreenshotBlocked(false), 3000);
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error in performance screenshot detection:', error);
      }
    };

    // Add event listeners
    const previewElement = previewRef.current;
    if (previewElement) {
      previewElement.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('keydown', handleKeyDown);

      // Disable drag and select
      previewElement.addEventListener('selectstart', e => e.preventDefault());
      previewElement.addEventListener('dragstart', e => e.preventDefault());
    }

    // Add global event listeners for screenshot detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('resize', detectDevTools);

    // Add clipboard event listeners
    document.addEventListener('copy', (e) => {
      e.preventDefault();
      customToast.error('Copy is disabled for security reasons');
      setIsScreenshotBlocked(true);
      setTimeout(() => setIsScreenshotBlocked(false), 2000);
      return false;
    });

    document.addEventListener('cut', (e) => {
      e.preventDefault();
      customToast.error('Cut is disabled for security reasons');
      setIsScreenshotBlocked(true);
      setTimeout(() => setIsScreenshotBlocked(false), 2000);
      return false;
    });

    document.addEventListener('paste', (e) => {
      e.preventDefault();
      customToast.error('Paste is disabled for security reasons');
      setIsScreenshotBlocked(true);
      setTimeout(() => setIsScreenshotBlocked(false), 2000);
      return false;
    });

    // Check for devtools periodically
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Check for screenshots using Canvas API periodically
    const canvasInterval = setInterval(detectScreenshotUsingCanvas, 2000);

    // Check for screenshots using CSS properties periodically
    const cssInterval = setInterval(detectScreenshotUsingCSS, 1500);

    // Check for screenshots using Clipboard API periodically
    const clipboardInterval = setInterval(detectScreenshotUsingClipboard, 3000);

    // Check for screenshots using Performance API periodically
    const performanceInterval = setInterval(detectScreenshotUsingPerformance, 2500);

    // Continuously change the content to make screenshots useless
    const dynamicContentInterval = setInterval(() => {
      const honeypot = document.getElementById('screenshot-honeypot');
      if (honeypot) {
        const randomColor = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
        honeypot.style.backgroundColor = randomColor;
      }
    }, 100);

    return () => {
      // Deactivate global screenshot protection
      if (window.deactivateScreenshotProtection) {
        window.deactivateScreenshotProtection();
      }

      if (previewElement) {
        previewElement.removeEventListener('contextmenu', handleContextMenu);
        previewElement.removeEventListener('selectstart', e => e.preventDefault());
        previewElement.removeEventListener('dragstart', e => e.preventDefault());
      }
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', () => {});
      document.removeEventListener('cut', () => {});
      document.removeEventListener('paste', () => {});
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', detectDevTools);
      clearInterval(devToolsInterval);
      clearInterval(canvasInterval);
      clearInterval(cssInterval);
      clearInterval(clipboardInterval);
      clearInterval(performanceInterval);
      clearInterval(dynamicContentInterval);
    };
  }, []);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      ref={previewRef}
      className="bg-[#2a2235] rounded-lg p-4 overflow-hidden max-h-[300px] flex justify-center anti-screenshot-container anti-screenshot-blur-content anti-screenshot-dynamic-content"
    >
      {/* Screenshot blocked overlay */}
      {isScreenshotBlocked && (
        <div className="screenshot-blocked-overlay">
          <div className="screenshot-blocked-title">
            SCREENSHOT DETECTED
          </div>
          <div className="screenshot-blocked-message">
            Screenshots are not allowed for security reasons.
          </div>
          <div className="screenshot-blocked-instruction">
            Please use the print function to obtain a copy of this document.
          </div>
        </div>
      )}

      {/* Anti-screenshot layers */}
      <div className="anti-screenshot-noise"></div>
      <div className="anti-screenshot-grid"></div>

      {/* Loading and error states */}
      {imageError ? (
        <div className="text-red-400 text-center p-4">
          <p>Error loading preview. The document will still print correctly.</p>
        </div>
      ) : !imageLoaded ? (
        <div className="text-blue-400 text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Loading preview...</p>
        </div>
      ) : null}

      {/* Watermark overlay */}
      <div className="anti-screenshot-watermark">
        <div className="anti-screenshot-watermark-text">DO NOT COPY</div>
      </div>

      {/* Honeypot element to detect screenshot attempts */}
      <div className="anti-screenshot-honeypot" id="screenshot-honeypot"></div>

      {/* Document image with CSS that makes screenshots difficult */}
      <img
        src={fileUrl}
        alt="Document Preview"
        className={`max-w-full h-auto object-contain anti-screenshot-no-select anti-screenshot-no-drag anti-screenshot-filter anti-screenshot-animate ${!imageLoaded ? 'hidden' : ''}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        style={{
          pointerEvents: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
          WebkitUserDrag: 'none',
          KhtmlUserDrag: 'none',
          MozUserDrag: 'none',
          OUserDrag: 'none',
          userDrag: 'none',
        }}
      />
    </div>
  );
};

export default PrintPreview;
