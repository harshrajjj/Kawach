import React, { useEffect, useRef, useState } from 'react';
import customToast from '../utils/toast';

// This component attempts to bypass the print dialog using aggressive techniques
const StealthPrintService = ({ fileUrl, onPrintComplete, onPrintError }) => {
  const iframeRef = useRef(null);
  const overlayRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Get user data for watermark
  const getUserData = () => {
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        return JSON.parse(userDataString);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return { name: 'Unknown User' };
  };

  useEffect(() => {
    if (!fileUrl) return;

    const printDocument = async () => {
      try {
        setIsPrinting(true);

        // Create a hidden iframe for printing
        const iframe = iframeRef.current;
        if (!iframe) return;

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Write content to the iframe
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Print Document</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              /* Grid pattern for watermark */
              .grid-watermark {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: repeating-linear-gradient(
                  45deg,
                  rgba(0, 0, 0, 0.02) 0px,
                  rgba(0, 0, 0, 0.02) 10px,
                  rgba(0, 0, 0, 0) 10px,
                  rgba(0, 0, 0, 0) 20px
                );
                z-index: 1;
                pointer-events: none;
              }

              @media print {
                body { margin: 0; background-color: white; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                /* Ensure content is visible in print preview */
                img { display: block !important; visibility: visible !important; }
                @page { size: auto; margin: 0mm; }
              }

              /* Hide print dialog overlay */
              .print-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: white;
                z-index: 9999;
                display: none;
              }

              /* Show overlay when printing */
              @media print {
                .print-overlay {
                  display: block;
                }
              }
            </style>
            <script>
              // Aggressive print function that tries to bypass the dialog
              function stealthPrint() {
                try {
                  // Create a hidden print button
                  const printButton = document.createElement('button');
                  printButton.style.position = 'absolute';
                  printButton.style.left = '-9999px';
                  printButton.style.top = '-9999px';
                  printButton.setAttribute('onClick', 'window.print(); return false;');
                  document.body.appendChild(printButton);

                  // Create a visual overlay to hide the print dialog
                  const overlay = document.createElement('div');
                  overlay.className = 'print-overlay';
                  document.body.appendChild(overlay);

                  // Try to use the most aggressive printing technique based on browser
                  if (navigator.userAgent.indexOf('Chrome') !== -1) {
                    // Chrome-specific techniques

                    // 1. Try to use the Chrome printing API
                    if (window.chrome && window.chrome.printing) {
                      try {
                        window.chrome.printing.print({
                          printBackground: true,
                          shouldPrintBackgrounds: true,
                          marginsType: 0,
                          scaleFactor: 100,
                          mediaSize: { width: 8.5, height: 11 },
                          landscape: false,
                          headerFooterEnabled: false
                        });
                        return;
                      } catch (e) {
                        console.log('Chrome printing API failed:', e);
                      }
                    }

                    // 2. Try using execCommand
                    if (document.execCommand && typeof document.execCommand === 'function') {
                      try {
                        document.execCommand('print', false, null);
                        return;
                      } catch (e) {
                        console.log('ExecCommand failed:', e);
                      }
                    }

                    // 3. Try to simulate keyboard shortcut
                    try {
                      const printEvent = new KeyboardEvent('keydown', {
                        key: 'p',
                        code: 'KeyP',
                        ctrlKey: true,
                        bubbles: true,
                        cancelable: true
                      });
                      document.dispatchEvent(printEvent);

                      // If that didn't work, try the button
                      setTimeout(() => {
                        printButton.click();
                      }, 100);
                      return;
                    } catch (e) {
                      console.log('Keyboard shortcut failed:', e);
                    }
                  }
                  else if (navigator.userAgent.indexOf('Firefox') !== -1) {
                    // Firefox-specific techniques
                    try {
                      // Add Firefox-specific print styles
                      const style = document.createElement('style');
                      style.innerHTML = '@page { size: auto; margin: 0mm; } @media print { body { margin: 0; } }';
                      document.head.appendChild(style);

                      // Try to simulate keyboard shortcut
                      const printEvent = new KeyboardEvent('keydown', {
                        key: 'p',
                        code: 'KeyP',
                        ctrlKey: true,
                        bubbles: true,
                        cancelable: true
                      });
                      document.dispatchEvent(printEvent);

                      // If that didn't work, try the button
                      setTimeout(() => {
                        printButton.click();
                      }, 100);
                      return;
                    } catch (e) {
                      console.log('Firefox print failed:', e);
                    }
                  }
                  else {
                    // Default for all other browsers
                    window.print();
                  }
                } catch (e) {
                  console.error('Stealth print error:', e);
                  window.parent.postMessage('print-error', '*');
                }
              }

              // Auto-focus the print button in the print dialog
              function focusPrintButton() {
                try {
                  // This is a speculative attempt to focus the print button
                  // It may not work in all browsers due to security restrictions
                  if (window.matchMedia('print').matches) {
                    // We're in the print dialog
                    const printButtons = document.querySelectorAll('button');
                    for (let i = 0; i < printButtons.length; i++) {
                      const button = printButtons[i];
                      if (button.textContent.toLowerCase().includes('print')) {
                        button.focus();
                        button.click();
                        break;
                      }
                    }
                  }
                } catch (e) {
                  console.log('Focus print button failed:', e);
                }
              }

              // Ensure the image is loaded before printing
              let imageLoaded = false;

              // Function to check if image is loaded and then print
              function checkImageAndPrint() {
                const img = document.querySelector('img');
                if (img && (img.complete || imageLoaded)) {
                  console.log('Image is loaded, proceeding with print');
                  // Try to print without dialog
                  stealthPrint();

                  // Try to focus the print button in the dialog
                  setTimeout(focusPrintButton, 500);

                  // Notify the parent window that printing has started
                  window.parent.postMessage('print-started', '*');
                } else {
                  console.log('Image not loaded yet, waiting...');
                  setTimeout(checkImageAndPrint, 200);
                }
              }

              // Set up image load event
              window.addEventListener('load', function() {
                const img = document.querySelector('img');
                if (img) {
                  img.onload = function() {
                    console.log('Image loaded event fired');
                    imageLoaded = true;
                  };

                  // If image is already loaded
                  if (img.complete) {
                    console.log('Image was already loaded');
                    imageLoaded = true;
                  }
                }

                // Start checking if image is loaded
                setTimeout(checkImageAndPrint, 500);
              });

              // Listen for the afterprint event
              window.addEventListener('afterprint', function() {
                window.parent.postMessage('print-complete', '*');
              });

              // Attempt to auto-close the print dialog if it appears
              window.addEventListener('focus', function() {
                // This is a speculative attempt to detect when the print dialog appears
                setTimeout(function() {
                  if (document.hasFocus()) {
                    // The window has focus, which might mean the print dialog is showing
                    // Try to simulate Enter key to select the default option (usually Print)
                    try {
                      const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        bubbles: true,
                        cancelable: true
                      });
                      document.dispatchEvent(enterEvent);
                    } catch (e) {
                      console.log('Auto-close failed:', e);
                    }
                  }
                }, 1000);
              });
            </script>
          </head>
          <body>
            <div style="position: relative;">
              <!-- Grid pattern watermark -->
              <div class="grid-watermark"></div>

              <!-- Watermark -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 2; pointer-events: none; user-select: none;">
                <!-- Multiple diagonal watermarks -->
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 4rem; color: rgba(0, 0, 0, 0.1); font-weight: bold; white-space: nowrap; letter-spacing: 0.5rem; text-transform: uppercase;">
                  CONFIDENTIAL
                </div>
                <div style="position: absolute; top: 25%; left: 25%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 2rem; color: rgba(0, 0, 0, 0.08); font-weight: bold; white-space: nowrap; letter-spacing: 0.3rem; text-transform: uppercase;">
                  PRINT ONLY - DO NOT SAVE
                </div>
                <div style="position: absolute; top: 75%; left: 75%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 2rem; color: rgba(0, 0, 0, 0.08); font-weight: bold; white-space: nowrap; letter-spacing: 0.3rem; text-transform: uppercase;">
                  UNAUTHORIZED COPY
                </div>

                <!-- Footer watermark with user info and timestamp -->
                <div style="position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 0 20px; font-size: 10px; color: rgba(0, 0, 0, 0.2);">
                  <span>Printed by: ${getUserData().name}</span>
                  <span>Printed on: ${new Date().toLocaleString()}</span>
                </div>
              </div>

              <!-- Document image - ensure it's visible and properly loaded -->
              <img
                src="${fileUrl}"
                style="max-width: 100%; height: auto; position: relative; z-index: 1; display: block;"
                onload="console.log('Image loaded successfully')"
                onerror="console.error('Failed to load image:', '${fileUrl}')"
              />
            </div>
          </body>
          </html>
        `);
        iframeDoc.close();

        // Create a visual overlay to try to hide the print dialog
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.innerHTML = '<div style="background: white; padding: 20px; border-radius: 8px;"><h2>Printing your document...</h2><p>Please wait while your document is being sent to the printer.</p></div>';
        document.body.appendChild(overlay);
        overlayRef.current = overlay;

        // Remove the overlay after a delay
        setTimeout(() => {
          if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
          }
        }, 5000);

      } catch (error) {
        console.error('Stealth print error:', error);
        setIsPrinting(false);
        if (onPrintError) onPrintError(error);
      }
    };

    // Set up message listener for print events
    const handlePrintMessage = (event) => {
      if (event.data === 'print-started') {
        console.log('Print started');
      } else if (event.data === 'print-complete') {
        console.log('Print completed');
        setIsPrinting(false);

        // Remove the overlay
        if (overlayRef.current && overlayRef.current.parentNode) {
          overlayRef.current.parentNode.removeChild(overlayRef.current);
        }

        if (onPrintComplete) onPrintComplete();
      } else if (event.data === 'print-error') {
        console.error('Print error from iframe');
        setIsPrinting(false);

        // Remove the overlay
        if (overlayRef.current && overlayRef.current.parentNode) {
          overlayRef.current.parentNode.removeChild(overlayRef.current);
        }

        if (onPrintError) onPrintError(new Error('Failed to print document'));
      }
    };

    window.addEventListener('message', handlePrintMessage);
    printDocument();

    return () => {
      window.removeEventListener('message', handlePrintMessage);

      // Remove the overlay if it exists
      if (overlayRef.current && overlayRef.current.parentNode) {
        overlayRef.current.parentNode.removeChild(overlayRef.current);
      }
    };
  }, [fileUrl, onPrintComplete, onPrintError]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '500px',  // Give it a real size to ensure content renders properly
        height: '500px',
        border: '0',
        opacity: '0'     // Make it invisible but still rendered
      }}
      title="Stealth Print Frame"
    />
  );
};

export default StealthPrintService;
