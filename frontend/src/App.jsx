import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ContactsPage from './pages/ContactsPage';
import ContactDetailsPage from './pages/ContactDetailsPage';
import ContactForm from './components/ContactForm';
import ConfirmDialog from './components/ConfirmDialog';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  checkHealth,
} from './api/contacts';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'details'
  const [selectedContact, setSelectedContact] = useState(null);

  // Contacts data state
  const [contacts, setContacts] = useState([]);
  const [allContactsCount, setAllContactsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formContact, setFormContact] = useState(null); // null for create, contact object for edit
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Service & Database health
  const [healthStatus, setHealthStatus] = useState(null);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Ref to track latest search query to prevent race conditions / stale responses
  const latestSearchRef = useRef('');

  // Helper to trigger toast notification
  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch backend and MongoDB health status
  const loadHealthStatus = useCallback(async () => {
    try {
      const data = await checkHealth();
      setHealthStatus(data);
    } catch (err) {
      setHealthStatus({
        status: 'error',
        database: 'disconnected',
        detail: 'Cannot reach backend service.',
      });
    }
  }, []);

  // Fetch contacts with optional search query
  const loadContacts = useCallback(async (query = '') => {
    setIsLoading(true);
    setError(null);
    latestSearchRef.current = query;

    try {
      const data = await getContacts(query);
      // Ensure stale response does not overwrite if user typed something newer
      if (latestSearchRef.current === query) {
        setContacts(data);
        if (!query.trim()) {
          setAllContactsCount(data.length);
        }
      }
    } catch (err) {
      if (latestSearchRef.current === query) {
        console.error('Failed to load contacts:', err);
        setError(err);
      }
    } finally {
      if (latestSearchRef.current === query) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadHealthStatus();
    loadContacts('');
  }, [loadHealthStatus, loadContacts]);

  // Debounced search handler
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      loadContacts(val);
    }, 250);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Open Add Contact modal
  const handleOpenAdd = () => {
    setFormContact(null);
    setIsFormOpen(true);
  };

  // Open Edit Contact modal
  const handleOpenEdit = (contact) => {
    setFormContact(contact);
    setIsFormOpen(true);
  };

  // View full contact details
  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to contacts list view
  const handleNavigateHome = () => {
    setCurrentView('list');
    setSelectedContact(null);
  };

  // Save contact handler (create or update)
  const handleSaveContact = async (formData, contactId) => {
    if (contactId) {
      // Update
      const updated = await updateContact(contactId, formData);
      showToast(`Contact "${updated.name}" updated successfully.`, 'success');
      // Update contacts list in state
      setContacts((prev) => prev.map((c) => (c.id === contactId ? updated : c)));
      if (selectedContact?.id === contactId) {
        setSelectedContact(updated);
      }
    } else {
      // Create
      const created = await createContact(formData);
      showToast(`Contact "${created.name}" created successfully.`, 'success');
      // Prepend to contacts list
      setContacts((prev) => [created, ...prev]);
      setAllContactsCount((prev) => prev + 1);
    }
    // Refresh health status in case it was pending
    loadHealthStatus();
  };

  // Open Delete confirmation dialog
  const handleOpenDelete = (contact) => {
    setContactToDelete(contact);
    setIsDeleteDialogOpen(true);
  };

  // Confirm and perform delete
  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);

    try {
      await deleteContact(contactToDelete.id);
      showToast(`Contact "${contactToDelete.name}" deleted.`, 'success');
      // Remove from list
      setContacts((prev) => prev.filter((c) => c.id !== contactToDelete.id));
      setAllContactsCount((prev) => Math.max(0, prev - 1));

      // If we are currently viewing the deleted contact's details, return to list
      if (selectedContact?.id === contactToDelete.id) {
        handleNavigateHome();
      }

      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
    } catch (err) {
      console.error('Failed to delete contact:', err);
      const msg = err.response?.data?.detail || 'Failed to delete contact. Please check your network connection.';
      showToast(msg, 'error');
      // Contact remains visible in UI upon failure
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Top Header */}
      <Header
        onAddContact={handleOpenAdd}
        healthStatus={healthStatus}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main Container */}
      <main className="main-content">
        {currentView === 'list' ? (
          <ContactsPage
            contacts={contacts}
            allContactsCount={allContactsCount}
            isLoading={isLoading}
            error={error}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onRefresh={() => {
              loadHealthStatus();
              loadContacts(searchTerm);
            }}
            onAddContact={handleOpenAdd}
            onViewContact={handleViewContact}
            onEditContact={handleOpenEdit}
            onDeleteContact={handleOpenDelete}
          />
        ) : (
          <ContactDetailsPage
            contact={selectedContact}
            onBack={handleNavigateHome}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-text">
            Full-Stack Contact Manager • Built with React, FastAPI & MongoDB Atlas
          </p>
          <div className="footer-links">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              FastAPI Swagger Docs
            </a>
          </div>
        </div>
      </footer>

      {/* Add / Edit Contact Modal */}
      <ContactForm
        isOpen={isFormOpen}
        contact={formContact}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveContact}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        contactName={contactToDelete?.name || ''}
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(false);
            setContactToDelete(null);
          }
        }}
      />

      {/* Toast Notifications Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-alert toast-${toast.type}`}
            role="status"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} className="toast-icon text-success" />
            ) : (
              <AlertCircle size={18} className="toast-icon text-error" />
            )}
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
