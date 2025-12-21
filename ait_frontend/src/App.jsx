import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Accordian from "./components/Accordian";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


function SeverityBadge({ severity }) {
  const getSeverityClasses = (sev) => {
    switch (sev.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-400 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${getSeverityClasses(severity)}`}>
      {severity}
    </span>
  );
}

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [openTableRows, setOpenTableRows] = useState(Array(incidents.length).fill(false));
  const [loading, setLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [form, setForm] = useState({
    serviceName: "",
    environment: "",
    description: ""
  });
  const [showModal, setShowModal] = useState(false);

  const handleRowClick = (idx) => {
    const newOpenTableRows = [...openTableRows];
    newOpenTableRows[idx] = !newOpenTableRows[idx];
    setOpenTableRows(newOpenTableRows);
  };

  useEffect(() => {
    setGlobalLoading(true);
    fetch(`${API_BASE_URL}/incidents`)
      .then(res => res.json())
      .then(data => {
        setIncidents(data);
        setLoading(false);
        setGlobalLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setGlobalLoading(false);
      });
  }, []);

  async function submitIncident(e) {
    e.preventDefault();
    setGlobalLoading(true);
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
      setGlobalLoading(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen font-sans text-lg text-gray-600 flex-col">
      <Loader2 size={48} className="animate-spin" />
      <p className="mt-2.5">Loading incidents...</p>
    </div>
  );

  return (
    <div className="font-sans bg-white min-h-screen p-4">
      <div className="shadow-lg overflow-hidden">
        <header className="bg-blue-600 text-white py-5 text-center">
          <h1 className="m-0 text-2xl">AI Incident Triage Dashboard</h1>
          <p className="mt-2.5 opacity-90">Log and monitor incidents with AI-powered analysis</p>
        </header>

        <div className="p-4">
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-7.5 text-center">
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white border-none py-3 px-6 rounded cursor-pointer transition-colors duration-300 hover:bg-blue-800">
              Log New Incident
            </button>
          </div>

          <div>
            <h2 className="text-gray-800 text-xl border-b-2 border-blue-600 pb-2.5 mb-5">
              Recent Incidents
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-3 text-left font-bold text-gray-800 border-b-2 border-gray-300">AI Analysis</th>
                    <th className="py-3 px-3 text-left font-bold text-gray-800 border-b-2 border-gray-300">Service</th>
                    <th className="py-3 px-3 text-left font-bold text-gray-800 border-b-2 border-gray-300">Environment</th>
                    <th className="py-3 px-3 text-left font-bold text-gray-800 border-b-2 border-gray-300">Severity</th>
                    <th className="py-3 px-3 text-left font-bold text-gray-800 border-b-2 border-gray-300">Confidence</th>
                    <th className="py-3 px-3 text-left font-bold text-gray-800 border-b-2 border-gray-300">Escalation</th>
                    
                    <th className="py-3 px-3 text-left font-bold text-gray-800 border-b-2 border-gray-300">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident, idx) => (
                    <>
                      <tr key={incident.id} className="border-b border-gray-300">
                        <td
                          className="py-3 px-3 border-b border-gray-300 cursor-pointer text-blue-600 underline hover:text-blue-800"
                          onClick={() => handleRowClick(idx)}
                          role="button"
                          title="View analysis"
                        >
                          {incident.id ?? "N/A"}
                        </td>
                        <td className="py-3 px-3 border-b border-gray-300">{incident.serviceName}</td>
                        <td className="py-3 px-3 border-b border-gray-300">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${incident.environment === 'production' ? 'bg-red-600 text-white' : 'bg-yellow-400 text-black'}`}>
                            {incident.environment}
                          </span>
                        </td>
                        <td className="py-3 px-3 border-b border-gray-300"><SeverityBadge severity={incident.severity} /></td>
                        <td className="py-3 px-3 border-b border-gray-300">{Math.round(incident.confidence * 100)}%</td>
                        <td className="py-3 px-3 border-b border-gray-300">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${incident.escalation === 'AUTO_TRIAGED' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black'}`}>
                            {incident.escalation.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-3 border-b border-gray-300">{new Date(incident.createdAt).toLocaleString()}</td>
                      </tr>
                      {
                        openTableRows[idx] && (
                          <tr>
                            <td colSpan={7} className="p-4 bg-gray-50">
                            <Accordian possibleCauses={incident.possibleCauses} nextSteps={incident.nextSteps} AISummary={incident.AISummary} />
                            </td>
                          </tr>
                        )
                      }
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
          <div className="bg-white rounded-lg p-4 max-w-md w-11/12 max-h-11/12 overflow-y-auto relative shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-2.5 right-2.5 bg-transparent border-none text-2xl cursor-pointer text-gray-600">
              ×
            </button>
            <div className="flex justify-between items-center mb-5">
              <h2 className="m-0 text-gray-800 text-xl">
                Log New Incident
              </h2>
            </div>
            <form onSubmit={submitIncident}>
              <div className="mb-3.75">
                <label className="block mb-1.25 font-bold text-gray-700">
                  Service Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., API Gateway"
                  value={form.serviceName}
                  onChange={e => setForm({ ...form, serviceName: e.target.value })}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded box-border text-base"
                />
              </div>

              <div className="mb-3.75">
                <label className="block mb-1.25 font-bold text-gray-700">
                  Environment
                </label>
                <select
                  value={form.environment}
                  onChange={e => setForm({ ...form, environment: e.target.value })}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded text-base bg-white"
                >
                  <option value="">Select Environment</option>
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="block mb-1.25 font-bold text-gray-700">
                  Incident Description
                </label>
                <textarea
                  placeholder="Describe the incident in detail..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full p-2.5 border border-gray-300 rounded text-base resize-vertical box-border"
                />
              </div>

              <div className="flex gap-2.5 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 text-white border-none py-3 px-6 rounded text-base cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={globalLoading} className={`text-white border-none py-3 px-6 rounded text-base cursor-pointer flex items-center gap-2 transition-colors duration-300 ${globalLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-800'}`}>
                  {globalLoading && <Loader2 size={16} className="animate-spin" />}
                  {globalLoading ? 'Submitting...' : 'Submit Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {globalLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 pointer-events-none">
          <div className="flex flex-col items-center text-white font-sans">
            <Loader2 size={48} className="animate-spin mb-2.5" />
            <p className="text-lg m-0">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}

