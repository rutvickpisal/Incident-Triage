import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const styles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

function SeverityBadge({ severity }) {
  const colors = {
    P0: "red",
    P1: "orange",
    P2: "yellow",
    P3: "green"
  };
  return (
    <span style={{ color: colors[severity] || "black", fontWeight: "bold" }}>
      {severity}
    </span>
  );
}

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          color: '#666'
        }}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    serviceName: "",
    environment: "",
    description: ""
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/incidents`)
      .then(res => res.json())
      .then(data => {
        setIncidents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function submitIncident(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Failed to submit incident');
      
      setForm({ serviceName: "", environment: "", description: "" });
      setShowModal(false);
      
      // Refresh incidents after successful submission
      const refreshResponse = await fetch(`${API_BASE_URL}/incidents`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error('Error submitting incident:', error);
      // Optionally, set an error state to show user feedback
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#666',
      flexDirection: 'column'
    }}>
      <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ marginTop: '10px' }}>Loading incidents...</p>
    </div>
  );

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: 'white',
      minHeight: '100vh'
    }}>
      <div style={{
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <header style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '28px' }}>AI Incident Triage Dashboard</h1>
          <p style={{ margin: '10px 0 0', opacity: 0.9 }}>Log and monitor incidents with AI-powered analysis</p>
        </header>

        <div style={{ padding: '30px' }}>
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <button onClick={() => setShowModal(true)} style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              Log New Incident
            </button>
          </div>

          <div>
            <h2 style={{
              color: '#333',
              fontSize: '24px',
              borderBottom: '2px solid #007bff',
              paddingBottom: '10px',
              marginBottom: '20px'
            }}>
              Recent Incidents
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={tableHeaderStyle}>Service</th>
                    <th style={tableHeaderStyle}>Environment</th>
                    <th style={tableHeaderStyle}>Severity</th>
                    <th style={tableHeaderStyle}>Confidence</th>
                    <th style={tableHeaderStyle}>Escalation</th>
                    <th style={tableHeaderStyle}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map(incident => (
                    <tr key={incident.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={tableCellStyle}>{incident.serviceName}</td>
                      <td style={tableCellStyle}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          backgroundColor: incident.environment === 'production' ? '#dc3545' : '#ffc107',
                          color: incident.environment === 'production' ? 'white' : 'black'
                        }}>
                          {incident.environment}
                        </span>
                      </td>
                      <td style={tableCellStyle}><SeverityBadge severity={incident.severity} /></td>
                      <td style={tableCellStyle}>{Math.round(incident.confidence * 100)}%</td>
                      <td style={tableCellStyle}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: incident.escalation === 'AUTO_TRIAGED' ? '#28a745' : '#ffc107',
                          color: incident.escalation === 'AUTO_TRIAGED' ? 'white' : 'black'
                        }}>
                          {incident.escalation.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={tableCellStyle}>{new Date(incident.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button onClick={() => setShowModal(false)} style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}>
              ×
            </button>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                margin: 0,
                color: '#333',
                fontSize: '24px'
              }}>
                Log New Incident
              </h2>
            </div>
            <form onSubmit={submitIncident}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                  color: '#555'
                }}>
                  Service Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., API Gateway"
                  value={form.serviceName}
                  onChange={e => setForm({ ...form, serviceName: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                  color: '#555'
                }}>
                  Environment
                </label>
                <select
                  value={form.environment}
                  onChange={e => setForm({ ...form, environment: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select Environment</option>
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                  color: '#555'
                }}>
                  Incident Description
                </label>
                <textarea
                  placeholder="Describe the incident in detail..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{
                  backgroundColor: submitting ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => !submitting && (e.target.style.backgroundColor = '#0056b3')}
                onMouseOut={(e) => !submitting && (e.target.style.backgroundColor = '#007bff')}
                >
                  {submitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {submitting ? 'Submitting...' : 'Submit Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#333',
  borderBottom: '2px solid #dee2e6'
};

const tableCellStyle = {
  padding: '12px',
  borderBottom: '1px solid #dee2e6'
};

