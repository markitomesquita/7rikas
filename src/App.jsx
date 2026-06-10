import { useState, useEffect, useRef } from "react";
import markoBiraImg from "./assets/markobira.webp";

/* ─── FONTS & GLOBAL CSS ────────────────────────────────────────────────────── */
(() => {
  const l = document.createElement("link");
  l.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap";
  l.rel = "stylesheet"; document.head.appendChild(l);
  const s = document.createElement("style");
  s.textContent = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
    @keyframes confettiFall { to { transform: translateY(110vh) rotate(720deg); opacity:0; } }
    @keyframes slideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes popIn{0%{transform:scale(0.7);opacity:0}65%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
    @keyframes trophy{0%{transform:scale(0) rotate(-15deg);opacity:0}70%{transform:scale(1.1) rotate(3deg)}100%{transform:scale(1) rotate(0);opacity:1}}
    @keyframes goalSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
    @keyframes rerollSpin{0%{opacity:1;transform:scale(1) rotate(0)}40%{opacity:0;transform:scale(0.7) rotate(180deg)}60%{opacity:0;transform:scale(0.7) rotate(180deg)}100%{opacity:1;transform:scale(1) rotate(360deg)}}

    * { box-sizing: border-box; margin:0; padding:0; }
    body { background: #0A0A0A; }
    .fadeUp { animation: fadeUp 0.35s ease both; }
    .slideIn { animation: slideIn 0.3s ease both; }
    .popIn   { animation: popIn   .35s cubic-bezier(.34,1.56,.64,1) both; }
    .trophy  { animation: trophy  .55s cubic-bezier(.34,1.56,.64,1) both; }
    .goalSlide { animation: goalSlide .25s ease both; }
    .rerollSpin { animation: rerollSpin .5s ease both; }

    ::-webkit-scrollbar { width: 0px; }
  `;
  document.head.appendChild(s);
})();

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────────── */
const C = {
  bg:       "#0A0A0A",
  surface:  "#141414",
  surface2: "#1E1E1E",
  surface3: "#252525",
  red:      "#E8323A",
  redDim:   "#2A1012",
  redMid:   "#3D1518",
  white:    "#FFFFFF",
  ink:      "#F0F0F0",
  inkDim:   "#AAAAAA",
  muted:    "#666666",
  border:   "#242424",
  border2:  "#2E2E2E",
  yellow:   "#F5A623",
  gold:     "#C9A227",
  black:    "#000000",
  faint:    "#1A1A1A",
};

/* typography shortcuts */
const F = {
  display: "'Space Grotesk', sans-serif",
  body:    "'DM Sans', sans-serif",
};

/* ─── FORMATIONS ─────────────────────────────────────────────────────────────── */
const FORMATIONS = {
  "4-3-3":[
    {slot:"GOL",group:"GOL",x:50,y:87},{slot:"LD",group:"DEF",x:80,y:72},{slot:"ZAG",group:"DEF",x:62,y:74},
    {slot:"ZAG",group:"DEF",x:38,y:74},{slot:"LE",group:"DEF",x:20,y:72},{slot:"MD",group:"MID",x:76,y:52},
    {slot:"VOL",group:"MID",x:50,y:50},{slot:"ME",group:"MID",x:24,y:52},{slot:"CA",group:"ATK",x:76,y:26},
    {slot:"CA",group:"ATK",x:50,y:23},{slot:"CA",group:"ATK",x:24,y:26},
  ],
  "4-4-2":[
    {slot:"GOL",group:"GOL",x:50,y:87},{slot:"LD",group:"DEF",x:82,y:72},{slot:"ZAG",group:"DEF",x:62,y:74},
    {slot:"ZAG",group:"DEF",x:38,y:74},{slot:"LE",group:"DEF",x:18,y:72},{slot:"MD",group:"MID",x:82,y:52},
    {slot:"MC",group:"MID",x:62,y:50},{slot:"MC",group:"MID",x:38,y:50},{slot:"ME",group:"MID",x:18,y:52},
    {slot:"CA",group:"ATK",x:62,y:26},{slot:"CA",group:"ATK",x:38,y:26},
  ],
  "3-5-2":[
    {slot:"GOL",group:"GOL",x:50,y:87},{slot:"ZAG",group:"DEF",x:70,y:74},{slot:"ZAG",group:"DEF",x:50,y:76},
    {slot:"ZAG",group:"DEF",x:30,y:74},{slot:"MD",group:"MID",x:88,y:52},{slot:"VOL",group:"MID",x:68,y:52},
    {slot:"VOL",group:"MID",x:50,y:50},{slot:"VOL",group:"MID",x:32,y:52},{slot:"ME",group:"MID",x:12,y:52},
    {slot:"CA",group:"ATK",x:62,y:26},{slot:"CA",group:"ATK",x:38,y:26},
  ],
  "4-2-3-1":[
    {slot:"GOL",group:"GOL",x:50,y:87},{slot:"LD",group:"DEF",x:82,y:72},{slot:"ZAG",group:"DEF",x:62,y:74},
    {slot:"ZAG",group:"DEF",x:38,y:74},{slot:"LE",group:"DEF",x:18,y:72},{slot:"VOL",group:"MID",x:63,y:60},
    {slot:"VOL",group:"MID",x:37,y:60},{slot:"MD",group:"MID",x:80,y:40},{slot:"MC",group:"MID",x:50,y:37},
    {slot:"ME",group:"MID",x:20,y:40},{slot:"CA",group:"ATK",x:50,y:20},
  ],
};
const SLOT_ACCEPTS={
  GOL:["GOL"],LD:["LD","ZAG"],LE:["LE","ZAG"],ZAG:["ZAG","LD","LE"],
  VOL:["VOL","MC"],MC:["MC","VOL","MD","ME"],MD:["MD","MC","CA","ME"],ME:["ME","MC","CA","MD"],CA:["CA","ME","MD"],
};
const POS_COLOR={GOL:"#F5A623",LD:"#4A90D9",ZAG:"#4A90D9",LE:"#4A90D9",VOL:"#7B68EE",MC:"#7B68EE",MD:"#7B68EE",ME:"#7B68EE",CA:"#E8323A"};
function groupColor(g){if(g==="GOL")return"#F5A623";if(g==="DEF")return"#4A90D9";if(g==="MID")return"#7B68EE";return"#E8323A";}
function posToGroup(p){if(p==="GOL")return"GOL";if(p==="ZAG"||p==="LD"||p==="LE")return"DEF";if(p==="VOL"||p==="MC"||p==="MD"||p==="ME")return"MID";return"ATK";}
function assignToSlots(fm,players){
  const slots=FORMATIONS[fm]||FORMATIONS["4-3-3"];
  const res=Array(slots.length).fill(null);const used=new Set();
  for(let pass=0;pass<3;pass++){
    slots.forEach((slot,si)=>{
      if(res[si])return;
      const ok=SLOT_ACCEPTS[slot.slot]||[slot.slot];
      for(let pi=0;pi<players.length;pi++){
        if(used.has(pi))continue;
        const match=pass===0?ok[0]===players[pi].pos:pass===1?ok.includes(players[pi].pos):true;
        if(match){res[si]=players[pi];used.add(pi);break;}
      }
    });
  }
  return res;
}
function openGroups(fm,team){
  const slots=FORMATIONS[fm]||FORMATIONS["4-3-3"];
  const assigned=assignToSlots(fm,team);
  const open=new Set();
  slots.forEach((slot,i)=>{if(!assigned[i])open.add(slot.group);});
  return open;
}

/* ─── SPFC SQUADS ────────────────────────────────────────────────────────────── */
const SQUADS=[
  {year:1980,ed:"Libertadores 1980",champion:false,players:[
    {name:"Waldir Peres",shirt:1,pos:"GOL",rating:80},
    {name:"Getúlio",shirt:2,pos:"LD",rating:75},
    {name:"Oscar",shirt:5,pos:"ZAG",rating:84},
    {name:"Dario Pereyra",shirt:4,pos:"ZAG",rating:82},
    {name:"Marinho Chagas",shirt:3,pos:"LE",rating:75},
    {name:"Almir",shirt:8,pos:"VOL",rating:76},
    {name:"Renato",shirt:6,pos:"MC",rating:77},
    {name:"Heriberto",shirt:10,pos:"MC",rating:74},
    {name:"Paulo César",shirt:11,pos:"ME",rating:77},
    {name:"Serginho Chulapa",shirt:9,pos:"CA",rating:83},
    {name:"Zé Sérgio",shirt:7,pos:"MD",rating:76},
  ]},
  {year:1986,ed:"Libertadores 1986",champion:false,players:[
    {name:"Gilmar",shirt:1,pos:"GOL",rating:80},
    {name:"Zé Teodoro",shirt:2,pos:"LD",rating:76},
    {name:"Wagner Basílio",shirt:4,pos:"ZAG",rating:78},
    {name:"Dario Pereyra",shirt:5,pos:"ZAG",rating:82},
    {name:"Nelsinho",shirt:3,pos:"LE",rating:76},
    {name:"Bernardo",shirt:8,pos:"VOL",rating:78},
    {name:"Silas",shirt:6,pos:"MC",rating:80},
    {name:"Pita",shirt:7,pos:"MD",rating:77},
    {name:"Müller",shirt:9,pos:"CA",rating:86},
    {name:"Careca",shirt:10,pos:"CA",rating:91},
    {name:"Sidney",shirt:11,pos:"ME",rating:78},
  ]},
  {year:1987,ed:"Libertadores 1987",champion:false,players:[
    {name:"Gilmar",shirt:1,pos:"GOL",rating:79},
    {name:"Zé Teodoro",shirt:2,pos:"LD",rating:76},
    {name:"Oscar",shirt:5,pos:"ZAG",rating:83},
    {name:"Dario Pereyra",shirt:4,pos:"ZAG",rating:77},
    {name:"Nelsinho",shirt:3,pos:"LE",rating:75},
    {name:"Bernardo",shirt:8,pos:"VOL",rating:77},
    {name:"Silas",shirt:6,pos:"MC",rating:80},
    {name:"Pita",shirt:7,pos:"MD",rating:76},
    {name:"Müller",shirt:9,pos:"CA",rating:86},
    {name:"Lê",shirt:10,pos:"CA",rating:79},
    {name:"Sidney",shirt:11,pos:"ME",rating:77},
  ]},
  // 1991 — CAMPEÃO Brasileiro 1991
  {year:1991,ed:"Libertadores 1991",champion:true,players:[
    {name:"Zetti",shirt:1,pos:"GOL",rating:84},
    {name:"Cafu",shirt:2,pos:"LD",rating:87},
    {name:"Antônio Carlos",shirt:4,pos:"ZAG",rating:81},
    {name:"Ricardo Rocha",shirt:5,pos:"ZAG",rating:80},
    {name:"Leonardo",shirt:3,pos:"LE",rating:82},
    {name:"Bernardo",shirt:8,pos:"VOL",rating:78},
    {name:"Sampaio",shirt:6,pos:"VOL",rating:77},
    {name:"Raí",shirt:10,pos:"MC",rating:90},
    {name:"Müller",shirt:7,pos:"MD",rating:83},
    {name:"Macedo",shirt:9,pos:"CA",rating:78},
    {name:"Elivélton",shirt:11,pos:"ME",rating:76},
  ]},
  // 1992 — CAMPEÃO real
  {year:1992,ed:"Libertadores 1992",champion:true,players:[
    {name:"Zetti",shirt:1,pos:"GOL",rating:84},
    {name:"Vítor",shirt:2,pos:"LD",rating:78},
    {name:"Adilson",shirt:4,pos:"ZAG",rating:82},
    {name:"Ronaldão",shirt:5,pos:"ZAG",rating:80},
    {name:"Ronaldo Luiz",shirt:3,pos:"LE",rating:76},
    {name:"Pintado",shirt:8,pos:"VOL",rating:79},
    {name:"Toninho Cerezo",shirt:6,pos:"VOL",rating:82},
    {name:"Raí",shirt:10,pos:"MC",rating:99,special:true},
    {name:"Cafu",shirt:7,pos:"MD",rating:88},
    {name:"Müller",shirt:9,pos:"CA",rating:84},
    {name:"Elivélton",shirt:11,pos:"ME",rating:77},
  ]},
  // 1993 — CAMPEÃO real
  {year:1993,ed:"Libertadores 1993",champion:true,players:[
    {name:"Zetti",shirt:1,pos:"GOL",rating:85},
    {name:"Cafu",shirt:2,pos:"LD",rating:91},
    {name:"Válber",shirt:4,pos:"ZAG",rating:81},
    {name:"Ronaldão",shirt:5,pos:"ZAG",rating:82},
    {name:"André Luiz",shirt:3,pos:"LE",rating:79},
    {name:"Pintado",shirt:8,pos:"VOL",rating:80},
    {name:"Toninho Cerezo",shirt:6,pos:"VOL",rating:82},
    {name:"Raí",shirt:10,pos:"MC",rating:93},
    {name:"Palhinha",shirt:7,pos:"MC",rating:80},
    {name:"Müller",shirt:9,pos:"CA",rating:85},
    {name:"Leonardo",shirt:11,pos:"ME",rating:83},
  ]},
  // 1994 — perdeu a final para Vélez Sársfield; Raí estava no PSG
  {year:1994,ed:"Libertadores 1994",champion:false,players:[
    {name:"Zetti",shirt:1,pos:"GOL",rating:85},
    {name:"Vítor",shirt:2,pos:"LD",rating:78},
    {name:"Júnior Baiano",shirt:4,pos:"ZAG",rating:82},
    {name:"Válber",shirt:5,pos:"ZAG",rating:81},
    {name:"André Luiz",shirt:3,pos:"LE",rating:79},
    {name:"Axel",shirt:8,pos:"VOL",rating:79},
    {name:"Doriva",shirt:6,pos:"VOL",rating:78},
    {name:"Palhinha",shirt:10,pos:"MC",rating:80},
    {name:"Sierra",shirt:7,pos:"MD",rating:77},
    {name:"Müller",shirt:11,pos:"ME",rating:83},
    {name:"Caio",shirt:9,pos:"CA",rating:80},
  ]},
  // 1995 — Raí retornou do PSG em 1996
  {year:1995,ed:"Libertadores 1995",champion:false,players:[
    {name:"Zetti",shirt:1,pos:"GOL",rating:84},
    {name:"Pavão",shirt:2,pos:"LD",rating:76},
    {name:"Bordon",shirt:4,pos:"ZAG",rating:80},
    {name:"Rogério Pinheiro",shirt:5,pos:"ZAG",rating:77},
    {name:"André Luiz",shirt:3,pos:"LE",rating:78},
    {name:"Axel",shirt:8,pos:"VOL",rating:78},
    {name:"Donizete",shirt:6,pos:"MC",rating:79},
    {name:"Denílson",shirt:7,pos:"MD",rating:80},
    {name:"Palhinha",shirt:10,pos:"MC",rating:79},
    {name:"Müller",shirt:11,pos:"ME",rating:82},
    {name:"Almir",shirt:9,pos:"CA",rating:79},
  ]},
  // 1997
  {year:1997,ed:"Libertadores 1997",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:85},
    {name:"Cláudio",shirt:2,pos:"LD",rating:76},
    {name:"Bordon",shirt:4,pos:"ZAG",rating:81},
    {name:"Rogério Pinheiro",shirt:5,pos:"ZAG",rating:77},
    {name:"Serginho",shirt:3,pos:"LE",rating:84},
    {name:"Alexandre",shirt:8,pos:"VOL",rating:80},
    {name:"Belletti",shirt:6,pos:"MC",rating:80},
    {name:"Fabiano",shirt:10,pos:"MC",rating:78},
    {name:"Marcelinho Paraíba",shirt:7,pos:"MD",rating:83},
    {name:"Dodô",shirt:11,pos:"ME",rating:82},
    {name:"Aristizábal",shirt:9,pos:"CA",rating:83},
  ]},
  // 1998
  {year:1998,ed:"Libertadores 1998",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:86},
    {name:"Zé Carlos",shirt:2,pos:"LD",rating:77},
    {name:"Bordon",shirt:4,pos:"ZAG",rating:82},
    {name:"Márcio Santos",shirt:5,pos:"ZAG",rating:80},
    {name:"Serginho",shirt:3,pos:"LE",rating:84},
    {name:"Alexandre",shirt:8,pos:"VOL",rating:80},
    {name:"Fabiano",shirt:6,pos:"VOL",rating:78},
    {name:"Raí",shirt:10,pos:"MC",rating:88},
    {name:"França",shirt:9,pos:"CA",rating:85},
    {name:"Dodô",shirt:7,pos:"MD",rating:81},
    {name:"Denílson",shirt:11,pos:"ME",rating:81},
  ]},
  // 1999 — elenco 100% São Paulo FC
  {year:1999,ed:"Libertadores 1999",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:86},
    {name:"Édson Podão",shirt:2,pos:"LD",rating:77},
    {name:"Wilson",shirt:4,pos:"ZAG",rating:79},
    {name:"Nem",shirt:5,pos:"ZAG",rating:78},
    {name:"Serginho",shirt:3,pos:"LE",rating:84},
    {name:"Alexandre",shirt:8,pos:"VOL",rating:80},
    {name:"Vágner",shirt:6,pos:"VOL",rating:78},
    {name:"Raí",shirt:10,pos:"MC",rating:87},
    {name:"Marcelinho Paraíba",shirt:7,pos:"MD",rating:83},
    {name:"França",shirt:9,pos:"CA",rating:85},
    {name:"Dodô",shirt:11,pos:"ME",rating:81},
  ]},
  // 2000
  {year:2000,ed:"Libertadores 2000",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:86},
    {name:"Belletti",shirt:2,pos:"LD",rating:82},
    {name:"Rogério Pinheiro",shirt:4,pos:"ZAG",rating:78},
    {name:"Wilson",shirt:5,pos:"ZAG",rating:78},
    {name:"Fábio Aurélio",shirt:3,pos:"LE",rating:80},
    {name:"Maldonado",shirt:8,pos:"VOL",rating:79},
    {name:"Vágner",shirt:6,pos:"VOL",rating:78},
    {name:"Marcelinho Paraíba",shirt:7,pos:"MD",rating:83},
    {name:"Edu",shirt:10,pos:"MC",rating:79},
    {name:"Sandro Hiroshi",shirt:11,pos:"ME",rating:78},
    {name:"França",shirt:9,pos:"CA",rating:85},
  ]},
  // 2001 — Kaká estreia profissional
  {year:2001,ed:"Libertadores 2001",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:86},
    {name:"Belletti",shirt:2,pos:"LD",rating:83},
    {name:"Rogério Pinheiro",shirt:4,pos:"ZAG",rating:78},
    {name:"Jean",shirt:5,pos:"ZAG",rating:79},
    {name:"Gustavo Nery",shirt:3,pos:"LE",rating:80},
    {name:"Alexandre",shirt:8,pos:"VOL",rating:80},
    {name:"Maldonado",shirt:6,pos:"VOL",rating:79},
    {name:"Kaká",shirt:10,pos:"MC",rating:85},
    {name:"Leonardo",shirt:7,pos:"MD",rating:78},
    {name:"Luís Fabiano",shirt:9,pos:"CA",rating:85},
    {name:"França",shirt:11,pos:"ME",rating:85},
  ]},
  // 2004
  {year:2004,ed:"Libertadores 2004",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:88},
    {name:"Cicinho",shirt:2,pos:"LD",rating:84},
    {name:"Fabão",shirt:4,pos:"ZAG",rating:81},
    {name:"Rodrigo",shirt:5,pos:"ZAG",rating:79},
    {name:"Gustavo Nery",shirt:3,pos:"LE",rating:81},
    {name:"Alexandre",shirt:8,pos:"VOL",rating:81},
    {name:"Josué",shirt:6,pos:"VOL",rating:86},
    {name:"Danilo",shirt:10,pos:"MC",rating:82},
    {name:"Marquinhos",shirt:7,pos:"MD",rating:80},
    {name:"Grafite",shirt:11,pos:"CA",rating:84},
    {name:"Luís Fabiano",shirt:9,pos:"CA",rating:87},
  ]},
  // 2005 — CAMPEÃO real
  {year:2005,ed:"Libertadores 2005",champion:true,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:99,special:true},
    {name:"Cicinho",shirt:2,pos:"LD",rating:85},
    {name:"Fabão",shirt:4,pos:"ZAG",rating:81},
    {name:"Diego Lugano",shirt:5,pos:"ZAG",rating:87},
    {name:"Júnior",shirt:3,pos:"LE",rating:81},
    {name:"Mineiro",shirt:8,pos:"VOL",rating:87},
    {name:"Josué",shirt:6,pos:"VOL",rating:83},
    {name:"Danilo",shirt:10,pos:"MC",rating:83},
    {name:"Edcarlos",shirt:7,pos:"MD",rating:79},
    {name:"Amoroso",shirt:11,pos:"ME",rating:84},
    {name:"Aloísio Chulapa",shirt:9,pos:"CA",rating:83},
  ]},
  // 2006
  {year:2006,ed:"Libertadores 2006",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:88},
    {name:"Ilsinho",shirt:2,pos:"LD",rating:79},
    {name:"Fabão",shirt:4,pos:"ZAG",rating:80},
    {name:"Diego Lugano",shirt:5,pos:"ZAG",rating:86},
    {name:"Júnior",shirt:3,pos:"LE",rating:80},
    {name:"Mineiro",shirt:8,pos:"VOL",rating:87},
    {name:"Josué",shirt:6,pos:"VOL",rating:86},
    {name:"Danilo",shirt:10,pos:"MC",rating:82},
    {name:"Souza",shirt:7,pos:"MD",rating:80},
    {name:"Leandro",shirt:11,pos:"ME",rating:78},
    {name:"Aloísio Chulapa",shirt:9,pos:"CA",rating:82},
  ]},
  // 2007
  {year:2007,ed:"Libertadores 2007",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:87},
    {name:"Ilsinho",shirt:2,pos:"LD",rating:80},
    {name:"Breno",shirt:4,pos:"ZAG",rating:78},
    {name:"Miranda",shirt:5,pos:"ZAG",rating:83},
    {name:"Júnior",shirt:3,pos:"LE",rating:79},
    {name:"Alex Silva",shirt:8,pos:"VOL",rating:79},
    {name:"Hernanes",shirt:10,pos:"MC",rating:85},
    {name:"Richarlyson",shirt:6,pos:"MC",rating:80},
    {name:"Jorge Wagner",shirt:7,pos:"MD",rating:81},
    {name:"Dagoberto",shirt:11,pos:"ME",rating:80},
    {name:"Borges",shirt:9,pos:"CA",rating:81},
  ]},
  // 2008
  {year:2008,ed:"Libertadores 2008",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:87},
    {name:"Zé Luis",shirt:2,pos:"LD",rating:79},
    {name:"Rodrigo",shirt:4,pos:"ZAG",rating:80},
    {name:"Miranda",shirt:5,pos:"ZAG",rating:84},
    {name:"Jorge Wagner",shirt:3,pos:"LE",rating:80},
    {name:"Jean",shirt:8,pos:"VOL",rating:80},
    {name:"Hernanes",shirt:10,pos:"MC",rating:86},
    {name:"Hugo",shirt:6,pos:"MC",rating:78},
    {name:"André Dias",shirt:7,pos:"MD",rating:79},
    {name:"Dagoberto",shirt:11,pos:"ME",rating:80},
    {name:"Borges",shirt:9,pos:"CA",rating:82},
  ]},
  // 2009
  {year:2009,ed:"Libertadores 2009",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:87},
    {name:"Adrián González",shirt:2,pos:"LD",rating:78},
    {name:"Renato Silva",shirt:4,pos:"ZAG",rating:79},
    {name:"André Dias",shirt:5,pos:"ZAG",rating:79},
    {name:"Junior Cesar",shirt:3,pos:"LE",rating:78},
    {name:"Miranda",shirt:8,pos:"VOL",rating:84},
    {name:"Jean",shirt:6,pos:"VOL",rating:80},
    {name:"Hernanes",shirt:10,pos:"MC",rating:86},
    {name:"Jorge Wagner",shirt:7,pos:"MD",rating:81},
    {name:"Dagoberto",shirt:11,pos:"ME",rating:80},
    {name:"Washington",shirt:9,pos:"CA",rating:82},
  ]},
  // 2010
  {year:2010,ed:"Libertadores 2010",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:85},
    {name:"Jean",shirt:2,pos:"LD",rating:79},
    {name:"Alex Silva",shirt:4,pos:"ZAG",rating:79},
    {name:"Miranda",shirt:5,pos:"ZAG",rating:84},
    {name:"Junior Cesar",shirt:3,pos:"LE",rating:78},
    {name:"Rodrigo Souto",shirt:8,pos:"VOL",rating:78},
    {name:"Richarlyson",shirt:6,pos:"VOL",rating:79},
    {name:"Hernanes",shirt:10,pos:"MC",rating:85},
    {name:"Marlos",shirt:7,pos:"MD",rating:79},
    {name:"Dagoberto",shirt:11,pos:"ME",rating:79},
    {name:"Fernandinho",shirt:9,pos:"CA",rating:80},
  ]},
  // 2011
  {year:2011,ed:"Libertadores 2011",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:84},
    {name:"Piris",shirt:2,pos:"LD",rating:77},
    {name:"João Filipe",shirt:4,pos:"ZAG",rating:78},
    {name:"Rhodolfo",shirt:5,pos:"ZAG",rating:80},
    {name:"Juan",shirt:3,pos:"LE",rating:79},
    {name:"Wellington",shirt:8,pos:"VOL",rating:79},
    {name:"Carlinhos Paraíba",shirt:6,pos:"VOL",rating:78},
    {name:"Lucas Moura",shirt:10,pos:"MC",rating:86},
    {name:"Cícero",shirt:7,pos:"MD",rating:79},
    {name:"Dagoberto",shirt:11,pos:"ME",rating:78},
    {name:"Luis Fabiano",shirt:9,pos:"CA",rating:86},
  ]},
  // 2012
  {year:2012,ed:"Libertadores 2012",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:86},
    {name:"Paulo Miranda",shirt:2,pos:"LD",rating:80},
    {name:"Rafael Toloi",shirt:4,pos:"ZAG",rating:82},
    {name:"Rhodolfo",shirt:5,pos:"ZAG",rating:81},
    {name:"Cortez",shirt:3,pos:"LE",rating:80},
    {name:"Denilson",shirt:8,pos:"VOL",rating:80},
    {name:"Wellington",shirt:6,pos:"MC",rating:79},
    {name:"Jadson",shirt:10,pos:"MC",rating:83},
    {name:"Osvaldo",shirt:7,pos:"MD",rating:81},
    {name:"Lucas Moura",shirt:11,pos:"ME",rating:88},
    {name:"Luis Fabiano",shirt:9,pos:"CA",rating:87},
  ]},
  // 2013
  {year:2013,ed:"Libertadores 2013",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:85},
    {name:"Douglas",shirt:2,pos:"LD",rating:80},
    {name:"Rodrigo Caio",shirt:4,pos:"ZAG",rating:82},
    {name:"Paulo Miranda",shirt:5,pos:"ZAG",rating:80},
    {name:"Reinaldo",shirt:3,pos:"LE",rating:80},
    {name:"Denilson",shirt:8,pos:"VOL",rating:79},
    {name:"Maicon",shirt:6,pos:"VOL",rating:82},
    {name:"Ganso",shirt:10,pos:"MC",rating:85},
    {name:"Aloísio",shirt:11,pos:"ME",rating:79},
    {name:"Osvaldo",shirt:7,pos:"MD",rating:81},
    {name:"Luis Fabiano",shirt:9,pos:"CA",rating:86},
  ]},
  // 2014
  {year:2014,ed:"Libertadores 2014",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:82},
    {name:"Hudson",shirt:2,pos:"LD",rating:79},
    {name:"Rafael Toloi",shirt:4,pos:"ZAG",rating:81},
    {name:"Edson Silva",shirt:5,pos:"ZAG",rating:79},
    {name:"Álvaro Pereira",shirt:3,pos:"LE",rating:78},
    {name:"Denilson",shirt:8,pos:"VOL",rating:78},
    {name:"Souza",shirt:6,pos:"VOL",rating:80},
    {name:"Ganso",shirt:10,pos:"MC",rating:84},
    {name:"Kaká",shirt:7,pos:"MC",rating:85},
    {name:"Alan Kardec",shirt:9,pos:"CA",rating:80},
    {name:"Alexandre Pato",shirt:11,pos:"ME",rating:82},
  ]},
  // 2015
  {year:2015,ed:"Libertadores 2015",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:81},
    {name:"Bruno",shirt:2,pos:"LD",rating:78},
    {name:"Rodrigo Caio",shirt:4,pos:"ZAG",rating:82},
    {name:"Lucão",shirt:5,pos:"ZAG",rating:77},
    {name:"Carlinhos",shirt:3,pos:"LE",rating:77},
    {name:"Thiago Mendes",shirt:8,pos:"VOL",rating:80},
    {name:"Hudson",shirt:6,pos:"VOL",rating:79},
    {name:"Ganso",shirt:10,pos:"MC",rating:83},
    {name:"Michel Bastos",shirt:7,pos:"MD",rating:81},
    {name:"Alexandre Pato",shirt:11,pos:"ME",rating:82},
    {name:"Luis Fabiano",shirt:9,pos:"CA",rating:84},
  ]},
  // 2016
  {year:2016,ed:"Libertadores 2016",champion:false,players:[
    {name:"Denis",shirt:1,pos:"GOL",rating:80},
    {name:"Bruno",shirt:2,pos:"LD",rating:78},
    {name:"Maicon",shirt:4,pos:"ZAG",rating:81},
    {name:"Rodrigo Caio",shirt:5,pos:"ZAG",rating:83},
    {name:"Mena",shirt:3,pos:"LE",rating:78},
    {name:"Hudson",shirt:8,pos:"VOL",rating:80},
    {name:"Thiago Mendes",shirt:6,pos:"VOL",rating:81},
    {name:"João Schmidt",shirt:10,pos:"MC",rating:79},
    {name:"Ganso",shirt:7,pos:"MC",rating:83},
    {name:"Kelvin",shirt:11,pos:"ME",rating:79},
    {name:"Calleri",shirt:9,pos:"CA",rating:83},
  ]},
  // 2017
  {year:2017,ed:"Libertadores 2017",champion:false,players:[
    {name:"Renan Ribeiro",shirt:1,pos:"GOL",rating:79},
    {name:"Éder Militão",shirt:2,pos:"LD",rating:82},
    {name:"Arboleda",shirt:4,pos:"ZAG",rating:81},
    {name:"Rodrigo Caio",shirt:5,pos:"ZAG",rating:82},
    {name:"Edimar",shirt:3,pos:"LE",rating:78},
    {name:"Jucilei",shirt:8,pos:"VOL",rating:80},
    {name:"Petros",shirt:6,pos:"VOL",rating:79},
    {name:"Hernanes",shirt:10,pos:"MC",rating:82},
    {name:"Cueva",shirt:7,pos:"MD",rating:83},
    {name:"Marcos Guilherme",shirt:11,pos:"ME",rating:79},
    {name:"Lucas Pratto",shirt:9,pos:"CA",rating:82},
  ]},
  // 2018
  {year:2018,ed:"Libertadores 2018",champion:false,players:[
    {name:"Sidão",shirt:1,pos:"GOL",rating:79},
    {name:"Éder Militão",shirt:2,pos:"LD",rating:83},
    {name:"Arboleda",shirt:4,pos:"ZAG",rating:82},
    {name:"Bruno Alves",shirt:5,pos:"ZAG",rating:81},
    {name:"Reinaldo",shirt:3,pos:"LE",rating:80},
    {name:"Jucilei",shirt:8,pos:"VOL",rating:79},
    {name:"Hudson",shirt:6,pos:"VOL",rating:78},
    {name:"Nenê",shirt:10,pos:"MC",rating:82},
    {name:"Joao Rojas",shirt:7,pos:"MD",rating:79},
    {name:"Everton",shirt:11,pos:"ME",rating:79},
    {name:"Diego Souza",shirt:9,pos:"CA",rating:82},
  ]},
  // 2019
  {year:2019,ed:"Libertadores 2019",champion:false,players:[
    {name:"Tiago Volpi",shirt:1,pos:"GOL",rating:82},
    {name:"Igor Vinícius",shirt:2,pos:"LD",rating:80},
    {name:"Arboleda",shirt:4,pos:"ZAG",rating:83},
    {name:"Bruno Alves",shirt:5,pos:"ZAG",rating:82},
    {name:"Reinaldo",shirt:3,pos:"LE",rating:82},
    {name:"Tchê Tchê",shirt:8,pos:"VOL",rating:81},
    {name:"Luan",shirt:6,pos:"MC",rating:82},
    {name:"Daniel Alves",shirt:10,pos:"MD",rating:85},
    {name:"Antony",shirt:11,pos:"ME",rating:83},
    {name:"Vitor Bueno",shirt:7,pos:"ME",rating:79},
    {name:"Pablo",shirt:9,pos:"CA",rating:83},
  ]},
  // 2020
  {year:2020,ed:"Libertadores 2020",champion:false,players:[
    {name:"Tiago Volpi",shirt:1,pos:"GOL",rating:82},
    {name:"Juanfran",shirt:2,pos:"LD",rating:80},
    {name:"Arboleda",shirt:4,pos:"ZAG",rating:83},
    {name:"Bruno Alves",shirt:5,pos:"ZAG",rating:81},
    {name:"Reinaldo",shirt:3,pos:"LE",rating:81},
    {name:"Luan",shirt:8,pos:"VOL",rating:81},
    {name:"Tchê Tchê",shirt:6,pos:"VOL",rating:80},
    {name:"Gabriel Sara",shirt:10,pos:"MC",rating:81},
    {name:"Igor Gomes",shirt:7,pos:"MD",rating:79},
    {name:"Luciano",shirt:11,pos:"ME",rating:82},
    {name:"Brenner",shirt:9,pos:"CA",rating:81},
  ]},
  // 2021
  {year:2021,ed:"Libertadores 2021",champion:false,players:[
    {name:"Tiago Volpi",shirt:1,pos:"GOL",rating:83},
    {name:"Igor Vinícius",shirt:2,pos:"LD",rating:81},
    {name:"Arboleda",shirt:4,pos:"ZAG",rating:84},
    {name:"Miranda",shirt:5,pos:"ZAG",rating:82},
    {name:"Reinaldo",shirt:3,pos:"LE",rating:82},
    {name:"Luan",shirt:8,pos:"VOL",rating:81},
    {name:"Léo",shirt:6,pos:"VOL",rating:80},
    {name:"Rodrigo Nestor",shirt:10,pos:"MC",rating:81},
    {name:"Gabriel Sara",shirt:7,pos:"MD",rating:81},
    {name:"Luciano",shirt:9,pos:"CA",rating:84},
    {name:"Rigoni",shirt:11,pos:"ME",rating:80},
  ]},
  // 2022
  {year:2022,ed:"Libertadores 2022",champion:false,players:[
    {name:"Jandrei",shirt:1,pos:"GOL",rating:81},
    {name:"Igor Vinícius",shirt:2,pos:"LD",rating:81},
    {name:"Diego Costa",shirt:4,pos:"ZAG",rating:80},
    {name:"Léo",shirt:5,pos:"ZAG",rating:81},
    {name:"Reinaldo",shirt:3,pos:"LE",rating:82},
    {name:"Pablo Maia",shirt:8,pos:"VOL",rating:82},
    {name:"Rodrigo Nestor",shirt:6,pos:"MC",rating:81},
    {name:"Alisson",shirt:10,pos:"MC",rating:82},
    {name:"Patrick",shirt:7,pos:"MD",rating:80},
    {name:"Luciano",shirt:11,pos:"ME",rating:83},
    {name:"Calleri",shirt:9,pos:"CA",rating:85},
  ]},
  // 2023
  {year:2023,ed:"Libertadores 2023",champion:false,players:[
    {name:"Rafael",shirt:1,pos:"GOL",rating:84},
    {name:"Rafinha",shirt:2,pos:"LD",rating:83},
    {name:"Arboleda",shirt:4,pos:"ZAG",rating:84},
    {name:"Beraldo",shirt:5,pos:"ZAG",rating:81},
    {name:"Caio Paulista",shirt:3,pos:"LE",rating:80},
    {name:"Pablo Maia",shirt:8,pos:"VOL",rating:83},
    {name:"Alisson",shirt:6,pos:"VOL",rating:82},
    {name:"Rodrigo Nestor",shirt:10,pos:"MC",rating:82},
    {name:"Wellington Rato",shirt:11,pos:"ME",rating:81},
    {name:"Luciano",shirt:7,pos:"MD",rating:83},
    {name:"Calleri",shirt:9,pos:"CA",rating:86},
  ]},
  // 2024
  {year:2024,ed:"Libertadores 2024",champion:false,players:[
    {name:"Rafael",shirt:1,pos:"GOL",rating:84},
    {name:"Rafinha",shirt:2,pos:"LD",rating:82},
    {name:"Arboleda",shirt:4,pos:"ZAG",rating:84},
    {name:"Alan Franco",shirt:5,pos:"ZAG",rating:82},
    {name:"Welington",shirt:3,pos:"LE",rating:82},
    {name:"Pablo Maia",shirt:8,pos:"VOL",rating:84},
    {name:"Alisson",shirt:6,pos:"VOL",rating:83},
    {name:"Lucas Moura",shirt:10,pos:"MC",rating:83},
    {name:"Wellington Rato",shirt:11,pos:"ME",rating:81},
    {name:"Luciano",shirt:7,pos:"MD",rating:83},
    {name:"Calleri",shirt:9,pos:"CA",rating:86},
  ]},
  // 2025
  {year:2025,ed:"Libertadores 2025",champion:false,players:[
    {name:"Rafael",shirt:1,pos:"GOL",rating:84},
    {name:"Cédric Soares",shirt:2,pos:"LD",rating:80},
    {name:"Arboleda",shirt:4,pos:"ZAG",rating:83},
    {name:"Alan Franco",shirt:5,pos:"ZAG",rating:82},
    {name:"Wendell",shirt:3,pos:"LE",rating:81},
    {name:"Pablo Maia",shirt:8,pos:"VOL",rating:85},
    {name:"Alisson",shirt:6,pos:"VOL",rating:83},
    {name:"Marcos Antônio",shirt:10,pos:"MC",rating:81},
    {name:"Lucas Moura",shirt:11,pos:"ME",rating:83},
    {name:"Luciano",shirt:7,pos:"MD",rating:83},
    {name:"Calleri",shirt:9,pos:"CA",rating:85},
  ]},
];

/* ─── OPPONENT SQUADS — specific year editions ──────────────────────────────── */
const ALL_OPPONENTS = [
  {name:"River Plate",year:1986,country:"ARG",flag:"🇦🇷",rating:90,
   scorers:["Alzamendi","Funes","Rubén Marcos","Burruchaga","Pumpido"]},
  {name:"River Plate",year:1996,country:"ARG",flag:"🇦🇷",rating:89,
   scorers:["Hernán Crespo","Marcelo Gallardo","Salas","Rambert","Ortega"]},
  {name:"River Plate",year:2018,country:"ARG",flag:"🇦🇷",rating:91,
   scorers:["Borré","Quintero","Pratto","De La Cruz","Palacios"]},
  {name:"Boca Juniors",year:2000,country:"ARG",flag:"🇦🇷",rating:91,
   scorers:["Palermo","Riquelme","Bermúdez","Córdoba","Delgado"]},
  {name:"Boca Juniors",year:2007,country:"ARG",flag:"🇦🇷",rating:88,
   scorers:["Palermo","Riquelme","Arruabarrena","Rodrigues","Ibarra"]},
  {name:"Independiente",year:1984,country:"ARG",flag:"🇦🇷",rating:85,
   scorers:["Burruchaga","Insúa","Commisso","Percudani","Acosta"]},
  {name:"Racing Club",year:2001,country:"ARG",flag:"🇦🇷",rating:83,
   scorers:["Sava","Milito","Laborde","Ortega","García"]},
  {name:"San Lorenzo",year:2014,country:"ARG",flag:"🇦🇷",rating:84,
   scorers:["Cauteruccio","Ortigoza","Blanco","Cerutti","Villar"]},
  {name:"Estudiantes",year:2009,country:"ARG",flag:"🇦🇷",rating:85,
   scorers:["Boselli","Verón","Fernández","Braña","Piatti"]},
  {name:"Vélez Sársfield",year:1994,country:"ARG",flag:"🇦🇷",rating:86,
   scorers:["Asad","Chilavert","Trotta","Gomez","Bassedas"]},
  {name:"Peñarol",year:1987,country:"URU",flag:"🇺🇾",rating:85,
   scorers:["Paz","Aguilera","Revelez","Ribas","Saralegui"]},
  {name:"Nacional",year:1988,country:"URU",flag:"🇺🇾",rating:83,
   scorers:["Ostolaza","Sosa","Méndez","Rodríguez","Zeoli"]},
  {name:"Olimpia",year:2002,country:"PAR",flag:"🇵🇾",rating:80,
   scorers:["Cardozo","Enciso","Villarreal","Saúl Salcedo","Rojas"]},
  {name:"Cerro Porteño",year:1999,country:"PAR",flag:"🇵🇾",rating:79,
   scorers:["Santa Cruz","Gamarra","Gavilán","Da Silva","Torres"]},
  {name:"Colo-Colo",year:1991,country:"CHI",flag:"🇨🇱",rating:86,
   scorers:["Zamorano","Basay","Vera","Fournier","Reyes"]},
  {name:"Colo-Colo",year:2006,country:"CHI",flag:"🇨🇱",rating:82,
   scorers:["Suazo","Barrera","Rivarola","Mouche","Gonzalez"]},
  {name:"U. de Chile",year:2012,country:"CHI",flag:"🇨🇱",rating:83,
   scorers:["Pinilla","Fierro","Tello","Fernández","Paredes"]},
  {name:"Flamengo",year:1981,country:"BRA",flag:"🇧🇷",rating:88,
   scorers:["Zico","Adílio","Nunes","Tita","Andrade"]},
  {name:"Flamengo",year:2019,country:"BRA",flag:"🇧🇷",rating:91,
   scorers:["Gabigol","Bruno Henrique","Arrascaeta","Éverton Ribeiro","Filipe Luís"]},
  {name:"Grêmio",year:1983,country:"BRA",flag:"🇧🇷",rating:87,
   scorers:["Renato Portaluppi","Tarciso","Caio","Paulo César","Casagrande"]},
  {name:"Grêmio",year:2017,country:"BRA",flag:"🇧🇷",rating:88,
   scorers:["Everton","Luan","Fernandinho","Jael","Ramiro"]},
  {name:"Internacional",year:2006,country:"BRA",flag:"🇧🇷",rating:87,
   scorers:["Adriano","Fernandão","Forlán","Alex","Rubens Cardoso"]},
  {name:"Palmeiras",year:1999,country:"BRA",flag:"🇧🇷",rating:87,
   scorers:["Euller","César Sampaio","Rivaldo","Roque Júnior","Alex"]},
  {name:"Palmeiras",year:2021,country:"BRA",flag:"🇧🇷",rating:90,
   scorers:["Raphael Veiga","Rony","Luiz Adriano","Breno Lopes","Willian"]},
  {name:"Atlético Mineiro",year:2013,country:"BRA",flag:"🇧🇷",rating:88,
   scorers:["Ronaldinho","Jô","Bernard","Luan","Diego Tardelli"]},
  {name:"Fluminense",year:1984,country:"BRA",flag:"🇧🇷",rating:83,
   scorers:["Assis","Washington","Lira","Renato Gaúcho","Dinho"]},
  {name:"Atlético Nacional",year:1989,country:"COL",flag:"🇨🇴",rating:85,
   scorers:["Higuita","Escobar","Álvarez","Leonel Álvarez","Ómar Pérez"]},
  {name:"Atlético Nacional",year:2016,country:"COL",flag:"🇨🇴",rating:84,
   scorers:["Uribe","Boateng","Arias","Moreno","Ibargüen"]},
  {name:"LDU Quito",year:2008,country:"ECU",flag:"🇪🇨",rating:83,
   scorers:["Bolaños","Bieler","Urrutia","Alcívar","Arroyo"]},
  {name:"Once Caldas",year:2004,country:"COL",flag:"🇨🇴",rating:79,
   scorers:["Moreno","Viáfara","Cuadrado","Rentería","Bedoya"]},
  {name:"Bolívar",year:2012,country:"BOL",flag:"🇧🇴",rating:78,
   scorers:["Morales","Algarañaz","Vaca","Chávez","Bejarano"]},
];

function oppLabel(opp){return`${opp.name} ${opp.year}`;}
function oppScorer(opp){const l=opp.scorers||["Jogador"];return l[0|Math.random()*l.length];}

const KO_ROUNDS=["Oitavas","Quartas","Semifinal","Final"];

/* ─── HELPERS ────────────────────────────────────────────────────────────────── */
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;};
const rand=(a,b)=>a+(0|Math.random()*(b-a+1));
const avgR=ps=>ps.reduce((s,p)=>s+p.rating,0)/ps.length;

function buildMatchEvents(players,myR,oppR,opp){
  const diff=(myR-oppR)/12;
  const myG=Math.max(0,Math.round(2.4+diff+(Math.random()*2.4-1)));
  const oppG=Math.max(0,Math.round(2.0-diff+(Math.random()*2.4-1.1)));
  const pool=[...players.filter(p=>p.pos==="CA"||p.pos==="ME"||p.pos==="MD"),
              ...players.filter(p=>p.pos==="CA"||p.pos==="ME"||p.pos==="MD"),
              ...players.filter(p=>p.pos==="MC"||p.pos==="VOL")];
  const used=new Set();
  const getMin=()=>{let m;do{m=rand(1,90);}while(used.has(m));used.add(m);return m;};
  const evs=[];
  for(let i=0;i<myG;i++){
    const sc=pool[0|Math.random()*pool.length]||players[0|Math.random()*players.length];
    evs.push({min:getMin(),team:"sp",name:sc.name,pos:sc.pos,type:"goal"});
  }
  for(let i=0;i<oppG;i++){
    evs.push({min:getMin(),team:"opp",name:oppScorer(opp),club:oppLabel(opp),type:"goal"});
  }
  // Cartões amarelos
  const yellowCount=rand(1,3);
  for(let i=0;i<yellowCount;i++){
    if(Math.random()<0.55){
      const p=players[0|Math.random()*players.length];
      evs.push({min:getMin(),team:"sp",name:p.name,type:"yellow"});
    }else{
      evs.push({min:getMin(),team:"opp",name:oppScorer(opp),club:oppLabel(opp),type:"yellow"});
    }
  }
  // Cartão vermelho (raro — 12%)
  if(Math.random()<0.12){
    if(Math.random()<0.35){
      const p=players[0|Math.random()*players.length];
      evs.push({min:getMin(),team:"sp",name:p.name,type:"red"});
    }else{
      evs.push({min:getMin(),team:"opp",name:oppScorer(opp),club:oppLabel(opp),type:"red"});
    }
  }
  evs.sort((a,b)=>a.min-b.min);
  return{myG,oppG,win:myG>oppG,draw:myG===oppG,evs};
}

function buildPenalties(players,opp){
  const takers=shuffle([...players.filter(p=>p.pos==="CA"||p.pos==="ME"||p.pos==="MD"),
                        ...players.filter(p=>p.pos==="MC"||p.pos==="VOL"||p.pos==="LD"||p.pos==="LE")]).slice(0,5);
  const oppTakers=(opp.scorers||["Cobrador 1","Cobrador 2","Cobrador 3","Cobrador 4","Cobrador 5"]).slice(0,5);
  const kicks=[];let spScore=0,oppScore=0;
  // Série normal — 5 cobranças cada
  for(let i=0;i<5;i++){
    const spC=Math.random()<0.76;const oppC=Math.random()<0.74;
    if(spC)spScore++;if(oppC)oppScore++;
    kicks.push({idx:i,round:"normal",spName:takers[i]?.name||`Jogador ${i+1}`,spConvert:spC,
      oppName:oppTakers[i]||`Cobrador ${i+1}`,oppConvert:oppC,spScore,oppScore});
    const rem=4-i;
    if(spScore-oppScore>rem)return{kicks,spWin:true,suddenDeath:false};
    if(oppScore-spScore>rem)return{kicks,spWin:false,suddenDeath:false};
  }
  // Morte súbita se empatado após 5
  if(spScore===oppScore){
    const sdPool=shuffle([...players]);
    for(let round=0;round<10;round++){
      const spC=Math.random()<0.76;const oppC=Math.random()<0.74;
      const spName=sdPool[round%sdPool.length]?.name||`Jogador ${round+6}`;
      const oppName=opp.scorers?.[round%opp.scorers.length]||`Cobrador ${round+6}`;
      if(spC)spScore++;if(oppC)oppScore++;
      kicks.push({idx:5+round,round:"sudden",spName,spConvert:spC,oppName,oppConvert:oppC,spScore,oppScore});
      if(spC!==oppC)return{kicks,spWin:spC,suddenDeath:true};
    }
  }
  return{kicks,spWin:spScore>=oppScore,suddenDeath:spScore===oppScore};
}

function buildTournament(team){
  const r=avgR(team);
  const opps=shuffle(ALL_OPPONENTS);
  const groupOpps=opps.slice(0,3);
  const koOpps=opps.slice(3,7);

  const groupMatches=groupOpps.map((opp,i)=>{
    const ev=randomMatchEvent();
    const mult=ev?(1+ev.boost):1;
    return{
      phase:"group",matchNum:i+1,label:`Grupo — Jogo ${i+1}`,opp,
      matchEvent:ev,
      ...buildMatchEvents(team,r*mult,opp.rating,opp),
    };
  });

  function simPts(a,b){
    const d=(a.rating-b.rating)/15;const r=Math.random();
    if(r<0.1+d*0.2)return[3,0];if(r<0.35)return[1,1];return[0,3];
  }
  const oppStats=groupOpps.map(o=>({...o,pts:0,w:0,d:0,l:0,gf:0,ga:0}));
  [[0,1],[0,2],[1,2]].forEach(([ai,bi])=>{
    const[pa,pb]=simPts(groupOpps[ai],groupOpps[bi]);
    oppStats[ai].pts+=pa;oppStats[bi].pts+=pb;
    if(pa===3){oppStats[ai].w++;oppStats[bi].l++;}
    else if(pa===1){oppStats[ai].d++;oppStats[bi].d++;}
    else{oppStats[bi].w++;oppStats[ai].l++;}
    const ga=rand(0,3),gb=rand(0,2);
    oppStats[ai].gf+=ga;oppStats[ai].ga+=gb;oppStats[bi].gf+=gb;oppStats[bi].ga+=ga;
  });
  const spW=groupMatches.filter(m=>m.win).length;
  const spD=groupMatches.filter(m=>m.draw).length;
  const spL=groupMatches.filter(m=>!m.win&&!m.draw).length;
  const spPts=spW*3+spD;
  const spGF=groupMatches.reduce((s,m)=>s+m.myG,0);
  const spGA=groupMatches.reduce((s,m)=>s+m.oppG,0);
  const spGD=spGF-spGA;
  groupMatches.forEach((m,i)=>{
    oppStats[i].pts+=(m.win?0:m.draw?1:3);
    oppStats[i].gf+=m.oppG;oppStats[i].ga+=m.myG;
    if(!m.win&&!m.draw)oppStats[i].w++;else if(m.draw)oppStats[i].d++;else oppStats[i].l++;
  });
  const allRows=[
    {name:"São Paulo",flag:"🇾🇪",pts:spPts,w:spW,d:spD,l:spL,gf:spGF,ga:spGA,gd:spGD,isSP:true},
    ...oppStats.map(o=>({name:oppLabel(o),flag:o.flag,pts:o.pts,w:o.w,d:o.d,l:o.l,gf:o.gf,ga:o.ga,gd:o.gf-o.ga,isSP:false})),
  ].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
  const qualified=allRows.findIndex(r=>r.isSP)<2;
  const koMatches=KO_ROUNDS.map((round,i)=>{
    const ev=randomMatchEvent();
    const mult=ev?(1+ev.boost):1;
    return{
      phase:"ko",round,label:round,opp:koOpps[i],
      matchEvent:ev,
      ...buildMatchEvents(team,r*mult,koOpps[i].rating,koOpps[i]),
    };
  });
  return{groupMatches,pts:spPts,gd:spGD,qualified,koMatches,groupTable:allRows};
}

/* ─── PITCH ──────────────────────────────────────────────────────────────────── */
function Pitch({formation,players,compact=false}){
  const slots=FORMATIONS[formation]||FORMATIONS["4-3-3"];
  const assigned=assignToSlots(formation,players);
  return(
    <div style={{width:"100%",position:"relative"}}>
      <div style={{width:"100%",paddingBottom:compact?"130%":"155%",
        background:"#0A1F0A",
        borderRadius:12,border:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 100 155" preserveAspectRatio="none">
          <rect x="3" y="3" width="94" height="149" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth=".7"/>
          <line x1="3" y1="77.5" x2="97" y2="77.5" stroke="rgba(255,255,255,.12)" strokeWidth=".7"/>
          <circle cx="50" cy="77.5" r="13" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth=".7"/>
          <circle cx="50" cy="77.5" r="1.2" fill="rgba(255,255,255,.3)"/>
          <rect x="22" y="3" width="56" height="22" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth=".6"/>
          <rect x="32" y="3" width="36" height="11" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth=".5"/>
          <rect x="22" y="130" width="56" height="22" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth=".6"/>
          <rect x="32" y="141" width="36" height="11" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth=".5"/>
          <path d="M32 25 A13 13 0 0 0 68 25" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".5"/>
          <path d="M32 130 A13 13 0 0 1 68 130" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".5"/>
          <rect x="39" y="0" width="22" height="4" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.12)" strokeWidth=".4"/>
          <rect x="39" y="151" width="22" height="4" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.12)" strokeWidth=".4"/>
        </svg>
        {slots.map((slot,i)=>{
          const p=assigned[i];const col=POS_COLOR[slot.slot]||groupColor(slot.group);const sz=compact?28:34;
          return(
            <div key={i} style={{position:"absolute",left:`${slot.x}%`,top:`${slot.y}%`,transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",zIndex:5}}>
              {p?(
                <div className="popIn" style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{width:sz,height:sz,borderRadius:"50%",background:col,border:"2px solid rgba(255,255,255,.85)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:compact?7:8,fontWeight:700,color:"#fff",fontFamily:F.display,boxShadow:"0 2px 10px rgba(0,0,0,.6)"}}>{p.shirt}</div>
                  <div style={{marginTop:2,background:"rgba(0,0,0,.85)",borderRadius:4,padding:"1px 4px",fontSize:compact?6:7.5,color:"#fff",fontWeight:600,whiteSpace:"nowrap",maxWidth:56,overflow:"hidden",textOverflow:"ellipsis",textAlign:"center",fontFamily:F.body}}>
                    {p.name.split(" ").slice(-1)[0]}{p._year?` '${String(p._year).slice(-2)}`:""}
                  </div>
                </div>
              ):(
                <div style={{width:compact?26:34,height:compact?26:34,borderRadius:"50%",border:"1.5px dashed rgba(255,255,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,.05)"}}>
                  <span style={{fontSize:compact?6:7.5,color:"rgba(255,255,255,.4)",fontWeight:700,fontFamily:F.body}}>{slot.slot}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── CONFETTI ───────────────────────────────────────────────────────────────── */
function Confetti(){
  const ps=Array.from({length:32},(_,i)=>({id:i,left:Math.random()*100,delay:Math.random()*2,dur:1.8+Math.random()*1.5,color:[C.red,C.yellow,C.gold,C.white,"#FF5555","#FFD700"][i%6],size:5+Math.random()*8}));
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:999}}>{ps.map(p=><div key={p.id} style={{position:"absolute",left:`${p.left}%`,top:-20,width:p.size,height:p.size,background:p.color,borderRadius:Math.random()>.5?"50%":"2px",animation:`confettiFall ${p.dur}s ease-in ${p.delay}s both`}}/>)}</div>);
}

/* ─── SLOT MACHINE ───────────────────────────────────────────────────────────── */
function SlotMachine({squads,onDone}){
  const IH=56,DUR=1400,CENTER=2;

  const initRef=useRef(null);
  if(!initRef.current){
    const chosen=squads[0|Math.random()*squads.length];
    const prefix=[...shuffle(squads),...shuffle(squads)];
    const landingIdx=prefix.length;
    const list=[...prefix,chosen,...shuffle(squads),...shuffle(squads)];
    const targetOffset=(landingIdx-CENTER)*IH;
    const extraSpin=Math.round(squads.length*2+Math.random()*squads.length)*IH;
    initRef.current={chosen,list,landingIdx,targetOffset,totalTravel:extraSpin+targetOffset};
  }
  const{chosen,list,targetOffset,totalTravel}=initRef.current;

  const [done,setDone]=useState(false);
  const listRef=useRef(null);
  const rafRef=useRef();

  useEffect(()=>{
    const t0=performance.now();
    // easeInOutCubic — acelera no início, desacelera no final
    const ease=t=>t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    const tick=now=>{
      const p=Math.min((now-t0)/DUR,1);
      if(listRef.current){
        listRef.current.style.transform=`translateY(-${ease(p)*totalTravel}px)`;
      }
      if(p<1){rafRef.current=requestAnimationFrame(tick);}
      else{
        if(listRef.current) listRef.current.style.transform=`translateY(-${targetOffset}px)`;
        setDone(true);
        setTimeout(()=>onDone(chosen),600);
      }
    };
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 20px",gap:16}}>
      <div style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:600,fontFamily:F.body}}>SORTEANDO ELENCO…</div>
      <div style={{width:"100%",maxWidth:320,height:IH*5,overflow:"hidden",
        border:`2px solid ${done?C.red:C.border}`,background:C.surface,borderRadius:12,
        position:"relative",boxShadow:done?`0 0 0 3px ${C.red}22`:"none",transition:"border-color .4s,box-shadow .4s"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:72,background:`linear-gradient(to bottom,${C.surface},transparent)`,zIndex:3,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:72,background:`linear-gradient(to top,${C.surface},transparent)`,zIndex:3,pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:IH*CENTER,left:0,right:0,height:IH,
          background:done?C.redDim:"rgba(255,255,255,0.03)",
          borderTop:`1.5px solid ${done?C.red:C.border}`,borderBottom:`1.5px solid ${done?C.red:C.border}`,
          zIndex:2,pointerEvents:"none",transition:"all .4s"}}/>
        <div ref={listRef} style={{willChange:"transform"}}>
          {list.map((sq,i)=>(
            <div key={i} style={{height:IH,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 20px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontFamily:F.display,fontSize:28,color:C.ink,fontWeight:700,lineHeight:1}}>{sq.year}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:3,fontWeight:500,fontFamily:F.body}}>{sq.ed}</div>
            </div>
          ))}
        </div>
      </div>
      {done&&(
        <div className="fadeUp" style={{textAlign:"center"}}>
          {chosen.champion&&<div style={{fontSize:10,color:C.red,fontWeight:700,letterSpacing:2,marginBottom:4,fontFamily:F.body}}>🏆 ANO CAMPEÃO</div>}
          <div style={{fontFamily:F.display,fontSize:16,fontWeight:700,color:C.ink}}>{chosen.ed}</div>
        </div>
      )}
    </div>
  );
}

