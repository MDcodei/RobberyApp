import axios from "axios";

const API_HEISTS  = "http://localhost:8080/api/heists";
const API_MENTORS = "http://localhost:8080/api/mentors";

export async function getMentorTools(mentorShortName) {
  const res = await fetch(`${API_MENTORS}/${encodeURIComponent(mentorShortName)}/tools`);
  if (!res.ok) throw new Error(`Failed to load tools for ${mentorShortName}`);
  return res.json();
}

export async function planHeist(payload) {
  const res = await fetch(`${API_HEISTS}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to plan heist");
  return res.json();
}

export async function getPlannedHeists() {
  const res = await fetch(`${API_HEISTS}/planned`);
  if (!res.ok) throw new Error("Failed to load planned heists");
  return res.json();
}

// IMPORTANT: use heistNumber now
export async function simulateHeistByHeistNumber(heistNumber) {
  const res = await fetch(`${API_HEISTS}/${heistNumber}/simulate`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to simulate heist ${heistNumber}`);
  return res.json();
}

export async function simulateHeist(heistObject) {
  const res = await fetch(`${API_HEISTS}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(heistObject),
  });
  if (!res.ok) throw new Error("Failed to simulate heist");
  return res.json();
}

// DELETE by heistNumber
export async function deleteHeist(heistNumber) {
  const res = await fetch(`${API_HEISTS}/${heistNumber}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete heist");
  return res.json();
}

// UPDATE by heistNumber
export async function updateHeist(heistNumber, updatedData) {
  const res = await fetch(`${API_HEISTS}/${heistNumber}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
  });
  if (!res.ok) throw new Error("Failed to update heist");
  return res.json();
}