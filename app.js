document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copyMarkdownBtn');

  const markdownContent = `# OSK0020

> Not a resume — just what I actually build, in my own words.

**Theme:** GitHub · **Style:** Detailed · **Status:** Student, AI-Powered Builder

---

## Header

Hi, I'm **OSK0020**. Student on summer break, building things because I like the challenge — AI does the typing, I do the deciding.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://www.gitskins.com/api/section/hero?username=OSK0020&theme=github-dark&mode=light" />
    <img src="https://www.gitskins.com/api/section/hero?username=OSK0020&theme=github-dark" alt="OSK0020 hero section" />
  </picture>
</p>

---

## About Me

No degree yet — just a student spending summer break building things at home because I genuinely like it. I "vibe code": AI is the executing arm, I'm the one steering. When an app I use hits a limit I don't like, I usually just rebuild my own version of it with AI — which is how I've ended up exposed to dozens of different systems and stacks.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://www.gitskins.com/api/section/about?username=OSK0020&theme=github-dark&mode=light" />
    <img src="https://www.gitskins.com/api/section/about?username=OSK0020&theme=github-dark" alt="OSK0020 about section" />
  </picture>
</p>

---

## Skills

Languages, frameworks, and the AI tools I actually vibe code with.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://www.gitskins.com/api/section/stack?username=OSK0020&theme=github-dark&mode=light" />
    <img src="https://www.gitskins.com/api/section/stack?username=OSK0020&theme=github-dark" alt="OSK0020 stack section" />
  </picture>
</p>

<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render" />
  <img src="https://img.shields.io/badge/Antigravity-4B0082?style=for-the-badge&logo=gemini&logoColor=white" alt="Antigravity" />
  <img src="https://img.shields.io/badge/Lovable-FF4B11?style=for-the-badge&logo=heart&logoColor=white" alt="Lovable" />
  <img src="https://img.shields.io/badge/UiPilot-000000?style=for-the-badge&logo=airplane&logoColor=white" alt="UiPilot" />
</div>

---

## GitHub Stats

GitSkins stat widgets using the **GitHub** dark theme.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://www.gitskins.com/api/section/stats?username=OSK0020&theme=github-dark&mode=light" />
    <img src="https://www.gitskins.com/api/section/stats?username=OSK0020&theme=github-dark" alt="OSK0020 stats section" />
  </picture>
</p>

---

## Projects

Highlights repositories as proof of work.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://www.gitskins.com/api/section/projects?username=OSK0020&theme=github-dark&mode=light" />
    <img src="https://www.gitskins.com/api/section/projects?username=OSK0020&theme=github-dark" alt="OSK0020 projects section" />
  </picture>
</p>

---

## Connect

Where to find me.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://www.gitskins.com/api/section/social?username=OSK0020&theme=github-dark&x=OSN_Reports&mode=light" />
    <img src="https://www.gitskins.com/api/section/social?username=OSK0020&theme=github-dark&x=OSN_Reports" alt="OSK0020 social section" />
  </picture>
</p>

<div align="center">
  <a href="https://x.com/OSN_Reports" target="_blank">
    <img src="https://img.shields.io/badge/X%20(Twitter)-000000?style=for-the-badge&logo=x&logoColor=white" alt="X/Twitter" />
  </a>
  &nbsp;&nbsp;
  <a href="https://t.me/OSN_Reports" target="_blank">
    <img src="https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" />
  </a>
</div>
`;

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(markdownContent);
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '✅ Copied to Clipboard!';
        copyBtn.style.borderColor = '#3fb950';
        copyBtn.style.color = '#3fb950';

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2500);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    });
  }
});
