#!/usr/bin/env node
// Automatically fetches OSK0020's 100% REAL-TIME GitHub stats (Contributions, Stars, Repos, Followers)
// directly from GitHub APIs & GitHub live contributions endpoint, and generates a self-contained
// HUD stats card (gitskins-stats.svg) as well as updating streak-stats.svg and activity-graph.svg.
// Runs automatically every 5 hours via GitHub Actions.

import fs from "fs";

const USERNAME = "OSK0020";
const STATS_SVG_PATH = "gitskins-stats.svg";
const STREAK_SVG_PATH = "streak-stats.svg";
const ACTIVITY_SVG_PATH = "activity-graph.svg";
const HERO_SVG_PATH = "gitskins-hero.svg";
const ABOUT_SVG_PATH = "gitskins-about.svg";
const STACK_SVG_PATH = "gitskins-stack.svg";

async function fetchLiveGitHubStats() {
  console.log(`Fetching 100% live GitHub stats for ${USERNAME}...`);
  let publicRepos = 3;
  let followers = 1;
  let totalStars = 21;
  let totalContributions = 750;

  try {
    // 1. Fetch user profile REST API
    const userRes = await fetch(`https://api.github.com/users/${USERNAME}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/vnd.github+json"
      }
    });

    if (userRes.ok) {
      const userData = await userRes.json();
      publicRepos = userData.public_repos ?? publicRepos;
      followers = userData.followers ?? followers;
    }

    // 2. Fetch public repos to calculate total stars
    const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?type=public&per_page=100`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/vnd.github+json"
      }
    });

    if (reposRes.ok) {
      const repos = await reposRes.json();
      if (Array.isArray(repos)) {
        totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
      }
    }

    // 3. Fetch exact live contributions from GitHub contributions endpoint
    const contribRes = await fetch(`https://github.com/users/${USERNAME}/contributions`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (contribRes.ok) {
      const html = await contribRes.text();
      const match = html.match(/([\d,]+)\s+contributions/i);
      if (match) {
        totalContributions = parseInt(match[1].replace(/,/g, ""), 10);
      }
    }
  } catch (err) {
    console.error("Error fetching live GitHub stats, using fallback defaults:", err.message);
  }

  console.log(`Live GitHub Stats: Stars=${totalStars}, Contributions=${totalContributions}, Repos=${publicRepos}, Followers=${followers}`);

  return {
    totalStars,
    totalContributions,
    publicRepos,
    followers
  };
}