/* ─── REROLL ANIM ────────────────────────────────────────────────────────────── */
function RerollAnim({onDone}){
  useEffect(()=>{const t=setTimeout(onDone,600);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"absolute",inset:0,background:"rgba(10,10,10,0.94)",zIndex:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,borderRadius:8}}>
      <div className="rerollSpin" style={{fontSize:36}}>🎲</div>
      <div style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:600,fontFamily:F.body}}>SORTEANDO…</div>
    </div>
  );
}

/* ─── POSITION ORDER FOR CARD ───────────────────────────────────────────────── */
const POS_ORDER={GOL:0,ZAG:1,LD:2,LE:3,VOL:4,MC:5,MD:6,ME:7,CA:8};
function sortByPosition(team){return[...team].sort((a,b)=>(POS_ORDER[a.pos]??5)-(POS_ORDER[b.pos]??5));}

/* ─── MATCH COMMENTARY ───────────────────────────────────────────────────────── */
function generateMatchCommentary(match,spGoals,oppGoals,evs){
  const opp=oppLabel(match.opp);
  const scorers=evs.filter(e=>e.type==="goal"&&e.team==="sp").map(e=>e.name);
  const first=scorers[0];
  const diff=spGoals-oppGoals;
  const r=()=>Math.random();

  if(spGoals>oppGoals){
    if(diff>=3){
      const opts=[
        `Goleada histórica! ${first||"O time"} foi fenomenal e o ${opp} saiu destruído do campo.`,
        `Isso é São Paulo! ${spGoals} a ${oppGoals} e sem discussão. Zé Bira tá em êxtase.`,
        `Marko Loco: "Não esperava tanto!" ${first?first+" fez a festa, ":""}o ${opp} não soube o que aconteceu.`,
      ];
      return opts[0|r()*opts.length];
    }else if(diff===2){
      const opts=[
        `Vitória convincente! ${first||"O time"} fez a diferença e o resultado foi justo.`,
        `Dois a mais pro ${opp}. Jogou bonito, mas podia ter matado o jogo mais cedo.`,
        `${first?first+" brilhou. ":""}São Paulo controlou e venceu bem. Zé Bira satisfeito.`,
      ];
      return opts[0|r()*opts.length];
    }else{
      const opts=[
        `Sofrido, mas nos três pontos! ${first||"Alguém"} decidiu quando precisava.`,
        `Que sufoco. ${first?first+" apareceu na hora certa. ":""}Marko Loco ficou tenso o jogo todo.`,
        `A vitória veio difícil, mas veio. ${first||"O gol"} valeu ouro nesse confronto.`,
      ];
      return opts[0|r()*opts.length];
    }
  }else if(spGoals===oppGoals){
    if(spGoals===0){
      const opts=[
        `Zero a zero. Que tédio. Pelo menos não perdeu.`,
        `Zé Bira cochilou na transmissão. Nenhum gol, mas um ponto no bolso.`,
        `O ${opp} tampou tudo e saiu com o empate. Faltou criatividade.`,
      ];
      return opts[0|r()*opts.length];
    }else{
      const opts=[
        `${spGoals} a ${oppGoals}. Ia ganhar, tomou o gol de bobeira no final. Clássico São Paulo.`,
        `Empate com gols, mas dói. ${first?first+" marcou mas não foi suficiente.":"Faltou um pouco mais."}`,
        `Deixou o ${opp} empatar. Marko Loco já chamou de "time sem eficiência".`,
      ];
      return opts[0|r()*opts.length];
    }
  }else{
    if(oppGoals-spGoals>=3){
      const opts=[
        `Tragédia total. O ${opp} aplicou uma goleada e o time nem apareceu em campo.`,
        `Isso foi um vexame. Zé Bira desligou o microfone no intervalo.`,
        `Impossível defender esse desempenho. ${oppGoals} gols sofridos. Uma vergonha.`,
      ];
      return opts[0|r()*opts.length];
    }else{
      const opts=[
        `Derrota amarga. O ${opp} foi melhor e não tem como esconder.`,
        `Perdeu e pronto. ${spGoals>0?"Pelo menos marcou um.":"Nem gol fez."} Tem que cobrar!`,
        `Marko Loco: "Esse time tá me estressando." Perdeu pro ${opp} e deixou muito a desejar.`,
      ];
      return opts[0|r()*opts.length];
    }
  }
}

