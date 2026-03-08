const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get("/", (req, res) => res.json({ status: "Pulse API calisiyor" }));

app.post("/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL gerekli" });
  try {
    const analysis = await claudeAnalyze(url);
    res.json({ success: true, ...analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function claudeAnalyze(url) {
  const prompt = "Sen uzman bir sosyal medya viral icerik analistisin. Video URL: " + url + "\n\nTurkce viral analiz yap. Sadece su satirlari yaz:\n\nPUAN: 75\nKARAR: Yuksek Viral Potansiyel\nDEGERLENDIRME: 2-3 cumle.\nICERIK: Ozet.\nHOOK: 80\nTUTULMA: 65\nTEMPO: 70\nGORSEL: 75\nCTA: 50\nTREND: 85\nGUC1: Guclu yon.\nGUC2: Guclu yon.\nSORUN1: Sorun.\nSORUN2: Sorun.\nDIKKAT: Dikkat.\nONERI1: Oneri.\nONERI2: Oneri.\nONERI3: Oneri.\nONERI4: Oneri.\nONERI5: Oneri.";

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = msg.content[0].text;
  const get = (key) => {
    const re = new RegExp(key + ":\\s*(.+?)(?=\\n[A-Z0-9]+:|$)", "si");
    const m = raw.match(re);
    return (m ? m[1] : "").trim();
  };
  const num = (key) => {
    const n = parseInt((get(key).match(/\d+/) || ["60"])[0]);
    return Math.min(100, Math.max(0, isNaN(n) ? 60 : n));
  };
  const lv = (v) => v >= 70 ? "iyi" : v >= 40 ? "orta" : "zayif";
  const h=num("HOOK"),tu=num("TUTULMA"),te=num("TEMPO"),g=num("GORSEL"),c=num("CTA"),tr=num("TREND");

  return {
    score: num("PUAN"),
    verdict: get("KARAR") || "Orta Viral Potansiyel",
    verdictDesc: get("DEGERLENDIRME"),
    transcript: get("ICERIK"),
    metrics: [
      {name:"Hook Gucu",value:h,level:lv(h)},
      {name:"Izlenme Tutulma",value:tu,level:lv(tu)},
      {name:"Tempo",value:te,level:lv(te)},
      {name:"Gorsel Kalite",value:g,level:lv(g)},
      {name:"CTA Gucu",value:c,level:lv(c)},
      {name:"Trend Uyumu",value:tr,level:lv(tr)},
    ],
    viralFactors: [
      {type:"pos",badge:"GUC",text:get("GUC1")},
      {type:"pos",badge:"GUC",text:get("GUC2")},
      {type:"neg",badge:"SORUN",text:get("SORUN1")},
      {type:"neg",badge:"SORUN",text:get("SORUN2")},
      {type:"neu",badge:"DIKKAT",text:get("DIKKAT")},
    ],
    suggestions: [get("ONERI1"),get("ONERI2"),get("ONERI3"),get("ONERI4"),get("ONERI5")].filter(Boolean),
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Pulse API port " + PORT + " aktif"));
