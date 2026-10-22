import React, { useState, useEffect } from 'react';
import { X, Loader2, User, Mail, Phone, Building, Briefcase, MapPin, FileText } from 'lucide-react';

export default function ContactForm({ isOpen, contact = null, onClose, onSave }) {
  const isEditing = Boolean(contact && contact.id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Prefill when editing, or reset when creating
  useEffect(() => {
    if (contact && isEditing) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        job_title: contact.job_title || '',
        address: contact.address || '',
        notes: contact.notes || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        address: '',
        notes: '',
      });
    }
    setErrors({});
    setServerError('');
  }, [contact, isEditing, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const validateField = (name, value) => {
    if (name === 'name') {
      if (!value || !value.trim()) {
        return 'Full name is required';
      }
      if (value.trim().length > 120) {
        return 'Name must be 120 characters or less';
      }
    }
    if (name === 'email') {
      if (value && value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          return 'Please enter a valid email address';
        }
      }
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time error validation
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate all required fields
    const newErrors = {};
    const nameErr = validateField('name', formData.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateField('email', formData.email);
    if (emailErr) newErrors.email = emailErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Trim all fields cleanly
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim() ? formData.email.trim() : null,
      phone: formData.phone.trim() ? formData.phone.trim() : null,
      company: formData.company.trim() ? formData.company.trim() : null,
      job_title: formData.job_title.trim() ? formData.job_title.trim() : null,
      address: formData.address.trim() ? formData.address.trim() : null,
      notes: formData.notes.trim() ? formData.notes.trim() : null,
    };

    setIsSubmitting(true);
    setServerError('');

    try {
      await onSave(payload, contact?.id);
      // Close form on success
      onClose();
    } catch (err) {
      console.error('Error saving contact:', err);
      // Extract helpful server validation message if present
      const responseData = err.response?.data;
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const fieldErrors = {};
        responseData.errors.forEach((e) => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
        setServerError('Please fix the indicated validation errors.');
      } else if (responseData?.detail) {
        setServerError(responseData.detail);
      } else {
        setServerError('Failed to save contact. Please verify the backend connection and try again.');
      }
      // Preserve user input on failure (formData is not cleared)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container modal-form-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 className="modal-title">{isEditing ? 'Edit Contact' : 'Create New Contact'}</h2>
            <p className="modal-subtitle">
              {isEditing ? 'Update the details for this contact.' : 'Add a new person to your contact database.'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {serverError && (
          <div className="alert-box alert-error" role="alert">
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="contact-form">
          <div className="form-grid">
            {/* Full Name */}
            <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="contact-name" className="field-label">
                Full Name <span className="required-star">*</span>
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {errors.name && <span className="field-error-text">{errors.name}</span>}
            </div>

            {/* Email Address */}
            <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="contact-email" className="field-label">
                Email Address
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. jane@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && <span className="field-error-text">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-field">
              <label htmlFor="contact-phone" className="field-label">
                Phone Number
              </label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +1 555-0199 or +91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Company */}
            <div className="form-field">
              <label htmlFor="contact-company" className="field-label">
                Company
              </label>
              <div className="input-with-icon">
                <Building size={16} className="input-icon" />
                <input
                  id="contact-company"
                  name="company"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acme Corp"
                  value={formData.company}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Job Title */}
            <div className="form-field form-field-full">
              <label htmlFor="contact-job-title" className="field-label">
                Job Title
              </label>
              <div className="input-with-icon">
                <Briefcase size={16} className="input-icon" />
                <input
                  id="contact-job-title"
                  name="job_title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.job_title}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Address */}
            <div className="form-field form-field-full">
              <label htmlFor="contact-address" className="field-label">
                Physical Address
              </label>
              <div className="input-with-icon">
                <MapPin size={16} className="input-icon" />
                <input
                  id="contact-address"
                  name="address"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 100 Market St, Suite 400, San Francisco, CA"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="form-field form-field-full">
              <label htmlFor="contact-notes" className="field-label">
                Notes
              </label>
              <textarea
                id="contact-notes"
                name="notes"
                rows={3}
                className="form-textarea"
                placeholder="Add any relevant notes or background information..."
                value={formData.notes}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>{isEditing ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Contact'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