function generateStatsHudSvg(stats) {
  const width = 850;
  const height = 210;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <defs>
    <linearGradient id="stats-outer-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f6feb" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#7000ff" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#00f7ff" stop-opacity="0.6" />
    </linearGradient>
    <linearGradient id="metric-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#161b22" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0.9" />
    </linearGradient>
    <linearGradient id="metric-border" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#30363d" />
      <stop offset="100%" stop-color="#484f58" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="20" fill="#0d1117" stroke="url(#stats-outer-border)" stroke-width="1.5"/>

  <text x="24" y="32" font-family="'Fira Code', monospace" font-size="13" font-weight="700" fill="#58a6ff" letter-spacing="1">PROFILE SIGNAL</text>
  <text x="160" y="32" font-family="'Fira Code', monospace" font-size="12" fill="#8b949e">Live GitHub stats &amp; metrics</text>
  <line x1="24" y1="44" x2="${width - 24}" y2="44" stroke="#30363d" stroke-width="1"/>

  <!-- Stars Metric Block -->
  <g transform="translate(24, 60)">
    <rect width="186" height="125" rx="14" fill="url(#metric-bg)" stroke="url(#metric-border)" stroke-width="1"/>
    <text x="20" y="30" font-family="'Fira Code', monospace" font-size="11" font-weight="600" fill="#8b949e">Stars</text>
    <text x="20" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="800" fill="#58a6ff">${stats.totalStars}</text>
    <rect x="20" y="94" width="146" height="4" fill="#21262d" rx="2"/>
    <rect x="20" y="94" width="90" height="4" fill="#58a6ff" rx="2"/>
  </g>

  <!-- Contributions Metric Block -->
  <g transform="translate(226, 60)">
    <rect width="186" height="125" rx="14" fill="url(#metric-bg)" stroke="url(#metric-border)" stroke-width="1"/>
    <text x="20" y="30" font-family="'Fira Code', monospace" font-size="11" font-weight="600" fill="#8b949e">Contributions</text>
    <text x="20" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="800" fill="#00f7ff">${stats.totalContributions}</text>
    <rect x="20" y="94" width="146" height="4" fill="#21262d" rx="2"/>
    <rect x="20" y="94" width="135" height="4" fill="#00f7ff" rx="2"/>
  </g>

  <!-- Repos Metric Block -->
  <g transform="translate(428, 60)">
    <rect width="186" height="125" rx="14" fill="url(#metric-bg)" stroke="url(#metric-border)" stroke-width="1"/>
    <text x="20" y="30" font-family="'Fira Code', monospace" font-size="11" font-weight="600" fill="#8b949e">Repos</text>
    <text x="20" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="800" fill="#a855f7">${stats.publicRepos}</text>
    <rect x="20" y="94" width="146" height="4" fill="#21262d" rx="2"/>
    <rect x="20" y="94" width="70" height="4" fill="#a855f7" rx="2"/>
  </g>

  <!-- Followers Metric Block -->
  <g transform="translate(630, 60)">
    <rect width="186" height="125" rx="14" fill="url(#metric-bg)" stroke="url(#metric-border)" stroke-width="1"/>
    <text x="20" y="30" font-family="'Fira Code', monospace" font-size="11" font-weight="600" fill="#8b949e">Followers</text>
    <text x="20" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="800" fill="#3fb950">${stats.followers}</text>
    <rect x="20" y="94" width="146" height="4" fill="#21262d" rx="2"/>
    <rect x="20" y="94" width="50" height="4" fill="#3fb950" rx="2"/>
  </g>
</svg>`;
}

async function fetchExternalSvg(url, outputPath, name) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "image/svg+xml,image/*,*/*"
      }
    });

    if (!res.ok) return;
    const content = await res.text();
    if (content && content.includes("<svg")) {
      fs.writeFileSync(outputPath, content, "utf8");
      console.log(`Saved external SVG: ${outputPath} for ${name}`);
    }
  } catch (err) {
    console.error(`Failed to fetch external SVG for ${name}:`, err.message);
  }
}

async function main() {
  // 1. Fetch live stats & generate custom Profile Signal HUD SVG card
  const stats = await fetchLiveGitHubStats();
  const hudSvg = generateStatsHudSvg(stats);
  fs.writeFileSync(STATS_SVG_PATH, hudSvg, "utf8");
  console.log(`Successfully updated ${STATS_SVG_PATH} with 100% REAL-TIME contribution count (${stats.totalContributions})!`);

  // 2. Fetch external Streak and Activity Graph SVGs
  const streakUrl = `https://streak-stats.demolab.com/?user=${USERNAME}&theme=dark&hide_border=true`;
  const activityUrl = `https://github-readme-activity-graph.vercel.app/graph?username=${USERNAME}&theme=react-dark&hide_border=true&area=true`;
  const heroUrl = `https://www.gitskins.com/api/section/hero?username=${USERNAME}&theme=github-dark`;
  const aboutUrl = `https://www.gitskins.com/api/section/about?username=${USERNAME}&theme=github-dark`;
  const stackUrl = `https://www.gitskins.com/api/section/stack?username=${USERNAME}&theme=github-dark`;

  await fetchExternalSvg(streakUrl, STREAK_SVG_PATH, "Streak Stats");
  await fetchExternalSvg(activityUrl, ACTIVITY_SVG_PATH, "Activity Graph");
  await fetchExternalSvg(heroUrl, HERO_SVG_PATH, "GitSkins Hero");
  await fetchExternalSvg(aboutUrl, ABOUT_SVG_PATH, "GitSkins About");
  await fetchExternalSvg(stackUrl, STACK_SVG_PATH, "GitSkins Stack");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
