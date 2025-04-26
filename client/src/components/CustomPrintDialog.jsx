import React, { useEffect, useRef, useState } from 'react';
import { FaPrint, FaTimes, FaEye } from 'react-icons/fa';
import axios from 'axios';
import customToast from '../utils/toast';
import PrintPreview from './PrintPreview';
import PdfBlockerService from './PdfBlockerService';

const CustomPrintDialog = ({ fileData, onClose, onPrintComplete }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [useDirectPrint, setUseDirectPrint] = useState(false);
  const printFrameRef = useRef(null);

  // Create an invisible iframe to hold the document for printing
  useEffect(() => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.name = 'printFrame';
    iframe.id = 'printFrame';
    document.body.appendChild(iframe);

    printFrameRef.current = iframe;

    return () => {
      document.body.removeChild(iframe);
    };
  }, []);

  // Log print event to server
  const logPrintEvent = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/v1/print/log/${fileId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Print event logged successfully');
    } catch (error) {
      console.error('Error logging print event:', error);
    }
  };

  // Check if printer is available
  const checkPrinterAvailability = () => {
    return new Promise((resolve) => {
      // Create a temporary iframe to check printer availability
      const tempIframe = document.createElement('iframe');
      tempIframe.style.position = 'absolute';
      tempIframe.style.top = '-9999px';
      tempIframe.style.left = '-9999px';
      tempIframe.style.width = '0';
      tempIframe.style.height = '0';
      tempIframe.style.border = '0';
      document.body.appendChild(tempIframe);

      // Write a simple document to the iframe
      const tempDoc = tempIframe.contentDocument || tempIframe.contentWindow.document;
      tempDoc.open();
      tempDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Printer Check</title>
          <script>
            function checkPrinter() {
              if (window.matchMedia('(pointer: fine)').matches &&
                  navigator.maxTouchPoints <= 1 &&
                  window.navigator.userAgent.indexOf('Windows') !== -1) {
                // On Windows desktop, we assume a printer is available
                window.parent.postMessage('printer-available', '*');
              } else {
                try {
                  // Try to access the print functionality
                  const mediaQueryList = window.matchMedia('print');
                  if (mediaQueryList.matches || mediaQueryList.addEventListener) {
                    window.parent.postMessage('printer-available', '*');
                  } else {
                    window.parent.postMessage('printer-unavailable', '*');
                  }
                } catch (e) {
                  // If there's an error, assume printer is unavailable
                  window.parent.postMessage('printer-unavailable', '*');
                }
              }
            }

            // Check printer after a short delay
            setTimeout(checkPrinter, 100);
          </script>
        </head>
        <body></body>
        </html>
      `);
      tempDoc.close();

      // Listen for the message from the iframe
      const handleMessage = (event) => {
        if (event.data === 'printer-available') {
          window.removeEventListener('message', handleMessage);
          document.body.removeChild(tempIframe);
          resolve(true);
        } else if (event.data === 'printer-unavailable') {
          window.removeEventListener('message', handleMessage);
          document.body.removeChild(tempIframe);
          resolve(false);
        }
      };

      window.addEventListener('message', handleMessage);

      // Timeout after 2 seconds and assume printer is unavailable
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        document.body.removeChild(tempIframe);
        resolve(false);
      }, 2000);
    });
  };

  // Handle the print action
  const handlePrint = async () => {
    if (!fileData?.url) {
      customToast.error('No document available to print');
      return;
    }

    try {
      setIsPrinting(true);

      // Check if printer is available
      const isPrinterAvailable = await checkPrinterAvailability();

      if (!isPrinterAvailable) {
        setIsPrinting(false);
        customToast.error('No printer available. Please connect a printer and try again.');
        return;
      }

      // Log the print event
      await logPrintEvent(fileData.fileId);

      // Use the iframe method directly
      console.log('Using iframe method for printing');
      setUseDirectPrint(true);

    } catch (error) {
      console.error('Print error:', error);
      customToast.error('Error printing document');
      setIsPrinting(false);
      setUseDirectPrint(false);
    }
  };

  // Handle direct print completion
  const handleDirectPrintComplete = () => {
    setIsPrinting(false);
    setUseDirectPrint(false);
    customToast.success('Document sent to printer successfully');
    onPrintComplete();
  };

  // Handle direct print error
  const handleDirectPrintError = (error) => {
    console.error('Direct print error:', error);
    setIsPrinting(false);
    setUseDirectPrint(false);
    customToast.error('Error sending document to printer');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* PDF Blocker Service */}
      {useDirectPrint && fileData?.url && (
        <PdfBlockerService
          fileUrl={fileData.url}
          onPrintComplete={handleDirectPrintComplete}
          onPrintError={handleDirectPrintError}
        />
      )}

      <div className="bg-[#1a1127] rounded-xl shadow-2xl p-4 sm:p-8 max-w-lg w-full border border-purple-900/50 my-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Print Document
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-[#251934] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">Document Details</h3>
            <div className="bg-[#2a2235] p-4 rounded-md">
              <p className="text-gray-300 break-all">
                {fileData?.filename || 'Document not available'}
              </p>
            </div>
          </div>

          <div className="bg-[#251934] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">Print Options</h3>
            <p className="text-sm text-gray-400 mb-4">
              This document can be printed or saved as PDF.
            </p>

            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800/50 mb-4">
              <p className="text-xs text-blue-300">
                <strong>Information:</strong> When the print dialog appears, you can:
              </p>
              <ol className="text-xs text-blue-300 list-decimal pl-5 mt-2 space-y-1">
                <li>Select any printer or PDF option</li>
                <li>Click the "Print" button to send to printer or save as PDF</li>
                <li>The document contains watermarks for tracking purposes</li>
              </ol>
              <p className="text-xs text-blue-300 mt-2 border-t border-blue-800/50 pt-2">
                <strong>Note:</strong> You can preview the document below before printing.
              </p>
            </div>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <FaEye />
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>

            {showPreview && fileData?.url && (
              <div className="mt-4">
                <PrintPreview fileUrl={fileData.url} />
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-3">
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg
                         hover:from-cyan-500 hover:to-purple-600 transition-all duration-300
                         flex items-center justify-center space-x-2 font-semibold"
              >
                {isPrinting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending to printer...
                  </span>
                ) : (
                  <>
                    <FaPrint className="text-xl mr-2" />
                    <span>Send to Printer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-400 text-center">
              This is a one-time print access. The link will expire after printing.
            </p>
            {isPrinting && (
              <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800/50">
                <p className="text-xs text-blue-300 text-center">
                  Your document is being prepared for printing. When the print dialog appears:
                </p>
                <ul className="text-xs text-blue-300 list-disc pl-5 mt-2 space-y-1">
                  <li>Select any printer or PDF option</li>
                  <li>Click the "Print" button to send to printer or save as PDF</li>
                  <li>The document contains watermarks for tracking purposes</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPrintDialog;
