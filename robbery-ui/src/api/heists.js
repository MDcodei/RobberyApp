// src/api/heists.js
const API_HEISTS  = "http://localhost:8080/api/heists";
const API_MENTORS = "http://localhost:8080/api/mentors";

export async function getMentorTools(mentorShortName) {
  const res = await fetch(`${API_MENTORS}/${encodeURIComponent(mentorShortName)}/tools`);
  if (!res.ok) throw new Error(`Failed to load tools for ${mentorShortName}`);
  return res.json(); // Item[]
}

export async function planHeist(payload) {
  const res = await fetch(`${API_HEISTS}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to plan heist");
  return res.json(); // { message, id }
}

export async function getPlannedHeists() {
  const res = await fetch(`${API_HEISTS}/planned`);
  if (!res.ok) throw new Error("Failed to load planned heists");
  return res.json(); // Heist[]
}

export async function simulateHeistById(id) {
  const res = await fetch(`${API_HEISTS}/${id}/simulate`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to simulate heist ${id}`);
  return res.json(); // HeistResult
}

export async function simulateHeist(heistObject) {
  const res = await fetch(`${API_HEISTS}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(heistObject),
  });
  if (!res.ok) throw new Error("Failed to simulate heist");
  return res.json(); // HeistResult
}