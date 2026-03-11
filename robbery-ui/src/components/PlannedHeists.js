import React, { useEffect, useState } from "react";
import { getPlannedHeists, simulateHeistById } from "../api/heists";
import { deleteHeist, updateHeist } from "../api/heists";
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
  const [simulatingId, setSimulatingId] = useState(null);
  const [error, setError] = useState("");
  const [editHeist, setEditHeist] = useState(null);


  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

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
    const result = await simulateHeistById(id);
    console.log("Simulation result (raw):", result);
    console.log("Type of success:", typeof result.success, "Value:", result.success);

    const heist = heists.find(h => h.id === id);
    if (!heist) {
      throw new Error(`Heist ${id} not found in state`);
    }

  
    const normalizeTarget = (t) => {
      const x = String(t || "").trim().toUpperCase();
 
      if (x === "POST OFFICE") return "POST_OFFICE";
      return ["BANK", "MANSION", "POST_OFFICE", "SUPERMARKET"].includes(x) ? x : "BANK";
    };

    const normalizeEscape = (e) => {
      const x = String(e || "").trim().toUpperCase().replace(/\s+/g, "_");
      return ["CAR", "BIKE", "BOAT", "ON_FOOT"].includes(x) ? x : "ON_FOOT";
    };

    const normalizeSuccess = (s) => {
    
      if (typeof s === "boolean") return s;
      if (typeof s === "string") return s.trim().toLowerCase() === "true";
      return !!s;
    };

    const normTarget = normalizeTarget(heist.target);
    const normEscape = normalizeEscape(heist.escape);
    const normSuccess = normalizeSuccess(result?.success);

   
    const targetClass = `target-${normTarget.replace("_", "-").toLowerCase()}`;  
    const escapeClass = `escape-${normEscape.toLowerCase()}`;                    
    const outcomeClass = normSuccess ? "outcome-success" : "outcome-fail";

    console.log("HeistSVG props (normalized):", {
      target: normTarget,
      success: normSuccess,
      escape: normEscape
    });
    console.log("Expect SVG classnames:", `heist-svg ${outcomeClass} ${targetClass} ${escapeClass}`);

    setModalTitle(`Heist #${id} Simulation`);

    console.log(
  "FINAL SVG SHOULD HAVE CLASS:",
  `heist-svg outcome-${result.success ? "success" : "fail"} target-${heist.target.replace("_","-").toLowerCase()} escape-${heist.escape.toLowerCase()}`
);

    setModalContent(
      <>
        <HeistSVG
          key={`${id}-${String(result?.success)}-${heist.escape}-${heist.target}`}
          target={normTarget}
          success={normSuccess}
          escape={normEscape}
          height={260}
        />

        <pre className="result-pre" style={{ marginTop: "12px" }}>
          {result?.summary || "Simulation complete."}
        </pre>
      </>
    );

    setModalOpen(true);
  } catch (e) {
    console.error(e);
    setModalTitle("Error");
    setModalContent("Failed to simulate this heist.");
    setModalOpen(true);
  } finally {
    setSimulatingId(null);
  }
}

async function handleDelete(id) {
  const ok = window.confirm("Are you sure you want to delete this heist?");
  if (!ok) return;

  try {
    await deleteHeist(id);
    load(); // reload the updated planned heists
  } catch (err) {
    console.error("Delete failed:", err);
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
            <button
              className="btn btn-secondary"
              onClick={() => handleDelete(h.id)}
            >
              Delete
            </button>

            
          </li>
        ))}
      </ul>


      <Modal
        open={modalOpen}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
      >
        {modalContent}
      </Modal>

    </div>
  );
}