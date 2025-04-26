import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPrint } from 'react-icons/fa';
import axios from 'axios';
import customToast from '../utils/toast';
import CustomPrintDialog from '../components/CustomPrintDialog';

const Print = () => {
  const navigate = useNavigate();
  const {fileId} = useParams();
  const containerRef = useRef(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  useEffect(() => {
    // Check if fileId exists
    if (!fileId) {
      customToast.error('No document selected');
      navigate('/dashboard');
      return;
    }

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
  }, [fileId, navigate]);

  const handlePrint = () => {
    if (!fileData?.url) {
      customToast.error('No document available to print');
      return;
    }

    // Show the custom print dialog instead of using the browser's print dialog
    setShowPrintDialog(true);
  };

  // Handle closing the print dialog
  const handleClosePrintDialog = () => {
    setShowPrintDialog(false);
  };

  // Handle print completion
  const handlePrintComplete = () => {
    customToast.success('Document printed successfully');
    // Redirect to dashboard after printing
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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

      {/* Custom Print Dialog */}
      {showPrintDialog && (
        <CustomPrintDialog
          fileData={{...fileData, fileId}}
          onClose={handleClosePrintDialog}
          onPrintComplete={handlePrintComplete}
        />
      )}
    </div>
  );
};

export default Print;
