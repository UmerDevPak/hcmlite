"use client";

import React from "react";

/**
 * EnterpriseVectorHero
 * Clean, seamless isometric vector art tailored for HCM Lite's dark enterprise UI.
 * Integrates directly with the page layout without enclosing box, borders, or card background.
 */
export default function EnterpriseVectorHero() {
  return (
    <div className="relative z-10 my-auto py-2 w-full max-w-xl flex items-center justify-center select-none">
      {/* Precision Isometric SVG Vector Artwork rendered directly on the background */}
      <svg
        viewBox="0 0 540 370"
        className="w-full h-auto max-h-[360px] transition-all duration-300"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Linear & Radial Gradients for Dark Enterprise Aesthetic */}
          <linearGradient id="podiumTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="podiumUpper" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4338ca" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="podiumSideL" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
          <linearGradient id="podiumSideR" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>

          <linearGradient id="tileTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="tileSideL" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#09090b" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="tileSideR" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Suit & Character Gradients */}
          <linearGradient id="suitJacket" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="suitPants" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Ambient Floor Glow */}
          <radialGradient id="ambientFloor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#312e81" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Floor Glow blending directly into page background */}
        <ellipse cx="270" cy="225" rx="190" ry="95" fill="url(#ambientFloor)" />

        {/* ======================================================== */}
        {/* CONNECTING DOTTED ISOMETRIC CIRCUIT CONDUITS */}
        {/* ======================================================== */}
        <g stroke="#6366f1" strokeOpacity="0.5" strokeWidth="1.8" strokeDasharray="4 4" fill="none">
          {/* To Lightbulb (Top-Left) */}
          <path d="M 270 195 L 210 150 L 140 100" />
          {/* To AI Brain (Top-Right) */}
          <path d="M 270 195 L 340 150 L 410 95" />
          {/* To Target (Mid-Left) */}
          <path d="M 270 215 L 180 200 L 95 185" />
          {/* To Analytics Easel (Mid-Right) */}
          <path d="M 270 215 L 370 205 L 435 195" />
          {/* To Security Shield (Far-Right) */}
          <path d="M 370 205 L 470 160" />
          {/* To Culture Plant (Lower-Left) */}
          <path d="M 270 230 L 195 240 L 165 245" />
          {/* To Rocket Launch (Bottom-Left) */}
          <path d="M 270 235 L 200 275 L 125 300" />
          {/* To Workflows / Gears (Bottom-Center) */}
          <path d="M 270 245 L 270 310" />
          {/* To Team / Workforce (Bottom-Right) */}
          <path d="M 270 235 L 360 275 L 425 295" />
        </g>

        {/* Animated traveling data packets */}
        <circle cx="210" cy="150" r="2.5" fill="#38bdf8" className="animate-ping" style={{ animationDuration: "2.4s" }} />
        <circle cx="340" cy="150" r="2.5" fill="#a855f7" className="animate-ping" style={{ animationDuration: "3.1s" }} />
        <circle cx="360" cy="275" r="2.5" fill="#34d399" className="animate-ping" style={{ animationDuration: "2.8s" }} />
        <circle cx="200" cy="275" r="2.5" fill="#fbbf24" className="animate-ping" style={{ animationDuration: "3.5s" }} />

        {/* ======================================================== */}
        {/* SATELLITE PODS (TILES & NODES) */}
        {/* ======================================================== */}

        {/* 1. TOP-LEFT: INNOVATION LIGHTBULB */}
        <g className="transition-transform duration-300 hover:-translate-y-1">
          <path d="M 140 85 L 175 102 L 140 120 L 105 102 Z" fill="url(#tileTop)" stroke="#6366f1" strokeOpacity="0.5" strokeWidth="1" />
          <path d="M 105 102 L 140 120 L 140 128 L 105 110 Z" fill="url(#tileSideL)" />
          <path d="M 140 120 L 175 102 L 175 110 L 140 128 Z" fill="url(#tileSideR)" />

          <circle cx="140" cy="72" r="18" fill="#fbbf24" fillOpacity="0.2" className="animate-pulse" />
          
          <path d="M 132 76 C 128 70 128 62 133 57 C 137 53 143 53 147 57 C 152 62 152 70 148 76 L 146 80 L 134 80 Z" fill="#fbbf24" />
          <rect x="135" y="80" width="10" height="3" rx="1" fill="#d97706" />
          <rect x="136" y="84" width="8" height="2" rx="1" fill="#78350f" />
          <line x1="140" y1="50" x2="140" y2="44" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="126" y1="54" x2="121" y2="49" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="154" y1="54" x2="159" y2="49" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* 2. TOP-RIGHT: AI & NEURAL INTELLIGENCE */}
        <g className="transition-transform duration-300 hover:-translate-y-1">
          <path d="M 410 80 L 445 97 L 410 115 L 375 97 Z" fill="url(#tileTop)" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="1" />
          <path d="M 375 97 L 410 115 L 410 123 L 375 105 Z" fill="url(#tileSideL)" />
          <path d="M 410 115 L 445 97 L 445 105 L 410 123 Z" fill="url(#tileSideR)" />

          <rect x="395" y="58" width="30" height="30" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <path d="M 404 73 C 404 69 407 66 410 66 C 413 66 416 69 416 73 C 416 77 413 80 410 80 C 407 80 404 77 404 73 Z" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
          <circle cx="410" cy="73" r="2.5" fill="#38bdf8" className="animate-ping" />
          <circle cx="403" cy="69" r="1.5" fill="#7dd3fc" />
          <circle cx="417" cy="69" r="1.5" fill="#7dd3fc" />
          <circle cx="403" cy="77" r="1.5" fill="#7dd3fc" />
          <circle cx="417" cy="77" r="1.5" fill="#7dd3fc" />
          <line x1="410" y1="58" x2="410" y2="54" stroke="#38bdf8" strokeWidth="1.2" />
          <line x1="425" y1="73" x2="429" y2="73" stroke="#38bdf8" strokeWidth="1.2" />
          <line x1="395" y1="73" x2="391" y2="73" stroke="#38bdf8" strokeWidth="1.2" />
        </g>

        {/* 3. MID-LEFT: GOALS & ATS TARGET */}
        <g className="transition-transform duration-300 hover:-translate-y-1">
          <path d="M 95 170 L 125 185 L 95 200 L 65 185 Z" fill="url(#tileTop)" stroke="#6366f1" strokeOpacity="0.4" strokeWidth="1" />
          <path d="M 65 185 L 95 200 L 95 206 L 65 191 Z" fill="url(#tileSideL)" />
          <path d="M 95 200 L 125 185 L 125 191 L 95 206 Z" fill="url(#tileSideR)" />

          <ellipse cx="95" cy="160" rx="16" ry="12" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
          <ellipse cx="95" cy="160" rx="10" ry="7.5" fill="#312e81" stroke="#f43f5e" strokeWidth="1.2" />
          <ellipse cx="95" cy="160" rx="4" ry="3" fill="#f43f5e" />
          <line x1="110" y1="145" x2="96" y2="159" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <polygon points="95,160 99,154 94,158" fill="#ffffff" />
        </g>

        {/* 4. MID-RIGHT: EXECUTIVE ANALYTICS EASEL */}
        <g className="transition-transform duration-300 hover:-translate-y-1">
          <line x1="435" y1="175" x2="422" y2="215" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <line x1="435" y1="175" x2="448" y2="215" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <line x1="435" y1="175" x2="435" y2="218" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

          <rect x="415" y="145" width="40" height="32" rx="4" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
          
          <rect x="420" y="163" width="4" height="9" rx="1" fill="#6366f1" />
          <rect x="427" y="157" width="4" height="15" rx="1" fill="#818cf8" />
          <rect x="434" y="152" width="4" height="20" rx="1" fill="#38bdf8" />
          <rect x="441" y="149" width="4" height="23" rx="1" fill="#34d399" />
          
          <path d="M 420 162 Q 430 155 445 148" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* 5. FAR-RIGHT: ZERO-TRUST RBAC SECURITY SHIELD */}
        <g className="transition-transform duration-300 hover:-translate-y-1">
          <path
            d="M 470 145 C 470 145 486 140 486 155 C 486 172 470 180 470 180 C 470 180 454 172 454 155 C 454 140 470 145 470 145 Z"
            fill="#064e3b"
            stroke="#10b981"
            strokeWidth="1.6"
          />
          <rect x="466" y="160" width="8" height="7" rx="1.5" fill="#34d399" />
          <path d="M 468 160 L 468 157 C 468 155.5 472 155.5 472 157 L 472 160" fill="none" stroke="#34d399" strokeWidth="1.3" />
        </g>

        {/* 6. BOTTOM-LEFT: PERFORMANCE ROCKET */}
        <g className="transition-transform duration-300 hover:-translate-y-1">
          <path d="M 125 285 L 155 300 L 125 315 L 95 300 Z" fill="url(#tileTop)" stroke="#6366f1" strokeOpacity="0.4" strokeWidth="1" />
          <path d="M 95 300 L 125 315 L 125 321 L 95 306 Z" fill="url(#tileSideL)" />
          <path d="M 125 315 L 155 300 L 155 306 L 125 321 Z" fill="url(#tileSideR)" />

          <g transform="translate(125, 280) rotate(-25)">
            <ellipse cx="0" cy="18" rx="4" ry="7" fill="#f59e0b" className="animate-pulse" />
            <ellipse cx="0" cy="15" rx="2" ry="4" fill="#fef08a" />
            <path d="M -5 12 L -5 -6 Q 0 -18 5 -6 L 5 12 Z" fill="#e0e7ff" />
            <path d="M 0 -18 Q 5 -6 5 12 L 0 12 Z" fill="#c7d2fe" />
            <polygon points="-5,4 -10,13 -5,12" fill="#ef4444" />
            <polygon points="5,4 10,13 5,12" fill="#dc2626" />
            <circle cx="0" cy="-2" r="2.5" fill="#38bdf8" stroke="#1e1b4b" strokeWidth="0.8" />
          </g>
        </g>

        {/* 7. LOWER-LEFT: ORGANIZATIONAL GROWTH PLANT */}
        <g className="transition-transform duration-300 hover:-translate-y-1">
          <ellipse cx="165" cy="242" rx="11" ry="5.5" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <path d="M 154 242 L 157 254 L 173 254 L 176 242 Z" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          
          <path d="M 165 240 Q 158 230 156 226 Q 166 227 165 237" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
          <path d="M 165 238 Q 172 228 174 224 Q 164 226 165 235" fill="#4ade80" stroke="#16a34a" strokeWidth="0.8" />
          <path d="M 165 236 L 165 220 Q 161 216 165 212 Q 169 216 165 220" fill="#86efac" stroke="#22c55e" strokeWidth="0.8" />
        </g>

        {/* 8. BOTTOM-CENTER: AUTOMATED WORKFLOWS & PAYROLL GEARS */}
        <g className="transition-transform duration-300 hover:-translate-y-1">
          <path d="M 270 300 L 305 317 L 270 335 L 235 317 Z" fill="url(#tileTop)" stroke="#8b5cf6" strokeOpacity="0.4" strokeWidth="1" />
          <path d="M 235 317 L 270 335 L 270 342 L 235 324 Z" fill="url(#tileSideL)" />
          <path d="M 270 335 L 305 317 L 305 324 L 270 342 Z" fill="url(#tileSideR)" />

          <g transform="translate(265, 305) scale(0.9, 0.5) rotate(15)">
            <circle cx="0" cy="0" r="14" fill="#312e81" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="6 3" />
            <circle cx="0" cy="0" r="6" fill="#1e1b4b" stroke="#c084fc" strokeWidth="1.5" />
          </g>
          <g transform="translate(283, 312) scale(0.7, 0.4) rotate(45)">
            <circle cx="0" cy="0" r="12" fill="#4c1d95" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="5 2.5" />
            <circle cx="0" cy="0" r="5" fill="#1e1b4b" stroke="#e9d5ff" strokeWidth="1.5" />
          </g>
        </g>

        {/* 9. BOTTOM-RIGHT: WORKFORCE & TEAM */}
        <g className="transition-transform duration-300 hover:-translate-y-1">
          <path d="M 425 280 L 455 295 L 425 310 L 395 295 Z" fill="url(#tileTop)" stroke="#6366f1" strokeOpacity="0.4" strokeWidth="1" />
          <path d="M 395 295 L 425 310 L 425 316 L 395 301 Z" fill="url(#tileSideL)" />
          <path d="M 425 310 L 455 295 L 455 301 L 425 316 Z" fill="url(#tileSideR)" />

          <circle cx="417" cy="272" r="4.5" fill="#f59e0b" />
          <path d="M 411 285 C 411 279 423 279 423 285 Z" fill="#d97706" />

          <circle cx="433" cy="272" r="4.5" fill="#38bdf8" />
          <path d="M 427 285 C 427 279 439 279 439 285 Z" fill="#0284c7" />

          <circle cx="425" cy="265" r="5" fill="#818cf8" />
          <path d="M 418 280 C 418 273 432 273 432 280 Z" fill="#4f46e5" />
        </g>

        {/* ======================================================== */}
        {/* CENTRAL ELEVATED PODIUM ("CEO / EXECUTIVE STAGE") */}
        {/* ======================================================== */}
        
        <path
          d="M 270 190 L 335 222 L 270 255 L 205 222 Z"
          fill="url(#podiumTop)"
          stroke="#6366f1"
          strokeWidth="1.5"
          strokeOpacity="0.8"
        />
        <path d="M 205 222 L 270 255 L 270 268 L 205 235 Z" fill="url(#podiumSideL)" stroke="#4338ca" strokeWidth="0.8" />
        <path d="M 270 255 L 335 222 L 335 235 L 270 268 Z" fill="url(#podiumSideR)" stroke="#4338ca" strokeWidth="0.8" />

        <path
          d="M 270 180 L 318 204 L 270 228 L 222 204 Z"
          fill="url(#podiumUpper)"
          stroke="#818cf8"
          strokeWidth="1.8"
        />
        <path d="M 222 204 L 270 228 L 270 236 L 222 212 Z" fill="#1e1b4b" />
        <path d="M 270 228 L 318 204 L 318 212 L 270 236 Z" fill="#2e1065" />

        <g transform="translate(254, 237)">
          <rect x="0" y="0" width="32" height="11" rx="2" fill="#0f172a" stroke="#818cf8" strokeWidth="1" />
          <text x="16" y="8" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#e0e7ff" fontFamily="monospace">
            EXECUTIVE
          </text>
        </g>

        {/* ======================================================== */}
        {/* CENTRAL CORPORATE LEADER / EXECUTIVE VECTOR CHARACTER */}
        {/* ======================================================== */}
        <g
          className="cursor-pointer transition-transform duration-300 hover:scale-105"
          style={{ transformOrigin: "270px 180px" }}
        >
          <ellipse cx="270" cy="205" rx="20" ry="7" fill="#09090b" fillOpacity="0.75" />

          <ellipse cx="264" cy="203" rx="4.5" ry="2.2" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.5" />
          <ellipse cx="276" cy="203" rx="4.5" ry="2.2" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.5" />

          <path d="M 261 162 L 268 162 L 267 202 L 262 202 Z" fill="url(#suitPants)" />
          <path d="M 272 162 L 279 162 L 278 202 L 273 202 Z" fill="url(#suitPants)" />
          <line x1="264.5" y1="166" x2="264.5" y2="200" stroke="#334155" strokeWidth="0.8" />
          <line x1="275.5" y1="166" x2="275.5" y2="200" stroke="#334155" strokeWidth="0.8" />

          <rect x="261" y="159" width="18" height="3.5" rx="1" fill="#0f172a" />
          <rect x="268.5" y="159.5" width="3" height="2.5" rx="0.5" fill="#f59e0b" />

          <polygon points="266,126 274,126 271,159 269,159" fill="#f8fafc" />
          <polygon points="269,129 271,129 271.5,147 270,150 268.5,147" fill="#06b6d4" />

          <path
            d="M 261 126 C 258 135 259 148 261 160 L 269 160 L 266 126 Z"
            fill="url(#suitJacket)"
            stroke="#312e81"
            strokeWidth="0.6"
          />
          <path
            d="M 279 126 C 282 135 281 148 279 160 L 271 160 L 274 126 Z"
            fill="url(#suitJacket)"
            stroke="#312e81"
            strokeWidth="0.6"
          />

          <path
            d="M 260 128 L 249 143 L 259 155"
            fill="none"
            stroke="#1e293b"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="260" cy="155" r="2.5" fill="#fed7aa" />

          <path
            d="M 280 128 L 291 143 L 281 155"
            fill="none"
            stroke="#1e293b"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="280" cy="155" r="2.5" fill="#fed7aa" />

          <rect x="267.5" y="121" width="5" height="6" rx="1" fill="#fed7aa" />

          <ellipse cx="270" cy="116" rx="5.5" ry="6.5" fill="#fed7aa" />

          <path
            d="M 264 115 C 264 108 276 108 276 113 C 276 114 274 116 272 113 C 270 110 266 112 264 115 Z"
            fill="#0f172a"
          />
        </g>
      </svg>
    </div>
  );
}
