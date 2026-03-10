import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HeistForm from "./components/heistForm";
import PlannedHeists from "./components/PlannedHeists";
import NavBar from "./components/NavBar";

import "./App.css";

function App() {
  const [result, setResult] = useState(null);

  return (
    <BrowserRouter>
      
      <NavBar />

      
      <div className="app-shell">

        
        <header className="hero">
          <h1>Welcome to Great Robbery App</h1>
          <p className="tagline">Blueprints. Crew. Execution. All in one place.</p>
        </header>

        
        <Routes>

          
          <Route
            path="/"
            element={<HeistForm onResult={(res) => setResult(res)} />}
          />

          
          <Route path="/planned" element={<PlannedHeists />} />

        </Routes>

        
        {result && (
          <div className="result-box">
            <h2>Simulation Result</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;