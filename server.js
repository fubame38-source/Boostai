const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function fallbackResult() {
  return {
    score: 60,
    verdict: "Orta Viral Potansiyel",
    verdictDesc: "Video ortalama performans gösterebilir.",
    metrics: [
      { name: "Hook Gücü", value: 60, level: "orta" },
      { name: "İzlenme Tutma", value: 55, level: "orta" },
      { name: "Tempo", value: 62, level: "orta" },
      { name: "Görsel Kalite", value: 70, level: "iyi" },
      { name: "CTA Gücü", value: 45, level: "zayıf" },
      { name: "Trend Uyumu", value: 58, level: "orta" }
    ],
    transcript: "Video içeriği doğrudan alınamadı. Bu nedenle genel bir analiz üretildi.",
    viralFactors: [
      { type: "pos", badge: "GÜÇ", text: "Görsel kalite potansiyeli var." },
      { type: "neg", badge: "SORUN", text: "Video içeriği doğrulanamadı." },
      { type: "neu", badge: "DİKKAT", text: "Gerçek analiz için açıklama veya transcript gerekir." }
    ],
    suggestions: [
      "Videonun ilk 3 saniyesini daha güçlü yap.",
      "Videoya altyazı ekle.",
      "Daha net bir CTA kullan.",
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
  <title>BoostAI</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0f0f18;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .box {
      width: 100%;
      max-width: 700px;
      background: #171723;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 24px;
    }
    h1 {
      margin-top: 0;
      margin-bottom: 8px;
    }
    p {
      color: #b7b7c9;
      margin-top: 0;
      margin-bottom: 16px;
    }
    input {
      width: 100%;
      padding: 14px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.08);
      background: #222232;
      color: white;
      margin-bottom: 12px;
    }
    button {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 10px;
      background: #7c5cfc;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .msg {
      margin-top: 14px;
      color: #ffb3b3;
      white-space: pre-wrap;
    }
    pre {
      margin-top: 16px;
      padding: 14px;
      border-radius: 10px;
      background: #11111a;
      border: 1px solid rgba(255,255,255,0.08);
      color: #d7d7e8;
      white-space: pre-wrap;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="box">
    <h1>🚀 BoostAI Viral Analyzer</h1>
    <p>Instagram / TikTok / YouTube linki yapıştır</p>
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

    const prompt =
      "Sen viral kısa video analiz uzmanısın. " +
      "Kullanıcının verdiği link: " + url + ". " +
      "Eğer videoyu doğrudan izleyemiyorsan bunu varsayımsal analiz olarak değerlendir. " +
      "Sadece geçerli JSON döndür. Şu formatı kullan: " +
      JSON.stringify({
        score: 65,
        verdict: "Orta Viral Potansiyel",
        verdictDesc: "Kısa açıklama",
        metrics: [
          { name: "Hook Gücü", value: 60, level: "orta" },
          { name: "İzlenme Tutma", value: 55, level: "orta" },
          { name: "Tempo", value: 62, level: "orta" },
          { name: "Görsel Kalite", value: 70, level: "iyi" },
          { name: "CTA Gücü", value: 45, level: "zayıf" },
          { name: "Trend Uyumu", value: 58, level: "orta" }
        ],
        transcript: "Kısa özet",
        viralFactors: [
          { type: "pos", badge: "GÜÇ", text: "Güçlü yön" },
          { type: "neg", badge: "SORUN", text: "Zayıf yön" },
          { type: "neu", badge: "DİKKAT", text: "Dikkat noktası" }
        ],
        suggestions: [
          "Öneri 1",
          "Öneri 2",
          "Öneri 3"
        ]
      });

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
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
      parsed = fallbackResult();
    }

    res.json(parsed);
  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    res.status(500).json({
      error: err && err.message ? err.message : "Analiz hatası"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("BoostAI server running on port " + PORT);
});
