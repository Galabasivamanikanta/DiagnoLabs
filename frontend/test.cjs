const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
        console.log(`[Browser Console ${msg.type()}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        console.log(`[Browser Error] ${error.message}`);
    });
    
    try {
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
        console.log("Page loaded successfully.");
    } catch (e) {
        console.log("Failed to load page:", e.message);
    }
    
    await browser.close();
})();