function generateCampaignComment(champ,allMatches,tournament,team){
  const wins=allMatches.filter(m=>m.win).length;
  const goals=allMatches.reduce((s,m)=>s+m.myG,0);
  const avg=avgR(team).toFixed(1);
  const r=()=>Math.random();
  if(champ){
    const opts=[
      `Esse time foi uma obra de arte! Campeão com ${wins} vitórias e ${goals} gols. Zé Bira tá em êxtase!`,
      `Ninguém acreditava, mas a taça veio! Média ${avg} e um coração enorme. Isso é São Paulo FC!`,
      `Marko Loco: "Eu sabia desde o sorteio." Mentira, mas ganhou. Que campanha histórica!`,
    ];
    return opts[0|r()*opts.length];
  }else if(!tournament?.qualified){
    const opts=[
      `Nem saiu dos grupos. Marko Loco pediu demissão da transmissão no intervalo do terceiro jogo.`,
      `Vexame na fase de grupos. Média ${avg} e nada a mostrar. Zé Bira chora até hoje.`,
      `Isso foi doloroso de assistir. Esperamos que o próximo draft seja melhor que esse.`,
    ];
    return opts[0|r()*opts.length];
  }else{
    const koPhase=allMatches.filter(m=>m.phase==="ko").slice(-1)[0]?.round||"mata-mata";
    const opts=[
      `Chegou longe, mas caiu nas ${koPhase}. ${wins} vitórias e ${goals} gols não foram suficientes.`,
      `Boa campanha, mas acabou cedo demais. Marko Loco: "Faltou um Raí nesse elenco."`,
      `Zé Bira ainda acredita que podia ter chegado mais longe. Quase, mas quase não basta.`,
    ];
    return opts[0|r()*opts.length];
  }
}

