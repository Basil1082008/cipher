import React from 'react';
import { Users, Mail, Phone, Plus, RefreshCw } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ContactCard from '../components/ContactCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function ContactsPage({
  contacts = [],
  allContactsCount = 0,
  isLoading = false,
  error = null,
  searchTerm = '',
  onSearchChange,
  onRefresh,
  onAddContact,
  onViewContact,
  onEditContact,
  onDeleteContact,
}) {
  // Compute synchronized real statistics from active contacts data
  const totalContacts = allContactsCount;
  const contactsWithEmail = contacts.filter((c) => Boolean(c.email && c.email.trim())).length;
  const contactsWithPhone = contacts.filter((c) => Boolean(c.phone && c.phone.trim())).length;

  const isSearching = Boolean(searchTerm && searchTerm.trim());

  return (
    <div className="contacts-page">
      {/* Top Heading & Summary Statistics */}
      <section className="page-header-section">
        <div className="page-title-group">
          <div className="title-row">
            <h2 className="page-title">Contacts</h2>
            <button
              type="button"
              className="btn-icon-refresh"
              onClick={onRefresh}
              title="Refresh contacts"
              disabled={isLoading}
              aria-label="Refresh contacts list"
            >
              <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            </button>
          </div>
          <p className="page-subtitle">
            Manage your personal and professional directory backed by MongoDB Atlas.
          </p>
        </div>

        {/* Real Summary Metric Cards */}
        <div className="summary-cards-grid">
          <div className="summary-card">
            <div className="summary-icon-box icon-indigo">
              <Users size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">Total Contacts</span>
              <span className="summary-number">{totalContacts}</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon-box icon-sky">
              <Mail size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">With Email</span>
              <span className="summary-number">{contactsWithEmail}</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon-box icon-emerald">
              <Phone size={20} />
            </div>
            <div className="summary-info">
              <span className="summary-label">With Phone</span>
              <span className="summary-number">{contactsWithPhone}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Controls: Search Bar & Add Button */}
      <section className="controls-section">
        <SearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search by name, email, phone, or company..."
        />

        <div className="controls-right">
          <span className="results-count">
            {isLoading ? (
              'Loading...'
            ) : isSearching ? (
              `${contacts.length} result${contacts.length === 1 ? '' : 's'} found`
            ) : (
              `${contacts.length} contact${contacts.length === 1 ? '' : 's'}`
            )}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddContact}
          >
            <Plus size={16} />
            <span>Add Contact</span>
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="contacts-content-section">
        {isLoading ? (
          <LoadingState count={6} />
        ) : error ? (
          <ErrorState error={error} onRetry={onRefresh} />
        ) : contacts.length === 0 ? (
          <EmptyState
            isSearching={isSearching}
            searchTerm={searchTerm}
            onAddContact={onAddContact}
            onClearSearch={() => onSearchChange('')}
          />
        ) : (
          <div className="contacts-grid">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onView={onViewContact}
                onEdit={onEditContact}
                onDelete={onDeleteContact}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
