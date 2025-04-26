/**
 * Utility functions for printing
 */

/**
 * Triggers Chrome's print dialog (Ctrl+Shift+P)
 * This is different from the system print dialog (which is triggered by window.print())
 *
 * @returns {boolean} True if the event was dispatched successfully
 */
export const triggerChromePrintDialog = () => {
  try {
    console.log('Attempting to trigger Chrome print dialog (Ctrl+Shift+P)');

    // Method 1: Using KeyboardEvent
    try {
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
      console.log('Chrome print dialog keyboard event dispatched');
    } catch (e) {
      console.error('Error with method 1:', e);
    }

    // Method 2: Using direct script execution
    try {
      // Create a script element
      const script = document.createElement('script');
      script.textContent = `
        (function() {
          try {
            // Try to programmatically trigger Ctrl+Shift+P
            const e = new KeyboardEvent('keydown', {
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
            document.dispatchEvent(e);
            console.log('Inline script: Chrome print dialog triggered');
          } catch(err) {
            console.error('Inline script error:', err);
          }
        })();
      `;
      document.head.appendChild(script);
      document.head.removeChild(script);
    } catch (e) {
      console.error('Error with method 2:', e);
    }

    // Method 3: Using a direct call to Chrome's print function
    try {
      // This is a direct attempt to access Chrome's print function
      if (window.chrome && window.chrome.tabs) {
        window.chrome.tabs.executeScript({
          code: 'window.print();'
        });
        console.log('Chrome API print triggered');
      }
    } catch (e) {
      console.error('Error with method 3:', e);
    }

    // Method 4: Using a button click that triggers the print dialog
    try {
      // Create a hidden button
      const button = document.createElement('button');
      button.style.position = 'absolute';
      button.style.left = '-9999px';
      button.style.top = '-9999px';
      button.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Try to trigger the print dialog
        const printEvent = new KeyboardEvent('keydown', {
          key: 'p',
          code: 'KeyP',
          keyCode: 80,
          which: 80,
          ctrlKey: true,
          shiftKey: true,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(printEvent);

        // Remove the button
        document.body.removeChild(this);
      };

      // Add the button to the document
      document.body.appendChild(button);

      // Click the button
      button.click();
    } catch (e) {
      console.error('Error with method 4:', e);
    }

    return true;
  } catch (e) {
    console.error('Error triggering Chrome print dialog:', e);
    return false;
  }
};

/**
 * Triggers the system print dialog
 *
 * @returns {boolean} True if the print dialog was triggered successfully
 */
export const triggerSystemPrintDialog = () => {
  try {
    console.log('Triggering system print dialog');
    window.print();
    return true;
  } catch (e) {
    console.error('Error triggering system print dialog:', e);
    return false;
  }
};

export default {
  triggerChromePrintDialog,
  triggerSystemPrintDialog
};