/* ─── GAME MODES ─────────────────────────────────────────────────────────────── */
const ODIO_YEARS=[2010,2011,2013,2014,2015,2016,2017,2018,2019,2020,2022,2024,2025];
const ONIRICO_YEARS=[1986,1991,1992,1993,1998,2005,2006,2007,2008,2023];
function getSquadsForMode(mode){
  if(mode==="odio")return SQUADS.filter(s=>ODIO_YEARS.includes(s.year));
  if(mode==="onirico")return SQUADS.filter(s=>ONIRICO_YEARS.includes(s.year));
  return SQUADS;
}

/* ─── RANDOM EVENTS ──────────────────────────────────────────────────────────── */
const NOSSO_PORRA=[
  {text:"Baby invadiu o CT e motivou o elenco.",boost:0.10},
  {text:"O elenco platinou o cabelo.",boost:0.10},
  {text:"O elenco usou Mounjaro.",boost:0.10},
  {text:"Morumbira lotado.",boost:0.10},
];
const CABO_PA_NOIS=[
  {text:"O salário do elenco atrasou.",boost:-0.10},
  {text:"Operação policial no clube.",boost:-0.10},
  {text:"Compra coletiva de camisa.",boost:-0.15},
  {text:"O elenco abusou no pudim no CT.",boost:-0.10},
];
function randomMatchEvent(){
  if(Math.random()>0.25)return null;
  const good=Math.random()<0.5;
  const list=good?NOSSO_PORRA:CABO_PA_NOIS;
  const ev=list[0|Math.random()*list.length];
  return{...ev,type:good?"bom":"ruim"};
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/*  APP                                                                          */
/* ═══════════════════════════════════════════════════════════════════════════════ */
export default function App(){
  const [phase,setPhase]=useState("intro");
  const [drawIdx,setDrawIdx]=useState(0);
  const [squad,setSquad]=useState(null);
  const [usedYrs,setUsedYrs]=useState([]);
  const [team,setTeam]=useState([]);
  const [formation,setFormation]=useState("4-3-3");
  const [rerolls,setRerolls]=useState(3);
  const [showSlot,setShowSlot]=useState(false);
  const [showReroll,setShowReroll]=useState(false);
  const [tournament,setTournament]=useState(null);
  const [matchIdx,setMatchIdx]=useState(0);
  const [livePhase,setLivePhase]=useState("idle");
  const [minute,setMinute]=useState(0);
  const [spG,setSpG]=useState(0);
  const [oppG,setOppG]=useState(0);
  const [events,setEvents]=useState([]);
  const [flash,setFlash]=useState(false);
  const [eliminated,setEliminated]=useState(false);
  const [champ,setChamp]=useState(false);
  const [elimPhaseState,setElimPhaseState]=useState("");
  const [penalties,setPenalties]=useState(null);
  const [history,setHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem("7rikas5")||"[]");}catch{return[];}});
  const [gameMode,setGameMode]=useState("normal");
  const [nilmarUnlocked,setNilmarUnlocked]=useState(false);
  const [nilmarToast,setNilmarToast]=useState(false);
  const nilmarTapsRef=useRef(0);
  const nilmarTimerRef=useRef(null);

  function saveHist(e){const h=[e,...history].slice(0,15);setHistory(h);try{localStorage.setItem("7rikas5",JSON.stringify(h));}catch{}}

  function newGame(mode="normal"){
    setGameMode(mode);
    setTeam([]);setUsedYrs([]);setDrawIdx(0);setFormation("4-3-3");setRerolls(3);
    setTournament(null);setMatchIdx(0);setEliminated(false);setChamp(false);setPenalties(null);
    setElimPhaseState("");
    setPhase("formation-pick");
  }

  function handleSecretTap(){
    nilmarTapsRef.current+=1;
    clearTimeout(nilmarTimerRef.current);
    nilmarTimerRef.current=setTimeout(()=>{nilmarTapsRef.current=0;},5000);
    if(nilmarTapsRef.current>=7){
      nilmarTapsRef.current=0;
      setNilmarUnlocked(true);
    }
  }

  useEffect(()=>{
    if(nilmarUnlocked)setNilmarToast(true);
  },[nilmarUnlocked]);

  function confirmFormation(f){
    setFormation(f);
    setShowSlot(true);
    setPhase("draft");
  }

  function handleSlotDone(sq){setSquad(sq);setShowSlot(false);}

  function pickPlayer(p){
    const e={...p,_year:squad.year,_edition:squad.ed,_champion:squad.champion};
    const next=[...team,e];setTeam(next);
    const ni=drawIdx+1;setDrawIdx(ni);
    if(ni>=11){setPhase("lineup");}
    else{setUsedYrs(u=>[...u,squad.year]);setSquad(null);setShowSlot(true);}
  }

  function doReroll(){
    if(rerolls<=0)return;setRerolls(r=>r-1);setShowReroll(true);
  }
  function afterReroll(){
    setShowReroll(false);
    const modeSquads=getSquadsForMode(gameMode);
    const avail=modeSquads.filter(s=>!usedYrs.includes(s.year)&&s.year!==squad?.year);
    if(!avail.length)return;
    setSquad(avail[0|Math.random()*avail.length]);
  }

  function startSim(){
    let finalTeam=team;
    if(nilmarUnlocked&&!finalTeam.find(p=>p.name==="Nilmar")){
      const nilmar={name:"Nilmar",shirt:99,pos:"CA",rating:88,special:false,_nilmar:true,
        _year:"?",_edition:"Bônus Secreto",_champion:false};
      finalTeam=[...finalTeam,nilmar];
    }
    const t=buildTournament(finalTeam);
    setTournament(t);setMatchIdx(0);setLivePhase("idle");setPhase("sim");
  }

  const allMatches=tournament?[...tournament.groupMatches,...tournament.koMatches]:[];
  const currentMatch=allMatches[matchIdx]||null;

  useEffect(()=>{
    if(phase!=="sim"||livePhase!=="live"||!currentMatch)return;
    const timer=setInterval(()=>{
      setMinute(m=>{
        const nx=m+1;
        currentMatch.evs.filter(e=>e.min===nx).forEach(ev=>{
          if(ev.type==="goal"){
            if(ev.team==="sp")setSpG(g=>g+1);else setOppG(g=>g+1);
            setFlash(true);setTimeout(()=>setFlash(false),600);
          }
          setEvents(prev=>[ev,...prev]);
        });
        if(nx>=90){clearInterval(timer);setTimeout(()=>setLivePhase("done"),700);}
        return nx;
      });
    },50);
    return()=>clearInterval(timer);
  },[livePhase,matchIdx,currentMatch,phase]);

  function kickoff(){setMinute(0);setSpG(0);setOppG(0);setEvents([]);setFlash(false);setPenalties(null);setLivePhase("live");}

  function advance(currentPhase){
    const m=currentMatch;if(!m)return;
    if(currentPhase==="groupResult"){
      if(!tournament.qualified){setEliminated(true);setElimPhaseState("Fase de Grupos");saveHist({date:new Date().toLocaleDateString("pt-BR"),champ:false,phase:"Grupos",formation});setPhase("result");}
      else{setMatchIdx(3);setLivePhase("idle");}
      return;
    }
    if(currentPhase==="penalties"){
      const pen=penalties;
      if(!pen?.spWin){setEliminated(true);setElimPhaseState(m.round||"");saveHist({date:new Date().toLocaleDateString("pt-BR"),champ:false,phase:m.round,formation});setPhase("result");}
      else if(matchIdx>=6){setChamp(true);saveHist({date:new Date().toLocaleDateString("pt-BR"),champ:true,phase:"Campeão",formation});setPhase("result");}
      else{setMatchIdx(i=>i+1);setLivePhase("idle");}
      return;
    }
    const isGroup=m.phase==="group";const isLastGrp=isGroup&&matchIdx===2;
    const isKO=m.phase==="ko";const isLastKO=isKO&&matchIdx===6;
    if(isGroup&&!isLastGrp){setMatchIdx(i=>i+1);setLivePhase("idle");}
    else if(isLastGrp){setLivePhase("groupResult");}
    else if(isKO){
      if(m.draw){const pen=buildPenalties(team,m.opp);setPenalties(pen);setLivePhase("penalties");return;}
      if(!m.win){setEliminated(true);setElimPhaseState(m.round||"");saveHist({date:new Date().toLocaleDateString("pt-BR"),champ:false,phase:m.round,formation});setPhase("result");}
      else if(isLastKO){setChamp(true);saveHist({date:new Date().toLocaleDateString("pt-BR"),champ:true,phase:"Campeão",formation});setPhase("result");}
      else{setMatchIdx(i=>i+1);setLivePhase("idle");}
    }
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:F.body,maxWidth:480,margin:"0 auto",color:C.ink}}>
      {phase==="intro"&&<IntroScreen onStart={newGame} history={history} onSecretTap={handleSecretTap}/>}
      {phase==="formation-pick"&&<FormationPickScreen onConfirm={confirmFormation}/>}
      {phase==="draft"&&<DraftScreen showSlot={showSlot} squad={squad} drawIdx={drawIdx} team={team} formation={formation} rerolls={rerolls} showReroll={showReroll} onSlotDone={handleSlotDone} onPick={pickPlayer} onReroll={doReroll} afterReroll={afterReroll} usedYrs={usedYrs} gameMode={gameMode}/>}
      {phase==="lineup"&&<LineupScreen team={team} formation={formation} setFormation={setFormation} onSim={startSim} nilmarUnlocked={nilmarUnlocked}/>}
      {phase==="sim"&&tournament&&<SimScreen allMatches={allMatches} matchIdx={matchIdx} livePhase={livePhase} minute={minute} spG={spG} oppG={oppG} events={events} flash={flash} tournament={tournament} penalties={penalties} onKickoff={kickoff} onAdvance={(ph)=>advance(ph)}/>}
      {phase==="result"&&<ResultScreen champ={champ} elimPhase={elimPhaseState} allMatches={allMatches.slice(0,matchIdx+1)} team={team} formation={formation} tournament={tournament} onRestart={newGame} onHome={()=>setPhase("intro")}/>}
      {nilmarToast&&(
        <div onClick={()=>setNilmarToast(false)} style={{
          position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          zIndex:9999,cursor:"pointer",
        }}>
          <div style={{fontSize:48,marginBottom:16}}>🔓</div>
          <div style={{fontFamily:F.display,fontSize:22,color:"#C9A227",letterSpacing:2,textAlign:"center"}}>
            MODO SÓ FALTA ASSINAR
          </div>
          <div style={{fontFamily:F.display,fontSize:16,color:"#C9A227",letterSpacing:1,marginTop:8}}>
            ATIVADO
          </div>
          <div style={{fontFamily:F.body,fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:20,textAlign:"center",maxWidth:280,lineHeight:1.6}}>
            Nilmar foi adicionado ao seu elenco como bônus secreto.
          </div>
          <div style={{fontFamily:F.body,fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:24}}>
            toque para fechar
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── HEADER ─────────────────────────────────────────────────────────────────── */
function Header({left=null,right=null}){
  return(
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"16px 20px", background:C.bg,
      borderBottom:`1px solid ${C.border}`, flexShrink:0,
    }}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {left || (
          <div style={{
            width:36, height:36, borderRadius:"50%",
            background:`linear-gradient(135deg, ${C.red}, #8B0000)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, fontWeight:700, color:C.white, fontFamily:F.display,
          }}>7R</div>
        )}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>{right}</div>
    </div>
  );
}

/* ─── INTRO ──────────────────────────────────────────────────────────────────── */
function IntroScreen({onStart,history,onSecretTap}){
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.bg}}>
      {/* Hero */}
      <div style={{background:"linear-gradient(160deg, #1A0608 0%, #0A0A0A 60%)",padding:"52px 28px 44px",position:"relative",overflow:"hidden"}}>
        <div onClick={onSecretTap} style={{fontFamily:F.display,fontSize:52,fontWeight:700,color:C.white,lineHeight:.9,letterSpacing:-1,cursor:"default",userSelect:"none"}}>
          7RIKAS
        </div>
        <div style={{marginTop:16,fontSize:13,color:C.inkDim,fontFamily:F.body,lineHeight:1.6,maxWidth:280}}>
          Uma jornada do SPFC rumo à glória eterna<br/>
          <span style={{color:C.muted}}>ou ódio profundo.</span>
        </div>
        <div style={{marginTop:8,fontSize:11,color:C.muted,fontFamily:F.body}}>
          Uma adaptação by Órfãos de Edcarlos
        </div>
        <div style={{position:"absolute",right:-10,bottom:-20,fontSize:120,opacity:.06,pointerEvents:"none",userSelect:"none"}}>🇾🇪</div>
      </div>

      {/* Content */}
      <div style={{flex:1,padding:"28px 20px",display:"flex",flexDirection:"column",gap:0}}>
        {/* Feature bullets */}
        {[
          ["⚽","Sorteie os elencos do SPFC e monte seu time."],
          ["🏆","Dispute contra times clássicos da Liberta."],
          ["😬","Existe risco de Rafael Tolói."],
        ].map(([icon,text],i,arr)=>(
          <div key={text} style={{
            display:"flex",gap:0,alignItems:"stretch",
            marginBottom:i<arr.length-1?8:16,
          }}>
            <div style={{
              borderLeft:`3px solid ${C.red}`,
              background:C.surface,
              borderRadius:10,
              padding:"14px 16px",
              display:"flex",gap:12,alignItems:"flex-start",
              flex:1,
            }}>
              <span style={{fontSize:18,lineHeight:1,marginTop:1,flexShrink:0}}>{icon}</span>
              <span style={{fontSize:14,color:C.inkDim,lineHeight:1.5,fontFamily:F.body,fontWeight:500}}>{text}</span>
            </div>
          </div>
        ))}

        {/* Mode buttons */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
          {[
            {id:"normal",label:"MODO NORMAL",sub:"Todos os elencos disponíveis",icon:"⚽",
              style:{background:C.surface2,border:`1px solid ${C.border}`}},
            {id:"odio",label:"MODO ÓDIO",sub:"Só elencos odiáveis (2010–2025)",icon:"😤",
              style:{background:C.red,border:"none"}},
            {id:"onirico",label:"MODO ONÍRICO",sub:"Só elencos campeões e lendários",icon:"✨",
              style:{background:"linear-gradient(135deg, #1A1A2E, #2D1B4E)",border:`1px solid ${C.border}`}},
          ].map(m=>(
            <button key={m.id} onClick={()=>onStart(m.id)} style={{
              ...m.style,
              color:m.id==="onirico"?C.gold:C.white,
              borderRadius:12,
              padding:"16px 20px",width:"100%",cursor:"pointer",
              fontFamily:F.display,fontSize:14,fontWeight:600,letterSpacing:1.5,
              display:"flex",alignItems:"center",justifyContent:"space-between",
              transition:"opacity .15s",
            }}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
              onMouseLeave={e=>e.currentTarget.style.opacity="1"}
            >
              <span>{m.icon} {m.label}</span>
              <span style={{fontSize:11,opacity:.7,fontFamily:F.body,fontWeight:500,textTransform:"none",letterSpacing:0}}>{m.sub}</span>
            </button>
          ))}
        </div>

        {history.length>0&&(
          <div style={{marginTop:28}}>
            <div style={{fontSize:10,letterSpacing:1.5,color:C.muted,fontWeight:600,marginBottom:12,fontFamily:F.body,textTransform:"uppercase"}}>Histórico</div>
            <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
              {history.slice(0,4).map((h,i,arr)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:i<arr.length-1&&i<3?`1px solid ${C.border}`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:h.champ?C.red:C.muted,flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:600,color:h.champ?C.red:C.inkDim,fontFamily:F.body}}>
                      {h.champ?"🏆 Campeão":h.phase?`${h.phase}`:"Eliminado"}
                    </span>
                  </div>
                  <span style={{fontSize:11,color:C.muted,fontFamily:F.body}}>{h.date} · {h.formation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── FORMATION PICK SCREEN ──────────────────────────────────────────────────── */
function FormationPickScreen({onConfirm}){
  const [selected,setSelected]=useState("4-3-3");
  const descriptions={
    "4-3-3":"Três atacantes, domínio das laterais.",
    "4-4-2":"Clássico e equilibrado. Dois pontas.",
    "3-5-2":"Três zagueiros, cinco meios. Posse.",
    "4-2-3-1":"Dois volantes, meia atrás do centroavante.",
  };
  const slots=FORMATIONS[selected]||FORMATIONS["4-3-3"];
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.bg}}>
      <Header/>
      <div style={{padding:"24px 20px 0",flexShrink:0}}>
        <div style={{fontFamily:F.display,fontSize:26,fontWeight:700,color:C.ink,lineHeight:1.1,letterSpacing:-0.5}}>
          Escolha sua<br/><span style={{color:C.red}}>formação</span>
        </div>
        <div style={{fontSize:13,color:C.muted,marginTop:8,fontFamily:F.body}}>
          Defina o esquema antes de montar o elenco.
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 120px"}}>
        {/* Formation list */}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
          {Object.keys(FORMATIONS).map((f)=>(
            <div key={f} onClick={()=>setSelected(f)} style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"16px 18px",
              borderRadius:12,
              border:`${selected===f?"2px":"1px"} solid ${selected===f?C.red:C.border}`,
              background:selected===f?C.redDim:C.surface,
              cursor:"pointer",
              transition:"all .15s",
            }}>
              <div>
                <div style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:selected===f?C.red:C.ink,lineHeight:1}}>{f}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:4,fontFamily:F.body}}>{descriptions[f]}</div>
              </div>
              <div style={{
                width:22,height:22,borderRadius:"50%",
                border:`2px solid ${selected===f?C.red:C.border}`,
                background:selected===f?C.red:"transparent",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,
              }}>
                {selected===f&&<div style={{width:7,height:7,borderRadius:"50%",background:C.white}}/>}
              </div>
            </div>
          ))}
        </div>

        {/* Pitch preview */}
        <div style={{fontSize:10,letterSpacing:1.5,color:C.muted,fontWeight:600,marginBottom:12,fontFamily:F.body,textTransform:"uppercase"}}>Prévia</div>
        <div style={{position:"relative",width:"100%"}}>
          <div style={{
            width:"100%",paddingBottom:"125%",
            background:"#0A1F0A",
            borderRadius:12,border:`1px solid ${C.border}`,
            position:"relative",overflow:"hidden",
          }}>
            <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 100 125" preserveAspectRatio="none">
              <rect x="2" y="2" width="96" height="121" fill="none" stroke="rgba(255,255,255,.10)" strokeWidth=".7"/>
              <line x1="2" y1="62.5" x2="98" y2="62.5" stroke="rgba(255,255,255,.10)" strokeWidth=".7"/>
              <circle cx="50" cy="62.5" r="12" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".6"/>
              <rect x="22" y="2" width="56" height="19" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".5"/>
              <rect x="22" y="104" width="56" height="19" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".5"/>
            </svg>
            {slots.map((slot,i)=>{
              const y=slot.y*(125/155);
              return(
                <div key={i} style={{position:"absolute",left:`${slot.x}%`,top:`${y}%`,transform:"translate(-50%,-50%)",zIndex:5}}>
                  <div style={{
                    width:30,height:30,borderRadius:"50%",
                    background:POS_COLOR[slot.slot]||groupColor(slot.group),
                    border:"2px solid rgba(255,255,255,.75)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:7,fontWeight:600,color:"#fff",fontFamily:F.body,
                    boxShadow:"0 1px 6px rgba(0,0,0,.5)",
                  }}>{slot.slot}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"16px 20px",background:C.bg,borderTop:`1px solid ${C.border}`,zIndex:50}}>
        <button onClick={()=>onConfirm(selected)} style={{
          background:C.red,color:C.white,border:"none",
          padding:"18px 0",width:"100%",cursor:"pointer",
          fontFamily:F.display,fontSize:15,fontWeight:700,letterSpacing:1.5,
          borderRadius:12,
          transition:"opacity .15s",
        }}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}
        >
          JOGAR COM {selected}
        </button>
      </div>
    </div>
  );
}

/* ─── DRAFT ──────────────────────────────────────────────────────────────────── */
function DraftScreen({showSlot,squad,drawIdx,team,formation,rerolls,showReroll,onSlotDone,onPick,onReroll,afterReroll,usedYrs,gameMode}){
  const modeSquads=getSquadsForMode(gameMode||"normal");
  const avail=modeSquads.filter(s=>!usedYrs.includes(s.year)&&s.year!==squad?.year);
  const open=openGroups(formation,team);

  const progressDots=(
    <div style={{display:"flex",gap:3,alignItems:"center"}}>
      {Array.from({length:11}).map((_,i)=>(
        <div key={i} style={{
          width:i<drawIdx?16:i===drawIdx?8:5,
          height:5,
          borderRadius:3,
          background:i<drawIdx?C.red:i===drawIdx?C.inkDim:C.border,
          transition:"all .3s",
        }}/>
      ))}
    </div>
  );

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.bg}}>
      <Header
        left={progressDots}
        right={<span style={{fontFamily:F.display,fontSize:13,fontWeight:700,color:C.red}}>{drawIdx+1}/11</span>}
      />
      {showSlot?(
        <SlotMachine squads={avail.length>3?avail:modeSquads} onDone={onSlotDone}/>
      ):squad?(
        <>
          {/* Squad banner */}
          <div style={{
            background:squad.champion?C.redDim:C.surface,
            borderBottom:`1px solid ${squad.champion?C.redMid:C.border}`,
            padding:"18px 20px",flexShrink:0,position:"relative",overflow:"hidden",
          }}>
            {squad.champion&&<div style={{position:"absolute",right:20,top:"50%",transform:"translateY(-50%)",fontSize:48,opacity:.10,pointerEvents:"none"}}>🏆</div>}
            <div style={{fontSize:10,letterSpacing:1.5,color:squad.champion?C.red:C.muted,fontFamily:F.body,fontWeight:600,marginBottom:4,textTransform:"uppercase"}}>
              {squad.champion?"Ano Campeão · ":""}Elenco {squad.year}
            </div>
            <div style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.ink,lineHeight:1}}>{squad.ed}</div>
            <div style={{marginTop:12,display:"flex",alignItems:"center",gap:8}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<rerolls?C.red:C.border}}/>
              ))}
              <button onClick={onReroll} disabled={rerolls<=0} style={{
                marginLeft:4,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:rerolls>0?"pointer":"not-allowed",
                background:C.surface3,border:`1px solid ${C.border}`,borderRadius:8,
                color:rerolls>0?C.inkDim:C.muted,fontFamily:F.body,
              }}>⟳ outro elenco</button>
            </div>
          </div>

          {/* Instruction strip */}
          <div style={{borderBottom:`1px solid ${C.border}`,padding:"10px 20px"}}>
            <span style={{fontSize:10,letterSpacing:1.5,color:C.muted,fontWeight:600,fontFamily:F.body,textTransform:"uppercase"}}>
              Escolha 1 jogador — {drawIdx+1}/11
            </span>
          </div>

          {/* Scrollable body: list above, pitch below */}
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",position:"relative"}}>
            {showReroll&&<RerollAnim onDone={afterReroll}/>}

            {/* Player list */}
            <div style={{padding:"12px 20px 0",flexShrink:0}}>
              {squad.players.map((p,i)=>{
                const isOpen=open.has(posToGroup(p.pos));
                return <PlayerRow key={i} player={p} year={squad.year} onPick={()=>onPick(p)} disabled={!isOpen}/>;
              })}
            </div>

            {/* Divider label */}
            <div style={{padding:"16px 20px 8px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
              <div style={{flex:1,height:1,background:C.border}}/>
              <span style={{fontSize:9,letterSpacing:1.5,color:C.muted,fontWeight:600,fontFamily:F.body,whiteSpace:"nowrap",textTransform:"uppercase"}}>Time em construção</span>
              <div style={{flex:1,height:1,background:C.border}}/>
            </div>

            {/* Pitch */}
            <div style={{padding:"0 20px 24px",flexShrink:0}}>
              <Pitch formation={formation} players={team}/>
            </div>
          </div>
        </>
      ):null}
    </div>
  );
}

function PlayerRow({player,year,onPick,disabled}){
  const [hov,setHov]=useState(false);
  const col=POS_COLOR[player.pos]||groupColor(posToGroup(player.pos));
  const isSpecial=player.special||false;
  const ratingColor=disabled?C.muted:isSpecial?C.gold:player.rating>=85?C.red:player.rating>=80?C.yellow:C.inkDim;
  const nameColor=disabled?C.muted:isSpecial?C.gold:C.ink;
  return(
    <div
      onMouseEnter={()=>!disabled&&setHov(true)}
      onMouseLeave={()=>setHov(false)}
      onClick={()=>!disabled&&onPick()}
      style={{
        display:"flex",alignItems:"center",gap:12,
        padding:"12px 14px",
        marginBottom:4,
        borderRadius:10,
        border:`1px solid ${hov&&!disabled?C.red:C.border}`,
        background:hov&&!disabled?C.redDim:C.surface2,
        cursor:disabled?"not-allowed":"pointer",
        opacity:disabled?0.35:1,
        transition:"all .12s",
      }}
    >
      {/* Pos badge */}
      <div style={{
        width:34,height:34,borderRadius:8,background:disabled?C.border:col,
        display:"flex",alignItems:"center",justifyContent:"center",
        flexShrink:0,
      }}>
        <span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:F.body,letterSpacing:.3}}>{player.pos}</span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:600,color:nameColor,fontFamily:F.body,lineHeight:1.2}}>
          {isSpecial&&"★ "}{player.name}
        </div>
        <div style={{fontSize:11,color:C.muted,marginTop:2,fontFamily:F.body}}>
          {year}{disabled?" · posição preenchida":""}
        </div>
      </div>
      <div style={{fontFamily:F.display,fontSize:24,fontWeight:700,color:ratingColor,flexShrink:0}}>
        {player.rating}
      </div>
    </div>
  );
}

/* ─── LINEUP ─────────────────────────────────────────────────────────────────── */
function LineupScreen({team,formation,setFormation,onSim,nilmarUnlocked}){
  const [tab,setTab]=useState("pitch");
  const rating=avgR(team).toFixed(1);
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.bg}}>
      <Header
        right={<span style={{fontFamily:F.display,fontSize:15,fontWeight:700,color:C.red}}>{rating}</span>}
      />
      {/* Formation picker */}
      <div style={{padding:"0 20px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:0,flexShrink:0}}>
        {Object.keys(FORMATIONS).map(f=>(
          <button key={f} onClick={()=>setFormation(f)} style={{
            padding:"12px 12px",fontSize:12,fontWeight:600,
            background:"transparent",border:"none",cursor:"pointer",fontFamily:F.body,
            color:formation===f?C.ink:C.muted,
            borderBottom:formation===f?`2px solid ${C.red}`:"2px solid transparent",
            transition:"color .15s",
          }}>{f}</button>
        ))}
      </div>
      {/* Tab bar */}
      <div style={{borderBottom:`1px solid ${C.border}`,display:"flex",flexShrink:0}}>
        {[["pitch","Campo"],["list","Elenco"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1,padding:"12px",fontSize:12,fontWeight:600,fontFamily:F.body,
            background:tab===t?C.redDim:"transparent",border:"none",cursor:"pointer",
            color:tab===t?C.red:C.muted,
            borderBottom:tab===t?`2px solid ${C.red}`:"2px solid transparent",
            transition:"all .15s",
          }}>{l}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px 120px"}}>
        {tab==="pitch"?<Pitch formation={formation} players={team}/>:(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {team.map((p,i)=>{
              const isSpecial=p.special||false;
              const ratingColor=isSpecial?C.gold:p.rating>=85?C.red:p.rating>=80?C.yellow:C.inkDim;
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:C.surface2}}>
                  <div style={{width:34,height:34,borderRadius:8,background:POS_COLOR[p.pos]||groupColor(posToGroup(p.pos)),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:F.body}}>{p.pos}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600,color:isSpecial?C.gold:C.ink,fontFamily:F.body}}>
                      {isSpecial&&"★ "}{p.name}
                    </div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2,fontFamily:F.body}}>{p._year}{p._champion?" · 🏆":""}</div>
                  </div>
                  <div style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:ratingColor}}>{p.rating}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {nilmarUnlocked&&(
        <div style={{margin:"0 20px 12px",padding:"12px 16px",background:C.surface,border:`2px solid ${C.gold}`,borderRadius:12,display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:24}}>🔓</span>
          <div>
            <div style={{fontSize:10,letterSpacing:1.5,color:C.gold,fontFamily:F.body,fontWeight:700,textTransform:"uppercase"}}>Bônus Secreto</div>
            <div style={{fontFamily:F.display,fontSize:16,fontWeight:700,color:C.gold}}>NILMAR</div>
            <div style={{fontSize:11,color:C.muted,fontFamily:F.body}}>CA · 88 · Modo Só Falta Assinar</div>
          </div>
        </div>
      )}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"16px 20px",background:C.bg,borderTop:`1px solid ${C.border}`,zIndex:50}}>
        <button onClick={onSim} style={{
          background:C.red,color:C.white,border:"none",
          padding:"18px 0",width:"100%",cursor:"pointer",
          fontFamily:F.display,fontSize:15,fontWeight:700,letterSpacing:1.5,
          borderRadius:12,
          transition:"opacity .15s",
        }}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}
        >
          DISPUTAR LIBERTADORES
        </button>
      </div>
    </div>
  );
}

/* ─── SIM SCREEN ─────────────────────────────────────────────────────────────── */
function SimScreen({allMatches,matchIdx,livePhase,minute,spG,oppG,events,flash,tournament,penalties,onKickoff,onAdvance}){
  const m=allMatches[matchIdx];if(!m)return null;
  const isLive=livePhase==="live",isDone=livePhase==="done",isGroupResult=livePhase==="groupResult";
  const isPenalties=livePhase==="penalties",isIdle=livePhase==="idle";
  const min2=String(minute).padStart(2,"0");
  const isGroup=m.phase==="group",isKO=m.phase==="ko";

  const doneLabel=()=>{
    if(isGroup)return matchIdx<2?"PRÓXIMO JOGO":"VER TABELA DO GRUPO";
    if(m.draw)return"PÊNALTIS";
    if(m.win)return matchIdx>=6?"VER RESULTADO":"PRÓXIMO JOGO";
    return"VER RESULTADO";
  };
  const doneBg=m.draw?C.yellow:m.win?C.red:C.surface2;
  const doneFg=m.draw?C.black:C.white;

  /* progress dots — groups and KO */
  const dots=(
    <div style={{display:"flex",gap:3,alignItems:"center"}}>
      {tournament.groupMatches.map((_,i)=>(
        <div key={i} style={{width:i<matchIdx?16:6,height:6,background:i<matchIdx?C.red:i===matchIdx?C.ink:C.faint,transition:"all .3s"}}/>
      ))}
      <div style={{width:1,height:10,background:C.border,margin:"0 3px"}}/>
      {tournament.koMatches.map((_,i)=>(
        <div key={i} style={{width:(matchIdx-3)>i?16:6,height:6,background:(matchIdx-3)>i?C.red:(matchIdx-3)===i?C.ink:C.faint,transition:"all .3s"}}/>
      ))}
    </div>
  );

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.bg}}>
      <Header right={dots}/>

      {/* Previous results strip */}
      {matchIdx>0&&(
        <div style={{borderBottom:`1px solid ${C.border}`,padding:"8px 20px",display:"flex",gap:12,overflowX:"auto",flexShrink:0}}>
          {allMatches.slice(0,matchIdx).map((prev,i)=>(
            <div key={i} style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
              <span style={{fontSize:10,color:C.muted,fontWeight:600,fontFamily:F.body}}>{prev.phase==="group"?`G${i+1}`:prev.round?.slice(0,3).toUpperCase()}</span>
              <span style={{fontFamily:F.display,fontSize:13,fontWeight:700,color:prev.win?C.red:C.inkDim}}>{prev.myG}–{prev.oppG}</span>
              <span style={{fontSize:12}}>{prev.opp.flag}</span>
            </div>
          ))}
        </div>
      )}

      {/* Scoreboard */}
      <div style={{background:"linear-gradient(180deg, #1A0608 0%, #141414 100%)",borderBottom:`1px solid ${C.border}`,padding:"24px 20px",transition:"background .5s",flexShrink:0}}>
        <div style={{textAlign:"center",marginBottom:12}}>
          <span style={{fontSize:10,letterSpacing:2,color:"rgba(255,255,255,.3)",fontFamily:F.body,fontWeight:600,textTransform:"uppercase"}}>
            {m.label}
          </span>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:6}}>🇾🇪</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:600,fontFamily:F.body,letterSpacing:1}}>SÃO PAULO</div>
          </div>
          <div style={{textAlign:"center",minWidth:120}}>
            {isIdle
              ? <div style={{fontFamily:F.display,fontSize:44,fontWeight:700,color:"rgba(255,255,255,.15)",letterSpacing:4}}>– –</div>
              : <div style={{fontFamily:F.display,fontSize:56,fontWeight:700,color:C.white,letterSpacing:6,lineHeight:1}}>{spG}  {oppG}</div>
            }
            {isLive&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:6}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:C.red,animation:"pulse 1s infinite"}}/>
                <span style={{fontFamily:F.body,fontSize:12,color:"rgba(255,255,255,.4)",fontWeight:600,letterSpacing:1.5}}>{min2}'</span>
              </div>
            )}
            {isDone&&(
              <div style={{fontSize:10,color:m.win?C.red:C.muted,fontWeight:700,fontFamily:F.body,letterSpacing:1.5,marginTop:6,textTransform:"uppercase"}}>
                {m.win?"Vitória":m.draw&&isKO?"Empate":m.draw?"Empate":"Derrota"}
              </div>
            )}
          </div>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:6}}>{m.opp.flag}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:600,fontFamily:F.body}}>{oppLabel(m.opp)}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.2)",marginTop:2,fontFamily:F.body}}>{m.opp.country}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{flex:1,overflowY:"auto",padding:"0 0 110px"}}>
        {isIdle&&(
          <div style={{padding:"36px 20px",textAlign:"center"}}>
            <div style={{fontSize:10,letterSpacing:1.5,color:C.muted,fontWeight:600,fontFamily:F.body,marginBottom:16,textTransform:"uppercase"}}>
              {isGroup?"Fase de Grupos":m.round}
            </div>
            <div style={{fontFamily:F.display,fontSize:24,fontWeight:700,color:C.ink,lineHeight:1.2,marginBottom:8}}>
              🇾🇪 São Paulo<br/><span style={{color:C.muted,fontSize:18}}>×</span><br/>{m.opp.flag} {oppLabel(m.opp)}
            </div>
            {m.matchEvent&&(
              <div style={{
                margin:"20px 0",
                padding:"14px 16px",
                background:m.matchEvent.type==="bom"?"#0D2818":C.redDim,
                border:`1px solid ${m.matchEvent.type==="bom"?"#38A169":C.red}`,
                borderRadius:10,
                textAlign:"left",
              }}>
                <div style={{
                  fontSize:10,fontWeight:700,letterSpacing:1.5,
                  color:m.matchEvent.type==="bom"?"#38A169":C.red,
                  marginBottom:6,fontFamily:F.body,textTransform:"uppercase",
                }}>
                  {m.matchEvent.type==="bom"?"🟢 NOSSO PORRA!":"🔴 CABÔ PÁ NÓIS"}
                </div>
                <div style={{fontSize:13,color:C.ink,fontFamily:F.body,lineHeight:1.5}}>
                  {m.matchEvent.text}
                  <span style={{fontWeight:700}}>{m.matchEvent.boost>0?` +${Math.round(m.matchEvent.boost*100)}% performance`:` ${Math.round(m.matchEvent.boost*100)}% performance`}</span>
                </div>
              </div>
            )}
            <div style={{marginTop:28}}>
              <button onClick={onKickoff} style={{
                background:C.red,color:C.white,border:"none",
                padding:"18px 52px",cursor:"pointer",
                fontFamily:F.display,fontSize:15,fontWeight:700,letterSpacing:1.5,
                borderRadius:50,
                transition:"opacity .15s",
              }}
                onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
                onMouseLeave={e=>e.currentTarget.style.opacity="1"}
              >▶ APITAR</button>
            </div>
          </div>
        )}

        {isGroupResult&&<GroupResultCard tournament={tournament} onContinue={()=>onAdvance("groupResult")}/>}
        {isPenalties&&penalties&&<PenaltyScreen penalties={penalties} opp={m.opp} onContinue={()=>onAdvance("penalties")}/>}

        {(isLive||isDone)&&(
          <div>
            <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:10,letterSpacing:1.5,color:C.muted,fontWeight:600,fontFamily:F.body,textTransform:"uppercase"}}>Lances</span>
            </div>
            {events.length===0&&isLive&&(
              <div style={{padding:"32px 20px",textAlign:"center",color:C.muted,fontSize:13,fontFamily:F.body,animation:"pulse 2s infinite"}}>
                Aguardando lance…
              </div>
            )}
            <div style={{padding:"8px 20px 0"}}>
              {events.map((ev,i)=>{
                const isGoal=ev.type==="goal";
                const isCard=ev.type==="yellow"||ev.type==="red";
                const icon=isGoal?"⚽":ev.type==="yellow"?"🟨":"🟥";
                const nameColor=ev.type==="yellow"?C.yellow:ev.type==="red"?C.red:(ev.team==="sp"?C.red:C.inkDim);
                return(
                  <div key={i} className={i===0?"goalSlide":""} style={{
                    display:"flex",alignItems:"center",gap:10,
                    padding:isCard?"8px 12px":"11px 12px",
                    marginBottom:4,
                    borderRadius:10,
                    background:isCard?C.surface2:C.surface,
                    borderLeft:`3px solid ${isGoal&&ev.team==="sp"?C.red:isCard&&ev.type==="yellow"?C.yellow:isCard&&ev.type==="red"?C.red:C.border}`,
                  }}>
                    <span style={{fontFamily:F.body,fontSize:isCard?10:11,color:isGoal&&ev.team==="sp"?C.red:C.muted,fontWeight:700,minWidth:24}}>{ev.min}'</span>
                    <span style={{fontSize:isCard?12:15}}>{icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:isCard?11:13,fontWeight:600,color:nameColor,fontFamily:F.body}}>{ev.name}</div>
                      {!isCard&&<div style={{fontSize:10,color:C.muted,marginTop:1,fontFamily:F.body}}>
                        {ev.team==="sp"?ev.pos:ev.club}
                      </div>}
                      {isCard&&<div style={{fontSize:10,color:C.muted,fontFamily:F.body}}>
                        {ev.type==="yellow"?"Cartão Amarelo":"Cartão Vermelho"}
                      </div>}
                    </div>
                    <span style={{fontSize:isCard?13:16}}>{ev.team==="sp"?"🇾🇪":m.opp.flag}</span>
                  </div>
                );
              })}
            </div>
            {isLive&&(
              <div style={{padding:"12px 20px",display:"flex",gap:8,alignItems:"center"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:C.red,animation:"pulse 1s infinite",flexShrink:0}}/>
                <span style={{fontSize:12,color:C.muted,fontWeight:500,fontFamily:F.body}}>{min2}' em andamento</span>
              </div>
            )}
            {isDone&&!isGroupResult&&!isPenalties&&(
              <div className="fadeUp" style={{margin:"12px 20px",padding:"14px 16px",borderRadius:12,background:C.surface2,border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <img src={markoBiraImg} alt="Marko e Bira" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                  <div style={{fontSize:9,letterSpacing:1.5,color:C.muted,fontWeight:700,fontFamily:F.body,textTransform:"uppercase"}}>
                    Comentário de Marko Loco e Zé Bira
                  </div>
                </div>
                <div style={{fontSize:13,color:C.ink,fontFamily:F.body,lineHeight:1.55,fontStyle:"italic"}}>
                  "{generateMatchCommentary(m,m.myG,m.oppG,m.evs)}"
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isDone&&!isGroupResult&&!isPenalties&&(
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"16px 20px",background:C.bg,borderTop:`1px solid ${C.border}`,zIndex:50}}>
          <button onClick={()=>onAdvance("done")} style={{
            background:doneBg,color:doneFg,border:"none",
            padding:"18px 0",width:"100%",cursor:"pointer",
            fontFamily:F.display,fontSize:15,fontWeight:700,letterSpacing:1.5,
            borderRadius:50,
          }}>{doneLabel()}</button>
        </div>
      )}
    </div>
  );
}

/* ─── GROUP RESULT CARD ──────────────────────────────────────────────────────── */
function GroupResultCard({tournament,onContinue}){
  const{groupMatches,pts,gd,qualified,groupTable}=tournament;
  return(
    <div style={{padding:"20px 20px"}}>
      <div style={{fontSize:10,letterSpacing:1.5,color:C.muted,fontWeight:600,fontFamily:F.body,marginBottom:16,textTransform:"uppercase"}}>Fase de Grupos — Classificação</div>

      {/* Table */}
      <div style={{borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:20}}>
        <div style={{background:C.surface2,padding:"10px 14px",display:"flex",alignItems:"center"}}>
          <span style={{fontSize:10,color:C.muted,fontWeight:600,fontFamily:F.body,flex:1}}>TIME</span>
          {["J","V","E","D","GP","GC","PTS"].map(h=>(
            <span key={h} style={{fontSize:10,color:C.muted,fontWeight:600,fontFamily:F.body,minWidth:26,textAlign:"center"}}>{h}</span>
          ))}
        </div>
        {groupTable.map((row,i)=>(
          <div key={i} style={{
            padding:"11px 14px",display:"flex",alignItems:"center",
            background:row.isSP?C.redDim:C.surface,
            borderTop:`1px solid ${C.border}`,
          }}>
            <div style={{flex:1,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:11,color:C.muted,fontWeight:600,fontFamily:F.body,minWidth:14}}>{i+1}</span>
              <span style={{fontSize:15}}>{row.flag}</span>
              <span style={{fontSize:12,fontWeight:row.isSP?700:500,color:row.isSP?C.ink:C.inkDim,fontFamily:F.body}}>{row.name}</span>
              {i<2&&<span style={{fontSize:9,color:C.red,fontWeight:700,fontFamily:F.body}}>✓</span>}
            </div>
            {[row.w+row.d+row.l,row.w,row.d,row.l,row.gf,row.ga,row.pts].map((v,j)=>(
              <span key={j} style={{fontSize:12,fontWeight:j===6?700:400,color:j===6?(row.isSP?C.red:C.inkDim):C.muted,minWidth:26,textAlign:"center",fontFamily:j===6?F.display:F.body}}>{v}</span>
            ))}
          </div>
        ))}
      </div>

      <div style={{textAlign:"center",padding:"12px 0 20px"}}>
        {qualified?(
          <>
            <div style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.ink,marginBottom:6}}>São Paulo classificado!</div>
            <div style={{fontSize:13,color:C.muted,fontFamily:F.body}}>{pts} pontos · {groupTable.findIndex(r=>r.isSP)+1}º do grupo</div>
          </>
        ):(
          <>
            <div style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.ink,marginBottom:6}}>São Paulo eliminado</div>
            <div style={{fontSize:13,color:C.muted,fontFamily:F.body}}>{pts} ponto{pts!==1?"s":""} · {groupTable.findIndex(r=>r.isSP)+1}º do grupo</div>
          </>
        )}
      </div>

      <button onClick={onContinue} style={{
        background:C.red,color:C.white,border:"none",
        padding:"18px 0",width:"100%",cursor:"pointer",
        fontFamily:F.display,fontSize:15,fontWeight:700,letterSpacing:1.5,
        borderRadius:50,
        transition:"opacity .15s",
      }}
        onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
        onMouseLeave={e=>e.currentTarget.style.opacity="1"}
      >
        {qualified?"MATA-MATA":"VER RESULTADO"}
      </button>
    </div>
  );
}

/* ─── PENALTY SCREEN ─────────────────────────────────────────────────────────── */
function PenaltyScreen({penalties,opp,onContinue}){
  const[revealed,setRevealed]=useState(0);
  const[done,setDone]=useState(false);
  const{kicks,spWin}=penalties;
  useEffect(()=>{
    if(revealed>=kicks.length){setDone(true);return;}
    const t=setTimeout(()=>setRevealed(r=>r+1),900);return()=>clearTimeout(t);
  },[revealed,kicks.length]);
  const spScore=kicks.slice(0,revealed).filter(k=>k.spConvert).length;
  const oppScore=kicks.slice(0,revealed).filter(k=>k.oppConvert).length;

  return(
    <div style={{padding:"20px"}}>
      {/* Scoreboard */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:10,letterSpacing:1.5,color:C.muted,fontWeight:600,fontFamily:F.body,marginBottom:14,textTransform:"uppercase"}}>Disputa de Pênaltis</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:4}}>🇾🇪</div>
            <div style={{fontSize:10,color:C.muted,fontWeight:600,fontFamily:F.body}}>SÃO PAULO</div>
          </div>
          <div style={{fontFamily:F.display,fontSize:52,fontWeight:700,color:C.ink,letterSpacing:4,lineHeight:1}}>
            {spScore}<span style={{fontSize:28,color:C.muted}}> × </span>{oppScore}
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:4}}>{opp.flag}</div>
            <div style={{fontSize:10,color:C.muted,fontWeight:600,fontFamily:F.body,maxWidth:60,lineHeight:1.3}}>{opp.name}</div>
          </div>
        </div>
      </div>

      {/* Kicks */}
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
        {kicks.slice(0,revealed).map((k,i)=>{
          const isSudden=k.round==="sudden";
          const isFirstSudden=isSudden&&(i===0||kicks[i-1]?.round!=="sudden");
          return(
            <div key={i}>
              {isFirstSudden&&(
                <div style={{textAlign:"center",padding:"10px 0 6px"}}>
                  <span style={{fontSize:9,letterSpacing:2,color:C.red,fontWeight:700,fontFamily:F.body}}>⚡ MORTE SÚBITA</span>
                </div>
              )}
              <div className="goalSlide" style={{display:"flex",gap:6,alignItems:"stretch"}}>
                <div style={{flex:1,background:k.spConvert?C.redDim:C.surface,border:`1px solid ${k.spConvert?C.red:C.border}`,borderRadius:8,padding:"9px 11px"}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.ink,fontFamily:F.body}}>{k.spName}</div>
                  <div style={{fontSize:10,color:k.spConvert?C.red:C.muted,marginTop:2,fontFamily:F.body,fontWeight:600}}>
                    {k.spConvert?"⚽ GOOOOL!":"❌ Defendida"}
                  </div>
                </div>
                <div style={{width:22,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:9,color:isSudden?C.red:C.muted,fontFamily:F.body,fontWeight:700}}>{isSudden?"⚡":i+1}</span>
                </div>
                <div style={{flex:1,background:k.oppConvert?"#1A1A1A":C.surface,border:`1px solid ${k.oppConvert?C.border2:C.border}`,borderRadius:8,padding:"9px 11px",textAlign:"right"}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.ink,fontFamily:F.body}}>{k.oppName}</div>
                  <div style={{fontSize:10,color:k.oppConvert?C.inkDim:C.muted,marginTop:2,fontFamily:F.body,fontWeight:600}}>
                    {k.oppConvert?"⚽ GOOOOL!":"❌ Defendida"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!done&&(
          <div style={{textAlign:"center",padding:"16px",color:C.muted,fontSize:13,fontFamily:F.body,animation:"pulse 1s infinite"}}>
            Próximo cobrador…
          </div>
        )}
      </div>

      {done&&(
        <>
          <div style={{textAlign:"center",padding:"14px 0 20px"}}>
            <div style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:C.ink,marginBottom:4}}>
              {spWin?"São Paulo vence!":oppLabel(opp)+" vence"}
            </div>
            <div style={{fontSize:13,color:C.muted,fontFamily:F.body}}>Disputa de pênaltis</div>
          </div>
          <button onClick={onContinue} style={{
            background:C.red,color:C.white,border:"none",
            padding:"18px 0",width:"100%",cursor:"pointer",
            fontFamily:F.display,fontSize:15,fontWeight:700,letterSpacing:1.5,
            borderRadius:50,
            transition:"opacity .15s",
          }}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}
          >
            {spWin?"PRÓXIMO JOGO":"VER RESULTADO"}
          </button>
        </>
      )}
    </div>
  );
}

/* ─── RESULT SCREEN ──────────────────────────────────────────────────────────── */
function ResultScreen({champ,elimPhase,allMatches,team,formation,tournament,onRestart,onHome}){
  const[tab,setTab]=useState("matches");
  const[cardStatus,setCardStatus]=useState("idle");

  async function handleCardAction(action){
    setCardStatus("generating");
    await document.fonts.ready;
    try{
      const canvas=await generateCampaignCard(champ,allMatches,team,formation,tournament);
      if(action==="whatsapp"){
        canvas.toBlob(async(blob)=>{
          const file=new File([blob],"7rikas-campanha.png",{type:"image/png"});
          const resultText=champ?"🏆 Fui CAMPEÃO da Libertadores no 7RIKAS!":"❌ Fui eliminado no 7RIKAS... que raiva.";
          const shareText=`${resultText}\n\nMontei um time histórico do SPFC e disputei a Libertadores.\n\n🎮 Jogue também: https://markitomesquita.github.io/7rikas/\n\n7RIKAS — Uma adaptação by Órfãos de Edcarlos`;
          if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
            try{
              await navigator.share({files:[file],text:shareText});
              setCardStatus("done");
            }catch(e){
              if(e.name!=="AbortError"){
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`,"_blank");
                setCardStatus("done");
              }else{setCardStatus("idle");}
            }
          }else{
            const link=document.createElement("a");
            link.download="7rikas-campanha.png";link.href=canvas.toDataURL("image/png");link.click();
            setTimeout(()=>window.open(`https://wa.me/?text=${encodeURIComponent(shareText+" (imagem baixada 👆)")}`,"_blank"),800);
            setCardStatus("done");
          }
          setTimeout(()=>setCardStatus("idle"),4000);
        },"image/png");
      }else{
        const link=document.createElement("a");
        link.download="7rikas-campanha.png";link.href=canvas.toDataURL("image/png");link.click();
        setCardStatus("done");
        setTimeout(()=>setCardStatus("idle"),3000);
      }
    }catch(e){console.error(e);setCardStatus("idle");}
  }

  // elimPhase comes from parent state, set at the moment of elimination

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.bg}}>
      {champ&&<Confetti/>}

      {/* Hero */}
      <div style={{background:champ?C.redDim:"#0D0D0D",borderBottom:`1px solid ${champ?C.redMid:C.border}`,padding:"40px 20px 32px",position:"relative",overflow:"hidden",flexShrink:0}}>
        {champ&&<div style={{position:"absolute",right:-20,top:"50%",transform:"translateY(-50%)",fontSize:160,opacity:.05,pointerEvents:"none"}}>🏆</div>}
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontSize:10,letterSpacing:1.5,color:champ?C.red:C.muted,fontWeight:700,fontFamily:F.body,marginBottom:12,textTransform:"uppercase"}}>
            {champ?"Campeão da Libertadores":"Eliminado"}
          </div>
          {champ?(
            <>
              <div className="trophy" style={{fontSize:52,marginBottom:12}}>🏆</div>
              <div style={{fontFamily:F.display,fontSize:34,fontWeight:700,color:C.white,lineHeight:1,letterSpacing:-.5}}>São Paulo<br/>conquista<br/>a América</div>
            </>
          ):(
            <>
              <div style={{fontSize:44,marginBottom:12}}>😤</div>
              <div style={{fontFamily:F.display,fontSize:34,fontWeight:700,color:C.white,lineHeight:1,letterSpacing:-.5}}>
                {elimPhase==="Fase de Grupos"?"Caiu na":"Caiu nas"}<br/>
                <span style={{color:C.muted}}>{elimPhase}</span>
              </div>
              <div style={{marginTop:14,fontSize:12,color:C.muted,fontFamily:F.body,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase"}}>
                Tem que cobrar!
              </div>
            </>
          )}
        </div>
      </div>

      {/* Share buttons */}
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0}}>
        <button onClick={()=>handleCardAction("download")} disabled={cardStatus==="generating"} style={{
          flex:1,background:cardStatus==="done"?"#0D2818":C.surface2,color:C.white,border:`1px solid ${C.border}`,
          padding:"13px 0",cursor:cardStatus==="generating"?"wait":"pointer",
          fontFamily:F.body,fontSize:12,fontWeight:600,letterSpacing:.5,
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          borderRadius:10,
          transition:"all .15s",
        }}>
          {cardStatus==="generating"?"⏳":cardStatus==="done"?"✓ Baixado":"⬇ Baixar card"}
        </button>
        <button onClick={()=>handleCardAction("whatsapp")} disabled={cardStatus==="generating"} style={{
          flex:1,background:"#25D366",color:"#fff",border:"none",
          padding:"13px 0",cursor:cardStatus==="generating"?"wait":"pointer",
          fontFamily:F.body,fontSize:12,fontWeight:600,letterSpacing:.5,
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          borderRadius:10,
        }}>
          💬 Compartilhar
        </button>
      </div>

      {/* Tabs */}
      <div style={{borderBottom:`1px solid ${C.border}`,display:"flex",flexShrink:0}}>
        {[["matches","Jogos"],["squad","Elenco"],["pitch","Campo"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1,padding:"12px",fontSize:12,fontWeight:600,fontFamily:F.body,
            background:tab===t?C.redDim:"transparent",border:"none",cursor:"pointer",
            color:tab===t?C.red:C.muted,
            borderBottom:tab===t?`2px solid ${C.red}`:"2px solid transparent",
            transition:"all .15s",
          }}>{l}</button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 20px 110px"}}>
        {tab==="matches"&&tournament&&(
          <div>
            <div style={{fontSize:10,letterSpacing:1.5,color:C.muted,fontWeight:600,fontFamily:F.body,marginBottom:12,textTransform:"uppercase"}}>Fase de Grupos</div>
            {tournament.groupMatches.filter(m=>allMatches.includes(m)).map((m,i)=><MatchRow key={i} m={m} label={`Jogo ${i+1}`} showComment/>)}
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 14px",borderRadius:8,background:C.surface,border:`1px solid ${C.border}`,marginBottom:20,marginTop:4}}>
              <span style={{fontSize:13,fontWeight:600,color:C.ink,fontFamily:F.body}}>{tournament.pts} pts · SG {tournament.gd>0?"+":""}{tournament.gd}</span>
              <span style={{fontSize:12,fontWeight:700,color:tournament.qualified?C.red:C.muted,fontFamily:F.body}}>{tournament.qualified?"✓ Classificado":"✗ Eliminado"}</span>
            </div>
            {tournament.koMatches.some(m=>allMatches.includes(m))&&(
              <div style={{fontSize:10,letterSpacing:1.5,color:C.muted,fontWeight:600,fontFamily:F.body,marginBottom:12,textTransform:"uppercase"}}>Mata-Mata</div>
            )}
            {tournament.koMatches.filter(m=>allMatches.includes(m)).map((m,i)=><MatchRow key={i} m={m} label={m.round} showComment/>)}
          </div>
        )}
        {tab==="squad"&&(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {team.map((p,i)=>{
              const isSpecial=p.special||false;
              const ratingColor=isSpecial?C.gold:p.rating>=85?C.red:p.rating>=80?C.yellow:C.inkDim;
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:C.surface2}}>
                  <div style={{width:34,height:34,borderRadius:8,background:POS_COLOR[p.pos]||groupColor(posToGroup(p.pos)),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:F.body}}>{p.pos}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600,color:isSpecial?C.gold:C.ink,fontFamily:F.body}}>{isSpecial&&"★ "}{p.name}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2,fontFamily:F.body}}>{p._year}{p._champion?" · 🏆":""}</div>
                  </div>
                  <div style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:ratingColor}}>{p.rating}</div>
                </div>
              );
            })}
          </div>
        )}
        {tab==="pitch"&&<Pitch formation={formation} players={team}/>}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"14px 20px",background:C.bg,borderTop:`1px solid ${C.border}`,display:"flex",gap:10,zIndex:50}}>
        <button onClick={onRestart} style={{
          flex:1,background:C.red,color:C.white,border:"none",
          padding:"16px 0",cursor:"pointer",fontFamily:F.display,fontSize:14,fontWeight:700,letterSpacing:1.5,
          borderRadius:12,
          transition:"opacity .15s",
        }}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}
        >ROLAR DE NOVO</button>
        <button onClick={onHome} style={{
          flex:.45,background:C.surface2,color:C.inkDim,border:`1px solid ${C.border}`,
          padding:"16px 0",cursor:"pointer",fontFamily:F.body,fontSize:12,fontWeight:600,
          borderRadius:12,
        }}>Início</button>
      </div>
    </div>
  );
}

