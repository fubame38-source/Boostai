const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function fallbackResult(url) {
  return {
    score: 58,
    verdict: "Orta Viral Potansiyel",
    verdictDesc: "Video içeriği doğrudan alınamadığı için genel bir tahmini analiz üretildi.",
    metrics: [
      { name: "Hook Gücü", value: 60, level: "orta" },
      { name: "İzlenme Tutma", value: 54, level: "orta" },
      { name: "Tempo", value: 57, level: "orta" },
      { name: "Görsel Kalite", value: 68, level: "iyi" },
      { name: "CTA Gücü", value: 42, level: "zayıf" },
      { name: "Trend Uyumu", value: 55, level: "orta" }
    ],
    transcript: "Video linki verildi ancak gerçek içerik doğrudan okunamadı: " + url,
    viralFactors: [
      { type: "pos", badge: "GÜÇ", text: "Kısa video formatı viral potansiyel taşır." },
      { type: "neg", badge: "SORUN", text: "Video içeriği doğrudan doğrulanamadı." },
      { type: "neu", badge: "DİKKAT", text: "Gerçek analiz için caption, transcript veya kısa açıklama gerekir." }
    ],
    suggestions: [
      "İlk 2 saniyede daha sert bir hook kullan.",
      "Videoya altyazı ekle.",
      "Daha net bir CTA yaz.",
      "Caption ve hedef kitle bilgisini ekle."
    ]
  };
}

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BoostAI Viral Analyzer</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0b0b14;
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .box {
      width: 100%;
      max-width: 760px;
      background: #171723;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.35);
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 38px;
      line-height: 1.1;
    }
    .sub {
      color: #b7b7c9;
      margin-bottom: 18px;
    }
    input {
      width: 100%;
      padding: 14px 16px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
      background: #222232;
      color: white;
      margin-bottom: 12px;
      font-size: 14px;
    }
    button {
      width: 100%;
      padding: 14px 16px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg,#7c5cfc,#8f6bff);
      color: white;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
    }
    button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .msg {
      margin-top: 14px;
      color: #ffb3b3;
      white-space: pre-wrap;
      min-height: 22px;
    }
    pre {
      margin-top: 16px;
      padding: 14px;
      border-radius: 12px;
      background: #11111a;
      border: 1px solid rgba(255,255,255,0.08);
      color: #d7d7e8;
      white-space: pre-wrap;
      overflow-x: auto;
      min-height: 140px;
    }
  </style>
</head>
<body>
  <div class="box">
    <h1>🚀 BoostAI Viral Analyzer</h1>
    <div class="sub">Instagram / TikTok / YouTube linki yapıştır</div>
    <input id="url" placeholder="https://www.instagram.com/reel/..." />
    <button id="btn" onclick="analyze()">Analiz Et</button>
    <div id="msg" class="msg"></div>
    <pre id="result"></pre>
  </div>

  <script>
    async function analyze() {
      const url = document.getElementById("url").value.trim();
      const btn = document.getElementById("btn");
      const msg = document.getElementById("msg");
      const result = document.getElementById("result");

      msg.textContent = "";
      result.textContent = "";

      if (!url || !url.startsWith("http")) {
        msg.textContent = "Geçerli bir link gir.";
        return;
      }

      btn.disabled = true;
      btn.textContent = "Analiz ediliyor...";

      try {
        const res = await fetch("/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Sunucu hatası");
        }

        result.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        msg.textContent = "Hata: " + err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = "Analiz Et";
      }
    }
  </script>
</body>
</html>
  `);
});

app.post("/analyze", async (req, res) => {
  try {
    const url = req.body && req.body.url ? String(req.body.url) : "";

    if (!url) {
      return res.status(400).json({ error: "URL gerekli" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "ANTHROPIC_API_KEY eksik" });
    }

    const prompt = `
Sen kısa video viral analiz uzmanısın.

Kullanıcının verdiği link:
${url}

Önemli kurallar:
- Videoyu doğrudan açamıyorsan bunu uydurma.
- Elinde sadece link varsa, tahmini ve dürüst analiz yap.
- Sadece geçerli JSON döndür.
- JSON dışında hiçbir şey yazma.

İstenen JSON formatı:
{
  "score": 0,
  "verdict": "metin",
  "verdictDesc": "metin",
  "metrics": [
    { "name": "Hook Gücü", "value": 0, "level": "zayıf" },
    { "name": "İzlenme Tutma", "value": 0, "level": "orta" },
    { "name": "Tempo", "value": 0, "level": "iyi" },
    { "name": "Görsel Kalite", "value": 0, "level": "iyi" },
    { "name": "CTA Gücü", "value": 0, "level": "zayıf" },
    { "name": "Trend Uyumu", "value": 0, "level": "orta" }
  ],
  "transcript": "kısa özet",
  "viralFactors": [
    { "type": "pos", "badge": "GÜÇ", "text": "güçlü yön" },
    { "type": "neg", "badge": "SORUN", "text": "zayıf yön" },
    { "type": "neu", "badge": "DİKKAT", "text": "dikkat noktası" }
  ],
  "suggestions": [
    "öneri 1",
    "öneri 2",
    "öneri 3",
    "öneri 4"
  ]
}
`;

    const msg = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const text =
      msg &&
      msg.content &&
      msg.content[0] &&
      msg.content[0].text
        ? msg.content[0].text
        : "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parsed = fallbackResult(url);
    }

    return res.json(parsed);
  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    return res.status(500).json({
      error: err && err.message ? err.message : "Analiz hatası"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("BoostAI server running on port " + PORT);
});
