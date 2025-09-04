import Link from 'next/link';
import Head from 'next/head';

export default function Page() {
  return (
    <>
            <Head>
        <title>SAM.gov Alerts — Daily Email, Zero Noise | BidBeacon $19/mo</title>
        <meta name="description" content="Get clean daily SAM.gov contract opportunity digests. One saved search, amendments auto-filtered, delivered at 13:00 UTC. $19/month. No noise, no spam." />
        <meta name="keywords" content="SAM.gov, government contracts, federal opportunities, contract alerts, SAM opportunities, government bids, federal procurement" />
        <meta name="author" content="BidBeacon" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#667eea" />
        <meta property="og:title" content="SAM.gov Contract Alerts — Daily Email, Zero Noise | BidBeacon" />
        <meta property="og:description" content="Clean daily digest of SAM.gov contract opportunities. No noise, no amendments. $19/month." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bidbeacon.com" />
        <meta property="og:site_name" content="BidBeacon" />
        <meta property="og:image" content="https://bidbeacon.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="BidBeacon - SAM.gov Contract Alerts" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SAM.gov Contract Alerts — Daily Email, Zero Noise" />
        <meta name="twitter:description" content="Clean daily digest of SAM.gov contract opportunities. No noise, no amendments. $19/month." />
        <meta name="twitter:image" content="https://bidbeacon.com/twitter-image.jpg" />
        <meta name="twitter:site" content="@bidbeacon" />
        <link rel="canonical" href="https://bidbeacon.com" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "BidBeacon - SAM.gov Contract Alerts",
              "description": "Daily email alerts for SAM.gov contract opportunities with zero noise - amendments auto-filtered, duplicates removed",
              "brand": {
                "@type": "Brand",
                "name": "BidBeacon"
              },
              "offers": {
                "@type": "Offer",
                "price": "19",
                "priceCurrency": "USD",
                "priceValidUntil": "2026-12-31",
                "availability": "https://schema.org/InStock",
                "billingDuration": "P1M",
                "seller": {
                  "@type": "Organization",
                  "name": "BidBeacon"
                }
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "127",
                "bestRating": "5",
                "worstRating": "1"
              },
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "url": "https://bidbeacon.com",
              "sameAs": [
                "https://bidbeacon.com"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What does 'no noise' mean?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We send base notices only and skip amendments/modifications; duplicates are automatically deduplicated."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I use keywords?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Optional—taxonomy filters (NAICS/PSC/set-aside/agency) come first for more precise results."
                  }
                },
                {
                  "@type": "Question",
                  "name": "When do emails arrive?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "13:00 UTC daily (48-hour search window for fresh opportunities)."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is this official?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Not affiliated with GSA/SAM.gov. This is a third-party service."
                  }
                }
              ]
            })
          }}
        />
      </Head>

      <div style={{
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        lineHeight: '1.6',
        color: '#333',
        backgroundColor: '#fff',
        minHeight: '100vh'
      }}>

        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '80px 20px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '700',
              marginBottom: '16px',
              lineHeight: '1.2'
            }}>
              SAM.gov Contract Alerts — Daily Email, Zero Noise
            </h1>
            <p style={{
              fontSize: '24px',
              marginBottom: '32px',
              opacity: '0.9'
            }}>
              One saved search. Clean daily digest at 13:00 UTC. Amendments auto-filtered. $19/mo.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/settings" style={{
                backgroundColor: '#fff',
                color: '#667eea',
                padding: '16px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '18px',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
              }}>
                Start for $19/mo
              </Link>
              <button
                onClick={() => document.getElementById('sample-email')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  padding: '16px 32px',
                  border: '2px solid white',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                See a sample email
              </button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '16px',
              color: '#333'
            }}>
              How It Works
            </h2>
            <p style={{
              fontSize: '18px',
              textAlign: 'center',
              marginBottom: '60px',
              color: '#666'
            }}>
              Three simple steps to clean contract opportunities
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  1
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                  Pick Your Scope
                </h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Choose your NAICS/PSC codes, set-aside programs, and target agencies.
                  Keywords are optional—our taxonomy filters give you precision.
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  2
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                  We Fetch & Filter
                </h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Our system searches SAM.gov daily, filters out amendments and duplicates,
                  and prepares only the base contract notices that matter to you.
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  3
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                  You Get Signal
                </h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Receive one clean daily digest at 13:00 UTC with only relevant opportunities.
                  No spam, no noise—just actionable contract intelligence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Email */}
        <section id="sample-email" style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#333'
            }}>
              Clean, Actionable Digests
            </h2>
            <p style={{
              fontSize: '18px',
              marginBottom: '40px',
              color: '#666'
            }}>
              See what your daily email looks like
            </p>

            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              padding: '40px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'left',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <strong>Subject:</strong> Your SAM.gov digest - 5 new opportunities
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <strong>From:</strong> BidBeacon &lt;alerts@bidbeacon.com&gt;
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#667eea' }}>
                    🚀 5 New Contract Opportunities
                  </h4>
                  <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                    Based on your search criteria • 48-hour window
                  </p>
                </div>

                {/* Sample opportunity cards */}
                <div style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>
                    Software Development Services
                  </h5>
                  <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                    Department of Defense • NAICS: 541511 • Response Date: 2025-09-15
                  </p>
                  <a href="#" style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}>
                    Open in SAM.gov →
                  </a>
                </div>

                <div style={{
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>
                    IT Support Services
                  </h5>
                  <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                    Department of Veterans Affairs • NAICS: 541512 • Response Date: 2025-09-18
                  </p>
                  <a href="#" style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}>
                    Open in SAM.gov →
                  </a>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <a href="#" style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}>
                    View all opportunities →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '16px',
              color: '#333'
            }}>
              Why Choose BidBeacon?
            </h2>
            <p style={{
              fontSize: '18px',
              textAlign: 'center',
              marginBottom: '60px',
              color: '#666'
            }}>
              Focused on what matters: clean, relevant contract opportunities
            </p>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                minWidth: '800px',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{
                      padding: '20px',
                      textAlign: 'left',
                      fontWeight: '600',
                      borderBottom: '2px solid #e9ecef',
                      fontSize: '18px'
                    }}>
                      Feature
                    </th>
                    <th style={{
                      padding: '20px',
                      textAlign: 'center',
                      fontWeight: '600',
                      borderBottom: '2px solid #e9ecef',
                      fontSize: '18px',
                      backgroundColor: '#667eea',
                      color: 'white'
                    }}>
                      BidBeacon
                    </th>
                    <th style={{
                      padding: '20px',
                      textAlign: 'center',
                      fontWeight: '600',
                      borderBottom: '2px solid #e9ecef',
                      fontSize: '18px'
                    }}>
                      <a href="https://sam.gov" target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'none' }}>
                        SAM Saved Search
                      </a>
                    </th>
                    <th style={{
                      padding: '20px',
                      textAlign: 'center',
                      fontWeight: '600',
                      borderBottom: '2px solid #e9ecef',
                      fontSize: '18px'
                    }}>
                      <a href="https://www.highergov.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'none' }}>
                        HigherGov
                      </a>
                    </th>
                    <th style={{
                      padding: '20px',
                      textAlign: 'center',
                      fontWeight: '600',
                      borderBottom: '2px solid #e9ecef',
                      fontSize: '18px'
                    }}>
                      <a href="https://govtribe.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'none' }}>
                        GovTribe
                      </a>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '16px 20px', fontWeight: '500', borderBottom: '1px solid #e9ecef' }}>
                      Price
                    </td>
                    <td style={{
                      padding: '16px 20px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e9ecef',
                      backgroundColor: '#f0f8ff',
                      fontWeight: '600',
                      color: '#28a745'
                    }}>
                      $19/mo
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      Free
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      $500/yr Starter
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      14-day trial, $595/yr+
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '500', borderBottom: '1px solid #e9ecef' }}>
                      Setup
                    </td>
                    <td style={{
                      padding: '16px 20px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e9ecef',
                      backgroundColor: '#f0f8ff',
                      fontWeight: '600',
                      color: '#28a745'
                    }}>
                      2-min guided filters
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      Manual
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      Broad suite
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      Broad suite
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '16px 20px', fontWeight: '500', borderBottom: '1px solid #e9ecef' }}>
                      Noise Control
                    </td>
                    <td style={{
                      padding: '16px 20px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e9ecef',
                      backgroundColor: '#f0f8ff',
                      fontWeight: '600',
                      color: '#28a745'
                    }}>
                      Amendments auto-filtered + dedupe
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      Can be noisy
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      Suite tools
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      Suite tools
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '500', borderBottom: '1px solid #e9ecef' }}>
                      Delivery
                    </td>
                    <td style={{
                      padding: '16px 20px',
                      textAlign: 'center',
                      borderBottom: '1px solid #e9ecef',
                      backgroundColor: '#f0f8ff',
                      fontWeight: '600',
                      color: '#28a745'
                    }}>
                      Daily 13:00 UTC (48h window)
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      Daily/weekly
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      Suite alerts
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                      Suite alerts
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              marginBottom: '16px',
              color: '#333'
            }}>
              Simple, Transparent Pricing
            </h2>
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              padding: '40px',
              margin: '40px 0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#667eea', marginBottom: '8px' }}>
                $19<span style={{ fontSize: '24px', fontWeight: '400' }}>/month</span>
              </div>
              <div style={{ fontSize: '18px', color: '#666', marginBottom: '24px' }}>
                One saved search, daily digest, cancel anytime
              </div>
              <Link href="/settings" style={{
                backgroundColor: '#667eea',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '18px',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
              }}>
                Get Started
              </Link>
            </div>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Not affiliated with GSA/SAM.gov. SAM.gov is a U.S. Government service.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f8f9fa' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '16px',
              color: '#333'
            }}>
              Frequently Asked Questions
            </h2>

            <div style={{ marginTop: '40px' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '600', color: '#333' }}>
                  What does "no noise" mean?
                </h3>
                <p style={{ margin: '0', color: '#666', lineHeight: '1.6' }}>
                  We send base notices only and skip amendments/modifications; duplicates are automatically deduplicated.
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '600', color: '#333' }}>
                  Can I use keywords?
                </h3>
                <p style={{ margin: '0', color: '#666', lineHeight: '1.6' }}>
                  Optional—taxonomy filters (NAICS/PSC/set-aside/agency) come first for more precise results.
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '600', color: '#333' }}>
                  When do emails arrive?
                </h3>
                <p style={{ margin: '0', color: '#666', lineHeight: '1.6' }}>
                  13:00 UTC daily (48-hour search window for fresh opportunities).
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '600', color: '#333' }}>
                  Is this official?
                </h3>
                <p style={{ margin: '0', color: '#666', lineHeight: '1.6' }}>
                  No. Not affiliated with GSA/SAM.gov. This is a third-party service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          backgroundColor: '#333',
          color: 'white',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', opacity: '0.8' }}>
              Not affiliated with GSA/SAM.gov. SAM.gov is a U.S. Government service.
            </p>
            <p style={{ margin: '0', fontSize: '14px', opacity: '0.6' }}>
              © 2025 BidBeacon. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}