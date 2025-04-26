import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPrint } from 'react-icons/fa';
import axios from 'axios';
import customToast from '../utils/toast';

const Print = () => {
  const navigate = useNavigate();
  const {fileId} = useParams();
  const containerRef = useRef(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if fileId exists
    if (!fileId) {
      customToast.error('No document selected');
      navigate('/dashboard');
      return;
    }

    // Detect if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts and dev tools
    const handleKeyDown = (e) => {
      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Dev Tools)
      if ((e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
          // Prevent Ctrl+S, Ctrl+P, Ctrl+C, Ctrl+V
          (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'c' || e.key === 'v')) ||
          // Prevent F12
          e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    // Fetch file data
    const fetchFile = async () => {
      try {
        console.log('Fetching file with ID:', fileId);
        const response = await axios.get(`/api/v1/print/${fileId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          console.log('File data received');
          setFileData(response.data.file);

          // Auto-trigger print only on desktop, not on mobile
          if (!isMobile) {
            setTimeout(() => {
              handlePrint();
            }, 1500);
          }
        } else {
          customToast.error('Failed to load document');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching file:', error);
        customToast.error('Error loading document');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Disable drag and select
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('dragstart', e => e.preventDefault());

    fetchFile();

    // Cleanup event listeners
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', e => e.preventDefault());
      document.removeEventListener('dragstart', e => e.preventDefault());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, navigate]);

  const handlePrint = async () => {
    if (!fileData?.url) {
      customToast.error('No document available to print');
      return;
    }

    try {
      // Detect if user is on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        customToast.error('Please allow popups to print');
        navigate('/dashboard');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Document</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 100%;
              text-align: center;
              padding: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 0 auto;
            }
            .mobile-message {
              display: none;
              margin: 20px 0;
              padding: 15px;
              background-color: #f8d7da;
              color: #721c24;
              border-radius: 5px;
              text-align: center;
              font-size: 16px;
            }
            .print-button {
              display: inline-block;
              margin-top: 20px;
              padding: 10px 20px;
              background-color: #4a90e2;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              .container {
                padding: 0;
              }
              .mobile-message, .print-button {
                display: none !important;
              }
            }
            @media screen and (max-width: 768px) {
              .mobile-message {
                display: block;
              }
            }
          </style>
          <script>
            // Block right click and keyboard shortcuts
            document.addEventListener('contextmenu', e => e.preventDefault());
            document.addEventListener('keydown', e => {
              if (e.ctrlKey || e.key === 'F12') e.preventDefault();
            });

            function handleAfterPrint() {
              window.close();
              if (window.opener) {
                window.opener.location.href = '/dashboard';
              }
            }

            function handlePrint() {
              // On mobile, don't auto-trigger print
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              if (!isMobile) {
                setTimeout(() => {
                  window.print();
                }, 1000);
              }
            }

            function manualPrint() {
              window.print();
            }

            // Listen for the afterprint event
            window.addEventListener('afterprint', handleAfterPrint);

            // If window is closed without printing, redirect
            window.addEventListener('unload', () => {
              if (window.opener) {
                window.opener.location.href = '/dashboard';
              }
            });
          </script>
        </head>
        <body>
          <div class="container">
            <div class="mobile-message">
              <p><strong>Mobile Printing Instructions:</strong></p>
              <p>1. Tap the "Print Document" button below</p>
              <p>2. In the print dialog, select your printer</p>
              <p>3. If using "Save as PDF", the document will be protected</p>
            </div>
            <img src="${fileData.url}" alt="Document" onload="handlePrint();" />
            <button class="print-button" onclick="manualPrint()">Print Document</button>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Print error:', error);
      customToast.error('Error printing document');
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Detect if user is on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0a0118] to-[#0c0118] text-white p-6">
      <div
        ref={containerRef}
        className="max-w-2xl mx-auto mt-20 p-8 bg-[#1a1127] rounded-xl shadow-xl"
      >
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Print Document
        </h1>

        <div className="space-y-6">
          <div className="bg-[#251934] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Document Details</h2>
            <div className="bg-[#2a2235] p-4 rounded-md">
              <p className="text-gray-300 break-all">
                {fileData?.filename || 'Document not available'}
              </p>
            </div>
          </div>

          {isMobile && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-200">
              <h3 className="font-semibold mb-2">Mobile Printing Instructions:</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Tap the "Print Document" button below</li>
                <li>Select your printer in the dialog that appears</li>
                <li>If using "Save as PDF", the document will be protected</li>
                <li>If you encounter errors, try using a desktop browser</li>
              </ol>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg
                     hover:from-cyan-500 hover:to-purple-600 transition-all duration-300
                     flex items-center justify-center space-x-2 font-semibold"
          >
            <FaPrint className="text-xl" />
            <span>Print Document</span>
          </button>

          <p className="text-sm text-gray-400 text-center mt-4">
            This is a one-time print access. The link will expire after printing.
          </p>
        </div>
      </div>

      {isMobile && (
        <div className="max-w-2xl mx-auto mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-200 text-sm">
          <p className="font-semibold">Troubleshooting Tips:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Make sure your device is connected to a printer</li>
            <li>If you see a "Save as PDF" option, you can use it to save the document</li>
            <li>For best results, use Chrome or Safari on your mobile device</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Print;
