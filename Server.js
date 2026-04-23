const http = require("http");
const fs   = require("fs");
const path = require("path");

const PORT = 3000;

// ── Word lists ────────────────────────────────────────────
const WORDS_EASY = [
  { word: "CAT",    category: "Animals"   },
  { word: "DOG",    category: "Animals"   },
  { word: "SUN",    category: "Nature"    },
  { word: "HAT",    category: "Clothing"  },
  { word: "BUS",    category: "Transport" },
  { word: "CUP",    category: "Objects"   },
  { word: "MAP",    category: "Objects"   },
  { word: "JAR",    category: "Objects"   },
  { word: "PEN",    category: "Objects"   },
  { word: "BOX",    category: "Objects"   },
  { word: "FISH",   category: "Animals"   },
  { word: "FROG",   category: "Animals"   },
  { word: "CAKE",   category: "Food"      },
  { word: "RAIN",   category: "Nature"    },
  { word: "BOOK",   category: "Objects"   },
  { word: "BIRD",   category: "Animals"   },
  { word: "BEAR",   category: "Animals"   },
  { word: "DUCK",   category: "Animals"   },
  { word: "LION",   category: "Animals"   },
  { word: "WOLF",   category: "Animals"   },
  { word: "TREE",   category: "Nature"    },
  { word: "LEAF",   category: "Nature"    },
  { word: "SNOW",   category: "Weather"   },
  { word: "WIND",   category: "Weather"   },
  { word: "FIRE",   category: "Nature"    },
  { word: "MILK",   category: "Food"      },
  { word: "RICE",   category: "Food"      },
  { word: "SOUP",   category: "Food"      },
  { word: "BREAD",  category: "Food"      },
  { word: "GRAPE",  category: "Food"      },
  { word: "CHAIR",  category: "Objects"   },
  { word: "TABLE",  category: "Objects"   },
  { word: "CLOCK",  category: "Objects"   },
  { word: "PHONE",  category: "Objects"   },
  { word: "PLANE",  category: "Transport" },
  { word: "TRAIN",  category: "Transport" },
  { word: "SHIRT",  category: "Clothing"  },
  { word: "SHOES",  category: "Clothing"  },
  { word: "GLOVE",  category: "Clothing"  },
  { word: "DANCE",  category: "Actions"   },
  { word: "SLEEP",  category: "Actions"   },
  { word: "SMILE",  category: "Actions"   },
  { word: "JUMP",   category: "Actions"   },
  { word: "DRUM",   category: "Music"     },
  { word: "FLUTE",  category: "Music"     },
  { word: "STAR",   category: "Nature"    },
  { word: "MOON",   category: "Nature"    },
  { word: "CLOUD",  category: "Weather"   },
  { word: "RIVER",  category: "Nature"    },
  { word: "OCEAN",  category: "Nature"    },
];

const WORDS_HARD = [
  { word: "JUNGLE",      category: "Nature"    },
  { word: "PYRAMID",     category: "History"   },
  { word: "WHISPER",     category: "Actions"   },
  { word: "BLANKET",     category: "Objects"   },
  { word: "CACTUS",      category: "Nature"    },
  { word: "FROZEN",      category: "Weather"   },
  { word: "MYSTERY",     category: "Concepts"  },
  { word: "LANTERN",     category: "Objects"   },
  { word: "BLOSSOM",     category: "Nature"    },
  { word: "GRAVITY",     category: "Science"   },
  { word: "TRUMPET",     category: "Music"     },
  { word: "GLACIER",     category: "Nature"    },
  { word: "PHANTOM",     category: "Concepts"  },
  { word: "ECLIPSE",     category: "Science"   },
  { word: "COMPASS",     category: "Objects"   },
  { word: "FORTRESS",    category: "History"   },
  { word: "SQUADRON",    category: "Military"  },
  { word: "LABYRINTH",   category: "Concepts"  },
  { word: "THRESHOLD",   category: "Concepts"  },
  { word: "AVALANCHE",   category: "Nature"    },
  { word: "SYMPOSIUM",   category: "Concepts"  },
  { word: "CROCODILE",   category: "Animals"   },
  { word: "SCORPION",    category: "Animals"   },
  { word: "FLAMINGO",    category: "Animals"   },
  { word: "ALBATROSS",   category: "Animals"   },
  { word: "JELLYFISH",   category: "Animals"   },
  { word: "PORCUPINE",   category: "Animals"   },
  { word: "WOLVERINE",   category: "Animals"   },
  { word: "BLIZZARD",    category: "Weather"   },
  { word: "HURRICANE",   category: "Weather"   },
  { word: "LIGHTNING",   category: "Weather"   },
  { word: "STALACTITE",  category: "Nature"    },
  { word: "WHIRLPOOL",   category: "Nature"    },
  { word: "QUICKSAND",   category: "Nature"    },
  { word: "XYLOPHONE",   category: "Music"     },
  { word: "ACCORDION",   category: "Music"     },
  { word: "SAXOPHONE",   category: "Music"     },
  { word: "SYMPHONY",    category: "Music"     },
  { word: "PERISCOPE",   category: "Objects"   },
  { word: "TELESCOPE",   category: "Science"   },
  { word: "MICROSCOPE",  category: "Science"   },
  { word: "HYPOTHESIS",  category: "Science"   },
  { word: "ALGORITHM",   category: "Science"   },
  { word: "BLUEPRINT",   category: "Objects"   },
  { word: "CATHEDRAL",   category: "History"   },
  { word: "COLOSSEUM",   category: "History"   },
  { word: "GLADIATOR",   category: "History"   },
  { word: "SAMURAI",     category: "History"   },
  { word: "PHARAOH",     category: "History"   },
  { word: "EXPEDITION",  category: "Concepts"  },
];

