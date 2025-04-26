import React from 'react';

const DocumentWatermark = ({ text, username, timestamp }) => {
  // Format the timestamp
  const formattedDate = new Date(timestamp).toLocaleString();
  
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Main diagonal watermark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="text-gray-800/10 font-bold text-4xl transform rotate-45 whitespace-nowrap"
          style={{ 
            fontSize: '4rem',
            letterSpacing: '0.5rem',
            textTransform: 'uppercase'
          }}
        >
          {text || 'CONFIDENTIAL'}
        </div>
      </div>
      
      {/* Footer watermark with user info and timestamp */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between text-gray-800/20 text-xs">
        <span>Printed by: {username}</span>
        <span>Printed on: {formattedDate}</span>
      </div>
    </div>
  );
};

export default DocumentWatermark;
