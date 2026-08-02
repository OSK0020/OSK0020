#!/usr/bin/env node
// 100% INDEPENDENT OSK0020 Custom SVG Cards Generator (Hero, About, Bio, Stack)
// Generates ultra-premium, dark-mode glassmorphic cards directly from live GitHub API metrics.

import fs from "fs";

const USERNAME = "OSK0020";
const HERO_SVG = "hero.svg";
const ABOUT_SVG = "about.svg";
const BIO_SVG = "bio.svg";
const STACK_SVG = "stack.svg";

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

function generateAboutSvg() {
  const width = 850;
  const height = 180;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <defs>
    <linearGradient id="about-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7000ff" />
      <stop offset="100%" stop-color="#00f7ff" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="20" fill="#0d1117" stroke="url(#about-border)" stroke-width="1.5"/>

  <text x="24" y="34" font-family="'Fira Code', monospace" font-size="13" font-weight="700" fill="#58a6ff" letter-spacing="1">OSK0020 // ARCHITECTURE &amp; VISION</text>
  <line x1="24" y1="46" x2="${width - 24}" y2="46" stroke="#30363d" stroke-width="1"/>

  <g transform="translate(24, 62)">
    <rect width="390" height="42" rx="10" fill="#161b22" stroke="#30363d" stroke-width="1"/>
    <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#00f7ff">🎓 Student Builder</text>
    <text x="145" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">Summer-break build log, not a resume</text>
  </g>

  <g transform="translate(434, 62)">
    <rect width="390" height="42" rx="10" fill="#161b22" stroke="#30363d" stroke-width="1"/>
    <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#a855f7">🤖 Vibe Coding</text>
    <text x="135" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">I direct architecture, AI executes</text>
  </g>

  <g transform="translate(24, 116)">
    <rect width="390" height="42" rx="10" fill="#161b22" stroke="#30363d" stroke-width="1"/>
    <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#3fb950">⚡ Rebuild Custom</text>
    <text x="150" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">App hits a limit? I build my own version</text>
  </g>

  <g transform="translate(434, 116)">
    <rect width="390" height="42" rx="10" fill="#161b22" stroke="#30363d" stroke-width="1"/>
    <text x="16" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#ff7b00">🔓 Multi-System</text>
    <text x="145" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">Exposed to dozens of prod stacks</text>
  </g>
</svg>`;
}

function generateBioSvg() {
  const width = 850;
  const height = 360;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <defs>
    <linearGradient id="bio-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f6feb" opacity="0.8"/>
      <stop offset="50%" stop-color="#7000ff" opacity="0.8"/>
      <stop offset="100%" stop-color="#00f7ff" opacity="0.8"/>
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="20" fill="#0d1117" stroke="url(#bio-border)" stroke-width="1.5"/>

  <!-- Paragraph 1 -->
  <text x="28" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#c9d1d9" line-height="1.6">
    I'm a student — no degree, not even close, just someone who spends summer break building things at home
  </text>
  <text x="28" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#c9d1d9">
    because I genuinely like it. I don't come from a "professional dev" background; most of what I know, I picked up by doing.
  </text>

  <!-- Paragraph 2 -->
  <text x="28" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#c9d1d9">
    I like a good challenge, so I've built a handful of bots and small tools. I "vibe code" — AI is the executing arm,
  </text>
  <text x="28" y="120" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#c9d1d9">
    I'm the one steering: directing, reviewing, and deciding what ships. When an app I use hits a limit, I rebuild
  </text>
  <text x="28" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" fill="#c9d1d9">
    my own version with AI, dragging me through dozens of frameworks and infrastructure I'd never touch otherwise.
  </text>

  <line x1="28" y1="162" x2="${width - 28}" y2="162" stroke="#30363d" stroke-width="1"/>

  <!-- 5 Cyberpunk Highlight Items -->
  <g transform="translate(28, 178)">
    <!-- Item 1 -->
    <g transform="translate(0, 0)">
      <rect width="794" height="28" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1"/>
      <text x="14" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#00f7ff">🎓 Who I am:</text>
      <text x="110" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">Student, no degree yet — this is a summer-break build log, not a resume.</text>
    </g>

    <!-- Item 2 -->
    <g transform="translate(0, 34)">
      <rect width="794" height="28" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1"/>
      <text x="14" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#a855f7">🤖 What I build:</text>
      <text x="120" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">A few bots, small tools, and whatever solves a problem that's bugging me.</text>
    </g>

    <!-- Item 3 -->
    <g transform="translate(0, 68)">
      <rect width="794" height="28" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1"/>
      <text x="14" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#ff7b00">⚡ How I build:</text>
      <text x="120" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">I "vibe code" — I direct, AI executes. I'm the architect, not just a prompt-typer.</text>
    </g>

    <!-- Item 4 -->
    <g transform="translate(0, 102)">
      <rect width="794" height="28" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1"/>
      <text x="14" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#3fb950">🔓 Why I build:</text>
      <text x="120" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">App hits a limit I don't like? Instead of accepting it, I rebuild my own version.</text>
    </g>

    <!-- Item 5 -->
    <g transform="translate(0, 136)">
      <rect width="794" height="28" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1"/>
      <text x="14" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#58a6ff">🧭 What I've learned:</text>
      <text x="155" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">Rebuilding things myself is how I ended up exposed to dozens of systems &amp; prod stacks.</text>
    </g>
  </g>
</svg>`;
}

function generateStackSvg(data) {
  const width = 850;
  const height = 210;

  const langList = Object.entries(data.languagesMap)
    .filter(([_, pct]) => pct > 0)
    .sort((a, b) => b[1] - a[1]);

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

async function main() {
  console.log("Generating 100% independent OSK custom cards (hero, about, bio, stack)...");
  const data = await fetchLiveProfileData();

  fs.writeFileSync(HERO_SVG, generateHeroSvg(data), "utf8");
  console.log(`Saved ${HERO_SVG}`);

  fs.writeFileSync(ABOUT_SVG, generateAboutSvg(), "utf8");
  console.log(`Saved ${ABOUT_SVG}`);

  fs.writeFileSync(BIO_SVG, generateBioSvg(), "utf8");
  console.log(`Saved ${BIO_SVG}`);

  fs.writeFileSync(STACK_SVG, generateStackSvg(data), "utf8");
  console.log(`Saved ${STACK_SVG}`);
}

main().catch(err => {
  console.error("OSK Card generator error:", err);
  process.exit(1);
});
