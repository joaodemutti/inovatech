// Exporta o logo EXISTENTE do InovaTech (tile gradiente + ícone "Activity"/pulso,
// o mesmo usado na Sidebar/Login) como asset SVG e como PNG quadrado para avatar.
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// ícone "Activity" do lucide (pulso) — o mesmo do app
const icon = `<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>`;

const svg = (rx) => `<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c3aed"/>
      <stop offset="1" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" rx="${rx}" fill="url(#g)"/>
  <g transform="translate(400 400) scale(20) translate(-12 -12)"
     fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${icon}
  </g>
</svg>`;

(async () => {
  // asset SVG (cantos arredondados, como no app)
  fs.writeFileSync(path.resolve('public/inovatech-logo.svg'), svg(180));

  // PNG quadrado full-bleed (sem cantos transparentes) — ideal p/ avatar do YouTube
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 2 });
  await page.setContent(`<style>*{margin:0;padding:0}html,body{width:800px;height:800px;overflow:hidden}</style>${svg(0)}`);
  await page.waitForTimeout(200);
  fs.mkdirSync('videos-demo', { recursive: true });
  await page.screenshot({ path: 'videos-demo/inovatech-logo.png' });
  await browser.close();
  console.log('OK -> public/inovatech-logo.svg  e  videos-demo/inovatech-logo.png (1600x1600)');
})();
