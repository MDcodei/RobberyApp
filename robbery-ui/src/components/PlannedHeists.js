import React, { useEffect, useState } from "react";
import { getPlannedHeists, simulateHeistById } from "../api/heists";
import "./plannedHeists.css";

export default function PlannedHeists() {
  const [heists, setHeists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulatingId, setSimulatingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await getPlannedHeists();
      setHeists(Array.isArray(data) ? data : data?.heists || []);
    } catch (e) {
      setError("Failed to load planned heists.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSimulate(id) {
    try {
      setSimulatingId(id);
      const result = await simulateHeistById(id); // or simulateHeist(heist.payload)
      // You can show a toast or navigate to a "results" page
      alert(result?.summary || "Simulation complete.");
    } catch (e) {
      alert("Failed to simulate this heist.");
    } finally {
      setSimulatingId(null);
    }
  }

  if (loading) return <div className="ph-wrap"><div className="loader" /></div>;
  if (error) return <div className="ph-wrap"><p className="err">{error}</p></div>;
  if (heists.length === 0) return <div className="ph-wrap"><p>No planned heists yet.</p></div>;

  return (
    <div className="ph-wrap">
      <ul className="heist-list">
        {heists.map(h => (
          <li key={h.id} className="heist-item">
            <div className="heist-meta">
              <div className="line">
                <span className="tag">{h.target}</span>
                <span className="dot" />
                <span className="tag">{h.difficulty}</span>
                <span className="dot" />
                <span className="tag">{h.escape}</span>
              </div>
              <div className="sub">Mentor: <strong>{h.mentorName}</strong></div>
            </div>
            <button
              className="simulate-btn"
              onClick={() => handleSimulate(h.id)}
              disabled={simulatingId === h.id}
            >
              {simulatingId === h.id ? "Simulating..." : "Simulate"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}