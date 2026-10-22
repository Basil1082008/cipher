import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = "Search contacts by name, email, phone, company..." }) {
  const [searchTerm, setSearchTerm] = useState(value || '');

  // Keep internal input state synced if parent updates value
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const nextVal = e.target.value;
    setSearchTerm(nextVal);
    onChange(nextVal);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
  };

  return (
    <div className="search-bar-wrapper">
      <div className="search-input-container">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          aria-label="Search contacts"
        />
        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
