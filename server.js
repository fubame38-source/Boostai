const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pulse - Viral Analiz</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#07070d;color:#ede9ff;font-family:'DM Sans',sans-serif;min-height:100vh}
.nav{display:flex;align-items:center;justify-content:space-between;padding:15px 24px;border-bottom:1px solid rgba(255,255,255,0.07)}
.logo{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;background:linear-gradient(135deg,#7c5cfc,#ff5fc4);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.badge{font-size:12px;background:rgba(124,92,252,.15);border:1px solid rgba(124,92,252,.3);color:#c4b5fd;padding:5px 14px;border-radius:100px;font-weight:600}
.wrap{max-width:820px;margin:0 auto;padding:30px 16px 80px}
h1{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(24px,5vw,46px);text-align:center;letter-spacing:-1.5px;line-height:1.1;margin-bottom:10px}
.grad{background:linear-gradient(135deg,#7c5cfc,#ff5fc4,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sub{text-align:center;color:#7a7894;font-size:15px;margin-bottom:28px;line-height:1.6}
.card{background:#0f0f18;border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:22px;margin-bottom:12px}
.label{font-size:11px;font-weight:700;color:#7a7894;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px}
.row{display:flex;gap:10px;flex-wrap:wrap}
input{flex:1;min-width:160px;background:#16161f;border:1px solid rgba(255,255,255,0.07);border-radius:11px;padding:13px 14px;font-size:14px;color:#ede9ff;font-family:'DM Sans',sans-serif;outline:none}
input:focus{border-color:rgba(124,92,252,.6)}
.btn{background:linear-gradient(135deg,#7c5cfc,#5a3de8);color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;padding:13px 26px;border-radius:12px;border:none;cursor:pointer;white-space:nowrap}
.hint{margin-top:11px;font-size:12px;color:#7a7894}
.err{background:rgba(255,95,95,.1);border:1px solid rgba(255,95,95,.3);border-radius:11px;padding:11px 15px;margin-top:13px;font-size:13px;color:#ffb3b3;display:none}
#loading{display:none;text-align:center;padding:50px 0}
.spin{width:56px;height:56px;border:3px solid rgba(124,92,252,.15);border-top-color:#7c5cfc;border-right-color:#ff5fc4;border-radius:50%;animation:spin .85s linear infinite;margin:0 auto 24px}
@keyframes spin{to{transform:rotate(360deg)}}
.steps{max-width:300px;margin:20px auto 0;text-align:left}
.step{display:flex;align-items:center;gap:10px;font-size:13px;margin-bottom:12px;color:#7a7894}
.step.active{color:#ede9ff}
.step.done{color:#22d47a}
.dot{width:7px;height:7px;border-radius:50%;background:#2a2a3a;flex-shrink:0}
.step.active .dot{background:#7c5cfc;animation:dp 1s ease-in-out infinite}
.step.done .dot{background:#22d47a}
@keyframes dp{0%,100%{transform:scale(1)}50%{transform:scale(1.7)}}
#result{display:none}
.score-wrap{background:linear-gradient(135deg,rgba(124,92,252,.15),rgba(255,95,196,.08));border:1px solid rgba(124,92,252,.25);border-radius:22px;padding:24px 28px;margin-bottom:13px;display:flex;align-items:center;gap:24px;flex-wrap:wrap}
.verdict{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(16px,3vw,26px);margin-bottom:8px;letter-spacing:-.5px}
.vdesc{color:#9490b8;font-size:14px;line-height:1.65}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-bottom:12px}
.bar-row{margin-bottom:13px}
.bar-label{display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px}
.bar-bg{height:6px;background:rgba(255,255,255,0.06);border-radius:99px}
.bar-fill{height:100%;border-radius:99px;transition:width 1.2s ease}
.factor{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;background:#16161f;border-radius:10px;margin-bottom:7px}
.fbadge{padding:2px 9px;border-radius:99px;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px}
.ftext{font-size:13px;color:#b8b4d0;line-height:1.6}
.sug{display:flex;gap:10px;padding:10px 12px;background:rgba(124,92,252,.07);border:1px solid rgba(124,92,252,.14);border-radius:10px;margin-bottom:7px}
.snum{width:22px;height:22px;background:#7c5cfc;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;color:#fff}
.stext{font-size:13px;color:#c4c0dc;line-height:1.55}
.reset-btn{width:100%;padding:13px;background:transparent;border:1px solid rgba(255,255,255,0.07);color:#7a7894;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;border-radius:11px;cursor:pointer;margin-top:16px}
</style>
</head>
<body>
<div class="nav"><div class="logo">Pulse</div><div class="badge">✦ Viral Analiz</div></div>
<div class="wrap">
  <h1>Videonu <span class="grad">Analiz Et</span></h1>
  <p class="sub">Instagram · TikTok · YouTube linki yapıştır</p>
  <div id="inputArea">
    <div class="card">
      <div class="label">Video URL</div>
      <div class="row">
        <input id="urlInput" type="url" placeholder="https://www.instagram.com/reel/..." />
        <button class="btn" onclick="analyze()">✦ Analiz Et</button>
      </div>
      <div class="err" id="errBox"></div>
      <div class="hint">💡 Instagram Reels · TikTok · YouTube Shorts</div>
    </div>
  </div>
  <div id="loading">
    <div class="spin"></div>
    <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:18px;margin-bottom:8px">Analiz ediliyor...</div>
    <div class="steps">
      <div class="step active" id="s0"><div class="dot"></div>Video alınıyor</div>
      <div class="step" id="s1"><div class="dot"></div>Transkript çıkarılıyor</div>
      <div class="step" id="s2"><div class="dot"></div>Faktörler analiz ediliyor</div>
      <div class="step" id="s3"><div class="dot"></div>Puan hesaplanıyor</div>
    </div>
  </div>
  <div id="result"></div>
</div>
<script>
let si;
function startSteps(){let i=0;si=setInterval(()=>{if(i>0)document.getElementById('s'+(i-1)).className='step done';if(i<4)document.getElementById('s'+i).className='step active';i++;if(i>4)clearInterval(si);},1200);}
async function analyze(){
  const url=document.getElementById('urlInput').value.trim();
  const err=document.getElementById('errBox');
  if(!url.startsWith('http')){err.style.display='block';err.textContent='Gecerli bir link girin';return;}
  err.style.display='none';
  document.getElementById('inputArea').style.display='none';
  document.getElementById('loading').style.display='block';
  startSteps();
  try{
    const res=await fetch('/analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});
    const d=await res.json();
    clearInterval(si);
    showResult(d);
  }catch(e){
    clearInterval(si);
    document.getElementById('loading').style.display='none';
    document.getElementById('inputArea').style.display='block';
    err.style.display='block';err.textContent='Hata: '+e.message;
  }
}
function showResult(d){
  document.getElementById('loading').style.display='none';
  const col=d.score>=70?'#22d47a':d.score>=40?'#ffc84a':'#ff5f5f';
  const C=2*Math.PI*52,off=C-(d.score/100)*C;
  const gr=l=>l==='iyi'?'linear-gradient(90deg,#22d47a,#00d4ff)':l==='zayif'?'linear-gradient(90deg,#ff5f5f,#ff3333)':'linear-gradient(90deg,#ffc84a,#ff9500)';
  const tc=l=>l==='iyi'?'#22d47a':l==='zayif'?'#ff5f5f':'#ffc84a';
  const bc=t=>t==='pos'?'rgba(34,212,122,.15)':t==='neg'?'rgba(255,95,95,.15)':'rgba(255,200,74,.15)';
  const fc=t=>t==='pos'?'#22d47a':t==='neg'?'#ff5f5f':'#ffc84a';
  document.getElementById('result').innerHTML=`
  <div class="score-wrap">
    <div style="position:relative;width:130px;height:130px;flex-shrink:0">
      <svg width="130" height="130" style="transform:rotate(-90deg)">
        <defs><linearGradient id="g1"><stop offset="0%" stop-color="#7c5cfc"/><stop offset="100%" stop-color="#ff5fc4"/></linearGradient></defs>
        <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="9"/>
        <circle cx="65" cy="65" r="52" fill="none" stroke="url(#g1)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:34px;color:${col};line-height:1">${d.score}</span>
        <span style="font-size:11px;color:#7a7894;margin-top:2px">/ 100</span>
      </div>
    </div>
    <div style="flex:1;min-width:170px"><div class="verdict" style="color:${col}">${d.verdict}</div><div class="vdesc">${d.verdictDesc}</div></div>
  </div>
  <div class="grid2">
    <div class="card"><div style="font-family:'Syne',sans-serif;font-weight:700;font-size:14px;margin-bottom:16px">📊 Performans Metrikleri</div>${(d.metrics||[]).map(m=>`<div class="bar-row"><div class="bar-label"><span style="color:#7a7894">${m.name}</span><span style="font-weight:700;color:${tc(m.level)}">${m.value}/100</span></div><div class="bar-bg"><div class="bar-fill" style="width:${m.value}%;background:${gr(m.level)}"></div></div></div>`).join('')}</div>
    <div class="card"><div style="font-family:'Syne',sans-serif;font-weight:700;font-size:14px;margin-bottom:12px">📝 Icerik Ozeti</div><div style="background:#16161f;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px;font-size:13px;line-height:1.75;color:#c4c0dc;max-height:200px;overflow-y:auto">${d.transcript}</div></div>
  </div>
  <div class="card" style="margin-bottom:12px"><div style="font-family:'Syne',sans-serif;font-weight:700;font-size:14px;margin-bottom:12px">🔥 Viral Faktorler</div>${(d.viralFactors||[]).map(f=>`<div class="factor"><span class="fbadge" style="background:${bc(f.type)};color:${fc(f.type)}">${f.badge}</span><div class="ftext">${f.text}</div></div>`).join('')}</div>
  <div class="card"><div style="font-family:'Syne',sans-serif;font-weight:700;font-size:14px;margin-bottom:12px">🚀 Oneriler</div>${(d.suggestions||[]).map((s,i)=>`<div class="sug"><div class="snum">${i+1}</div><div class="stext">${s}</div></div>`).join('')}</div>
  <button class="reset-btn" onclick="reset()">← Yeni Video Analiz Et</button>`;
  document.getElementById('result').style.display='block';
}
function reset(){
  document.getElementById('result').style.display='none';
  document.getElementById('result').innerHTML='';
  document.getElementById('inputArea').style.display='block';
  document.getElementById('urlInput').value='';
  for(let i=0;i<4;i++)document.getElementById('s'+i).className='step';
  document.getElementById('s0').className='step active';
}
document.getElementById('urlInput').addEventListener('keydown',e=>{if(e.key==='Enter')analyze()});
</script>
</body>
</html>`);
});

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
