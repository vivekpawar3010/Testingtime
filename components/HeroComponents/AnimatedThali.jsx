"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedThali() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    // 10 seconds cycle: 6 seconds to fill, 4 seconds to show fully filled, then reset
    const interval = setInterval(() => {
      setCycle(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Food item animation variants
  const foodVariant = (delay) => ({
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 120, 
        damping: 14, 
        delay: delay 
      }
    }
  });

  return (
    <div className="relative flex items-center justify-center w-full max-w-[400px] aspect-square mx-auto select-none">
      {/* Decorative Outer Glow */}
      <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* SVG Container */}
      <svg 
        viewBox="0 0 400 400" 
        className="w-full h-full drop-shadow-2xl relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic Thali Gradients */}
          <linearGradient id="metalRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f0f0" />
            <stop offset="25%" stopColor="#b8b8b8" />
            <stop offset="50%" stopColor="#e8e8e8" />
            <stop offset="75%" stopColor="#969696" />
            <stop offset="100%" stopColor="#d5d5d5" />
          </linearGradient>
          
          <radialGradient id="plateInner" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="85%" stopColor="#d1d5db" />
            <stop offset="97%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#4b5563" />
          </radialGradient>

          <radialGradient id="katoriMetal" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#d8d8d8" />
            <stop offset="70%" stopColor="#9c9c9c" />
            <stop offset="100%" stopColor="#5c5c5c" />
          </radialGradient>

          {/* Food Gradients */}
          <radialGradient id="dalGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#facc15" /> {/* Light yellow */}
            <stop offset="70%" stopColor="#eab308" /> {/* Medium yellow */}
            <stop offset="100%" stopColor="#ca8a04" /> {/* Dark yellow/mustard */}
          </radialGradient>

          <radialGradient id="curryGradient" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f97316" /> {/* Light orange */}
            <stop offset="65%" stopColor="#ea580c" /> {/* Deep orange-red */}
            <stop offset="100%" stopColor="#9a3412" /> {/* Brownish red */}
          </radialGradient>

          <radialGradient id="cabbageGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a3e635" /> {/* Light lime */}
            <stop offset="75%" stopColor="#84cc16" /> {/* Green/Lime */}
            <stop offset="100%" stopColor="#4d7c0f" /> {/* Dark green */}
          </radialGradient>

          <radialGradient id="raitaGradient" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="80%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </radialGradient>

          {/* Shadow Filter */}
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. Base Steel Thali Plate */}
        <g id="thali-plate">
          {/* Rim */}
          <circle cx="200" cy="200" r="180" fill="url(#metalRim)" />
          {/* Inner Plate base */}
          <circle cx="200" cy="200" r="170" fill="url(#plateInner)" />
        </g>

        {/* 2. Empty Katoris (Steel Bowls) - Always present */}
        <g id="katoris" filter="url(#shadow)">
          {/* Katori 1: Top-Left (Dal) */}
          <circle cx="105" cy="115" r="38" fill="url(#katoriMetal)" />
          <circle cx="105" cy="115" r="35" fill="#374151" opacity="0.1" />

          {/* Katori 2: Top (Paneer Curry) */}
          <circle cx="200" cy="85" r="38" fill="url(#katoriMetal)" />
          <circle cx="200" cy="85" r="35" fill="#374151" opacity="0.1" />

          {/* Katori 3: Top-Right (Veggie Fry) */}
          <circle cx="295" cy="115" r="38" fill="url(#katoriMetal)" />
          <circle cx="295" cy="115" r="35" fill="#374151" opacity="0.1" />

          {/* Katori 4: Mid-Right (Raita) */}
          <circle cx="320" cy="210" r="34" fill="url(#katoriMetal)" />
          <circle cx="320" cy="210" r="31" fill="#374151" opacity="0.1" />

          {/* Katori 5: Bottom-Right (Rice) */}
          <circle cx="265" cy="295" r="42" fill="url(#katoriMetal)" />
          <circle cx="265" cy="295" r="39" fill="#374151" opacity="0.1" />
        </g>

        {/* 3. Animating Food Content (Refreshed on each cycle) */}
        <g key={cycle}>
          
          {/* Item 1: Yellow Dal (Top-Left Katori) */}
          <motion.g 
            variants={foodVariant(0.5)} 
            initial="hidden" 
            animate="visible"
          >
            {/* Dal Liquid */}
            <circle cx="105" cy="115" r="34" fill="url(#dalGradient)" />
            {/* Coriander/Garnish leaves */}
            <path d="M100,105 Q102,102 105,105 Q108,102 110,105" stroke="#16a34a" strokeWidth="1.5" fill="none" />
            <circle cx="102" cy="118" r="1.5" fill="#ca8a04" />
            <circle cx="112" cy="110" r="1.5" fill="#dc2626" /> {/* Mustard seed */}
            <circle cx="96" cy="112" r="1" fill="#111827" /> {/* Black mustard seed */}
          </motion.g>

          {/* Item 2: Paneer Masala Curry (Top Katori) */}
          <motion.g 
            variants={foodVariant(1.2)} 
            initial="hidden" 
            animate="visible"
          >
            {/* Gravy */}
            <circle cx="200" cy="85" r="34" fill="url(#curryGradient)" />
            {/* Paneer Cubes */}
            <rect x="185" y="75" width="12" height="12" rx="2" fill="#fffef0" transform="rotate(15 191 81)" filter="url(#shadow)" />
            <rect x="202" y="80" width="11" height="11" rx="2" fill="#fffef0" transform="rotate(-10 207 85)" filter="url(#shadow)" />
            <rect x="194" y="94" width="10" height="10" rx="2" fill="#fffef0" transform="rotate(45 199 99)" filter="url(#shadow)" />
            {/* Green chili slices / herbs */}
            <path d="M188,72 Q193,73 194,78" stroke="#22c55e" strokeWidth="2" fill="none" />
            <path d="M210,95 Q206,98 208,102" stroke="#22c55e" strokeWidth="1.5" fill="none" />
          </motion.g>

          {/* Item 3: Cabbage Veggie Fry (Top-Right Katori) */}
          <motion.g 
            variants={foodVariant(1.9)} 
            initial="hidden" 
            animate="visible"
          >
            {/* Veggie Base */}
            <circle cx="295" cy="115" r="34" fill="url(#cabbageGradient)" />
            {/* Green Peas / Cabbage shreds texture */}
            <circle cx="285" cy="105" r="3.5" fill="#15803d" />
            <circle cx="308" cy="120" r="3.5" fill="#15803d" />
            <circle cx="295" cy="128" r="3.5" fill="#15803d" />
            <path d="M280,122 L292,118 M290,102 L305,112 M300,128 L310,124" stroke="#facc15" strokeWidth="1.5" opacity="0.7" />
          </motion.g>

          {/* Item 4: Creamy Raita (Mid-Right Katori) */}
          <motion.g 
            variants={foodVariant(2.6)} 
            initial="hidden" 
            animate="visible"
          >
            {/* White curd */}
            <circle cx="320" cy="210" r="30" fill="url(#raitaGradient)" />
            {/* Cucumber/Mint sprinkle drops */}
            <circle cx="312" cy="204" r="2.5" fill="#4ade80" />
            <circle cx="328" cy="216" r="2" fill="#4ade80" />
            <circle cx="322" cy="200" r="2" fill="#4ade80" />
            <circle cx="314" cy="218" r="2.5" fill="#4ade80" />
            {/* Chili powder pinch */}
            <circle cx="320" cy="209" r="1" fill="#ef4444" />
            <circle cx="324" cy="206" r="1" fill="#ef4444" />
            <circle cx="316" cy="212" r="1.5" fill="#ea580c" />
          </motion.g>

          {/* Item 5: White Basmati Rice (Bottom-Right Large Katori) */}
          <motion.g 
            variants={foodVariant(3.3)} 
            initial="hidden" 
            animate="visible"
          >
            {/* Rice Mound Base */}
            <circle cx="265" cy="295" r="38" fill="#f9fafb" />
            {/* Rice grain texture dots */}
            <ellipse cx="255" cy="285" rx="3" ry="1.5" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" transform="rotate(25 255 285)" />
            <ellipse cx="275" cy="280" rx="3" ry="1.5" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" transform="rotate(-35 275 280)" />
            <ellipse cx="248" cy="300" rx="3" ry="1.5" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" transform="rotate(15 248 300)" />
            <ellipse cx="262" cy="290" rx="3" ry="1.5" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" transform="rotate(-10 262 290)" />
            <ellipse cx="270" cy="305" rx="3" ry="1.5" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" transform="rotate(45 270 305)" />
            <ellipse cx="282" cy="295" rx="3" ry="1.5" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" transform="rotate(-15 282 295)" />
            <ellipse cx="254" cy="312" rx="3" ry="1.5" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" transform="rotate(60 254 312)" />
            <ellipse cx="264" cy="320" rx="3" ry="1.5" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" transform="rotate(-50 264 320)" />
          </motion.g>

          {/* Item 6: Golden Folding Roti (Center-Left) */}
          <motion.g 
            variants={foodVariant(4.0)} 
            initial="hidden" 
            animate="visible"
            filter="url(#shadow)"
          >
            {/* Main folded flatbread shape */}
            <path 
              d="M100,230 C90,195 130,170 160,195 C185,215 175,260 145,275 C115,290 85,260 100,230 Z" 
              fill="#ebd0a7" 
            />
            {/* Inner folded layer detail */}
            <path 
              d="M105,232 C115,210 145,200 155,222 C160,235 140,265 125,260" 
              stroke="#dfc093" 
              strokeWidth="2" 
              fill="none" 
            />
            {/* Brown roasted spots */}
            <circle cx="118" cy="210" r="3" fill="#78350f" opacity="0.75" />
            <circle cx="132" cy="225" r="4.5" fill="#451a03" opacity="0.8" />
            <circle cx="124" cy="245" r="2.5" fill="#78350f" opacity="0.75" />
            <circle cx="148" cy="235" r="3.5" fill="#451a03" opacity="0.8" />
            <circle cx="140" cy="212" r="2" fill="#78350f" opacity="0.7" />
            <circle cx="152" cy="250" r="4" fill="#451a03" opacity="0.85" />
            <circle cx="112" cy="238" r="3.5" fill="#78350f" opacity="0.75" />
          </motion.g>

          {/* Item 7: Crispy Roasted Papadum (Center-Top, overlapping slightly) */}
          <motion.g 
            variants={foodVariant(4.8)} 
            initial="hidden" 
            animate="visible"
            filter="url(#shadow)"
          >
            {/* Papad base circle */}
            <circle cx="195" cy="180" r="36" fill="#fde047" opacity="0.9" />
            {/* Crispy black pepper / roasted brown dots */}
            <circle cx="178" cy="172" r="1.5" fill="#292524" />
            <circle cx="192" cy="162" r="1" fill="#78350f" />
            <circle cx="212" cy="170" r="1.5" fill="#292524" />
            <circle cx="188" cy="188" r="2" fill="#78350f" />
            <circle cx="205" cy="192" r="1.5" fill="#292524" />
            <circle cx="174" cy="185" r="1" fill="#78350f" />
            <circle cx="220" cy="182" r="2" fill="#292524" />
            <circle cx="200" cy="176" r="1.5" fill="#78350f" />
          </motion.g>

          {/* Item 8: Fresh Salad & Onion Garnish (Bottom-Left Rim) */}
          <motion.g 
            variants={foodVariant(5.5)} 
            initial="hidden" 
            animate="visible"
            filter="url(#shadow)"
          >
            {/* Red Onion rings */}
            <circle cx="92" cy="295" r="10" stroke="#c084fc" strokeWidth="3" fill="none" transform="rotate(15 92 295)" />
            <circle cx="92" cy="295" r="8" stroke="#ffffff" strokeWidth="1" fill="none" transform="rotate(15 92 295)" />
            
            <circle cx="82" cy="312" r="10" stroke="#c084fc" strokeWidth="3" fill="none" transform="rotate(-10 82 312)" />
            <circle cx="82" cy="312" r="8" stroke="#ffffff" strokeWidth="1" fill="none" transform="rotate(-10 82 312)" />

            {/* Cucumber slice */}
            <circle cx="106" cy="316" r="9" fill="#86efac" />
            <circle cx="106" cy="316" r="7" stroke="#22c55e" strokeWidth="1.5" fill="none" />
            <circle cx="104" cy="314" r="1" fill="#15803d" />
            <circle cx="108" cy="318" r="1" fill="#15803d" />
            <circle cx="108" cy="313" r="1" fill="#15803d" />

            {/* Lemon wedge */}
            <path d="M72,280 C65,292 80,300 84,288 Z" fill="#facc15" />
            <path d="M72,280 C65,292 80,300 84,288 Z" stroke="#eab308" strokeWidth="1" fill="none" />
          </motion.g>

        </g>
      </svg>
    </div>
  );
}
