/**
 * This script helps trigger Chrome's print dialog (Ctrl+Shift+P)
 */

// Function to trigger Chrome's print dialog
function triggerChromePrintDialog() {
  try {
    console.log('Chrome Print Helper: Attempting to trigger Chrome print dialog');
    
    // Create a keyboard event for Ctrl+Shift+P
    const printEvent = new KeyboardEvent('keydown', {
      key: 'p',
      code: 'KeyP',
      keyCode: 80,
      which: 80,
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
      composed: true
    });
    
    // Dispatch the event to the document
    document.dispatchEvent(printEvent);
    
    console.log('Chrome Print Helper: Chrome print dialog event dispatched');
    return true;
  } catch (e) {
    console.error('Chrome Print Helper: Error triggering Chrome print dialog:', e);
    return false;
  }
}

// Make the function available globally
window.triggerChromePrintDialog = triggerChromePrintDialog;

// Add a keyboard shortcut listener
document.addEventListener('keydown', function(e) {
  // Check if the user pressed Ctrl+Alt+P (an alternative shortcut)
  if (e.ctrlKey && e.altKey && e.key === 'p') {
    e.preventDefault();
    console.log('Chrome Print Helper: Ctrl+Alt+P shortcut detected');
    triggerChromePrintDialog();
  }
});

console.log('Chrome Print Helper: Script loaded and ready');
