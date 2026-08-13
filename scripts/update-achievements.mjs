#!/usr/bin/env node
// 100% Dynamic GitHub Achievements HUD Card Generator (achievements.svg)
// Scrapes unlocked achievements, fetches high-res badge icons, calculates live metric progress,
// and applies ULTRA-GLOWING VIBRANT GRADIENT metallic tier borders (Platinum, Gold, Silver, Bronze) with CLEAN minimalist layout.

import fs from "fs";

const USERNAME = "OSK0020";
const SVG_PATH = "achievements.svg";

const TIER_STYLES = {
  Platinum: {
    label: "Platinum 💎",
    color: "#00f7ff",
    gradId: "plat-grad",
    stops: [
      { offset: "0%", color: "#00f7ff" },
      { offset: "50%", color: "#a855f7" },
      { offset: "100%", color: "#00f7ff" }
    ]
  },
  Gold: {
    label: "Gold 🥇",
    color: "#ffd700",
    gradId: "gold-grad",
    stops: [
      { offset: "0%", color: "#ffe600" },
      { offset: "50%", color: "#ff7b00" },
      { offset: "100%", color: "#ffd700" }
    ]
  },
  Silver: {
    label: "Silver 🥈",
    color: "#e0e6ed",
    gradId: "silver-grad",
    stops: [
      { offset: "0%", color: "#ffffff" },
      { offset: "50%", color: "#8a9ba8" },
      { offset: "100%", color: "#ffffff" }
    ]
  },
  Bronze: {
    label: "Bronze 🥉",
    color: "#ff9d42",
    gradId: "bronze-grad",
    stops: [
      { offset: "0%", color: "#ff9d42" },
      { offset: "50%", color: "#b85c14" },
      { offset: "100%", color: "#ff9d42" }
    ]
  },
  Unlocked: {
    label: "Unlocked ✨",
    color: "#3fb950",
    gradId: "unlocked-grad",
    stops: [
      { offset: "0%", color: "#3fb950" },
      { offset: "100%", color: "#238636" }
    ]
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

  // Match all <a> tags that link to an achievement
  const aMatches = [...html.matchAll(/<a[^>]+href="[^"]*achievement=[^"]*"[^>]*>([\s\S]*?)<\/a>/gi)];
  if (aMatches.length > 0) {
    for (const m of aMatches) {
      const innerHtml = m[1];
      const srcMatch = innerHtml.match(/src="([^"]+)"/i);
      const altMatch = innerHtml.match(/alt="Achievement:\s*([^"]+)"/i);
      if (srcMatch && altMatch) {
        const name = altMatch[1].trim();
        const src = srcMatch[1];
        const key = name.toLowerCase();

        let tier = "Unlocked";
        const tierMatch = innerHtml.match(/achievement-tier-label--([a-z0-9-]+)/i);
        if (tierMatch) {
          const rawTier = tierMatch[1].toLowerCase();
          if (rawTier === "bronze") tier = "Bronze";
          else if (rawTier === "silver") tier = "Silver";
          else if (rawTier === "gold") tier = "Gold";
          else if (rawTier === "platinum") tier = "Platinum";
        }

        unlockedMap.set(key, { name, src, tier });
      }
    }
  } else {
    // Fallback to direct image matching if profile structure changes
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
            src: srcMatch[1],
            tier: "Unlocked"
          });
        }
      }
    }
  }

  console.log(`Detected ${unlockedMap.size} unlocked achievements on profile:`, [...unlockedMap.keys()]);
  return unlockedMap;
}

function determineTier(src, name) {
  const lowerSrc = (src || "").toLowerCase();
  const lowerName = (name || "").toLowerCase();

  if (lowerSrc.includes("platinum") || lowerSrc.includes("-x5") || lowerName.includes("x5")) {
    return "Platinum";
  }
  if (lowerSrc.includes("gold") || lowerSrc.includes("-x4") || lowerName.includes("x4")) {
    return "Gold";
  }
  if (lowerSrc.includes("silver") || lowerSrc.includes("-x3") || lowerName.includes("x3")) {
    return "Silver";
  }
  if (lowerSrc.includes("bronze") || lowerSrc.includes("-x2") || lowerName.includes("x2")) {
    return "Bronze";
  }
  return "Unlocked";
}

