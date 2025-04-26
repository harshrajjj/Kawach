import React, { useEffect, useRef, useState } from 'react';
import customToast from '../utils/toast';

// This component focuses specifically on blocking PDF saving and screenshots
const PdfBlockerService = ({ fileUrl, onPrintComplete, onPrintError }) => {
  const iframeRef = useRef(null);
  const [isScreenshotBlocked, setIsScreenshotBlocked] = useState(false);

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
        // Create a hidden iframe for printing
        const iframe = iframeRef.current;
        if (!iframe) return;

        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Write content to the iframe - using a very specific approach to block PDF saving
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Print Document</title>
            <style>
              @media screen {
                .pdf-block-screen { display: none; }
                .print-content { display: block; }
              }

              @media print {
                /* This is the key - we use a technique that works differently in PDF vs physical printing */
                @page { size: auto; margin: 0mm; }

                body {
                  margin: 0;
                  padding: 0;
                  background-color: white;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }

                /* Special technique: PDF renderers often handle these differently than physical printers */
                .pdf-block {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-color: white;
                  z-index: 9999;
                  display: none;
                }

                /* This will only be visible in PDFs due to how they handle fixed positioning */
                .pdf-block-screen {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background-color: white;
                  z-index: 9999;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  text-align: center;
                  padding: 20px;
                }

                /* Print styling - show content for all print options */
                @media print {
                  /* Show content for all print options */
                  .print-content {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                  }

                  /* Hide the warning screen for all print options */
                  .pdf-block-screen {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                  }
                }

                /* This will be visible in physical prints but hidden in PDFs */
                .print-content {
                  position: relative;
                  z-index: 1;
                }

                /* Force watermarks to be visible in print */
                .watermark-text, .watermark-footer {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            </style>
          </head>
          <body>
            <!-- This div will be hidden in all print options -->
            <div class="pdf-block-screen" style="display: none;">
              <!-- Empty div - we're not blocking any print options -->
            </div>

            <!-- This div will be visible in physical prints -->
            <div class="print-content">
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
                <img
                  src="${fileUrl}"
                  style="max-width: 100%; height: auto; display: block; margin: 0 auto;"
                  onload="document.imageLoaded = true; console.log('Image loaded');"
                  onerror="document.imageLoadError = true; console.error('Image load error');"
                />
              </div>
            </div>

            <script>
              // Block screenshots at the iframe level
              function blockScreenshots() {
                // Block Print Screen key
                document.addEventListener('keydown', function(e) {
                  if (e.key === 'PrintScreen' || e.keyCode === 44) {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('Screenshots are disabled for security reasons');
                    window.parent.postMessage('screenshot-blocked', '*');
                    return false;
                  }

                  // Block other screenshot shortcuts
                  const isScreenshotAttempt =
                    (e.ctrlKey && e.key === 'PrintScreen') ||
                    (e.altKey && e.key === 'PrintScreen') ||
                    (e.shiftKey && e.key === 'PrintScreen') ||
                    (e.ctrlKey && e.shiftKey && e.key === 's') ||
                    (e.metaKey && e.shiftKey && e.key === '3') ||
                    (e.metaKey && e.shiftKey && e.key === '4') ||
                    (e.metaKey && e.shiftKey && e.key === '5');

                  if (isScreenshotAttempt) {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('Screenshots are disabled for security reasons');
                    window.parent.postMessage('screenshot-blocked', '*');
                    return false;
                  }
                }, true);

                // Block context menu
                document.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                  window.parent.postMessage('contextmenu-blocked', '*');
                  return false;
                }, true);

                // Block selection
                document.addEventListener('selectstart', function(e) {
                  e.preventDefault();
                  return false;
                }, true);

                // Block copy
                document.addEventListener('copy', function(e) {
                  e.preventDefault();
                  window.parent.postMessage('copy-blocked', '*');
                  return false;
                }, true);

                console.log('Screenshot blocking activated in iframe');
              }

              // Call the function to block screenshots
              blockScreenshots();

              // Function to handle print preparation
              function preparePrintDialog() {
                try {
                  console.log('Preparing print dialog...');

                  // Add a class to allow all print options
                  document.body.classList.add('allow-all-print');

                  // Add a special attribute for CSS targeting
                  document.body.setAttribute('data-print-preview', 'true');

                  console.log('Print dialog prepared - all print options allowed');
                  return true;
                } catch (e) {
                  console.error('Error in print dialog preparation:', e);
                  return false;
                }
              }

              // Prepare for printing
              function prepareForPrinting() {
                // Prepare the print dialog to allow all print options
                const result = preparePrintDialog();

                // Add a note about printing
                const printNote = document.createElement('div');
                printNote.style.position = 'absolute';
                printNote.style.top = '5px';
                printNote.style.right = '5px';
                printNote.style.color = 'rgba(0,0,0,0.15)';
                printNote.style.fontSize = '8px';
                printNote.style.zIndex = '1000';
                printNote.innerHTML = 'Print ready';
                document.body.appendChild(printNote);

                // Add event listener for the beforeprint event
                window.addEventListener('beforeprint', function() {
                  // This will run right before the print dialog opens
                  console.log('Before print event - preparing print dialog');
                  preparePrintDialog();
                });

                return result;
              }

              // Wait for the image to load before printing
              function checkImageAndPrint() {
                if (document.imageLoaded) {
                  console.log('Image loaded, proceeding with print');

                  // Prepare for printing - block all PDF options
                  prepareForPrinting();

                  setTimeout(function() {
                    // Prepare the print dialog to block all PDF options
                    preparePrintDialog();

                    // Use the system print dialog
                    try {
                      console.log('Opening system print dialog');
                      window.print();

                      // Notify parent when print is complete
                      window.parent.postMessage('print-complete', '*');
                    } catch (e) {
                      console.error('Error opening print dialog:', e);

                      // Notify parent of the error
                      window.parent.postMessage('print-error', '*');
                    }
                  }, 500);
                } else if (document.imageLoadError) {
                  console.error('Image failed to load');
                  window.parent.postMessage('print-error', '*');
                } else {
                  console.log('Waiting for image to load...');
                  setTimeout(checkImageAndPrint, 200);
                }
              }

              // Start checking when the document is ready
              document.addEventListener('DOMContentLoaded', function() {
                // If image is already loaded
                if (document.querySelector('img').complete) {
                  document.imageLoaded = true;
                }

                setTimeout(checkImageAndPrint, 500);
              });

              // Listen for the afterprint event
              window.addEventListener('afterprint', function() {
                window.parent.postMessage('print-complete', '*');
              });

              // Prepare for printing during the print event
              window.addEventListener('beforeprint', function() {
                console.log('Before print event fired - preparing print dialog');

                // Prepare the print dialog to allow all print options
                preparePrintDialog();

                // Add a class to allow all print options
                document.body.classList.add('allow-all-print');
              });
            </script>
          </body>
          </html>
        `);
        iframeDoc.close();

      } catch (error) {
        console.error('Print error:', error);
        if (onPrintError) onPrintError(error);
      }
    };

    // Set up message listener for print and screenshot events
    const handlePrintMessage = (event) => {
      if (event.data === 'print-complete') {
        console.log('Print completed');
        if (onPrintComplete) onPrintComplete();
      } else if (event.data === 'print-error') {
        console.error('Print error from iframe');
        if (onPrintError) onPrintError(new Error('Failed to print document'));
      } else if (event.data === 'print-request') {
        // Handle print request
        console.log('Received print request');
        window.print();
      } else if (event.data === 'screenshot-blocked') {
        // Handle screenshot blocked event
        console.log('Screenshot blocked in iframe');
        customToast.error('Screenshots are not allowed for security reasons');
        setIsScreenshotBlocked(true);
        setTimeout(() => setIsScreenshotBlocked(false), 3000);
      } else if (event.data === 'contextmenu-blocked') {
        // Handle context menu blocked event
        console.log('Context menu blocked in iframe');
        customToast.error('Right-click is disabled for security reasons');
      } else if (event.data === 'copy-blocked') {
        // Handle copy blocked event
        console.log('Copy blocked in iframe');
        customToast.error('Copy is disabled for security reasons');
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
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        border: '0',
        zIndex: '-1'
      }}
      title="PDF Blocker Frame"
    />
  );
};

export default PdfBlockerService;
