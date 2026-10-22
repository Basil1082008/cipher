import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ error, onRetry }) {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.response?.data?.detail || error?.message || 'Failed to load contacts from the server.';

  return (
    <div className="error-state-card" role="alert">
      <div className="error-icon-wrapper">
        <AlertCircle size={40} className="error-icon" />
      </div>
      <h3 className="error-title">Unable to Load Contacts</h3>
      <p className="error-description">{errorMessage}</p>
      <div className="error-hint">
        <span>Make sure the FastAPI backend is running and your MongoDB Atlas cluster allows incoming connections.</span>
      </div>
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          <RefreshCw size={16} />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
