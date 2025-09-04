'use client';
import { useEffect, useState } from 'react';
import MultiSelect from '../../components/MultiSelect';
import { naicsCodes } from '../../lib/naics-codes';
import { pscCodes } from '../../lib/psc-codes';
import { setAsidePrograms } from '../../lib/setaside-programs';

// Reusable style objects
const pageStyle = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  lineHeight: '1.6',
  color: '#333',
  backgroundColor: '#fff',
  maxWidth: '800px',
  margin: '0 auto',
  padding: '40px 20px'
};

const formGroupStyle = { marginBottom: '24px' };

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  fontSize: '16px',
  color: '#333'
};

const pStyle = {
  margin: '0 0 12px',
  fontSize: '14px',
  color: '#666'
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  fontSize: '14px',
  boxSizing: 'border-box' as 'border-box'
};

const baseButtonStyle = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s'
};

const primaryButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#667eea',
  color: 'white',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
};

const secondaryButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#f8f9fa',
  color: '#333',
  border: '1px solid #e9ecef'
};

const disabledButtonStyle = {
  ...primaryButtonStyle,
  backgroundColor: '#ccc',
  cursor: 'not-allowed',
  boxShadow: 'none',
  transform: 'none'
};

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [cronFailed, setCronFailed] = useState(false);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(j => {
      setCronFailed(j?.lastCron?.ok === false);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!email.trim()) {
      setPaid(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email.trim() })
    }).then(resp => resp.json()).then(j => {
      if (j.plan === 'paid') {
        setPaid(true);
        if (j.search) {
          setSelectedNaics(j.search.naics || []);
          setPscCodes(j.search.psc || []);
          setSelectedSetAside(j.search.setaside || []);
          setSelectedAgency(j.search.agency || '');
          setIncludeWords(j.search.includeWords || '');
          setExcludeWords(j.search.excludeWords || '');
          setMuteAgencies(j.search.muteAgencies || []);
          setMuteTerms(j.search.muteTerms || []);
        }
      } else {
        setPaid(false);
      }
    }).catch(() => setPaid(false)).finally(() => setLoading(false));
  }, [email]);

  const [selectedNaics, setSelectedNaics] = useState<string[]>([]);
  const [selectedPsc, setPscCodes] = useState<string[]>([]);
  const [selectedSetAside, setSelectedSetAside] = useState<string[]>([]);
  const [selectedAgency, setSelectedAgency] = useState('');
  const [includeWords, setIncludeWords] = useState('');
  const [excludeWords, setExcludeWords] = useState('');
  const [muteAgencies, setMuteAgencies] = useState<string[]>([]);
  const [muteTerms, setMuteTerms] = useState<string[]>([]);
  
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const hasCriteria = selectedNaics.length || selectedPsc.length || selectedSetAside.length || selectedAgency || includeWords || excludeWords || muteAgencies.length || muteTerms.length;
    if (!hasCriteria) {
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
          excludeWords,
          muteAgencies,
          muteTerms
        })
      }).then(r => r.json()).then(setPreviewData).catch(() => setPreviewData(null)).finally(() => setPreviewLoading(false));
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [selectedNaics, selectedPsc, selectedSetAside, selectedAgency, includeWords, excludeWords, muteAgencies, muteTerms]);

  const handleSubmit = async (e: React.FormEvent) => {
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
        includeWords, 
        excludeWords,
        muteAgencies,
        muteTerms
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
  };

  const handleStripeCheckout = () => {
    fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email })
    }).then(r => r.json()).then(d => {
      if (d.url) window.location.href = d.url;
    });
  };

  return (
    <div style={pageStyle}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '12px' }}>Set Up Your SAM.gov Alerts</h1>
        <p style={{ fontSize: '18px', color: '#666', margin: '0 0 24px' }}>
          Configure your search criteria and start receiving daily contract opportunities
        </p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '16px',
          fontSize: '14px',
          color: '#999'
        }}>
          <span style={{ 
            backgroundColor: paid ? '#28a745' : '#667eea', 
            color: '#fff', 
            padding: '4px 12px', 
            borderRadius: '16px',
            fontWeight: '600'
          }}>
            {paid ? '✓ Step 1: Configure Filters' : 'Step 1: Configure Filters'}
          </span>
          <span>→</span>
          <span style={{ 
            backgroundColor: paid ? '#28a745' : '#e9ecef', 
            color: paid ? '#fff' : '#666',
            padding: '4px 12px', 
            borderRadius: '16px',
            fontWeight: '600'
          }}>
            {paid ? '✓ Step 2: Subscribe ($19/mo)' : 'Step 2: Subscribe ($19/mo)'}
          </span>
        </div>
      </div>
      
      {cronFailed && <div style={{ margin: '16px 0', padding: 16, background: '#f8d7da', borderRadius: '8px' }}>Last cron run failed. Please check logs.</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Email Address</label>
          <p style={pStyle}>Enter your email to load settings and manage your subscription.</p>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="your.email@company.com" />
        </div>
        
        {loading && email.trim() && <div style={{ margin: '16px 0', padding: 16, background: '#e3f2fd', borderRadius: '8px' }}>Checking subscription status...</div>}
        {!loading && !paid && email.trim() && (
          <div style={{ margin: '16px 0', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', color: '#fff' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>👆 Configure Your Filters Above</h3>
            <p style={{ margin: '0', fontSize: '14px', opacity: '0.9' }}>
              Test your search criteria with live preview, then subscribe to start receiving daily email alerts.
            </p>
          </div>
        )}
        {!loading && paid && <div style={{ margin: '16px 0', padding: 16, background: '#d4edda', borderRadius: '8px' }}>✅ Subscription active! Configure your search filters below.</div>}

        <div style={{ ...formGroupStyle, opacity: paid ? 1 : 0.7 }}>
          <label style={labelStyle}>🏭 Industry (NAICS Codes)</label>
          <p style={pStyle}>Select the industries you want to monitor for contract opportunities.</p>
          <MultiSelect options={naicsCodes} value={selectedNaics} onChange={setSelectedNaics} placeholder="Select NAICS codes (e.g., 541511 - Software Development)" groupBy="sector" searchable={true} />
        </div>

        <div style={{ ...formGroupStyle, opacity: paid ? 1 : 0.7 }}>
          <label style={labelStyle}>🛠️ Product/Service (PSC Codes)</label>
          <p style={pStyle}>Choose specific product or service categories.</p>
          <MultiSelect options={pscCodes} value={selectedPsc} onChange={setPscCodes} placeholder="Select PSC codes (e.g., D316 - Software Programming)" groupBy="category" searchable={true} />
        </div>

        <div style={{ ...formGroupStyle, opacity: paid ? 1 : 0.7 }}>
          <label style={labelStyle}>🎯 Set-Aside Programs</label>
          <p style={pStyle}>Filter by small business set-aside programs (optional).</p>
          <MultiSelect options={setAsidePrograms} value={selectedSetAside} onChange={setSelectedSetAside} placeholder="Select set-aside programs (e.g., SBA, WOSB, 8A)" searchable={true} />
        </div>

        <div style={{ ...formGroupStyle, opacity: paid ? 1 : 0.7 }}>
          <label style={labelStyle}>🏛️ Federal Agency (Optional)</label>
          <p style={pStyle}>Filter by specific agency name or code.</p>
          <input type="text" value={selectedAgency} onChange={(e) => setSelectedAgency(e.target.value)} style={inputStyle} placeholder="e.g., GSA, Department of Defense, 97" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', ...formGroupStyle, opacity: paid ? 1 : 0.7 }}>
          <div>
            <label style={labelStyle}>✅ Include Keywords</label>
            <p style={pStyle}>Must contain these words.</p>
            <input type="text" value={includeWords} onChange={(e) => setIncludeWords(e.target.value)} style={inputStyle} placeholder="e.g., cloud, cybersecurity" />
          </div>
          <div>
            <label style={labelStyle}>❌ Exclude Keywords</label>
            <p style={pStyle}>Must NOT contain these words.</p>
            <input type="text" value={excludeWords} onChange={(e) => setExcludeWords(e.target.value)} style={inputStyle} placeholder="e.g., construction, janitorial" />
          </div>
        </div>

        <div style={{ ...formGroupStyle, opacity: paid ? 1 : 0.7, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#333' }}>🔇 Mute Filters (Value Booster)</h3>
          <p style={{ ...pStyle, marginBottom: '20px' }}>
            Permanently suppress content from specific agencies or containing certain terms. These can also be added directly from your email digest.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>🏛️ Muted Agencies</label>
              <p style={pStyle}>Hide all opportunities from these agencies.</p>
              <div style={{ marginBottom: '8px' }}>
                <input 
                  type="text" 
                  placeholder="e.g., Department of Agriculture"
                  style={inputStyle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !muteAgencies.includes(value)) {
                        setMuteAgencies([...muteAgencies, value]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {muteAgencies.map((agency, idx) => (
                  <span key={idx} style={{ 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {agency}
                    <button 
                      type="button"
                      onClick={() => setMuteAgencies(muteAgencies.filter((_, i) => i !== idx))}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'white', 
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '14px'
                      }}
                    >×</button>
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <label style={labelStyle}>💬 Muted Terms</label>
              <p style={pStyle}>Hide opportunities containing these terms.</p>
              <div style={{ marginBottom: '8px' }}>
                <input 
                  type="text" 
                  placeholder="e.g., janitorial, food service"
                  style={inputStyle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !muteTerms.includes(value)) {
                        setMuteTerms([...muteTerms, value]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {muteTerms.map((term, idx) => (
                  <span key={idx} style={{ 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {term}
                    <button 
                      type="button"
                      onClick={() => setMuteTerms(muteTerms.filter((_, i) => i !== idx))}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'white', 
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '14px'
                      }}
                    >×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {(selectedNaics.length > 0 || selectedPsc.length > 0 || selectedSetAside.length > 0 || selectedAgency || includeWords || excludeWords || muteAgencies.length > 0 || muteTerms.length > 0) && (
          <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '18px', color: '#333' }}>📊 Live Preview (Last 7 Days)</h4>
            {previewLoading ? (
              <div style={{ color: '#666' }}>Loading preview...</div>
            ) : previewData ? (
              <div>
                <div style={{ marginBottom: '12px', fontSize: '16px' }}>
                  <strong>{previewData.filteredCount}</strong> opportunities found out of {previewData.totalRecords} total
                </div>
                {previewData.sampleTitles?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Sample opportunities:</div>
                    <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', color: '#555' }}>
                      {previewData.sampleTitles.map((title: string, idx: number) => <li key={idx} style={{ marginBottom: '4px' }}>{title}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#666' }}>Configure criteria to see a preview.</div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', borderTop: '1px solid #e9ecef', paddingTop: '32px' }}>
          <button type="submit" disabled={!paid} style={paid ? primaryButtonStyle : disabledButtonStyle}>
            {paid ? 'Save Search Criteria' : 'Save Search (Requires Subscription)'}
          </button>
          <button type="button" onClick={handleStripeCheckout} style={paid ? secondaryButtonStyle : primaryButtonStyle}>
            {paid ? 'Manage Subscription' : 'Complete Setup & Subscribe ($19/mo)'}
          </button>
        </div>

        {paid && (
          <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '14px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '16px' }}>📧 Daily Digest Schedule</h4>
            <p style={{ margin: '0' }}>
              You'll receive your personalized SAM.gov contract digest daily at <strong>1:00 PM UTC</strong>.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
