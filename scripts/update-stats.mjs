#!/usr/bin/env node
import fs from "fs";

const USERNAME = "OSK0020";
const STREAK_SVG_PATH = "streak-stats.svg";
const ACTIVITY_SVG_PATH = "activity-graph.svg";

async function fetchAndSaveSvg(url, outputPath) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/svg+xml,image/*,*/*"
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }

    const content = await res.text();
    if (content && content.includes("<svg")) {
      fs.writeFileSync(outputPath, content, "utf8");
      console.log(`Successfully generated ${outputPath} (${content.length} bytes)`);
    } else {
      console.warn(`Warning: Fetched content for ${outputPath} does not look like SVG`);
    }
  } catch (err) {
    console.error(`Error updating ${outputPath}:`, err.message);
  }
}

async function main() {
  const streakUrl = `https://streak-stats.demolab.com/?user=${USERNAME}&theme=dark&hide_border=true`;
  const activityUrl = `https://github-readme-activity-graph.vercel.app/graph?username=${USERNAME}&theme=react-dark&hide_border=true&area=true`;

  console.log("Updating local SVG stats cards...");
  await fetchAndSaveSvg(streakUrl, STREAK_SVG_PATH);
  await fetchAndSaveSvg(activityUrl, ACTIVITY_SVG_PATH);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
