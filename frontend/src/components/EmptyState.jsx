import React from 'react';
import { UserPlus, SearchX, Users } from 'lucide-react';

export default function EmptyState({ isSearching, searchTerm, onAddContact, onClearSearch }) {
  if (isSearching) {
    return (
      <div className="empty-state-card">
        <div className="empty-icon-wrapper">
          <SearchX size={36} className="empty-icon" />
        </div>
        <h3 className="empty-title">No matching contacts</h3>
        <p className="empty-description">
          We couldn't find any contacts matching <strong>"{searchTerm}"</strong> across names, emails, phones, or companies.
        </p>
        <button type="button" className="btn btn-secondary" onClick={onClearSearch}>
          Clear Search Filter
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state-card">
      <div className="empty-icon-wrapper">
        <Users size={36} className="empty-icon" />
      </div>
      <h3 className="empty-title">No contacts yet</h3>
      <p className="empty-description">
        Your contact list is empty. Add your first contact to get started with persistent storage on MongoDB Atlas.
      </p>
      <button type="button" className="btn btn-primary" onClick={onAddContact}>
        <UserPlus size={16} />
        <span>Add Your First Contact</span>
      </button>
    </div>
  );
}