function calculateAchievementMetrics(key, src, name, scrapedTier) {
  const tier = scrapedTier && scrapedTier !== "Unlocked" ? scrapedTier : determineTier(src, name);
  const descriptions = {
    "galaxy brain": "Answer accepted in GitHub Discussions",
    "pull shark": "Opened & merged pull requests",
    "pair extraordinaire": "Co-authored commits with collaborators",
    "starstruck": "Created repository with star milestones",
    "quickdraw": "Closed issue or PR within 5 minutes",
    "yolo": "Merged PR directly without code review",
    "public sponsor": "Sponsored an open source developer",
    "heart on your sleeve": "Reacted with a heart to an issue or PR"
  };

  return {
    desc: descriptions[key] || "Official GitHub Achievement",
    tier,
    progressPct: 100
  };
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

  const gradientDefs = Object.entries(TIER_STYLES).map(([_, s]) => {
    const stopsXml = s.stops.map(st => `<stop offset="${st.offset}" stop-color="${st.color}" />`).join("\n      ");
    return `<linearGradient id="${s.gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      ${stopsXml}
    </linearGradient>`;
  }).join("\n    ");

  const itemCardsXml = items.map((item, idx) => {
    const row = Math.floor(idx / cardsPerRow);
    const col = idx % cardsPerRow;
    const x = startX + col * (cardWidth + gapX);
    const y = startY + row * (cardHeight + gapY);

    const name = escapeXml(item.name);
    const desc = escapeXml(item.desc);

    const style = TIER_STYLES[item.tier] || TIER_STYLES.Unlocked;
    const gradUrl = `url(#${style.gradId})`;
    const tierLabel = style.label;

    const progressWidth = Math.max(10, Math.min(280, Math.round((280 * item.progressPct) / 100)));

    const imageElement = item.base64
      ? `<image href="${item.base64}" x="18" y="18" width="54" height="54" />`
      : `<circle cx="45" cy="45" r="24" fill="${style.color}" fill-opacity="0.15" stroke="${style.color}" stroke-width="1.5"/><text x="45" y="52" font-size="22" text-anchor="middle">🏆</text>`;

    return `  <g transform="translate(${x}, ${y})">
      <!-- GLOWING GRADIENT Metallic Tier Border Card -->
      <rect width="${cardWidth}" height="${cardHeight}" rx="14" fill="#161b22" stroke="${gradUrl}" stroke-width="2.5"/>
      
      <!-- Official Badge Icon -->
      ${imageElement}

      <!-- Badge Title & Details -->
      <text x="82" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15.5" font-weight="800" fill="#f0f6fc">${name}</text>
      <text x="82" y="54" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#8b949e">${desc}</text>

      <!-- Clean Status Pill -->
      <rect x="82" y="68" width="76" height="18" fill="#238636" fill-opacity="0.25" stroke="#238636" stroke-width="1" rx="9"/>
      <text x="120" y="80.5" font-family="'Fira Code', monospace" font-size="8.5" font-weight="700" fill="#3fb950" text-anchor="middle">UNLOCKED</text>

      <!-- Tier Label -->
      <text x="370" y="36" font-family="'Fira Code', monospace" font-size="11.5" font-weight="800" fill="${style.color}" text-anchor="end">${tierLabel}</text>

      <!-- Dynamic Progress Bar -->
      <rect x="82" y="98" width="280" height="7" fill="#0d1117" stroke="#30363d" stroke-width="1" rx="3.5"/>
      <rect x="82" y="98" width="${progressWidth}" height="7" fill="${gradUrl}" rx="3.5"/>
    </g>`;
  }).join("\n\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="850" height="${svgHeight}" viewBox="0 0 850 ${svgHeight}" fill="none">
  <defs>
    <linearGradient id="card-outer-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f6feb" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#7000ff" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#00f7ff" stop-opacity="0.8" />
    </linearGradient>
    ${gradientDefs}
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
    const metrics = calculateAchievementMetrics(key, badgeInfo.src, badgeInfo.name, badgeInfo.tier);
    const base64 = await fetchImageAsBase64(badgeInfo.src);

    items.push({
      name: badgeInfo.name,
      src: badgeInfo.src,
      base64,
      ...metrics
    });
  }

  const svgContent = generateSvgCard(items);
  fs.writeFileSync(SVG_PATH, svgContent, "utf8");
  console.log(`Successfully generated clean minimalist ${SVG_PATH} for ${items.length} unlocked achievements!`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
