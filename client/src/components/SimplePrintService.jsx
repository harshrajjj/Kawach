import React, { useEffect, useRef, useState } from 'react';
import customToast from '../utils/toast';

// This component focuses on correctly displaying and printing the document
const SimplePrintService = ({ fileUrl, onPrintComplete, onPrintError }) => {
  const iframeRef = useRef(null);
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

        // Write content to the iframe - keeping it simple to ensure it works
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
                background-color: white;
              }

              .container {
                position: relative;
                width: 100%;
                height: 100%;
              }

              .watermark {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 2;
                pointer-events: none;
              }

              .watermark-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 4rem;
                color: rgba(0, 0, 0, 0.1);
                font-weight: bold;
                white-space: nowrap;
                letter-spacing: 0.5rem;
                text-transform: uppercase;
              }

              .watermark-footer {
                position: absolute;
                bottom: 10px;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-between;
                padding: 0 20px;
                font-size: 10px;
                color: rgba(0, 0, 0, 0.2);
              }

              .document-image {
                display: block;
                max-width: 100%;
                height: auto;
                margin: 0 auto;
              }

              @media print {
                body {
                  margin: 0;
                  background-color: white;
                }

                .watermark-text, .watermark-footer {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }

                /* Hide content when PDF saving is detected */
                body.is-pdf-detected .container,
                body.is-pdf-detected .document-image,
                body.is-pdf-detected .watermark {
                  display: none !important;
                  visibility: hidden !important;
                  opacity: 0 !important;
                }

                body.is-pdf-detected {
                  background-color: white !important;
                }

                body.is-pdf-detected::before {
                  content: "PDF SAVING IS NOT ALLOWED";
                  display: block;
                  position: absolute;
                  top: 40%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  font-size: 36px;
                  font-weight: bold;
                  color: red;
                  text-align: center;
                  width: 100%;
                }

                body.is-pdf-detected::after {
                  content: "This document can only be printed to a physical printer. Please select a printer instead of 'Save as PDF'.";
                  display: block;
                  position: absolute;
                  top: 60%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  font-size: 18px;
                  color: black;
                  text-align: center;
                  width: 80%;
                }
              }
            </style>
          </head>
          <body class="print-body">
            <!-- Hidden elements to detect PDF saving -->
            <div id="pdf-detector" style="display: none; position: absolute; width: 1px; height: 1px; background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=');"></div>

            <div class="container">
              <div class="watermark">
                <div class="watermark-text">CONFIDENTIAL</div>
                <div class="watermark-footer">
                  <span>Printed by: ${getUserData().name}</span>
                  <span>Printed on: ${new Date().toLocaleString()}</span>
                </div>
              </div>

              <img
                src="${fileUrl}"
                class="document-image"
                onload="console.log('Image loaded successfully'); document.imageLoaded = true;"
                onerror="console.error('Failed to load image'); document.imageLoadError = true;"
              />
            </div>

            <script>
              // Detect if "Save as PDF" is selected in the print dialog
              function detectPdfSaving() {
                try {
                  // Check if we're in a print preview
                  const isPrinting = window.matchMedia('print').matches;
                  if (!isPrinting) return false;

                  // Try to detect PDF printer
                  // Method 1: Check for PDF-related objects
                  if (window.chrome && window.chrome.printing && window.chrome.printing.getPrinterInfo) {
                    window.chrome.printing.getPrinterInfo().then(function(printers) {
                      const pdfPrinters = printers.filter(p =>
                        p.name.toLowerCase().includes('pdf') ||
                        p.name.toLowerCase().includes('save') ||
                        p.name.toLowerCase().includes('microsoft print to pdf') ||
                        p.name.toLowerCase().includes('adobe') ||
                        p.name.toLowerCase().includes('cutepdf')
                      );

                      if (pdfPrinters.length > 0) {
                        document.body.classList.add('is-pdf-detected');
                        console.log('PDF printer detected:', pdfPrinters[0].name);
                      }
                    }).catch(function(error) {
                      console.log('Could not get printer info:', error);
                    });
                  }

                  // Method 2: Check for PDF-specific CSS
                  const style = window.getComputedStyle(document.body);
                  const hasPdfStyles = style.getPropertyValue('--pdf-printing') === 'true';
                  if (hasPdfStyles) {
                    document.body.classList.add('is-pdf-detected');
                    return true;
                  }

                  // Method 3: Check for PDF-specific media features
                  if (window.matchMedia('(device-type: pdf)').matches) {
                    document.body.classList.add('is-pdf-detected');
                    return true;
                  }

                  // Method 4: Check for PDF-specific properties in the window object
                  if (typeof window.navigator.msSaveOrOpenBlob !== 'undefined' ||
                      typeof window.navigator.msSaveBlob !== 'undefined') {
                    document.body.classList.add('is-pdf-detected');
                    return true;
                  }

                  // Method 5: Check for PDF destination in print settings
                  if (window.print && window.print.toString().indexOf('PDF') !== -1) {
                    document.body.classList.add('is-pdf-detected');
                    return true;
                  }

                  // Method 6: Check for PDF detector element visibility
                  const pdfDetector = document.getElementById('pdf-detector');
                  if (pdfDetector) {
                    const detectorStyle = window.getComputedStyle(pdfDetector);
                    // PDF renderers often handle background images differently
                    if (detectorStyle.backgroundImage === 'none' ||
                        detectorStyle.display === 'block') {
                      document.body.classList.add('is-pdf-detected');
                      return true;
                    }
                  }

                  return false;
                } catch (e) {
                  console.error('Error detecting PDF saving:', e);
                  return false;
                }
              }

              // Wait for the image to load before printing
              function checkImageAndPrint() {
                if (document.imageLoaded) {
                  console.log('Image loaded, proceeding with print');
                  setTimeout(function() {
                    window.print();
                    window.parent.postMessage('print-complete', '*');
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

                // Add PDF detection during printing
                window.addEventListener('beforeprint', function() {
                  console.log('Before print event fired');
                  detectPdfSaving();
                });
              });

              // Listen for the afterprint event
              window.addEventListener('afterprint', function() {
                console.log('After print event fired');
                // Remove the PDF detection class in case they try again
                document.body.classList.remove('is-pdf-detected');
                window.parent.postMessage('print-complete', '*');
              });

              // Additional detection for PDF saving
              // This runs periodically to check if PDF saving is being attempted
              setInterval(function() {
                if (window.matchMedia('print').matches) {
                  detectPdfSaving();
                }
              }, 500);
            </script>
          </body>
          </html>
        `);
        iframeDoc.close();

      } catch (error) {
        console.error('Print error:', error);
        setIsPrinting(false);
        if (onPrintError) onPrintError(error);
      }
    };

    // Set up message listener for print events
    const handlePrintMessage = (event) => {
      if (event.data === 'print-complete') {
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
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        border: '0',
        zIndex: '-1'
      }}
      title="Simple Print Frame"
    />
  );
};

export default SimplePrintService;
