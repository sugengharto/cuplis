const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");
const readline = require("readline");

async function createBlog(blogName, blogUrl) {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        await driver.get("https://www.blogger.com/");

        // Tunggu tombol "Buat Blog Baru" muncul
        let createBlogBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(text(),'Buat Blog')]")),
            10000
        );
        await createBlogBtn.click();

        await driver.sleep(2000);

        // Isi Nama Blog
        let blogNameField = await driver.findElement(By.name("title"));
        await blogNameField.sendKeys(blogName);

        // Isi URL Blog
        let blogUrlField = await driver.findElement(By.name("address"));
        await blogUrlField.sendKeys(blogUrl);

        await driver.sleep(2000);

        // Pilih tema pertama
        let themes = await driver.findElements(By.className("nqaJIf"));
        if (themes.length > 0) {
            await themes[0].click();
        }

        await driver.sleep(2000);

        // Klik tombol "Buat Blog"
        let createButton = await driver.findElement(By.xpath("//button[contains(text(),'Buat blog')]"));
        await createButton.click();

        console.log(`Blog "${blogName}" (${blogUrl}.blogspot.com) berhasil dibuat!`);

        await driver.sleep(5000);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await driver.quit();
    }
}

// Baca file cepot.txt dan buat blog satu per satu
async function start() {
    const fileStream = fs.createReadStream("cepot.txt");
    const rl = readline.createInterface({ input: fileStream });

    for await (const line of rl) {
        const [blogName, blogUrl] = line.split(",");
        if (blogName && blogUrl) {
            await createBlog(blogName.trim(), blogUrl.trim());
        }
    }
}

start();
