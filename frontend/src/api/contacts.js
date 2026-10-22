import axios from 'axios';

// Get base URL from environment or default to local backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Fetch all contacts, optionally filtered by a search term.
 * @param {string} [searchTerm]
 * @returns {Promise<Array>}
 */
export async function getContacts(searchTerm = '') {
  const params = {};
  if (searchTerm && searchTerm.trim()) {
    params.search = searchTerm.trim();
  }
  const response = await apiClient.get('/contacts', { params });
  return response.data;
}

/**
 * Search contacts by query string.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchContacts(query) {
  return getContacts(query);
}

/**
 * Fetch a single contact by ID.
 * @param {string} contactId
 * @returns {Promise<Object>}
 */
export async function getContactById(contactId) {
  const response = await apiClient.get(`/contacts/${contactId}`);
  return response.data;
}

/**
 * Create a new contact.
 * @param {Object} contactData
 * @returns {Promise<Object>}
 */
export async function createContact(contactData) {
  const response = await apiClient.post('/contacts', contactData);
  return response.data;
}

/**
 * Update an existing contact by ID.
 * @param {string} contactId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export async function updateContact(contactId, updateData) {
  const response = await apiClient.put(`/contacts/${contactId}`, updateData);
  return response.data;
}

/**
 * Delete a contact by ID.
 * @param {string} contactId
 * @returns {Promise<void>}
 */
export async function deleteContact(contactId) {
  await apiClient.delete(`/contacts/${contactId}`);
}

/**
 * Check backend service and database health.
 * @returns {Promise<Object>}
 */
export async function checkHealth() {
  const response = await apiClient.get('/health');
  return response.data;
}

export default {
  getContacts,
  searchContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  checkHealth,
};
