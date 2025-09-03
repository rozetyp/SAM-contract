'use client';
import { useEffect, useState } from 'react';
import MultiSelect from '../../components/MultiSelect';
import { naicsCodes } from '../../lib/naics-codes';
import { pscCodes } from '../../lib/psc-codes';
import { setAsidePrograms } from '../../lib/setaside-programs';
import { federalAgencies } from '../../lib/federal-agencies';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [cronFailed, setCronFailed] = useState(false);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check health status
    fetch('/api/health')
      .then((r) => r.json())
      .then((j) => {
        const ok = j?.lastCron?.ok !== false; // if undefined or true -> no failure banner
        setCronFailed(!ok);
      })
      .catch(() => {});
  }, []);

  // Check current user status and load existing settings when email changes
  useEffect(() => {
    if (!email.trim()) {
      setPaid(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Load existing settings
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email.trim() })
    })
      .then((resp) => resp.json())
      .then((j) => {
        if (j.plan === 'paid') {
          setPaid(true);
          // Load existing search criteria if available
          if (j.search) {
            setSelectedNaics(j.search.naics || []);
            setPscCodes(j.search.psc || []);
            setSelectedSetAside(j.search.setaside || []);
            setSelectedAgency(j.search.agency || '');
            setIncludeWords(j.search.includeWords || '');
            setExcludeWords(j.search.excludeWords || '');
          }
        } else {
          setPaid(false);
        }
      })
      .catch(() => setPaid(false))
      .finally(() => setLoading(false));
  }, [email]);

  // Guided filter states
  const [selectedNaics, setSelectedNaics] = useState<string[]>([]);
  const [selectedPsc, setPscCodes] = useState<string[]>([]);
  const [selectedSetAside, setSelectedSetAside] = useState<string[]>([]);
  const [selectedAgency, setSelectedAgency] = useState('');
  const [includeWords, setIncludeWords] = useState('');
  const [excludeWords, setExcludeWords] = useState('');
  
  // Preview state
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Auto-preview when criteria changes
  useEffect(() => {
    if (!selectedNaics.length && !selectedPsc.length && !selectedSetAside.length && !selectedAgency && !includeWords && !excludeWords) {
      setPreviewData(null);
      return;
    }

    const debounceTimer = setTimeout(() => {
      setPreviewLoading(true);
      fetch('/api/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          naics: selectedNaics,
          psc: selectedPsc,
          setaside: selectedSetAside,
          agency: selectedAgency,
          includeWords,
          excludeWords
        })
      })
      .then(r => r.json())
      .then(data => setPreviewData(data))
      .catch(() => setPreviewData(null))
      .finally(() => setPreviewLoading(false));
    }, 1000); // 1 second debounce

    return () => clearTimeout(debounceTimer);
  }, [selectedNaics, selectedPsc, selectedSetAside, selectedAgency, includeWords, excludeWords]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>BidBeacon Settings</h2>
      {/* Force rebuild - v2 */}
      {cronFailed && (
        <div style={{ margin: '12px 0', padding: 12, background: '#f8d7da', borderRadius: '4px' }}>
          Last cron run failed. Please check logs.
        </div>
      )}
      
      {!paid && email && (
        <div style={{ margin: '12px 0', padding: 16, background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
          <h4 style={{ margin: '0 0 8px', color: '#856404' }}>🚀 Subscribe to Start</h4>
          <p style={{ margin: '0', fontSize: '14px', color: '#856404' }}>
            Configure your perfect search criteria below and preview results. <strong>Subscribe to save your settings and receive daily email digests.</strong>
          </p>
        </div>
      )}
      
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const resp = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ 
              email, 
              naics: selectedNaics, 
              psc: selectedPsc, 
              setaside: selectedSetAside,
              agency: selectedAgency,
              includeWords: includeWords,
              excludeWords: excludeWords
            })
          });
          const j = await resp.json();
          if (resp.status === 402) {
            setPaid(false);
            alert('Subscription required to save settings.');
            return;
          }
          if (resp.ok) {
            setPaid(true);
            alert('Settings saved successfully!');
          } else {
            alert(`Error: ${j?.error || 'unknown'}`);
          }
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Email Address
          </label>
          <input 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }} 
            placeholder="your.email@company.com"
          />
        </div>
        
        {loading && email.trim() && (
          <div style={{ margin: '12px 0', padding: 12, background: '#d1ecf1', borderRadius: '4px' }}>
            Checking subscription status...
          </div>
        )}
        
        {!loading && !paid && email.trim() && (
          <div style={{ margin: '12px 0', padding: 12, background: '#fff3cd', borderRadius: '4px' }}>
            💳 <strong>Trial Mode:</strong> You can configure your search criteria below, but you'll need a paid subscription to save them and receive daily digests.
          </div>
        )}
        
        {!loading && paid && (
          <div style={{ margin: '12px 0', padding: 12, background: '#d4edda', borderRadius: '4px' }}>
            ✅ Subscription active! Configure your search filters below.
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            🏭 Industry (NAICS Codes)
          </label>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#666' }}>
            Select the industries you want to monitor for contract opportunities
          </p>
          <div style={{ opacity: paid ? 1 : 0.7 }}>
            <MultiSelect
              options={naicsCodes}
              value={selectedNaics}
              onChange={setSelectedNaics}
              placeholder="Select NAICS codes (e.g., 541511 - Software Development)"
              groupBy="sector"
              searchable={true}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            🛠️ Product/Service (PSC Codes)
          </label>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#666' }}>
            Choose specific product or service categories
          </p>
          <div style={{ opacity: paid ? 1 : 0.7 }}>
            <MultiSelect
              options={pscCodes}
              value={selectedPsc}
              onChange={setPscCodes}
              placeholder="Select PSC codes (e.g., D316 - Software Programming)"
              groupBy="category"
              searchable={true}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            🎯 Set-Aside Programs
          </label>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#666' }}>
            Filter by small business set-aside programs (optional)
          </p>
          <div style={{ opacity: paid ? 1 : 0.7 }}>
            <MultiSelect
              options={setAsidePrograms}
              value={selectedSetAside}
              onChange={setSelectedSetAside}
              placeholder="Select set-aside programs (e.g., SBA, WOSB, 8A)"
              searchable={true}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            🏛️ Federal Agency (Optional)
          </label>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#666' }}>
            Filter by specific agency name or code
          </p>
          <input 
            type="text"
            value={selectedAgency}
            onChange={(e) => setSelectedAgency(e.target.value)}
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              opacity: paid ? 1 : 0.7
            }}
            placeholder="Agency name or code (e.g., GSA, Department of Defense, 97)"
          />
        </div>

        {/* Live Preview Section */}
        {(selectedNaics.length > 0 || selectedPsc.length > 0 || selectedSetAside.length > 0 || selectedAgency || includeWords || excludeWords) && (
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '16px', color: '#495057' }}>
              📊 Live Preview - Last 7 Days
            </h4>
            {previewLoading ? (
              <div style={{ color: '#666', fontStyle: 'italic' }}>Loading preview...</div>
            ) : previewData ? (
              <div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>{previewData.filteredCount}</strong> opportunities found out of {previewData.totalRecords} total
                </div>
                {previewData.sampleTitles && previewData.sampleTitles.length > 0 && (
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px' }}>Sample opportunities:</div>
                    <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px' }}>
                      {previewData.sampleTitles.map((title: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '2px' }}>{title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#666', fontStyle: 'italic' }}>Configure your criteria above to see a preview</div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              ✅ Include Keywords (Optional)
            </label>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#666' }}>
              Must contain these words
            </p>
            <input 
              type="text"
              value={includeWords}
              onChange={(e) => setIncludeWords(e.target.value)}
              style={{ 
                display: 'block', 
                width: '100%', 
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                opacity: paid ? 1 : 0.7
              }}
              placeholder="cloud, cybersecurity, AI"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              ❌ Exclude Keywords (Optional)
            </label>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#666' }}>
              Must NOT contain these words
            </p>
            <input 
              type="text"
              value={excludeWords}
              onChange={(e) => setExcludeWords(e.target.value)}
              style={{ 
                display: 'block', 
                width: '100%', 
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                opacity: paid ? 1 : 0.7
              }}
              placeholder="construction, janitorial"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button 
            type="submit" 
            disabled={!paid}
            style={{
              padding: '12px 24px',
              backgroundColor: paid ? '#2196f3' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: paid ? 'pointer' : 'not-allowed'
            }}
          >
            Save Search Criteria
          </button>
          
          <button
            type="button"
            onClick={(e) => { 
              e.preventDefault(); 
              fetch('/api/stripe/checkout', { 
                method: 'POST', 
                headers: { 'content-type': 'application/json' }, 
                body: JSON.stringify({ email }) 
              }).then(r => r.json()).then(d => { 
                if (d.url) window.location.href = d.url; 
              }); 
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {paid ? 'Manage Subscription' : 'Subscribe ($19/month)'}
          </button>
        </div>

        {paid && (
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '14px' }}>
            <h4 style={{ margin: '0 0 8px' }}>📧 Daily Digest Schedule</h4>
            <p style={{ margin: '0' }}>
              You'll receive your personalized SAM.gov contract digest daily at <strong>1:00 PM UTC</strong> 
              ({new Date().toLocaleString()} local time). Only new opportunities matching your criteria will be sent.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}