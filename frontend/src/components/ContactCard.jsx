import React from 'react';
import { Mail, Phone, Building2, Briefcase, Eye, Edit3, Trash2 } from 'lucide-react';

const AVATAR_COLORS = [
  '#4f46e5', // indigo
  '#0284c7', // light blue
  '#059669', // emerald
  '#d97706', // amber
  '#7c3aed', // violet
  '#db2777', // pink
  '#0891b2', // cyan
  '#ea580c', // orange
];

/**
 * Deterministically pick an avatar color based on the contact's name.
 */
function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Extract 1 or 2 uppercase initials from a contact's full name.
 */
function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function ContactCard({ contact, onView, onEdit, onDelete }) {
  const avatarBg = getAvatarColor(contact.name);
  const initials = getInitials(contact.name);

  return (
    <article className="contact-card">
      <div className="contact-card-header" onClick={() => onView(contact)} role="button" tabIndex={0}>
        <div
          className="contact-avatar"
          style={{ backgroundColor: avatarBg }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="contact-header-info">
          <h3 className="contact-name" title={contact.name}>
            {contact.name}
          </h3>
          {(contact.job_title || contact.company) && (
            <p className="contact-role" title={`${contact.job_title || ''} at ${contact.company || ''}`}>
              {contact.job_title && <span>{contact.job_title}</span>}
              {contact.job_title && contact.company && <span className="role-sep">•</span>}
              {contact.company && <span>{contact.company}</span>}
            </p>
          )}
        </div>
      </div>

      <div className="contact-card-body">
        {contact.email ? (
          <div className="contact-field" title={contact.email}>
            <Mail size={15} className="field-icon" />
            <a
              href={`mailto:${contact.email}`}
              className="field-link"
              onClick={(e) => e.stopPropagation()}
            >
              {contact.email}
            </a>
          </div>
        ) : (
          <div className="contact-field field-empty">
            <Mail size={15} className="field-icon" />
            <span className="field-placeholder">No email provided</span>
          </div>
        )}

        {contact.phone ? (
          <div className="contact-field" title={contact.phone}>
            <Phone size={15} className="field-icon" />
            <a
              href={`tel:${contact.phone}`}
              className="field-link"
              onClick={(e) => e.stopPropagation()}
            >
              {contact.phone}
            </a>
          </div>
        ) : (
          <div className="contact-field field-empty">
            <Phone size={15} className="field-icon" />
            <span className="field-placeholder">No phone provided</span>
          </div>
        )}
      </div>

      <div className="contact-card-actions">
        <button
          type="button"
          className="card-action-btn view-btn"
          onClick={() => onView(contact)}
          title="View full contact details"
          aria-label={`View details for ${contact.name}`}
        >
          <Eye size={16} />
          <span>View</span>
        </button>

        <button
          type="button"
          className="card-action-btn edit-btn"
          onClick={() => onEdit(contact)}
          title="Edit contact"
          aria-label={`Edit ${contact.name}`}
        >
          <Edit3 size={16} />
          <span>Edit</span>
        </button>

        <button
          type="button"
          className="card-action-btn delete-btn"
          onClick={() => onDelete(contact)}
          title="Delete contact"
          aria-label={`Delete ${contact.name}`}
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </article>
  );
}
