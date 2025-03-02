const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const open = require("open");

// Path file kredensial OAuth dan token
const CREDENTIALS_PATH = "credentials.json";
const TOKEN_PATH = "token.json";
const BLOG_LIST_PATH = "cepotblog.txt";

// Scope untuk Blogger API
const SCOPES = ["https://www.googleapis.com/auth/blogger"];

// Fungsi untuk mendapatkan autentikasi OAuth
async function authenticate() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Cek apakah sudah ada token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  return await getNewToken(oAuth2Client);
}

// Fungsi untuk mendapatkan token OAuth baru
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log(`🔗 Buka link ini untuk login:\n${authUrl}`);
  await open(authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise((resolve) => rl.question("Masukkan kode autentikasi: ", resolve));
  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

  console.log("✅ Token berhasil disimpan.");
  return oAuth2Client;
}

// Fungsi untuk membuat blog baru
async function createBlog(auth, blogName) {
  const blogger = google.blogger({ version: "v3", auth });

  try {
    const response = await blogger.blogs.insert({
      requestBody: {
        name: blogName,
        description: `Blog otomatis bernama ${blogName}`,
        locale: { language: "id" },
      },
    });
    console.log(`✅ Blog berhasil dibuat: ${response.data.url}`);
  } catch (error) {
    console.error(`❌ Gagal membuat blog "${blogName}":`, error.message);
  }
}

// Fungsi utama untuk membaca daftar blog dan membuatnya
async function main() {
  try {
    const auth = await authenticate();
    const fileStream = fs.createReadStream(BLOG_LIST_PATH);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
      const blogName = line.trim();
      if (blogName) {
        await createBlog(auth, blogName);
      }
    }
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error.message);
  }
}

// Jalankan script
main();
