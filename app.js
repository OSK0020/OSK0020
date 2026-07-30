document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copyMarkdownBtn');

  const markdownContent = `# OSK0020

> Recruiter-friendly proof and contact path.

**Theme:** GitHub · **Style:** Detailed · **Agent:** Full-Stack Engineer

---

## Header

Hi, I'm **OSK0020**. Building scalable full-stack web applications and leveraging autonomous AI agent systems.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://www.gitskins.com/api/section/hero?username=OSK0020&theme=github-dark&mode=light" />
    <img src="https://www.gitskins.com/api/section/hero?username=OSK0020&theme=github-dark" alt="OSK0020 hero section" />
  </picture>
</p>

---

## About Me

Constantly pushing the boundaries of self-learning and technological exploration. My journey focuses on leveraging advanced AI tools and autonomous agents to accelerate development processes and build modern, scalable web solutions.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://www.gitskins.com/api/section/about?username=OSK0020&theme=github-dark&mode=light" />
    <img src="https://www.gitskins.com/api/section/about?username=OSK0020&theme=github-dark" alt="OSK0020 about section" />
  </picture>
</p>

---

## Skills

Selected stack and skill badges generated for full-stack engineering and tactical AI integration.

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

Connect via social channels and direct uplinks.

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
