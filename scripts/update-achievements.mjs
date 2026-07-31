#!/usr/bin/env node
// Automatically scrapes OSK0020's GitHub profile to detect ALL unlocked achievements,
// fetches their official high-res badge icons from GitHub CDN, encodes them as Base64 Data URIs,
// and generates a self-contained, 100% dynamic HUD achievements card (achievements.svg).
// ONLY displays achievements that have actually been UNLOCKED. Auto-discovers new unlocks every 5 hours.

import fs from "fs";

const USERNAME = "OSK0020";
const SVG_PATH = "achievements.svg";

// Catalogue of standard GitHub Achievements metadata
const ACHIEVEMENT_CATALOG = {
  "galaxy brain": {
    name: "Galaxy Brain",
    desc: "Answer accepted in GitHub Discussions",
    tier: "Gold",
    color: "#a855f7"
  },
  "yolo": {
    name: "YOLO",
    desc: "Merged PR directly without code review",
    tier: "Silver",
    color: "#ec4899"
  },
  "quickdraw": {
    name: "Quickdraw",
    desc: "Closed issue or PR within 5 minutes",
    tier: "Bronze",
    color: "#eab308"
  },
  "pull shark": {
    name: "Pull Shark",
    desc: "Opened & merged pull requests",
    tier: "Bronze",
    color: "#06b6d4"
  },
  "starstruck": {
    name: "Starstruck",
    desc: "Created repository with star milestones",
    tier: "Bronze",
    color: "#f43f5e"
  },
  "pair extraordinaire": {
    name: "Pair Extraordinaire",
    desc: "Co-authored commits with collaborators",
    tier: "Ongoing",
    color: "#10b981"
  },
  "public sponsor": {
    name: "Public Sponsor",
    desc: "Sponsoring open source projects",
    tier: "Gold",
    color: "#ea4c89"
  }
};

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchImageAsBase64(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/png,image/*"
      }
    });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error(`Failed to fetch image Base64 for ${url}:`, err.message);
    return null;
  }
}

async function scrapeProfileAchievements() {
  const profileUrl = `https://github.com/${USERNAME}`;
  console.log(`Scraping profile achievements from ${profileUrl}...`);

  const res = await fetch(profileUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to scrape profile: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const unlockedMap = new Map();

  const imgMatches = [...html.matchAll(/<img[^>]+>/gi)];
  for (const m of imgMatches) {
    const tag = m[0];
    if (tag.includes("githubassets.com/assets/")) {
      const srcMatch = tag.match(/src="([^"]+)"/i);
      const altMatch = tag.match(/alt="Achievement:\s*([^"]+)"/i);
      if (srcMatch && altMatch) {
        const name = altMatch[1].trim();
        const key = name.toLowerCase();
        unlockedMap.set(key, {
          name,
          src: srcMatch[1]
        });
      }
    }
  }

  console.log(`Detected ${unlockedMap.size} unlocked achievements on profile:`, [...unlockedMap.keys()]);
  return unlockedMap;
}

function generateSvgCard(items) {
  const cardsPerRow = 2;
  const cardWidth = 390;
  const cardHeight = 125;
  const gapX = 22;
  const gapY = 16;
  const startX = 24;
  const startY = 60;
  const rows = Math.max(1, Math.ceil(items.length / cardsPerRow));
  const svgHeight = startY + rows * (cardHeight + gapY) + 10;

  const itemCardsXml = items.map((item, idx) => {
    const row = Math.floor(idx / cardsPerRow);
    const col = idx % cardsPerRow;
    const x = startX + col * (cardWidth + gapX);
    const y = startY + row * (cardHeight + gapY);

    const name = escapeXml(item.name);
    const desc = escapeXml(item.desc);

    const imageElement = item.base64
      ? `<image href="${item.base64}" x="18" y="18" width="54" height="54" />`
      : `<circle cx="45" cy="45" r="24" fill="${item.color}" fill-opacity="0.15" stroke="${item.color}" stroke-width="1.5"/><text x="45" y="52" font-size="22" text-anchor="middle">🏆</text>`;

    return `  <g transform="translate(${x}, ${y})">
      <rect width="${cardWidth}" height="${cardHeight}" rx="14" fill="url(#card-bg)" stroke="url(#card-border)" stroke-width="1"/>
      
      <!-- Official Badge Icon -->
      ${imageElement}

      <!-- Badge Title & Details -->
      <text x="82" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#f0f6fc">${name}</text>
      <text x="82" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#8b949e">${desc}</text>

      <!-- Status Pill -->
      <rect x="82" y="74" width="82" height="20" fill="#238636" fill-opacity="0.25" stroke="#238636" stroke-width="1" rx="10"/>
      <text x="123" y="88" font-family="'Fira Code', monospace" font-size="9" font-weight="700" fill="#3fb950" text-anchor="middle">UNLOCKED</text>

      <!-- Tier Badge -->
      <text x="365" y="38" font-family="'Fira Code', monospace" font-size="10" font-weight="600" fill="${item.color}" text-anchor="end">${item.tier}</text>

      <!-- Progress Bar -->
      <rect x="82" y="104" width="280" height="6" fill="#21262d" rx="3"/>
      <rect x="82" y="104" width="280" height="6" fill="${item.color}" rx="3"/>
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
  <text x="730" y="32" font-family="'Fira Code', monospace" font-size="12" font-weight="700" fill="#3fb950">${items.length} UNLOCKED</text>
  <line x1="24" y1="44" x2="826" y2="44" stroke="#30363d" stroke-width="1"/>

${itemCardsXml}
</svg>`;
}

async function main() {
  const unlockedMap = await scrapeProfileAchievements();
  const items = [];

  for (const [key, badgeInfo] of unlockedMap.entries()) {
    const catalogItem = ACHIEVEMENT_CATALOG[key] || {
      name: badgeInfo.name,
      desc: "Official GitHub Achievement",
      tier: "Unlocked",
      color: "#58a6ff"
    };

    const base64 = await fetchImageAsBase64(badgeInfo.src);

    items.push({
      ...catalogItem,
      name: badgeInfo.name || catalogItem.name,
      isUnlocked: true,
      progress: 100,
      base64
    });
  }

  const svgContent = generateSvgCard(items);
  fs.writeFileSync(SVG_PATH, svgContent, "utf8");
  console.log(`Successfully generated ${SVG_PATH} containing ONLY the ${items.length} unlocked achievements!`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
