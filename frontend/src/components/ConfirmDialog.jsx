import React, { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = "Delete Contact",
  contactName = "",
  message,
  confirmText = "Delete Contact",
  cancelText = "Cancel",
  isConfirming = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isConfirming) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirming, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="alertdialog" aria-modal="true">
      <div className="modal-container modal-confirm-container" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrapper">
          <AlertTriangle size={28} className="confirm-warning-icon" />
        </div>

        <div className="confirm-content">
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-message">
            {message || (
              <>
                Are you sure you want to permanently delete <strong>{contactName}</strong>? This action cannot be undone.
              </>
            )}
          </p>
        </div>

        <div className="modal-footer confirm-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>
                <Loader2 size={16} className="spinner" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
