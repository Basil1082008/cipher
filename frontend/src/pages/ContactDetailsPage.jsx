import React from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Briefcase,
  MapPin,
  FileText,
  Calendar,
  Clock,
  Edit3,
  Trash2,
} from 'lucide-react';

const AVATAR_COLORS = [
  '#4f46e5',
  '#0284c7',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#db2777',
  '#0891b2',
  '#ea580c',
];

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export default function ContactDetailsPage({ contact, onBack, onEdit, onDelete }) {
  if (!contact) {
    return (
      <div className="details-container">
        <button type="button" className="btn btn-secondary back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Contacts</span>
        </button>
        <div className="empty-state-card">
          <p>Contact not found.</p>
        </div>
      </div>
    );
  }

  const avatarBg = getAvatarColor(contact.name);
  const initials = getInitials(contact.name);

  return (
    <div className="details-view-container">
      {/* Top Navigation */}
      <div className="details-nav">
        <button type="button" className="btn btn-secondary back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Contacts</span>
        </button>

        <div className="details-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onEdit(contact)}
          >
            <Edit3 size={16} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="btn btn-danger-outline"
            onClick={() => onDelete(contact)}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="details-hero-card">
        <div
          className="details-avatar"
          style={{ backgroundColor: avatarBg }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="details-hero-info">
          <h2 className="details-hero-name">{contact.name}</h2>
          <div className="details-hero-sub">
            {contact.job_title && (
              <span className="hero-badge">
                <Briefcase size={14} />
                {contact.job_title}
              </span>
            )}
            {contact.company && (
              <span className="hero-badge">
                <Building size={14} />
                {contact.company}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="details-grid">
        {/* Contact Info Card */}
        <section className="details-section-card">
          <h3 className="section-title">Contact Information</h3>
          <div className="details-items-list">
            <div className="detail-item">
              <div className="detail-icon-box">
                <Mail size={16} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Email Address</span>
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="detail-value detail-link">
                    {contact.email}
                  </a>
                ) : (
                  <span className="detail-value text-muted">Not specified</span>
                )}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-box">
                <Phone size={16} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Phone Number</span>
                {contact.phone ? (
                  <a href={`tel:${contact.phone}`} className="detail-value detail-link">
                    {contact.phone}
                  </a>
                ) : (
                  <span className="detail-value text-muted">Not specified</span>
                )}
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-box">
                <MapPin size={16} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Physical Address</span>
                <span className="detail-value">
                  {contact.address || <span className="text-muted">Not specified</span>}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Details Card */}
        <section className="details-section-card">
          <h3 className="section-title">Employment & Organization</h3>
          <div className="details-items-list">
            <div className="detail-item">
              <div className="detail-icon-box">
                <Building size={16} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Company</span>
                <span className="detail-value">
                  {contact.company || <span className="text-muted">Not specified</span>}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon-box">
                <Briefcase size={16} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Job Title</span>
                <span className="detail-value">
                  {contact.job_title || <span className="text-muted">Not specified</span>}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Notes Card */}
        <section className="details-section-card details-section-full">
          <h3 className="section-title">
            <FileText size={16} className="inline-icon" />
            <span>Notes & Background</span>
          </h3>
          <div className="notes-box">
            {contact.notes ? (
              <p className="notes-text">{contact.notes}</p>
            ) : (
              <p className="notes-text text-muted">No notes recorded for this contact.</p>
            )}
          </div>
        </section>

        {/* Record Metadata Card */}
        <section className="details-section-card details-section-full">
          <h3 className="section-title">Record Details</h3>
          <div className="metadata-row">
            <div className="metadata-item">
              <Calendar size={14} className="metadata-icon" />
              <span>Created: <strong>{formatDate(contact.created_at)}</strong></span>
            </div>
            <div className="metadata-item">
              <Clock size={14} className="metadata-icon" />
              <span>Last Updated: <strong>{formatDate(contact.updated_at)}</strong></span>
            </div>
            <div className="metadata-item">
              <span className="id-badge" title={`Internal MongoDB ObjectId: ${contact.id}`}>
                ID: {contact.id}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
