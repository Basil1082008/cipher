import React from 'react';

export default function LoadingState({ count = 6 }) {
  return (
    <div className="contacts-grid loading-grid" aria-busy="true" aria-label="Loading contacts">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="contact-card skeleton-card">
          <div className="contact-card-header">
            <div className="skeleton-avatar skeleton-pulse" />
            <div className="skeleton-header-info">
              <div className="skeleton-line skeleton-title skeleton-pulse" />
              <div className="skeleton-line skeleton-subtitle skeleton-pulse" />
            </div>
          </div>
          <div className="contact-card-body">
            <div className="skeleton-line skeleton-field skeleton-pulse" />
            <div className="skeleton-line skeleton-field skeleton-pulse" />
          </div>
          <div className="contact-card-actions">
            <div className="skeleton-button skeleton-pulse" />
            <div className="skeleton-button skeleton-pulse" />
            <div className="skeleton-button skeleton-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
