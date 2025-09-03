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

  const getOptionDisplay = (option: Option) => {
    const title = option.title || option.name || '';
    return `${option.code} - ${title}`;
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
    <div className="multi-select" ref={dropdownRef}>
      <div 
        className="select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px 12px',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '4px',
          cursor: 'pointer',
          backgroundColor: '#fff'
        }}
      >
        {value.length > 0 ? (
          value.map(code => {
            const option = options.find(o => o.code === code);
            return (
              <span 
                key={code}
                style={{
                  backgroundColor: '#e3f2fd',
                  border: '1px solid #2196f3',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {option ? `${code} - ${(option.title || option.name || '').substring(0, 30)}...` : code}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(code);
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#2196f3',
                    fontWeight: 'bold'
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
        <span style={{ marginLeft: 'auto', color: '#666' }}>▼</span>
      </div>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {searchable && (
            <div style={{ padding: '8px' }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}

          <div>
            {groupedOptions ? (
              Object.entries(groupedOptions).map(([group, groupOptions]) => (
                <div key={group}>
                  <div style={{
                    padding: '6px 12px',
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    color: '#666',
                    borderBottom: '1px solid #eee'
                  }}>
                    {group}
                  </div>
                  {groupOptions.map(option => (
                    <div
                      key={option.code}
                      onClick={() => toggleOption(option.code)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        backgroundColor: value.includes(option.code) ? '#e3f2fd' : 'transparent',
                        borderBottom: '1px solid #f0f0f0',
                        fontSize: '14px'
                      }}
                    >
                      <div style={{ fontWeight: '500' }}>{option.code}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
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
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: value.includes(option.code) ? '#e3f2fd' : 'transparent',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ fontWeight: '500' }}>{option.code}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {option.title || option.name}
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredOptions.length === 0 && (
            <div style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
              No options found
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .multi-select {
          position: relative;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
