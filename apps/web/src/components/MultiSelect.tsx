'use client';
import { useState, useRef, useEffect } from 'react';

interface Option {
  code: string;
  title?: string;
  name?: string;
  category?: string;
  sector?: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  searchable?: boolean;
  groupBy?: 'category' | 'sector';
}

export default function MultiSelect({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  searchable = true,
  groupBy 
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = searchable && searchQuery
    ? options.filter(option => {
        const q = searchQuery.toLowerCase();
        const title = option.title || option.name || '';
        return option.code.toLowerCase().includes(q) || 
               title.toLowerCase().includes(q) ||
               (option.category && option.category.toLowerCase().includes(q)) ||
               (option.sector && option.sector.toLowerCase().includes(q));
      })
    : options;

  const toggleOption = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter(v => v !== code));
    } else {
      onChange([...value, code]);
    }
  };

  const groupedOptions = groupBy 
    ? filteredOptions.reduce((groups, option) => {
        const key = option[groupBy] || 'Other';
        if (!groups[key]) groups[key] = [];
        groups[key].push(option);
        return groups;
      }, {} as Record<string, Option[]>)
    : null;

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          padding: '12px 16px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px',
          cursor: 'pointer',
          backgroundColor: '#fff',
          fontSize: '14px'
        }}
      >
        {value.length > 0 ? (
          value.map(code => {
            const option = options.find(o => o.code === code);
            return (
              <span 
                key={code}
                style={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderRadius: '16px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  maxWidth: '200px'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {option ? `${code} - ${(option.title || option.name || '').substring(0, 25)}...` : code}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(code);
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    padding: '0',
                    lineHeight: '1'
                  }}
                >
                  ×
                </button>
              </span>
            );
          })
        ) : (
          <span style={{ color: '#999' }}>{placeholder}</span>
        )}
        <span style={{ marginLeft: 'auto', color: '#666', fontSize: '12px' }}>▼</span>
      </div>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            backgroundColor: '#fff',
            border: '1px solid #e9ecef',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {searchable && (
            <div style={{ padding: '12px' }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box' as 'border-box'
                }}
              />
            </div>
          )}

          <div>
            {groupedOptions ? (
              Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <div key={group}>
                  <div style={{
                    padding: '8px 16px',
                    backgroundColor: '#f8f9fa',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: '#666',
                    borderBottom: '1px solid #e9ecef',
                    textTransform: 'uppercase' as 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {group}
                  </div>
                  {groupOptions.map(option => (
                    <div
                      key={option.code}
                      onClick={() => toggleOption(option.code)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        backgroundColor: value.includes(option.code) ? '#667eea' : 'transparent',
                        color: value.includes(option.code) ? 'white' : '#333',
                        borderBottom: '1px solid #f0f0f0',
                        fontSize: '14px',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: '500' }}>{option.code}</div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: value.includes(option.code) ? 'rgba(255,255,255,0.8)' : '#666',
                        marginTop: '2px'
                      }}>
                        {option.title || option.name}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.code}
                  onClick={() => toggleOption(option.code)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: value.includes(option.code) ? '#667eea' : 'transparent',
                    color: value.includes(option.code) ? 'white' : '#333',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '14px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{ fontWeight: '500' }}>{option.code}</div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: value.includes(option.code) ? 'rgba(255,255,255,0.8)' : '#666',
                    marginTop: '2px'
                  }}>
                    {option.title || option.name}
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredOptions.length === 0 && (
            <div style={{ 
              padding: '16px', 
              textAlign: 'center' as 'center', 
              color: '#999',
              fontSize: '14px'
            }}>
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
