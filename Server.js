const http = require("http");
const fs   = require("fs");
const path = require("path");

const PORT = 3000;

// ── Word lists ────────────────────────────────────────────
const WORDS_EASY = ["CAT", "DOG", "SUN", "HAT", "BUS", "CUP", "MAP", "JAR", "PEN", "BOX"];
const WORDS_HARD = ["JUNGLE", "PYRAMID", "WHISPER", "BLANKET", "CACTUS", "FROZEN", "MYSTERY", "LANTERN", "BLOSSOM", "GRAVITY"];

function pickWord(difficulty) {
  const list = difficulty === "hard" ? WORDS_HARD : WORDS_EASY;
  return list[Math.floor(Math.random() * list.length)];
}

// ── Work out the right Content-Type for static files ─────
function getContentType(filePath) {
  const ext = path.extname(filePath);
  const types = {
    ".html": "text/html",
    ".css":  "text/css",
    ".js":   "text/javascript",
  };
  return types[ext] || "text/plain";
}

// ── Server ────────────────────────────────────────────────
const server = http.createServer((req, res) => {

  // API route — GET /word?difficulty=easy
  if (req.url.startsWith("/word")) {
    const params     = new URL(req.url, `http://localhost:${PORT}`).searchParams;
    const difficulty = params.get("difficulty") || "easy";
    const word       = pickWord(difficulty);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ word }));
    return;
  }

  // Static files — serve index.html, style.css, script.js
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": getContentType(filePath) });
    res.end(data);
  });

});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});