const WORDS_EXTREME = [
  { word: "PSYCHEDELIC",     category: "Concepts"  },
  { word: "MISCREANT",       category: "Concepts"  },
  { word: "SYCOPHANT",       category: "Concepts"  },
  { word: "JUXTAPOSITION",   category: "Concepts"  },
  { word: "EPHEMERAL",       category: "Concepts"  },
  { word: "QUINTESSENTIAL",  category: "Concepts"  },
  { word: "NEFARIOUS",       category: "Concepts"  },
  { word: "OBFUSCATE",       category: "Concepts"  },
  { word: "PERSPICACIOUS",   category: "Concepts"  },
  { word: "LOQUACIOUS",      category: "Concepts"  },
  { word: "MELLIFLUOUS",     category: "Concepts"  },
  { word: "PUSILLANIMOUS",   category: "Concepts"  },
  { word: "MAGNANIMOUS",     category: "Concepts"  },
  { word: "FLABBERGASTED",   category: "Emotions"  },
  { word: "DISCOMBOBULATE",  category: "Actions"   },
  { word: "KERFUFFLE",       category: "Concepts"  },
  { word: "SHENANIGANS",     category: "Concepts"  },
  { word: "BAMBOOZLE",       category: "Actions"   },
  { word: "HULLABALOO",      category: "Concepts"  },
  { word: "BROUHAHA",        category: "Concepts"  },
  { word: "HIGGLEDY",        category: "Concepts"  },
  { word: "TCHOTCHKE",       category: "Objects"   },
  { word: "DEFENESTRATE",    category: "Actions"   },
  { word: "CALLIPYGIAN",     category: "Concepts"  },
  { word: "ONOMATOPOEIA",    category: "Language"  },
  { word: "ANTIDISESTABLISH", category: "Language" },
  { word: "PNEUMONOULTRAMICROSCOPIC", category: "Science" },
  { word: "HIPPOPOTOMONSTROUS", category: "Concepts" },
  { word: "FLOCCINAUCINIHILIPILIFICATION", category: "Language" },
  { word: "SUPERCALIFRAGILISTIC", category: "Concepts" },
  { word: "VERISIMILITUDE",  category: "Language"  },
  { word: "SCHADENFREUDE",   category: "Emotions"  },
  { word: "WELTANSCHAUUNG",  category: "Concepts"  },
  { word: "ZEITGEIST",       category: "Concepts"  },
  { word: "POLTERGEIST",     category: "Concepts"  },
  { word: "PRESTIDIGITATION", category: "Actions"  },
  { word: "LIMERENCE",       category: "Emotions"  },
  { word: "SOLIPSISM",       category: "Concepts"  },
  { word: "PAREIDOLIA",      category: "Science"   },
  { word: "PETRICHOR",       category: "Nature"    },
  { word: "PHOSPHORESCENT",  category: "Science"   },
  { word: "BIOLUMINESCENCE", category: "Science"   },
  { word: "CONCATENATION",   category: "Science"   },
  { word: "SYNECDOCHE",      category: "Language"  },
  { word: "PLEONASM",        category: "Language"  },
  { word: "OXYMORON",        category: "Language"  },
  { word: "SESQUIPEDALIAN",  category: "Language"  },
  { word: "TINTINNABULATION", category: "Music"    },
  { word: "BORBORYGMUS",     category: "Science"   },
  { word: "CALLITHUMPIAN",   category: "Concepts"  },
];

function pickWord(difficulty) {
  const lists = { easy: WORDS_EASY, hard: WORDS_HARD, extreme: WORDS_EXTREME };
  const list = lists[difficulty] || WORDS_EASY;
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

const SCORES_FILE = path.join(__dirname, "scores.json");

function readScores() {
  try {
    return JSON.parse(fs.readFileSync(SCORES_FILE, "utf8"));
  } catch {
    return { wins: 0, losses: 0 };
  }
}

function writeScores(scores) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
}

// ── Server ────────────────────────────────────────────────
const server = http.createServer((req, res) => {

  // GET /score — return current scores
  if (req.method === "GET" && req.url === "/score") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(readScores()));
    return;
  }

  // POST /score — save updated scores
  if (req.method === "POST" && req.url === "/score") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      const scores = JSON.parse(body);
      writeScores(scores);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(scores));
    });
    return;
  }

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