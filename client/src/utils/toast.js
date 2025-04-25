import toast from 'react-hot-toast';

// Custom toast utility functions
const customToast = {
  // Success toast with custom message
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      ...options,
    });
  },

  // Error toast with custom message
  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 4000,
      ...options,
    });
  },

  // Info toast with custom message
  info: (message, options = {}) => {
    return toast(message, {
      duration: 3000,
      icon: '📢',
      ...options,
    });
  },

  // Warning toast with custom message
  warning: (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      icon: '⚠️',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
        border: '1px solid #F59E0B',
      },
      ...options,
    });
  },

  // Loading toast that can be updated later
  loading: (message, options = {}) => {
    return toast.loading(message, {
      duration: Infinity, // Loading toasts don't auto-dismiss
      ...options,
    });
  },

  // Promise toast that shows loading, success, and error states
  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'An error occurred',
      },
      options
    );
  },

  // Dismiss a specific toast by ID
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },
};

export default customToast;
