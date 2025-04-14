import React, { useState, useCallback } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';

/**
 * Custom hook for using ConfirmationModal across the app
 * @returns {Object} Confirmation hook functions and component
 */
const useConfirmation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'default',
    icon: null,
    hideCancel: false,
    closeOnTouchOutside: true,
  });

  /**
   * Show confirmation dialog with custom configuration
   * @param {Object} options - Configuration options for the confirmation dialog
   * @returns {Promise} - Promise that resolves when confirmed, rejects when canceled
   */
  const confirm = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      setConfig({
        ...config,
        ...options,
        onConfirm: () => {
          setIsVisible(false);
          if (options.onConfirm) options.onConfirm();
          resolve(true);
        },
        onCancel: () => {
          setIsVisible(false);
          if (options.onCancel) options.onCancel();
          reject(false);
        },
      });
      setIsVisible(true);
    });
  }, [config]);

  /**
   * Shorthand for showing a danger confirmation
   * @param {string} message - Confirmation message
   * @param {Object} options - Additional configuration options
   * @returns {Promise} - Promise that resolves when confirmed, rejects when canceled
   */
  const confirmDelete = useCallback((message, options = {}) => {
    return confirm({
      title: 'Confirm Delete',
      message,
      confirmText: 'Delete',
      type: 'danger',
      icon: 'trash',
      ...options,
    });
  }, [confirm]);

  /**
   * Shorthand for showing a warning confirmation
   * @param {string} message - Confirmation message
   * @param {Object} options - Additional configuration options
   * @returns {Promise} - Promise that resolves when confirmed, rejects when canceled
   */
  const confirmWarning = useCallback((message, options = {}) => {
    return confirm({
      title: 'Warning',
      message,
      type: 'warning',
      ...options,
    });
  }, [confirm]);

  /**
   * Close the confirmation dialog
   */
  const close = useCallback(() => {
    setIsVisible(false);
  }, []);

  // The actual confirmation modal component
  const ConfirmationComponent = useCallback(() => (
    <ConfirmationModal
      visible={isVisible}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      onConfirm={config.onConfirm}
      onCancel={config.onCancel}
      type={config.type}
      icon={config.icon}
      hideCancel={config.hideCancel}
      closeOnTouchOutside={config.closeOnTouchOutside}
    />
  ), [isVisible, config]);

  return {
    confirm,
    confirmDelete,
    confirmWarning,
    close,
    ConfirmationComponent,
  };
};

export default useConfirmation;