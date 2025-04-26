/**
 * Global screenshot blocker script
 * This script blocks screenshot attempts at the system level
 */

(function() {
  // Flag to track if we're in a protected view
  let isProtectedViewActive = false;

  // Function to activate screenshot protection
  function activateScreenshotProtection() {
    isProtectedViewActive = true;
    console.log('Screenshot protection activated');
  }

  // Function to deactivate screenshot protection
  function deactivateScreenshotProtection() {
    isProtectedViewActive = false;
    console.log('Screenshot protection deactivated');
  }

  // Function to handle key events globally
  function handleKeyEvent(event) {
    if (!isProtectedViewActive) return;

    // Check for Print Screen key
    if (event.key === 'PrintScreen' || event.keyCode === 44) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Print Screen key blocked');
      
      // Show alert
      alert('Screenshots are disabled for security reasons');
      return false;
    }

    // Check for Windows screenshot shortcuts
    if ((event.ctrlKey && event.key === 'PrintScreen') ||
        (event.altKey && event.key === 'PrintScreen') ||
        (event.shiftKey && event.key === 'PrintScreen') ||
        (event.ctrlKey && event.shiftKey && event.key === 's')) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Windows screenshot shortcut blocked');
      
      // Show alert
      alert('Screenshots are disabled for security reasons');
      return false;
    }

    // Check for Windows Snipping Tool shortcuts
    if ((event.key === 'Meta' && event.shiftKey && event.key === 's') ||
        (event.ctrlKey && event.key === 'Meta' && event.key === 's')) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Windows Snipping Tool shortcut blocked');
      
      // Show alert
      alert('Screenshots are disabled for security reasons');
      return false;
    }

    // Check for Mac screenshot shortcuts
    if ((event.metaKey && event.shiftKey && event.key === '3') ||
        (event.metaKey && event.shiftKey && event.key === '4') ||
        (event.metaKey && event.shiftKey && event.key === '5')) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Mac screenshot shortcut blocked');
      
      // Show alert
      alert('Screenshots are disabled for security reasons');
      return false;
    }
  }

  // Add global event listeners
  document.addEventListener('keydown', handleKeyEvent, true);
  document.addEventListener('keyup', handleKeyEvent, true);
  document.addEventListener('keypress', handleKeyEvent, true);

  // Expose functions to window
  window.activateScreenshotProtection = activateScreenshotProtection;
  window.deactivateScreenshotProtection = deactivateScreenshotProtection;

  // Automatically activate protection when the script loads
  activateScreenshotProtection();

  console.log('Global screenshot blocker initialized');
})();
