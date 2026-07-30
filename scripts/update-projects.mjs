#!/usr/bin/env node
// Automatically fetches ALL public repositories of OSK0020 from GitHub REST API,
// and dynamically builds the custom HUD projects SVG card (projects.svg) as well as
// updating README.md. 100% automatic without any manual maintenance needed.

import fs from "fs";

const USERNAME = "OSK0020";
const README_PATH = "README.md";
const SVG_PATH = "projects.svg";
const START_MARKER = "<!-- PROJECTS:START -->";
const END_MARKER = "<!-- PROJECTS:END -->";

function escapeXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSvgCard(projects) {
  const cardsPerRow = 2;
  const cardWidth = 390;
  const cardHeight = 155;
  const gapX = 22;
  const gapY = 16;
  const startX = 24;
  const startY = 60;
  const rows = Math.ceil(projects.length / cardsPerRow);
  const svgHeight = startY + rows * (cardHeight + gapY) + 10;

  const projectCardsXml = projects.map((r, idx) => {
    const row = Math.floor(idx / cardsPerRow);
    const col = idx % cardsPerRow;
    const x = startX + col * (cardWidth + gapX);
    const y = startY + row * (cardHeight + gapY);

    const name = escapeXml(r.name);
    const desc = escapeXml(r.description ? r.description.trim() : "Public open-source repository.");
    const stars = r.stargazers_count || 0;
    const lang = escapeXml(r.language || "TypeScript");
    const dotColor = idx % 2 === 0 ? "#3fb950" : "#58a6ff";
    const dialGrad = idx % 2 === 0 ? "dial-grad-1" : "dial-grad-2";
    const percent = Math.min(98, 80 + (idx * 7) % 18);
    const offset = (163.3 * (100 - percent) / 100).toFixed(1);

    return `  <a href="${r.html_url}" target="_blank">
    <g transform="translate(${x}, ${y})">
      <rect width="${cardWidth}" height="${cardHeight}" rx="14" fill="url(#inner-card-bg)" stroke="url(#inner-card-border)" stroke-width="1"/>
      <circle cx="24" cy="24" r="4" fill="${dotColor}"/>
      <text x="36" y="28" font-family="'Fira Code', monospace" font-size="11" fill="#8b949e">${name}</text>
      <text x="24" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#f0f6fc">${name}</text>
      <text x="24" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#8b949e">${desc.length > 45 ? desc.substring(0, 42) + '...' : desc}</text>
      <rect x="24" y="112" width="85" height="22" fill="#21262d" rx="10"/>
      <text x="34" y="127" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#58a6ff">${lang}</text>
      <path d="M125 118l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#e3b341"/>
      <text x="137" y="127" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#8b949e">${stars} stars</text>

      <g transform="translate(325, 75)">
        <circle cx="0" cy="0" r="26" fill="none" stroke="#21262d" stroke-width="6"/>
        <circle cx="0" cy="0" r="26" fill="none" stroke-width="6" stroke-linecap="round" stroke="url(#${dialGrad})" stroke-dasharray="163.3" stroke-dashoffset="${offset}"/>
        <text x="0" y="4" font-family="'Fira Code', monospace" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">${percent}%</text>
      </g>
    </g>
  </a>`;
  }).join("\n\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="850" height="${svgHeight}" viewBox="0 0 850 ${svgHeight}" fill="none">
  <defs>
    <linearGradient id="proj-card-border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f6feb" stop-opacity="0.6" />
      <stop offset="50%" stop-color="#7000ff" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#00f7ff" stop-opacity="0.6" />
    </linearGradient>
    <linearGradient id="inner-card-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#161b22" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0.9" />
    </linearGradient>
    <linearGradient id="inner-card-border" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#30363d" />
      <stop offset="100%" stop-color="#484f58" />
    </linearGradient>
    <linearGradient id="dial-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7000ff" />
      <stop offset="100%" stop-color="#00f7ff" />
    </linearGradient>
    <linearGradient id="dial-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3fb950" />
      <stop offset="100%" stop-color="#00f7ff" />
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="846" height="${svgHeight - 4}" rx="20" fill="#0d1117" stroke="url(#proj-card-border)" stroke-width="1.5"/>

  <text x="24" y="32" font-family="'Fira Code', monospace" font-size="13" font-weight="700" fill="#58a6ff" letter-spacing="1">PROJECTS.LIST</text>
  <text x="160" y="32" font-family="'Fira Code', monospace" font-size="12" fill="#8b949e">./projects.sh --all</text>
  <text x="730" y="32" font-family="'Fira Code', monospace" font-size="12" fill="#8b949e">${projects.length} public</text>
  <line x1="24" y1="44" x2="826" y2="44" stroke="#30363d" stroke-width="1"/>

${projectCardsXml}
</svg>`;
}

async function main() {
  let headers = { "User-Agent": "readme-updater", Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  let res = await fetch(
    `https://api.github.com/users/${USERNAME}/repos?type=public&sort=updated&per_page=100`,
    { headers }
  );

  if (res.status === 401 && process.env.GITHUB_TOKEN) {
    delete headers.Authorization;
    res = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?type=public&sort=updated&per_page=100`,
      { headers }
    );
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  const repos = await res.json();

  const projects = repos
    .filter((r) => !r.fork && !r.archived && !r.private)
    .filter((r) => r.name.toLowerCase() !== USERNAME.toLowerCase())
    .sort((a, b) => b.stargazers_count - a.stargazers_count);

  if (projects.length === 0) {
    console.log("No public repositories found.");
    return;
  }

  const svgContent = generateSvgCard(projects);
  fs.writeFileSync(SVG_PATH, svgContent);
  console.log(`Successfully generated projects.svg with ${projects.length} public repositories: ${projects.map(p => p.name).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
