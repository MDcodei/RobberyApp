import React, { useEffect, useState } from "react";
import { simulateHeist, planHeist, getMentorTools } from "../api/heists";

import "./heistForm.css";

export default function HeistForm({ onResult }) {
  const [target, setTarget] = useState("BANK");
  const [difficulty, setDifficulty] = useState("EASY");
  const [escapeMethod, setEscapeMethod] = useState("CAR");
  const [mentorName, setMentorName] = useState("Rob (The head)");
  const [tools, setTools] = useState([]);

  useEffect(() => {
    const mentorShort = mentorName.split(" ")[0]; // "Rob" or "Bobby"
    async function load() {
      const baseTools = await getMentorTools(mentorShort);
      setTools(baseTools);
    }
    load();
  }, [mentorName]);

  function toggleTool(tool) {
    const exists = tools.some(t => t.name === tool.name);
    setTools(exists ? tools.filter(t => t.name !== tool.name) : [...tools, tool]);
  }

  const payload = {
    target,
    difficulty,
    escape: escapeMethod,
    mentorName,
    tools,
    note: ""
  };

  
async function handleSimulate(id) {
  try {
    const result = await simulateHeist(id);
    alert(`Simulated #${id}: ${result.success ? "SUCCESS" : "FAILED"} | $${result.lootValue ?? result.loot ?? 0}`);
  } catch (e) {
    console.error(e);
    alert(`Failed to simulate #${id}: ${e.message}`);
  }
}


  async function handlePlan() {
  try {
    const result = await planHeist(payload);
    alert(result?.message || `Planned with id ${result?.id}`);
  } catch (err) {
    console.error(err);
    alert(`Failed to plan heist: ${err.message}`);
  }
}

  return (
    <div className="heist-container">
      {/* No title here — just sections / buttons */}

      {/* TARGET */}
      <div className="section">
        <label>Target:</label>
        <div className="btn-group">
          {["BANK","MANSION","POST_OFFICE","SUPERMARKET"].map(t => (
            <button
              key={t}
              className={target === t ? "btn selected" : "btn"}
              onClick={() => setTarget(t)}
            >
              {t.replace("_"," ")}
            </button>
          ))}
        </div>
      </div>

      {/* DIFFICULTY */}
      <div className="section">
        <label>Difficulty:</label>
        <div className="btn-group">
          {["EASY","MEDIUM","HARD"].map(d => (
            <button
              key={d}
              className={difficulty === d ? "btn selected" : "btn"}
              onClick={() => setDifficulty(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* ESCAPE */}
      <div className="section">
        <label>Escape:</label>
        <div className="btn-group">
          {["CAR","BIKE","BOAT","ON_FOOT"].map(e => (
            <button
              key={e}
              className={escapeMethod === e ? "btn selected" : "btn"}
              onClick={() => setEscapeMethod(e)}
            >
              {e.replace("_"," ")}
            </button>
          ))}
        </div>
      </div>

      {/* MENTOR */}
      <div className="section">
        <label>Mentor:</label>
        <div className="btn-group">
          {["Rob (The head)","Bobby (The mountain)"].map(m => (
            <button
              key={m}
              className={mentorName === m ? "btn selected" : "btn"}
              onClick={() => setMentorName(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* TOOLS */}
      <div className="section">
        <label>Tools {mentorName.split(" ")[0]} brings:</label>
        <div className="tool-list">
          {tools.map(t => (
            <div key={`${t.name}_active`} className="tool-chip active">
              {t.name} (${t.value})
            </div>
          ))}
        </div>
      </div>

      {/* EXTRA TOOLS */}
      <div className="section">
        <label>Add Extra Tools:</label>
        <div className="tool-list">
          {["gun","knife","bat","scissors"].map(name => {
            const tool = { name, value: name === "knife" || name === "scissors" ? 2.5 : 1.5 };
            const isActive = tools.some(t => t.name === tool.name);
            return (
              <div
                key={name}
                onClick={() => toggleTool(tool)}
                className={isActive ? "tool-chip active" : "tool-chip"}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleTool(tool)}
              >
                {tool.name} (${tool.value})
              </div>
            );
          })}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="section actions">
        <button className="action-btn" onClick={() => handleSimulate}>Simulate</button>
        <button className="action-btn danger" onClick={handlePlan}>Plan</button>
      </div>
    </div>
  );
}