const puppeteer = require('puppeteer');
const fs = require('fs');

const EMAIL = "emailkamu@gmail.com";  // Ganti dengan emailmu
const PASSWORD = "passwordmu";        // Ganti dengan passwordmu
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; // Sesuaikan dengan lokasi Chrome-mu

async function loginGoogle(page) {
    await page.goto("https://accounts.google.com/signin", { waitUntil: "networkidle2" });

    // Masukkan Email
    await page.type("#identifierId", EMAIL);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);

    // Masukkan Password
    await page.type("input[name='password']", PASSWORD);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(5000);

    console.log("✅ Berhasil login ke Google");
}

async function buatBlog(page, namaBlog, urlBlog) {
    try {
        await page.goto("https://www.blogger.com/");
        await page.waitForTimeout(3000);

        // Klik tombol "Buat Blog"
        await page.click("a[href*='create-blog']");
        await page.waitForTimeout(3000);

        // Isi Nama Blog
        await page.type("input[placeholder='Give your blog a name']", namaBlog);
        await page.keyboard.press("Enter");
        await page.waitForTimeout(3000);

        // Isi URL Blog
        await page.type("input[placeholder='Give your blog an address']", urlBlog);
        await page.keyboard.press("Enter");
        await page.waitForTimeout(3000);

        // Klik Selesai
        await page.click("button:contains('Finish')");
        await page.waitForTimeout(3000);

        console.log(`✅ Blog ${namaBlog} (${urlBlog}.blogspot.com) berhasil dibuat!`);
    } catch (error) {
        console.error(`❌ Gagal membuat blog ${namaBlog}:`, error);
    }
}

async function processFile() {
    const browser = await puppeteer.launch({ 
        headless: false,
        executablePath: CHROME_PATH, // Pakai Chrome yang kompatibel
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Tambahkan argumen jika perlu
    });

    const page = await browser.newPage();
    await loginGoogle(page);

    const data = fs.readFileSync('cepot.txt', 'utf8');
    const lines = data.split('\n');

    for (let line of lines) {
        if (!line.trim()) continue;
        const [namaBlog, urlBlog] = line.split('|');
        console.log(`🚀 Membuat blog: ${namaBlog} (${urlBlog}.blogspot.com)`);
        await buatBlog(page, namaBlog.trim(), urlBlog.trim());
    }

    await browser.close();
}

processFile();
