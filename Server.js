const http = require("http");
const fs   = require("fs");
const path = require("path");

const PORT = 3000;

// ── Word lists ────────────────────────────────────────────
const WORDS_EASY = [
  { word: "CAT",    category: "Animals" },
  { word: "DOG",    category: "Animals" },
  { word: "SUN",    category: "Nature"  },
  { word: "HAT",    category: "Clothing" },
  { word: "BUS",    category: "Transport" },
  { word: "CUP",    category: "Objects" },
  { word: "MAP",    category: "Objects" },
  { word: "JAR",    category: "Objects" },
  { word: "PEN",    category: "Objects" },
  { word: "BOX",    category: "Objects" },
  { word: "FISH",   category: "Animals" },
  { word: "FROG",   category: "Animals" },
  { word: "CAKE",   category: "Food"    },
  { word: "RAIN",   category: "Nature"  },
  { word: "BOOK",   category: "Objects" },
];

const WORDS_HARD = [
  { word: "JUNGLE",   category: "Nature"    },
  { word: "PYRAMID",  category: "History"   },
  { word: "WHISPER",  category: "Actions"   },
  { word: "BLANKET",  category: "Objects"   },
  { word: "CACTUS",   category: "Nature"    },
  { word: "FROZEN",   category: "Weather"   },
  { word: "MYSTERY",  category: "Concepts"  },
  { word: "LANTERN",  category: "Objects"   },
  { word: "BLOSSOM",  category: "Nature"    },
  { word: "GRAVITY",  category: "Science"   },
  { word: "TRUMPET",  category: "Music"     },
  { word: "GLACIER",  category: "Nature"    },
  { word: "PHANTOM",  category: "Concepts"  },
  { word: "ECLIPSE",  category: "Science"   },
  { word: "COMPASS",  category: "Objects"   },
];

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
    const entry      = pickWord(difficulty);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ word: entry.word, category: entry.category }));
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