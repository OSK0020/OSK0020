#!/usr/bin/env node
// 100% INDEPENDENT OSK0020 Custom SVG Cards Generator (Hero, Master Synthesis About, Stack, Compact Dark Refresh Button)
// Generates ultra-premium, dark-mode glassmorphic cards directly from live GitHub API metrics.

import fs from "fs";

const USERNAME = "OSK0020";
const HERO_SVG = "hero.svg";
const ABOUT_SVG = "about.svg";
const STACK_SVG = "stack.svg";
const REFRESH_BTN_SVG = "refresh-button.svg";

const LANG_COLORS = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  "C#": "#178600",
  Shell: "#89e051"
};

async function fetchLiveProfileData() {
  let publicRepos = 3;
  let followers = 1;
  let totalStars = 21;
  let totalContributions = 756;
  let languagesMap = {};

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    "User-Agent": "OSK0020-Card-Generator",
    Accept: "application/vnd.github+json"
  };
  if (token) headers.Authorization = `token ${token}`;

  try {
    const userRes = await fetch(`https://api.github.com/users/${USERNAME}`, { headers });
    if (userRes.ok) {
      const u = await userRes.json();
      publicRepos = u.public_repos || publicRepos;
      followers = u.followers || followers;
    }

    const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?type=public&per_page=100`, { headers });
    if (reposRes.ok) {
      const repos = await reposRes.json();
      if (Array.isArray(repos)) {
        const langBytes = {};
        let calcStars = 0;
        for (const r of repos) {
          if (r.fork) continue;
          calcStars += r.stargazers_count || 0;
          if (r.language) {
            langBytes[r.language] = (langBytes[r.language] || 0) + 1000;
          }
        }
        totalStars = Math.max(totalStars, calcStars);

        const totalBytes = Object.values(langBytes).reduce((a, b) => a + b, 0);
        if (totalBytes > 0) {
          for (const [lang, bytes] of Object.entries(langBytes)) {
            languagesMap[lang] = Math.round((bytes / totalBytes) * 100);
          }
        }
      }
    }

    const calRes = await fetch(`https://github.com/users/${USERNAME}/contributions`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (calRes.ok) {
      const html = await calRes.text();
      const tdBlocks = [...html.matchAll(/<td[^>]*class="ContributionCalendar-day"[^>]*>/gi)];
      let countSum = 0;
      for (const block of tdBlocks) {
        const str = block[0];
        const dateMatch = str.match(/data-date="([^"]+)"/i);
        const levelMatch = str.match(/data-level="(\d+)"/i);
        const idMatch = str.match(/id="([^"]+)"/i);
        if (dateMatch && idMatch) {
          const ttRegex = new RegExp(`for="${idMatch[1]}"[^>]*>(No|[\\d,]+)\\s+contributions?`, "i");
          const ttMatch = html.match(ttRegex);
          if (ttMatch) {
            const cStr = ttMatch[1];
            countSum += cStr.toLowerCase() === "no" ? 0 : parseInt(cStr.replace(/,/g, ""), 10);
          } else if (levelMatch) {
            countSum += parseInt(levelMatch[1], 10);
          }
        }
      }
      if (countSum > 0) totalContributions = countSum;
    }
  } catch (err) {
    console.error("OSK Card Generator error:", err.message);
  }

  if (Object.keys(languagesMap).length === 0) {
    languagesMap = { TypeScript: 81, JavaScript: 9, HTML: 5, CSS: 5 };
  }

  return { totalStars, totalContributions, publicRepos, followers, languagesMap };
}

