#!/usr/bin/env node
// Automatically fetches and updates all dynamic stats cards & GitSkins cards as local SVG files.
// Runs automatically every 5 hours via GitHub Actions.

import fs from "fs";

const USERNAME = "OSK0020";

const SVG_TARGETS = [
  {
    name: "Streak Stats",
    url: `https://streak-stats.demolab.com/?user=${USERNAME}&theme=dark&hide_border=true`,
    path: "streak-stats.svg"
  },
  {
    name: "Recent Activity Graph",
    url: `https://github-readme-activity-graph.vercel.app/graph?username=${USERNAME}&theme=react-dark&hide_border=true&area=true`,
    path: "activity-graph.svg"
  },
  {
    name: "GitSkins Hero",
    url: `https://www.gitskins.com/api/section/hero?username=${USERNAME}&theme=github-dark`,
    path: "gitskins-hero.svg"
  },
  {
    name: "GitSkins About",
    url: `https://www.gitskins.com/api/section/about?username=${USERNAME}&theme=github-dark`,
    path: "gitskins-about.svg"
  },
  {
    name: "GitSkins Stack",
    url: `https://www.gitskins.com/api/section/stack?username=${USERNAME}&theme=github-dark`,
    path: "gitskins-stack.svg"
  },
  {
    name: "GitSkins Stats",
    url: `https://www.gitskins.com/api/section/stats?username=${USERNAME}&theme=github-dark`,
    path: "gitskins-stats.svg"
  }
];

async function fetchAndSaveSvg(target) {
  try {
    const res = await fetch(target.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/svg+xml,image/*,*/*"
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${target.name}: ${res.status} ${res.statusText}`);
    }

    const content = await res.text();
    if (content && content.includes("<svg")) {
      fs.writeFileSync(target.path, content, "utf8");
      console.log(`Successfully generated ${target.path} (${content.length} bytes) for ${target.name}`);
    } else {
      console.warn(`Warning: Content for ${target.name} does not look like SVG`);
    }
  } catch (err) {
    console.error(`Error updating ${target.name}:`, err.message);
  }
}

async function main() {
  console.log("Updating all local SVG cards (Streak, Activity Graph & GitSkins)...");
  for (const target of SVG_TARGETS) {
    await fetchAndSaveSvg(target);
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
