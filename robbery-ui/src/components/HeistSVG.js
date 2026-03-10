import React, { memo } from "react";

/**
 * HeistSVG — single-file animated SVG
 * Props:
 *  - target: "BANK" | "MANSION" | "POST_OFFICE" | "SUPERMARKET"
 *  - success: boolean
 *  - escape: "CAR" | "BIKE" | "BOAT" | "ON_FOOT"
 *  - width / height (optional)
 */
function HeistSVG({ target = "BANK", success = true, escape = "CAR", width = "100%", height = 300 }) {
  const outcomeClass = success ? "outcome-success" : "outcome-fail";
  const targetClass = `target-${target.replace("_", "-").toLowerCase()}`;
  const escapeClass = `escape-${escape.toLowerCase()}`;

  // Character sizes/positions (cartoon outline, blockier proportions)
  // Scene coordinate space: viewBox 0 0 800 300
  // Ground line at y=240. Door center around x=510..540 depending on building width.
  return (
    <svg
      className={`heist-svg ${outcomeClass} ${targetClass} ${escapeClass}`}
      viewBox="0 0 800 300"
      width={width}
      height={height}
      role="img"
      aria-label="Heist simulation animation"
    >
      <style>{`
        /* ---------- General ---------- */
        .bg { fill: #f1f5f9; } /* soft light background */
        .ground { stroke: #9aa4b2; stroke-width: 2; }
        .panel-line { stroke: #0f172a; stroke-width: 3; opacity: 0.2; }

        /* Comic panel borders */
        .panel-top { transform: translateY(1px); }
        .panel-bottom { transform: translateY(-1px); }

        /* Hide all buildings by default; show via target class */
        .building { display: none; }
        .heist-svg.target-bank .building.bank { display: inline; }
        .heist-svg.target-mansion .building.mansion { display: inline; }
        .heist-svg.target-post-office .building.postoffice { display: inline; }
        .heist-svg.target-supermarket .building.supermarket { display: inline; }

        /* ---------- Characters (cartoon outline) ---------- */
        .stroke { stroke: #0f172a; stroke-width: 3; fill: none; }
        .ink   { stroke: #0f172a; stroke-width: 3; fill: #ffffff; }
        .accent{ fill: #10b981; stroke: #065f46; stroke-width: 2; } /* money bag accent */

        .crew { transform: translateX(-140px); animation: crew-enter 2.2s ease-out forwards; }
        /* If success + ON_FOOT, run offscreen after 2.3s */
        .heist-svg.outcome-success.escape-on_foot .crew {
          animation: crew-enter 2.2s ease-out forwards, crew-run 1.2s 2.3s ease-in forwards;
        }

        /* If success with vehicle, crew stops near door then fades out */
        .heist-svg.outcome-success.escape-car .crew,
        .heist-svg.outcome-success.escape-bike .crew,
        .heist-svg.outcome-success.escape-boat .crew {
          animation: crew-enter 2.2s ease-out forwards, 
          crew-fade 0.8s 3.1s ease-in forwards;
        }

        /* If failed, they stop and don't fade */
        .heist-svg.outcome-fail .crew { animation: crew-enter 2.2s ease-out forwards; }

        /* Walk cycle — legs + arms */
        .leg-left  { transform-origin: 20px 210px; animation: leg-swing 0.8s ease-in-out infinite alternate; }
        .leg-right { transform-origin: 20px 210px; animation: leg-swing 0.8s ease-in-out infinite alternate-reverse; }
        .arm-left  { transform-origin: 25px 170px; animation: arm-swing 0.8s ease-in-out infinite alternate; }
        .arm-right { transform-origin: 25px 170px; animation: arm-swing 0.8s ease-in-out infinite alternate-reverse; }

        /* Mentor slightly different gait */
        .mentor .leg-left  { animation-duration: 0.86s; }
        .mentor .leg-right { animation-duration: 0.86s; }
        .mentor .arm-left,
        .mentor .arm-right { animation-duration: 0.86s; }

        @keyframes leg-swing {
          0% { transform: rotate(-20deg); }
          100% { transform: rotate(20deg); }
        }
        @keyframes arm-swing {
          0% { transform: rotate(18deg); }
          100% { transform: rotate(-18deg); }
        }

        @keyframes crew-enter {
          0%   { transform: translateX(-140px); }
          100% { transform: translateX(320px); } /* stop in front of the door zone */
        }
        @keyframes crew-run {
          0%   { transform: translateX(320px); }
          100% { transform: translateX(860px); } /* run offscreen right */
        }
        @keyframes crew-fade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }

        /* ---------- Vehicles (success only) ---------- */
        .vehicle { opacity: 0; transform: translateX(900px); }
        .debug-show .vehicle { opacity: 1 !important; transform: translateX(520px) !important; }
        .heist-svg.outcome-success.escape-car  .vehicle.car,
        .heist-svg.outcome-success.escape-bike .vehicle.bike,
        .heist-svg.outcome-success.escape-boat .vehicle.boat {
          animation: vehicle-in 0.9s 2.4s ease-out forwards, 
          vehicle-exit 1.1s 4.0s ease-in forwards;
        }

        @keyframes vehicle-in {
          0% { opacity: 0; transform: translateX(900px); }
          100% { opacity: 1; transform: translateX(520px); } /* pull up near door */
        }
        @keyframes vehicle-exit {
          0% { opacity: 1; transform: translateX(520px); }
          100% { opacity: 1; transform: translateX(900px); } /* drive off */
        }

        /* ---------- Police (failure only) ---------- */
        .police { opacity: 0; transform: translateX(900px); }
        .heist-svg.outcome-fail .police {
          animation: police-in 0.9s 2.0s ease-out forwards;
        }
        @keyframes police-in {
          0% { opacity: 0; transform: translateX(900px); }
          100% { opacity: 1; transform: translateX(560px); }
        }

        /* Police lights flash */
        .light-red  { fill: #ef4444; opacity: 0; animation: flash 0.25s 2s linear infinite; }
        .light-blue { fill: #3b82f6; opacity: 0; animation: flash 0.25s 2.125s linear infinite; }
        @keyframes flash {
          0%, 100% { opacity: 0; }
          50%      { opacity: 1; }
        }

        /* ---------- Building Styles (cartoon, full color) ---------- */
        /* All share same door zone (x≈510..540) so animations align */
        .bank-front       { fill: #c7d2fe; stroke: #1e3a8a; stroke-width: 3; }
        .bank-detail      { stroke: #1e3a8a; stroke-width: 3; fill: none; }
        .bank-sign        { fill: #1e3a8a; font: 700 18px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; letter-spacing: 1px; }

        .mansion-front    { fill: #fde68a; stroke: #92400e; stroke-width: 3; }
        .mansion-detail   { stroke: #92400e; stroke-width: 3; fill: none; }
        .mansion-sign     { fill: #92400e; font: 700 16px ui-sans-serif, system-ui; letter-spacing: 1px; }

        .po-front         { fill: #bae6fd; stroke: #0369a1; stroke-width: 3; }
        .po-detail        { stroke: #0369a1; stroke-width: 3; fill: none; }
        .po-sign          { fill: #0369a1; font: 700 16px ui-sans-serif, system-ui; letter-spacing: 1px; }

        .market-front     { fill: #bbf7d0; stroke: #166534; stroke-width: 3; }
        .market-detail    { stroke: #166534; stroke-width: 3; fill: none; }
        .market-sign      { fill: #166534; font: 700 16px ui-sans-serif, system-ui; letter-spacing: 1px; }

        .door { fill: #111827; stroke: #111827; stroke-width: 2.5; }

        /* ---------- Utility ---------- */
        .hidden { display: none; }
      `}</style>

      {/* Background + Comic panel feel */}
      <rect className="bg" x="0" y="0" width="800" height="300" rx="8" />
      <line className="panel-line panel-top" x1="10" y1="10" x2="790" y2="10" />
      <line className="panel-line panel-bottom" x1="10" y1="290" x2="790" y2="290" />
      <line className="ground" x1="20" y1="240" x2="780" y2="240" />

      {/* ---------- Buildings (only one visible based on target class) ---------- */}
      {/* BANK (A) */}
      <g className="building bank">
        <rect className="bank-front" x="430" y="80" width="250" height="150" rx="6" />
        {/* Pillars */}
        <line className="bank-detail" x1="465" y1="90" x2="465" y2="230" />
        <line className="bank-detail" x1="505" y1="90" x2="505" y2="230" />
        <line className="bank-detail" x1="585" y1="90" x2="585" y2="230" />
        <line className="bank-detail" x1="625" y1="90" x2="625" y2="230" />
        {/* Door @ center */}
        <rect className="door" x="510" y="160" width="60" height="80" rx="4" />
        {/* Sign */}
        <text className="bank-sign" x="555" y="110" textAnchor="middle">BANK</text>
      </g>

      {/* MANSION (B1: fancy) */}
      <g className="building mansion">
        <rect className="mansion-front" x="420" y="95" width="270" height="135" rx="10" />
        {/* Balcony / arches */}
        <path className="mansion-detail" d="M440 145 h230" />
        <path className="mansion-detail" d="M470 145 q15 -18 30 0" />
        <path className="mansion-detail" d="M550 145 q15 -18 30 0" />
        {/* Big door */}
        <rect className="door" x="515" y="160" width="60" height="80" rx="4" />
        {/* Sign */}
        <text className="mansion-sign" x="555" y="120" textAnchor="middle">MANSION</text>
      </g>

      {/* POST OFFICE (C) */}
      <g className="building postoffice">
        <rect className="po-front" x="435" y="95" width="250" height="135" rx="6" />
        {/* USPS stripe vibe */}
        <line className="po-detail" x1="440" y1="130" x2="680" y2="130" />
        <line className="po-detail" x1="440" y1="136" x2="680" y2="136" />
        {/* Door */}
        <rect className="door" x="510" y="160" width="60" height="80" rx="4" />
        {/* Sign */}
        <text className="po-sign" x="555" y="120" textAnchor="middle">POST OFFICE</text>
        {/* Mailbox */}
        <rect x="690" y="200" width="24" height="36" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="3" rx="4" />
      </g>

      {/* SUPERMARKET (D) */}
      <g className="building supermarket">
        <rect className="market-front" x="430" y="90" width="260" height="140" rx="6" />
        {/* Glass panels */}
        <line className="market-detail" x1="445" y1="130" x2="675" y2="130" />
        <line className="market-detail" x1="445" y1="150" x2="675" y2="150" />
        {/* Door */}
        <rect className="door" x="510" y="160" width="60" height="80" rx="4" />
        {/* Cart icon-ish */}
        <path className="market-detail" d="M450 120 h40 l8 20 h40" />
        <circle className="market-detail" cx="535" cy="140" r="5" />
        <circle className="market-detail" cx="515" cy="140" r="5" />
        {/* Sign */}
        <text className="market-sign" x="560" y="110" textAnchor="middle">SUPERMARKET</text>
      </g>

      

      {/* ---------- Crew (two distinct cartoon characters) ---------- */}
      <g className="crew">
        {/* Robber (front) */}
        <g className="robber" transform="translate(40,0)">
          {/* Head */}
          <circle className="ink" cx="40" cy="150" r="14" />
          {/* Body */}
          <path className="stroke" d="M40 164 L40 205" />
          {/* Arms */}
          <path className="stroke arm-left" d="M40 178 Q25 184 20 195" />
          <path className="stroke arm-right" d="M40 178 Q55 184 60 195" />
          {/* Legs */}
          <path className="stroke leg-left"  d="M40 205 Q32 220 28 240" />
          <path className="stroke leg-right" d="M40 205 Q48 220 52 240" />
          {/* Money bag accent */}
          <circle className="accent" cx="18" cy="198" r="6" />
        </g>

        {/* Mentor (behind) */}
        <g className="mentor" transform="translate(0,-6)">
          {/* Head (square-ish) */}
          <rect x="20" y="138" width="16" height="16" rx="3" fill="#fff" stroke="#0f172a" strokeWidth="3" />
          {/* Body */}
          <path className="stroke" d="M28 156 L28 202" />
          {/* Arms (slightly different) */}
          <path className="stroke arm-left"  d="M28 172 Q15 180 10 195" />
          <path className="stroke arm-right" d="M28 172 Q41 180 46 195" />
          {/* Legs thicker */}
          <path className="stroke leg-left"  d="M28 202 Q22 220 20 240" />
          <path className="stroke leg-right" d="M28 202 Q34 220 36 240" />
        </g>
      </g>

    
      {/*---------- Vehicles (success only) ----------
      
      <g className="vehicle car" transform="translate(0,0)">
        <rect x="560" y="198" width="90" height="28" fill="#ef4444" stroke="#7f1d1d" strokeWidth="3" rx="6" />
        <rect x="575" y="186" width="50" height="16" fill="#fecaca" stroke="#7f1d1d" strokeWidth="3" rx="3" />
        <circle cx="580" cy="230" r="8" fill="#111827" />
        <circle cx="630" cy="230" r="8" fill="#111827" />
      </g>

      
      <g className="vehicle bike" transform="translate(0,0)">
        <circle cx="585" cy="230" r="10" fill="#1e293b" />
        <circle cx="625" cy="230" r="10" fill="#1e293b" />
        <line x1="585" y1="230" x2="610" y2="208" stroke="#0ea5e9" strokeWidth="3" />
        <line x1="625" y1="230" x2="610" y2="208" stroke="#0ea5e9" strokeWidth="3" />
        <line x1="610" y1="208" x2="600" y2="198" stroke="#0ea5e9" strokeWidth="3" />
        <line x1="610" y1="208" x2="620" y2="198" stroke="#0ea5e9" strokeWidth="3" />
      </g>

      
      <g className="vehicle boat" transform="translate(0,0)">
        
        <path d="M560 230 h90 l-12 12 h-66 z" fill="#10b981" stroke="#065f46" strokeWidth="3" />
        <rect x="590" y="210" width="32" height="16" fill="#a7f3d0" stroke="#065f46" strokeWidth="3" rx="3" />
      </g> 
      */}


      


      {/* ---------- Police (failure only) ---------- */}
      <g className="police">
        {/* car base */}
        <rect x="560" y="198" width="92" height="28" fill="#ffffff" stroke="#111827" strokeWidth="3" rx="6" />
        {/* roof bar */}
        <rect x="590" y="186" width="32" height="10" fill="#111827" rx="2" />
        {/* lights */}
        <rect className="light-red"  x="592" y="186" width="12" height="10" rx="2" />
        <rect className="light-blue" x="610" y="186" width="12" height="10" rx="2" />
        {/* wheels */}
        <circle cx="580" cy="230" r="8" fill="#111827" />
        <circle cx="632" cy="230" r="8" fill="#111827" />
      </g>

      {/* ---------- Vehicles (success only) — MOVED TO TOP LAYER ---------- */}
        {/* CAR */}
        <g className="vehicle car" transform="translate(0,0)">
        <rect x="560" y="198" width="90" height="28" fill="#ef4444" stroke="#7f1d1d" strokeWidth="3" rx="6" />
        <rect x="575" y="186" width="50" height="16" fill="#fecaca" stroke="#7f1d1d" strokeWidth="3" rx="3" />
        <circle cx="580" cy="230" r="8" fill="#111827" />
        <circle cx="630" cy="230" r="8" fill="#111827" />
        </g>

        {/* BIKE */}
        <g className="vehicle bike" transform="translate(0,0)">
        <circle cx="585" cy="230" r="10" fill="#1e293b" />
        <circle cx="625" cy="230" r="10" fill="#1e293b" />
        <line x1="585" y1="230" x2="610" y2="208" stroke="#0ea5e9" strokeWidth="3" />
        <line x1="625" y1="230" x2="610" y2="208" stroke="#0ea5e9" strokeWidth="3" />
        <line x1="610" y1="208" x2="600" y2="198" stroke="#0ea5e9" strokeWidth="3" />
        <line x1="610" y1="208" x2="620" y2="198" stroke="#0ea5e9" strokeWidth="3" />
        </g>

        {/* BOAT */}
        <g className="vehicle boat" transform="translate(0,0)">
        {/* simple hull */}
        <path d="M560 230 h90 l-12 12 h-66 z" fill="#10b981" stroke="#065f46" strokeWidth="3" />
        <rect x="590" y="210" width="32" height="16" fill="#a7f3d0" stroke="#065f46" strokeWidth="3" rx="3" />
        </g>
    </svg>
  );
}

export default memo(HeistSVG);