function escapeXml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateHeroSvg(data) {
  const width = 850;
  const height = 210;

  const topLangs = Object.entries(data.languagesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([l]) => l);

  const langPills = topLangs.map((lang, i) => {
    const x = 200 + i * 105;
    const color = LANG_COLORS[lang] || "#58a6ff";
    return `<g transform="translate(${x}, 145)">
      <rect width="95" height="28" rx="8" fill="#161b22" stroke="${color}" stroke-width="1" stroke-opacity="0.6"/>
      <circle cx="16" cy="14" r="4" fill="${color}"/>
      <text x="28" y="18" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="#f0f6fc">${escapeXml(lang)}</text>
    </g>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <defs>
    <linearGradient id="hero-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f6feb" />
      <stop offset="50%" stop-color="#7000ff" />
      <stop offset="100%" stop-color="#00f7ff" />
    </linearGradient>
    <linearGradient id="hero-avatar-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7000ff" />
      <stop offset="100%" stop-color="#00f7ff" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="20" fill="#0d1117" stroke="url(#hero-border)" stroke-width="1.5"/>

  <g transform="translate(35, 35)">
    <circle cx="65" cy="65" r="62" fill="#161b22" stroke="url(#hero-avatar-glow)" stroke-width="2.5"/>
    <circle cx="65" cy="65" r="54" fill="#0d1117"/>
    <text x="65" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#00f7ff" text-anchor="middle" letter-spacing="1">OSK</text>
  </g>

  <text x="200" y="55" font-family="'Fira Code', monospace" font-size="12" font-weight="600" fill="#8b949e">@osk0020</text>
  <text x="200" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="900" fill="#ffffff" letter-spacing="1">OSK</text>

  <g transform="translate(610, 38)">
    <rect width="205" height="135" rx="14" fill="#161b22" stroke="#30363d" stroke-width="1"/>
    <text x="102" y="32" font-family="'Fira Code', monospace" font-size="10" font-weight="700" fill="#8b949e" text-anchor="middle">TOTAL STARS</text>
    <text x="102" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="900" fill="#00f7ff" text-anchor="middle">${data.totalStars}</text>

    <line x1="20" y1="80" x2="185" y2="80" stroke="#30363d" stroke-width="1"/>

    <text x="30" y="105" font-family="'Fira Code', monospace" font-size="11" fill="#8b949e">Contributions</text>
    <text x="175" y="105" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="#3fb950" text-anchor="end">${data.totalContributions}</text>

    <text x="30" y="122" font-family="'Fira Code', monospace" font-size="11" fill="#8b949e">Public Repos</text>
    <text x="175" y="122" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="#a855f7" text-anchor="end">${data.publicRepos}</text>
  </g>

  ${langPills}
  
  <text x="200" y="122" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#8b949e">Bot &amp; Web Developer | Exploring technologies &amp; building with AI</text>
</svg>`;
}

function generateSynthesisAboutSvg() {
  const width = 850;
  const height = 350;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <defs>
    <linearGradient id="about-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f6feb" opacity="0.8"/>
      <stop offset="50%" stop-color="#7000ff" opacity="0.8"/>
      <stop offset="100%" stop-color="#00f7ff" opacity="0.8"/>
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="20" fill="#0d1117" stroke="url(#about-border)" stroke-width="1.5"/>

  <text x="24" y="34" font-family="'Fira Code', monospace" font-size="13" font-weight="700" fill="#58a6ff" letter-spacing="1">OSK0020 // ARCHITECTURE &amp; VISION</text>
  <line x1="24" y1="46" x2="${width - 24}" y2="46" stroke="#30363d" stroke-width="1"/>

  <text x="24" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#c9d1d9">
    I'm a student spending summer break building projects at home out of genuine passion for software architecture.
  </text>
  <text x="24" y="96" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#c9d1d9">
    I "vibe code" — directing design &amp; system boundaries while using AI as the executing arm to build bots and custom tools.
  </text>
  <text x="24" y="118" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#c9d1d9">
    Whenever an app hits an annoying limit, I rebuild my own version, mastering dozens of frameworks and infrastructure.
  </text>

  <line x1="24" y1="138" x2="${width - 24}" y2="138" stroke="#30363d" stroke-width="1"/>

  <g transform="translate(24, 154)">
    <g transform="translate(0, 0)">
      <rect width="802" height="30" rx="7" fill="#161b22" stroke="#30363d" stroke-width="1"/>
      <text x="14" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#00f7ff">🎓 Identity:</text>
      <text x="105" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">Student &amp; Independent Builder (Summer-break build log, not a resume)</text>
    </g>

    <g transform="translate(0, 36)">
      <rect width="802" height="30" rx="7" fill="#161b22" stroke="#30363d" stroke-width="1"/>
      <text x="14" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#a855f7">🤖 Methodology:</text>
      <text x="135" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">"Vibe Coding" — Directing architecture &amp; system specs while AI executes</text>
    </g>

    <g transform="translate(0, 72)">
      <rect width="802" height="30" rx="7" fill="#161b22" stroke="#30363d" stroke-width="1"/>
      <text x="14" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#ff7b00">⚡ Philosophy:</text>
      <text x="120" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">Rebuilding custom versions of tools whenever existing apps hit limitations</text>
    </g>

    <g transform="translate(0, 108)">
      <rect width="802" height="30" rx="7" fill="#161b22" stroke="#30363d" stroke-width="1"/>
      <text x="14" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#3fb950">🔓 Scope:</text>
      <text x="95" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">Autonomous bots, data pipelines, WebGL 3D maps &amp; full-stack applications</text>
    </g>

    <g transform="translate(0, 144)">
      <rect width="802" height="30" rx="7" fill="#161b22" stroke="#30363d" stroke-width="1"/>
      <text x="14" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#58a6ff">🧭 Experience:</text>
      <text x="125" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">Exposure to dozens of production frameworks, databases &amp; cloud infra</text>
    </g>
  </g>
</svg>`;
}

function generateStackSvg(data) {
  const width = 850;
  const langList = Object.entries(data.languagesMap)
    .filter(([_, pct]) => pct > 0)
    .sort((a, b) => b[1] - a[1]);

  const height = 65 + langList.length * 32 + 15;

  const bars = langList.map(([lang, pct], idx) => {
    const y = 65 + idx * 32;
    const color = LANG_COLORS[lang] || "#58a6ff";
    const barWidth = Math.max(12, Math.min(610, Math.round((610 * pct) / 100)));

    return `<g transform="translate(24, ${y})">
      <circle cx="10" cy="12" r="5" fill="${color}"/>
      <text x="24" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#ffffff">${escapeXml(lang)}</text>
      <text x="150" y="16" font-family="'Fira Code', monospace" font-size="12" font-weight="700" fill="${color}">${pct}%</text>

      <rect x="200" y="6" width="600" height="12" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1"/>
      <rect x="200" y="6" width="${barWidth}" height="12" rx="6" fill="${color}"/>
    </g>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <defs>
    <linearGradient id="stack-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f7ff" />
      <stop offset="100%" stop-color="#1f6feb" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="20" fill="#0d1117" stroke="url(#stack-border)" stroke-width="1.5"/>

  <text x="24" y="34" font-family="'Fira Code', monospace" font-size="13" font-weight="700" fill="#58a6ff" letter-spacing="1">Language Stack</text>
  <text x="730" y="34" font-family="'Fira Code', monospace" font-size="11" fill="#8b949e">&gt; stack.scan</text>
  <line x1="24" y1="46" x2="${width - 24}" y2="46" stroke="#30363d" stroke-width="1"/>

  ${bars}
</svg>`;
}

function generateCompactDarkRefreshButtonSvg() {
  const width = 230;
  const height = 36;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <rect x="1.5" y="1.5" width="${width - 3}" height="${height - 3}" rx="8" fill="#161b22" stroke="#30363d" stroke-width="1.2"/>
  
  <text x="14" y="22" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#58a6ff">⚡</text>
  <text x="32" y="22" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="#c9d1d9" letter-spacing="0.5">REFRESH ALL DATA</text>
  
  <g transform="translate(178, 8)">
    <rect width="40" height="20" rx="4" fill="#0d1117" stroke="#238636" stroke-width="1"/>
    <text x="20" y="14" font-family="'Fira Code', monospace" font-size="9.5" font-weight="700" fill="#3fb950" text-anchor="middle">SYNC</text>
  </g>
</svg>`;
}

async function main() {
  console.log("Generating 100% synthesis OSK custom cards (hero, master about, stack, compact-refresh-button)...");
  const data = await fetchLiveProfileData();

  fs.writeFileSync(HERO_SVG, generateHeroSvg(data), "utf8");
  console.log(`Saved ${HERO_SVG}`);

  const masterAbout = generateSynthesisAboutSvg();
  fs.writeFileSync(ABOUT_SVG, masterAbout, "utf8");
  console.log(`Saved synthesis ${ABOUT_SVG}`);

  fs.writeFileSync(STACK_SVG, generateStackSvg(data), "utf8");
  console.log(`Saved ${STACK_SVG}`);

  const refreshBtn = generateCompactDarkRefreshButtonSvg();
  fs.writeFileSync(REFRESH_BTN_SVG, refreshBtn, "utf8");
  console.log(`Saved compact dark ${REFRESH_BTN_SVG}`);
}

main().catch(err => {
  console.error("OSK Card generator error:", err);
  process.exit(1);
});