function MatchRow({m,label,showComment=false}){
  return(
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}`}}>
        <div>
          <div style={{fontSize:9,color:C.muted,letterSpacing:1.5,fontWeight:600,fontFamily:F.body,marginBottom:4,textTransform:"uppercase"}}>{label}</div>
          <div style={{fontSize:13,fontWeight:600,color:C.ink,fontFamily:F.body}}>{m.opp.flag} {oppLabel(m.opp)}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2,fontFamily:F.body}}>{m.opp.country}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:F.display,fontSize:26,fontWeight:700,color:m.win?C.red:m.draw?C.yellow:C.inkDim,letterSpacing:1}}>{m.myG}–{m.oppG}</div>
          <div style={{fontSize:10,fontWeight:700,color:m.win?C.red:m.draw?C.yellow:C.muted,fontFamily:F.body,letterSpacing:1,textTransform:"uppercase"}}>{m.win?"Vitória":m.draw?"Empate":"Derrota"}</div>
        </div>
      </div>
      {showComment&&m.evs&&(
        <div style={{padding:"10px 14px 4px"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
            <img src={markoBiraImg} alt="Marko e Bira" style={{width:24,height:24,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
            <div style={{fontSize:9,letterSpacing:1.5,color:C.muted,fontWeight:700,fontFamily:F.body,textTransform:"uppercase"}}>Marko Loco e Zé Bira</div>
          </div>
          <div style={{fontSize:12,color:C.inkDim,fontFamily:F.body,lineHeight:1.5,fontStyle:"italic"}}>
            "{generateMatchCommentary(m,m.myG,m.oppG,m.evs)}"
          </div>
        </div>
      )}
    </div>
  );
}
async function generateCampaignCard(champ,allMatches,team,formation,tournament){
  const W=1080,H=1920;
  const canvas=document.createElement("canvas");
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext("2d");

  const RED="#E8323A",DARK="#0A0A0A",INK="#F0F0F0";
  const MUTED="#666666",BORDER="#242424",WHITE="#FFFFFF",SURFACE="#141414";
  const GOLD="#C9A227";
  const PAD=72;

  function fillR(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
  function tx(str,x,y,font,color,align){
    ctx.save();ctx.font=font;ctx.fillStyle=color||INK;ctx.textAlign=align||"left";
    ctx.fillText(String(str),x,y);ctx.restore();
  }
  function wrapText(str,x,y,maxW,font,color,lineH){
    ctx.save();ctx.font=font;ctx.fillStyle=color||INK;
    const words=str.split(" ");let line="",cy=y;
    for(const w of words){
      const t=line?line+" "+w:w;
      if(ctx.measureText(t).width>maxW&&line){ctx.fillText(line,x,cy);line=w;cy+=lineH;}
      else{line=t;}
    }
    if(line)ctx.fillText(line,x,cy);
    ctx.restore();
    return cy;
  }

  fillR(0,0,W,H,DARK);

  // ── HEADER stripe ──
  fillR(0,0,W,260,"#1A0608");
  const TY=200;
  ctx.save();
  ctx.font="bold 140px 'Space Grotesk', sans-serif";
  ctx.fillStyle=RED;
  const w7=ctx.measureText("7").width;
  ctx.fillText("7",PAD,TY);
  ctx.fillStyle=WHITE;
  ctx.fillText("RIKAS",PAD+w7,TY);
  ctx.restore();
  tx("Uma adaptação by Órfãos de Edcarlos",PAD,TY+52,"400 23px 'DM Sans', sans-serif",MUTED);
  fillR(PAD,TY+82,W-PAD*2,2,RED);

  // ── RESULTADO ──
  const RY=TY+170;
  const koPlayed=allMatches.filter(m=>m.phase==="ko");
  const elimPhase=!tournament?.qualified?"Fase de Grupos":(koPlayed.slice(-1)[0]?.round||"");
  const elimText=elimPhase==="Fase de Grupos"?"na Fase de Grupos":"nas "+elimPhase;

  if(champ){
    tx("🏆 CAMPEÃO!",W/2,RY,"bold 76px 'Space Grotesk', sans-serif",RED,"center");
    tx("BUSCO RIVAL!",W/2,RY+78,"bold 40px 'Space Grotesk', sans-serif",WHITE,"center");
  }else{
    tx("😤 ELIMINADO.",W/2,RY,"bold 68px 'Space Grotesk', sans-serif",WHITE,"center");
    tx("TEM QUE COBRAR!",W/2,RY+72,"bold 38px 'Space Grotesk', sans-serif",RED,"center");
    tx("Caiu "+elimText,W/2,RY+120,"400 25px 'DM Sans', sans-serif",MUTED,"center");
  }
  tx(formation+"  ·  Média "+avgR(team).toFixed(1),W-PAD,RY+(champ?140:168),"400 22px 'DM Sans', sans-serif",MUTED,"right");

  // ── ELENCO (ordenado por posição) ──
  const sortedTeam=sortByPosition(team);
  const SQ=RY+(champ?200:230);
  const ROW=70;
  const SQH=44+sortedTeam.length*ROW;

  fillR(PAD,SQ,W-PAD*2,44,SURFACE);
  fillR(PAD,SQ,4,44,RED);
  tx("ELENCO DOS SONHOS",PAD+20,SQ+28,"700 16px 'DM Sans', sans-serif","rgba(255,255,255,0.45)");
  tx("RTG",W-PAD-20,SQ+28,"700 16px 'DM Sans', sans-serif","rgba(255,255,255,0.3)","right");

  const PC={GOL:"#F5A623",ZAG:"#4A90D9",LD:"#4A90D9",LE:"#4A90D9",VOL:"#7B68EE",MC:"#7B68EE",MD:"#7B68EE",ME:"#7B68EE",CA:RED};
  sortedTeam.forEach((p,i)=>{
    const ry=SQ+44+i*ROW;
    fillR(PAD,ry,W-PAD*2,ROW,i%2===0?"#161616":"#141414");
    ctx.save();ctx.strokeStyle=BORDER;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(PAD,ry);ctx.lineTo(W-PAD,ry);ctx.stroke();ctx.restore();
    const pc=PC[p.pos]||"#666";
    fillR(PAD+16,ry+ROW/2-12,46,24,pc);
    tx(p.pos,PAD+39,ry+ROW/2+7,"700 14px 'DM Sans', sans-serif",WHITE,"center");
    tx(p.name,PAD+78,ry+ROW/2-5,"600 30px 'DM Sans', sans-serif",p.special?GOLD:INK);
    tx(String(p._year),PAD+78,ry+ROW/2+20,"400 18px 'DM Sans', sans-serif",MUTED);
    const rc=p.rating>=85?RED:p.rating>=80?"#F5A623":MUTED;
    tx(String(p.rating),W-PAD-20,ry+ROW/2+12,"bold 40px 'Space Grotesk', sans-serif",rc,"right");
  });
  ctx.save();ctx.strokeStyle=BORDER;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(PAD,SQ+SQH);ctx.lineTo(W-PAD,SQ+SQH);ctx.stroke();ctx.restore();

  // ── CAMPANHA ──
  let cy=SQ+SQH+48;
  tx("CAMPANHA",PAD,cy,"700 15px 'DM Sans', sans-serif",MUTED);
  cy+=10;fillR(PAD,cy,W-PAD*2,1,BORDER);cy+=32;

  allMatches.forEach((m,gi)=>{
    const lbl=m.phase==="group"?"Grupo "+(gi+1):m.round;
    const col=m.win?RED:m.draw?"#F5A623":MUTED;
    tx(lbl,PAD,cy,"400 19px 'DM Sans', sans-serif",MUTED);
    tx(m.opp.flag+" "+oppLabel(m.opp),PAD+130,cy,"400 22px 'DM Sans', sans-serif",INK);
    tx(m.myG+"–"+m.oppG,W-PAD-60,cy,"bold 24px 'Space Grotesk', sans-serif",col,"right");
    tx(m.win?"V":m.draw?"E":"D",W-PAD-16,cy,"700 20px 'DM Sans', sans-serif",col,"right");
    cy+=36;
  });

  // ── COMENTÁRIO DE MARKO LOCO E ZÉ BIRA ──
  cy+=20;fillR(PAD,cy,W-PAD*2,1,BORDER);cy+=28;
  const avatarSize=52,avatarX=PAD,avatarY=cy-avatarSize/2-2;
  try{
    const av=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=markoBiraImg;});
    ctx.save();
    ctx.beginPath();ctx.arc(avatarX+avatarSize/2,avatarY+avatarSize/2,avatarSize/2,0,Math.PI*2);ctx.clip();
    ctx.drawImage(av,avatarX,avatarY,avatarSize,avatarSize);
    ctx.restore();
  }catch(e){}
  tx("COMENTÁRIO DE MARKO LOCO E ZÉ BIRA",PAD+avatarSize+14,cy,"700 15px 'DM Sans', sans-serif",MUTED);
  cy+=28;
  const comment='"'+generateCampaignComment(champ,allMatches,tournament,team)+'"';
  const lastY=wrapText(comment,PAD,cy,W-PAD*2,"italic 400 23px 'DM Sans', sans-serif",INK,34);
  cy=lastY+20;

  // ── RODAPÉ ──
  const FY=Math.max(cy+40,H-120);
  fillR(PAD,FY,W-PAD*2,1,BORDER);
  tx("markitomesquita.github.io/7rikas",W/2,FY+46,"400 22px 'DM Sans', sans-serif",MUTED,"center");
  tx("Jogue você também →",W/2,FY+80,"700 20px 'DM Sans', sans-serif",RED,"center");

  return canvas;
}

