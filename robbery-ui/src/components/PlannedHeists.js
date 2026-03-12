import React, { useEffect, useState } from "react";
import { 
  getPlannedHeists, 
  simulateHeistByHeistNumber,
  deleteHeist
} from "../api/heists";
import "./plannedHeists.css";
import HeistSVG from "./HeistSVG";

function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="simulate-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function PlannedHeists() {
  const [heists, setHeists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulatingNumber, setSimulatingNumber] = useState(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await getPlannedHeists();
      setHeists(data);
    } catch (e) {
      setError("Failed to load planned heists.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSimulate(heistNumber) {
    try {
      setSimulatingNumber(heistNumber);
      const result = await simulateHeistByHeistNumber(heistNumber);

      const heist = heists.find(h => h.heistNumber === heistNumber);
      if (!heist) throw new Error("Heist not found");

      const summary = result.summary || "Simulation complete.";

      setModalTitle(`Heist #${heistNumber} Simulation`);
      setModalContent(
        <>
          <HeistSVG
            key={`${heistNumber}-${String(result?.success)}-${heist.escape}-${heist.target}`}
            target={heist.target}
            success={result.success}
            escape={heist.escape}
            height={260}
          />
          <pre className="result-pre" style={{ marginTop: "12px" }}>
            {summary}
          </pre>
        </>
      );

      setModalOpen(true);
    } catch (err) {
      console.error(err);
      setModalTitle("Error");
      setModalContent("Failed to simulate the heist.");
      setModalOpen(true);
    } finally {
      setSimulatingNumber(null);
    }
  }

  async function handleDelete(heistNumber) {
    if (!window.confirm("Delete this heist?")) return;

    try {
      await deleteHeist(heistNumber);
      load();
    } catch (err) {
      console.error(err);
      alert("Failed to delete heist.");
    }
  }

  if (loading) return <div className="ph-wrap"><div className="loader" /></div>;
  if (error) return <div className="ph-wrap"><p className="err">{error}</p></div>;
  if (heists.length === 0) return <div className="ph-wrap"><p>No planned heists yet.</p></div>;

  return (
    <div className="ph-wrap">
      <ul className="heist-list">
        {heists.map(h => (
          <li key={h.heistNumber} className="heist-item">

            <div className="heist-meta">
              <div className="line">
                <span className="tag">#{h.heistNumber}</span>
                <span className="dot" />
                <span className="tag">{h.target}</span>
                <span className="dot" />
                <span className="tag">{h.difficulty}</span>
                <span className="dot" />
                <span className="tag">{h.escape}</span>
              </div>
              <div className="sub">
                Mentor: <strong>{h.mentorName}</strong>
              </div>
            </div>

            <button
              className="simulate-btn"
              onClick={() => handleSimulate(h.heistNumber)}
              disabled={simulatingNumber === h.heistNumber}
            >
              {simulatingNumber === h.heistNumber ? "Simulating..." : "Simulate"}
            </button>

            <button className="btn btn-secondary" onClick={() => handleDelete(h.heistNumber)}>
              Delete
            </button>

          </li>
        ))}
      </ul>

      <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </div>
  );
}