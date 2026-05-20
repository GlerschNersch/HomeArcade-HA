import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5000');
  
  const getStarted = page.locator('button:has-text("Get started")');
  if (await getStarted.isVisible()) {
    await getStarted.click();
  }

  // Navigate to NES
  await page.click('text=NES');
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'nes_library.png', fullPage: true });
  
  // Also check "All Games"
  await page.click('text=All Games');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'all_games_library.png', fullPage: true });

  await browser.close();
})();
