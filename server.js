import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.get("/", (req,res)=>{
res.send(`
<html>
<head>
<title>BoostAI</title>
<style>
body{
font-family:sans-serif;
background:#0f0f18;
color:white;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
}
.box{
background:#1a1a25;
padding:40px;
border-radius:10px;
width:400px;
text-align:center;
}
input{
width:100%;
padding:10px;
margin-top:10px;
border-radius:5px;
border:none;
}
button{
margin-top:15px;
padding:10px;
width:100%;
background:#7c5cfc;
border:none;
color:white;
border-radius:5px;
font-weight:bold;
cursor:pointer;
}
pre{
text-align:left;
margin-top:20px;
white-space:pre-wrap;
}
</style>
</head>

<body>

<div class="box">

<h2>🚀 BoostAI Viral Analyzer</h2>

<input id="url" placeholder="Instagram / TikTok link">

<button onclick="analyze()">Analiz Et</button>

<pre id="result"></pre>

</div>

<script>

async function analyze(){

const url = document.getElementById("url").value

const res = await fetch("/analyze",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({url})
})

const data = await res.json()

document.getElementById("result").innerText = JSON.stringify(data,null,2)

}

</script>

</body>
</html>
`)
})

app.post("/analyze", async (req,res)=>{

try{

const {url} = req.body

const prompt = \`
Analyze this short form video and return JSON.

Video: \${url}

{
"score":number,
"verdict":"text",
"verdictDesc":"text"
}
\`

const msg = await anthropic.messages.create({
model:"claude-3-haiku-20240307",
max_tokens:500,
messages:[
{role:"user",content:prompt}
]
})

res.json(JSON.parse(msg.content[0].text))

}catch(e){

res.json({
score:60,
verdict:"Orta Viral Potansiyel",
verdictDesc:"Video ortalama performans gösterebilir"
})

}

})

app.listen(3000,()=>{
console.log("server running")
})
