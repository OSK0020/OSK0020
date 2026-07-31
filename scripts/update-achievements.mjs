#!/usr/bin/env node
// Automatically generates the custom HUD Achievements SVG card (achievements.svg)
// Matches the exact visual language of projects.svg in OSK0020 repository.

import fs from "fs";

const SVG_PATH = "achievements.svg";

const ACHIEVEMENTS_DATA = [
  {
    id: "galaxy-brain",
    name: "Galaxy Brain",
    icon: "🧠",
    desc: "Answer accepted in GitHub Discussions",
    status: "UNLOCKED",
    tier: "Gold",
    color: "#a855f7",
    progress: 100,
  },
  {
    id: "yolo",
    name: "YOLO",
    icon: "🔀",
    desc: "Merged PR directly without code review",
    status: "UNLOCKED",
    tier: "Silver",
    color: "#ec4899",
    progress: 100,
  },
  {
    id: "quickdraw",
    name: "Quickdraw",
    icon: "🤠",
    desc: "Closed issue or PR within 5 minutes",
    status: "UNLOCKED",
    tier: "Bronze",
    color: "#eab308",
    progress: 100,
  },
  {
    id: "pull-shark",
    name: "Pull Shark",
    icon: "🦈",
    desc: "Opened & merged pull requests",
    status: "UNLOCKED",
    tier: "Bronze",
    color: "#06b6d4",
    progress: 100,
  },
  {
    id: "starstruck",
    name: "Starstruck",
    icon: "⭐",
    desc: "Created repository with star milestones",
    status: "UNLOCKED",
    tier: "Bronze",
    color: "#f43f5e",
    progress: 100,
  },
  {
    id: "pair-extraordinaire",
    name: "Pair Extraordinaire",
    icon: "👯",
    desc: "Co-authored commits with collaborators",
    status: "IN PROGRESS",
    tier: "Ongoing",
    color: "#10b981",
    progress: 65,
  },
];

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSvgCard(items) {
  const cardsPerRow = 2;
  const cardWidth = 390;
  const cardHeight = 125;
  const gapX = 22;
  const gapY = 16;
  const startX = 24;
  const startY = 60;
  const rows = Math.ceil(items.length / cardsPerRow);
  const svgHeight = startY + rows * (cardHeight + gapY) + 10;

  const itemCardsXml = items.map((item, idx) => {
    const row = Math.floor(idx / cardsPerRow);
    const col = idx % cardsPerRow;
    const x = startX + col * (cardWidth + gapX);
    const y = startY + row * (cardHeight + gapY);

    const name = escapeXml(item.name);
    const desc = escapeXml(item.desc);
    const isUnlocked = item.status === "UNLOCKED";
    const statusBg = isUnlocked ? "#238636" : "#1f6feb";
    const statusText = isUnlocked ? "UNLOCKED" : "IN PROGRESS";

    return `  <g transform="translate(${x}, ${y})">
      <rect width="${cardWidth}" height="${cardHeight}" rx="14" fill="url(#card-bg)" stroke="url(#card-border)" stroke-width="1"/>
      
      <!-- Icon Glow Circle -->
      <circle cx="45" cy="45" r="24" fill="${item.color}" fill-opacity="0.15" stroke="${item.color}" stroke-width="1.5"/>
      <text x="45" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="22" text-anchor="middle">${item.icon}</text>

      <!-- Badge Title & Details -->
      <text x="82" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#f0f6fc">${name}</text>
      <text x="82" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#8b949e">${desc}</text>

      <!-- Status Pill -->
      <rect x="82" y="74" width="${isUnlocked ? 82 : 98}" height="20" fill="${statusBg}" fill-opacity="0.25" stroke="${statusBg}" stroke-width="1" rx="10"/>
      <text x="${82 + (isUnlocked ? 41 : 49)}" y="88" font-family="'Fira Code', monospace" font-size="9" font-weight="700" fill="${isUnlocked ? "#3fb950" : "#58a6ff"}" text-anchor="middle">${statusText}</text>

      <!-- Tier Badge -->
      <text x="365" y="38" font-family="'Fira Code', monospace" font-size="10" font-weight="600" fill="${item.color}" text-anchor="end">${item.tier}</text>

      <!-- Progress Bar -->
      <rect x="82" y="104" width="280" height="6" fill="#21262d" rx="3"/>
      <rect x="82" y="104" width="${(280 * item.progress) / 100}" height="6" fill="${item.color}" rx="3"/>
    </g>`;
  }).join("\n\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="850" height="${svgHeight}" viewBox="0 0 850 ${svgHeight}" fill="none">
  <defs>
    <linearGradient id="card-outer-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f6feb" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#7000ff" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#00f7ff" stop-opacity="0.6" />
    </linearGradient>
    <linearGradient id="card-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#161b22" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0.9" />
    </linearGradient>
    <linearGradient id="card-border" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#30363d" />
      <stop offset="100%" stop-color="#484f58" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="846" height="${svgHeight - 4}" rx="20" fill="#0d1117" stroke="url(#card-outer-border)" stroke-width="1.5"/>

  <text x="24" y="32" font-family="'Fira Code', monospace" font-size="13" font-weight="700" fill="#58a6ff" letter-spacing="1">ACHIEVEMENTS.HUD</text>
  <text x="175" y="32" font-family="'Fira Code', monospace" font-size="12" fill="#8b949e">./achievements.sh --status</text>
  <text x="710" y="32" font-family="'Fira Code', monospace" font-size="12" fill="#8b949e">${items.filter(i => i.status === "UNLOCKED").length}/${items.length} unlocked</text>
  <line x1="24" y1="44" x2="826" y2="44" stroke="#30363d" stroke-width="1"/>

${itemCardsXml}
</svg>`;
}

function main() {
  const svgContent = generateSvgCard(ACHIEVEMENTS_DATA);
  fs.writeFileSync(SVG_PATH, svgContent, "utf8");
  console.log(`Successfully generated ${SVG_PATH} matching projects.svg visual HUD theme!`);
}

main();
