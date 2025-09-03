'use client';
import { useState } from 'react';
import { FaCheck, FaTimes, FaEnvelope, FaFilter, FaClock } from 'react-icons/fa';

const ComparisonTable = () => (
  <div style={{ overflowX: 'auto', margin: '32px 0' }}>
    <table style={{ 
      width: '100%', 
      borderCollapse: 'collapse', 
      fontSize: '14px',
      backgroundColor: '#fff',
      border: '1px solid #e9ecef'
    }}>
      <thead>
        <tr style={{ backgroundColor: '#f8f9fa' }}>
          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>Feature</th>
          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #dee2e6', backgroundColor: '#e3f2fd' }}>
            <strong>BidBeacon</strong>
          </th>
          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>SAM Saved Search (free)</th>
          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>HigherGov</th>
          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #dee2e6' }}>GovTribe</th>
        </tr>
      </thead>
      <tbody>
        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
          <td style={{ padding: '12px', fontWeight: '500' }}>Price</td>
          <td style={{ padding: '12px', textAlign: 'center', backgroundColor: '#e3f2fd', fontWeight: '600' }}>$19/mo</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>Free</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>$500/yr Starter</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>14-day trial, plans from $595/yr</td>
        </tr>
        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
          <td style={{ padding: '12px', fontWeight: '500' }}>Setup</td>
          <td style={{ padding: '12px', textAlign: 'center', backgroundColor: '#e3f2fd', fontWeight: '600' }}>2-min guided filters</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>Manual</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>Broad suite</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>Broad suite</td>
        </tr>
        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
          <td style={{ padding: '12px', fontWeight: '500' }}>Noise control</td>
          <td style={{ padding: '12px', textAlign: 'center', backgroundColor: '#e3f2fd', fontWeight: '600' }}>Amendments auto-filtered + dedupe</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>Alerts can be noisy</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>Suite tools</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>Suite tools</td>
        </tr>
        <tr>
          <td style={{ padding: '12px', fontWeight: '500' }}>Delivery</td>
          <td style={{ padding: '12px', textAlign: 'center', backgroundColor: '#e3f2fd', fontWeight: '600' }}>Daily 13:00 UTC (48h window)</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>Daily/weekly</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>Suite alerts</td>
          <td style={{ padding: '12px', textAlign: 'center' }}>Suite alerts</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "What does 'no noise' mean?",
      answer: "We send base notices only and skip amendments/modifications. Duplicates are automatically deduped so you never see the same opportunity twice."
    },
    {
      question: "Can I use keywords?",
      answer: "Yes, keywords are optional. Our taxonomy filters (NAICS/PSC/set-aside/agency) come first for precise targeting, but you can add include/exclude keywords for extra refinement."
    },
    {
      question: "When do emails arrive?",
      answer: "Daily at 13:00 UTC (8 AM EST, 5 AM PST) with a 48-hour opportunity window. This ensures you get fresh opportunities without overwhelming frequency."
    },
    {
      question: "Is this official?",
      answer: "No. BidBeacon is not affiliated with GSA or SAM.gov. We're an independent service that helps you monitor SAM.gov opportunities more efficiently."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees."
    }
  ];

  return (
    <div style={{ margin: '48px 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '28px', fontWeight: '700' }}>
        Frequently Asked Questions
      </h2>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {faqs.map((faq, index) => (
          <div 
            key={index}
            style={{ 
              border: '1px solid #e9ecef', 
              borderRadius: '8px', 
              marginBottom: '16px',
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              style={{
                width: '100%',
                padding: '16px 20px',
                backgroundColor: '#f8f9fa',
                border: 'none',
                textAlign: 'left',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {faq.question}
              <span style={{ fontSize: '18px' }}>
                {openFAQ === index ? '−' : '+'}
              </span>
            </button>
            {openFAQ === index && (
              <div style={{ 
                padding: '16px 20px', 
                backgroundColor: '#fff',
                borderTop: '1px solid #e9ecef',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#555'
              }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SampleEmailModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1001,
            backgroundColor: '#fff',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
        
        {/* Sample Email Content */}
        <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ borderBottom: '2px solid #0066cc', paddingBottom: '16px', marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '18px', color: '#0066cc' }}>
              📧 Your SAM.gov daily digest
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666' }}>
              <strong>From:</strong> alerts@bidbeacon.com<br />
              <strong>Subject:</strong> Your SAM.gov daily digest - 5 new opportunities
            </p>
          </div>
          
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              <strong>Found 5 new opportunities</strong> matching your criteria in the last 48 hours.
            </p>
          </div>
          
          {/* Sample Opportunities */}
          {[
            {
              title: "Cloud Infrastructure Services",
              agency: "Department of Defense",
              naics: "541511",
              deadline: "Oct 15, 2025",
              id: "SPE1C125R0047"
            },
            {
              title: "Cybersecurity Assessment and Implementation",
              agency: "General Services Administration",
              naics: "541512",
              deadline: "Oct 22, 2025", 
              id: "47QSWA25R0012"
            },
            {
              title: "Software Development and Maintenance",
              agency: "Department of Veterans Affairs",
              naics: "541511",
              deadline: "Nov 5, 2025",
              id: "36C25525Q0083"
            }
          ].map((opp, index) => (
            <div key={index} style={{
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '16px',
              backgroundColor: '#fff'
            }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#0066cc' }}>
                {opp.title}
              </h3>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                <div><strong>Agency:</strong> {opp.agency}</div>
                <div><strong>NAICS:</strong> {opp.naics}</div>
                <div><strong>Response Deadline:</strong> {opp.deadline}</div>
                <div><strong>Notice ID:</strong> {opp.id}</div>
              </div>
              <a
                href="#"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#0066cc',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Open in SAM.gov →
              </a>
            </div>
          ))}
          
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '12px', color: '#666' }}>
            <p style={{ margin: 0 }}>
              This digest covers opportunities posted in the last 48 hours. 
              All amendments and duplicates have been filtered out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [showSampleEmail, setShowSampleEmail] = useState(false);

  const handleStartSubscription = () => {
    window.location.href = '/settings';
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "BidBeacon - SAM.gov Contract Alerts",
            "description": "Daily email digest of SAM.gov contract opportunities with guided filters and noise control. $19/month subscription.",
            "brand": {
              "@type": "Brand",
              "name": "BidBeacon"
            },
            "offers": {
              "@type": "Offer",
              "price": "19.00",
              "priceCurrency": "USD",
              "priceValidUntil": "2025-12-31",
              "availability": "https://schema.org/InStock",
              "url": "https://bidbeacon.com"
            },
            "category": "Software",
            "audience": {
              "@type": "BusinessAudience",
              "audienceType": "Government Contractors"
            }
          })
        }}
      />

      <div style={{ 
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.6',
        color: '#333'
      }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '80px 20px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ 
              fontSize: 'clamp(28px, 5vw, 48px)', 
              fontWeight: '700', 
              margin: '0 0 24px',
              lineHeight: '1.2'
            }}>
              SAM.gov Contract Alerts — Daily Email, Zero Noise
            </h1>
            <p style={{ 
              fontSize: 'clamp(16px, 3vw, 20px)', 
              margin: '0 0 40px',
              opacity: '0.9',
              fontWeight: '400'
            }}>
              One saved search. Clean daily digest at 13:00 UTC. Amendments auto-filtered. $19/mo.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleStartSubscription}
                style={{
                  backgroundColor: '#fff',
                  color: '#667eea',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
              >
                Start for $19/mo
              </button>
              <button
                onClick={() => setShowSampleEmail(true)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#fff',
                  border: '2px solid #fff',
                  padding: '14px 32px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#fff';
                  (e.target as HTMLElement).style.color = '#667eea';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                  (e.target as HTMLElement).style.color = '#fff';
                }}
              >
                See a sample email
              </button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '48px' }}>
              How It Works
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '40px',
              marginTop: '40px'
            }}>
              <div>
                <div style={{ 
                  backgroundColor: '#667eea', 
                  color: '#fff', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 20px',
                  fontSize: '24px'
                }}>
                  <FaFilter />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px' }}>
                  1. Pick your scope
                </h3>
                <p style={{ fontSize: '16px', color: '#666' }}>
                  NAICS/PSC codes, set-aside programs, agency filters. Keywords optional.
                  Our guided interface makes setup effortless.
                </p>
              </div>
              
              <div>
                <div style={{ 
                  backgroundColor: '#667eea', 
                  color: '#fff', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 20px',
                  fontSize: '24px'
                }}>
                  <FaCheck />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px' }}>
                  2. We fetch & filter
                </h3>
                <p style={{ fontSize: '16px', color: '#666' }}>
                  Base notices only (no amendments), automatically deduped.
                  Smart filtering eliminates noise.
                </p>
              </div>
              
              <div>
                <div style={{ 
                  backgroundColor: '#667eea', 
                  color: '#fff', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 20px',
                  fontSize: '24px'
                }}>
                  <FaEnvelope />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '16px' }}>
                  3. You get signal
                </h3>
                <p style={{ fontSize: '16px', color: '#666' }}>
                  One clean digest at 13:00 UTC. Only relevant opportunities,
                  properly formatted with direct SAM.gov links.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Email Screenshot Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>
              Clean, Professional Email Digest
            </h2>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px' }}>
              No clutter, no noise. Just the opportunities that match your criteria.
            </p>
            
            <div style={{
              border: '1px solid #e9ecef',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              maxWidth: '600px',
              margin: '0 auto',
              cursor: 'pointer'
            }}
            onClick={() => setShowSampleEmail(true)}
            >
              <div style={{ 
                padding: '20px', 
                backgroundColor: '#f8f9fa', 
                borderBottom: '1px solid #e9ecef',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  <strong>From:</strong> alerts@bidbeacon.com
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                  Your SAM.gov daily digest - 5 new opportunities
                </div>
              </div>
              
              <div style={{ padding: '20px', textAlign: 'left' }}>
                <div style={{ 
                  backgroundColor: '#e3f2fd', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  <strong>Found 5 new opportunities</strong> matching your criteria.
                </div>
                
                <div style={{ borderLeft: '3px solid #667eea', paddingLeft: '12px', marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                    Cloud Infrastructure Services
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Department of Defense • NAICS 541511 • Due Oct 15
                  </div>
                </div>
                
                <div style={{ borderLeft: '3px solid #667eea', paddingLeft: '12px', marginBottom: '12px' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                    Cybersecurity Assessment
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    GSA • NAICS 541512 • Due Oct 22
                  </div>
                </div>
                
                <div style={{ borderLeft: '3px solid #667eea', paddingLeft: '12px' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                    Software Development
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Department of VA • NAICS 541511 • Due Nov 5
                  </div>
                </div>
              </div>
              
              <div style={{ 
                padding: '16px 20px', 
                backgroundColor: '#f8f9fa', 
                borderTop: '1px solid #e9ecef',
                fontSize: '12px',
                color: '#667eea',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                Click to view full sample email →
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '48px' }}>
              Why Choose BidBeacon?
            </h2>
            <ComparisonTable />
            <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#666' }}>
              Sources: <a href="https://www.highergov.com/pricing" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>HigherGov pricing</a>, 
              {' '}<a href="https://www.govtribe.com" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>GovTribe plans</a>, 
              {' '}<a href="https://sam.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>SAM.gov help docs</a>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>
              Simple, Transparent Pricing
            </h2>
            
            <div style={{
              border: '2px solid #667eea',
              borderRadius: '12px',
              padding: '40px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#667eea', marginBottom: '8px' }}>
                $19
              </div>
              <div style={{ fontSize: '18px', color: '#666', marginBottom: '24px' }}>
                per month
              </div>
              
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: '0 0 32px',
                textAlign: 'left',
                maxWidth: '300px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                  <FaCheck style={{ color: '#22c55e', marginRight: '12px' }} />
                  One saved search configuration
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                  <FaCheck style={{ color: '#22c55e', marginRight: '12px' }} />
                  Daily email digest at 13:00 UTC
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                  <FaCheck style={{ color: '#22c55e', marginRight: '12px' }} />
                  Amendments auto-filtered
                </li>
                <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                  <FaCheck style={{ color: '#22c55e', marginRight: '12px' }} />
                  Cancel anytime
                </li>
              </ul>
              
              <button
                onClick={handleStartSubscription}
                style={{
                  backgroundColor: '#667eea',
                  color: '#fff',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '300px'
                }}
              >
                Start for $19/mo
              </button>
            </div>
            
            <p style={{ fontSize: '14px', color: '#666', marginTop: '24px' }}>
              Not affiliated with GSA/SAM.gov
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <FAQSection />
          </div>
        </section>

        {/* Footer Legal */}
        <footer style={{ 
          padding: '40px 20px', 
          backgroundColor: '#333', 
          color: '#fff', 
          textAlign: 'center' 
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p style={{ margin: '0 0 16px', fontSize: '14px' }}>
              <strong>Legal Notice:</strong> Not affiliated with GSA/SAM.gov. SAM.gov is a U.S. Government service.
            </p>
            <p style={{ margin: 0, fontSize: '14px', opacity: '0.8' }}>
              BidBeacon is an independent service that helps businesses monitor government contract opportunities.
            </p>
          </div>
        </footer>

        {/* Sample Email Modal */}
        <SampleEmailModal 
          isOpen={showSampleEmail} 
          onClose={() => setShowSampleEmail(false)} 
        />
      </div>
    </>
  );
}