import React from 'react';
import { Users, UserPlus, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Header({ onAddContact, healthStatus, onNavigateHome }) {
  const isConnected = healthStatus?.database === 'connected';
  const isDisconnected = healthStatus?.database === 'disconnected';

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand" onClick={onNavigateHome} role="button" tabIndex={0} title="Return to Dashboard">
          <div className="brand-icon-wrapper">
            <Users className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">ContactHub</h1>
            <span className="brand-subtitle">MongoDB Atlas & FastAPI</span>
          </div>
        </div>

        <div className="header-actions">
          {healthStatus && (
            <div
              className={`health-badge ${isConnected ? 'status-connected' : 'status-disconnected'}`}
              title={healthStatus.detail || `Database: ${healthStatus.database}`}
            >
              {isConnected ? (
                <>
                  <CheckCircle2 size={14} className="status-icon" />
                  <span>Atlas Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle size={14} className="status-icon" />
                  <span>{isDisconnected ? 'Atlas Offline' : 'Atlas Unconfigured'}</span>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary btn-add-contact"
            onClick={onAddContact}
          >
            <UserPlus size={18} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>
    </header>
  );
}
