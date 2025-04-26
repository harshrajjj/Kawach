import React, { useEffect, useRef, useState } from 'react';
import customToast from '../utils/toast';

// This component handles direct printing without showing the browser's print dialog
const DirectPrintService = ({ fileUrl, onPrintComplete, onPrintError }) => {
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
  const iframeRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

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
            <title>Direct Print</title>
            <style>
              body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              #printContainer { display: none; }
              @media print {
                body { margin: 0; }
                #printContainer { display: block; }
                /* Force watermarks to be visible in print */
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                /* Disable save as PDF option if possible */
                @page { size: auto; margin: 0mm; }
              }
            </style>
            <script>
              // Function to print without dialog (attempt)
              function printWithoutDialog() {
                try {
                  // Create a hidden print button
                  const printButton = document.createElement('button');
                  printButton.style.position = 'absolute';
                  printButton.style.left = '-9999px';
                  printButton.style.top = '-9999px';
                  printButton.setAttribute('onClick', 'window.print(); return false;');
                  document.body.appendChild(printButton);

                  // For Chrome
                  if (navigator.userAgent.indexOf('Chrome') !== -1) {
                    // Try to use the Chrome-specific print API
                    if (window.chrome && window.chrome.printing) {
                      try {
                        // This is a non-standard API that might work in some Chrome versions
                        window.chrome.printing.print({
                          printBackground: true,
                          shouldPrintBackgrounds: true,
                          marginsType: 0,
                          scaleFactor: 100,
                          mediaSize: { width: 8.5, height: 11 },
                          landscape: false,
                          headerFooterEnabled: false
                        });
                        return true;
                      } catch (e) {
                        console.log('Chrome printing API failed:', e);
                      }
                    }

                    // Try using execCommand (works in some Chrome versions)
                    if (document.execCommand && typeof document.execCommand === 'function') {
                      try {
                        document.execCommand('print', false, null);
                        return true;
                      } catch (e) {
                        console.log('ExecCommand failed:', e);
                      }
                    }

                    // Try to use the webkitPrint API if available
                    if (window.webkitPrint) {
                      try {
                        window.webkitPrint();
                        return true;
                      } catch (e) {
                        console.log('webkitPrint failed:', e);
                      }
                    }
                  }

                  // For Firefox
                  if (navigator.userAgent.indexOf('Firefox') !== -1) {
                    // Try to use the Firefox-specific print API
                    try {
                      // Add Firefox-specific print styles
                      const style = document.createElement('style');
                      style.innerHTML = '@page { size: auto; margin: 0mm; } @media print { body { margin: 0; } }';
                      document.head.appendChild(style);

                      // Try to simulate a keyboard shortcut
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

                      return true;
                    } catch (e) {
                      console.log('Firefox print failed:', e);
                    }
                  }

                  // For Safari
                  if (navigator.userAgent.indexOf('Safari') !== -1) {
                    try {
                      // Add Safari-specific print styles
                      const style = document.createElement('style');
                      style.innerHTML = '@media print { body { -webkit-print-color-adjust: exact; } }';
                      document.head.appendChild(style);

                      // Try to use the Safari-specific print API
                      if (window.print) {
                        window.print();
                        return true;
                      }
                    } catch (e) {
                      console.log('Safari print failed:', e);
                    }
                  }

                  // Default fallback for all browsers
                  try {
                    // Last resort: try to override the print function
                    const originalPrint = window.print;
                    window.print = function() {
                      try {
                        // Call the original print function
                        originalPrint.call(window);

                        // Restore the original function
                        window.print = originalPrint;
                      } catch (e) {
                        console.error('Print override error:', e);
                        window.print = originalPrint;
                      }
                    };

                    // Call the print function
                    window.print();
                    return true;
                  } catch (e) {
                    console.error('Default print failed:', e);
                    return false;
                  }
                } catch (e) {
                  console.error('Print error:', e);
                  return false;
                }
              }

              // Attempt to print when the image is loaded
              window.onload = function() {
                // Wait a moment for the image to render properly
                setTimeout(function() {
                  const success = printWithoutDialog();
                  if (success) {
                    // Notify the parent window that printing has started
                    window.parent.postMessage('print-started', '*');
                  } else {
                    window.parent.postMessage('print-error', '*');
                  }
                }, 500);
              };

              // Listen for the afterprint event
              window.addEventListener('afterprint', function() {
                window.parent.postMessage('print-complete', '*');
              });
            </script>
          </head>
          <body>
            <div id="printContainer">
              <div style="position: relative;">
                <!-- Watermark -->
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 2; pointer-events: none; user-select: none;">
                  <!-- Main diagonal watermark -->
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 4rem; color: rgba(0, 0, 0, 0.1); font-weight: bold; white-space: nowrap; letter-spacing: 0.5rem; text-transform: uppercase;">
                    CONFIDENTIAL
                  </div>

                  <!-- Footer watermark with user info and timestamp -->
                  <div style="position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 0 20px; font-size: 10px; color: rgba(0, 0, 0, 0.2);">
                    <span>Printed by: ${getUserData().name}</span>
                    <span>Printed on: ${new Date().toLocaleString()}</span>
                  </div>
                </div>

                <!-- Document image -->
                <img src="${fileUrl}" style="max-width: 100%; height: auto; position: relative; z-index: 1;" />
              </div>
            </div>
          </body>
          </html>
        `);
        iframeDoc.close();

      } catch (error) {
        console.error('Direct print error:', error);
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
        if (onPrintComplete) onPrintComplete();
      } else if (event.data === 'print-error') {
        console.error('Print error from iframe');
        setIsPrinting(false);
        if (onPrintError) onPrintError(new Error('Failed to print document'));
      }
    };

    window.addEventListener('message', handlePrintMessage);
    printDocument();

    return () => {
      window.removeEventListener('message', handlePrintMessage);
    };
  }, [fileUrl, onPrintComplete, onPrintError]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '0',
        height: '0',
        border: '0'
      }}
      title="Direct Print Frame"
    />
  );
};

export default DirectPrintService;
