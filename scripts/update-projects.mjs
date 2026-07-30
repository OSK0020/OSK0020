#!/usr/bin/env node
// Regenerates the "Projects" section of README.md using ONLY repositories
// that are public, not forks, and not archived — pulled live from the
// GitHub REST API (which never returns private repos to unauthenticated
// requests, so this can't accidentally leak anything private).

import fs from "fs";

const USERNAME = "OSK0020";
const README_PATH = "README.md";
const START_MARKER = "<!-- PROJECTS:START -->";
const END_MARKER = "<!-- PROJECTS:END -->";

// Small style map so common languages get a matching badge color/logo/emoji.
// Anything not listed falls back to DEFAULT_STYLE.
const LANG_STYLE = {
  TypeScript: { color: "007ACC", logo: "typescript", emoji: "🤖" },
  JavaScript: { color: "F7DF1E", logo: "javascript", emoji: "⚡" },
  Python: { color: "3776AB", logo: "python", emoji: "🐍" },
  HTML: { color: "E34F26", logo: "html5", emoji: "🎨" },
  CSS: { color: "1572B6", logo: "css3", emoji: "🎨" },
  "C#": { color: "239120", logo: "csharp", emoji: "🛠️" },
  Java: { color: "007396", logo: "openjdk", emoji: "☕" },
  Go: { color: "00ADD8", logo: "go", emoji: "🐹" },
  Rust: { color: "000000", logo: "rust", emoji: "🦀" },
};
const DEFAULT_STYLE = { color: "6e7681", logo: "github", emoji: "📦" };

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
    // Retry without Authorization header if local token is invalid
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
    console.log("No public repositories found — leaving README untouched.");
    return;
  }

  const blocks = projects.map((r) => {
    const style = LANG_STYLE[r.language] || DEFAULT_STYLE;
    const desc = r.description ? r.description.trim() : "No description yet.";
    const langBadge = r.language
      ? ` ![${r.language}](https://img.shields.io/badge/${encodeURIComponent(
          r.language
        )}-${style.color}?style=for-the-badge&logo=${style.logo}&logoColor=white)`
      : "";

    return `### ${style.emoji} **[${r.name}](${r.html_url})**
> ${desc}

![Stars](https://img.shields.io/github/stars/${USERNAME}/${r.name}?style=for-the-badge&color=7000ff&logo=github)${langBadge}

<details>
<summary>⚡ <b>View Details</b></summary>

<br/>

- **Stack**: ${r.language || "N/A"}
- **Repository**: [github.com/${USERNAME}/${r.name}](${r.html_url})

</details>`;
  });

  const newSection = `${START_MARKER}\n<!-- Auto-generated — do not edit by hand. See .github/workflows/update-projects.yml -->\n\n${blocks.join(
    "\n\n<br/>\n\n"
  )}\n\n${END_MARKER}`;

  const readme = fs.readFileSync(README_PATH, "utf8");
  const pattern = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`);

  if (!pattern.test(readme)) {
    throw new Error("Could not find PROJECTS markers in README.md");
  }

  const updated = readme.replace(pattern, newSection);
  fs.writeFileSync(README_PATH, updated);
  console.log(`Updated README.md with ${projects.length} public repositories: ${projects.map(p => p.name).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
