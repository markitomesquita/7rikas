import { useState, useEffect, useRef } from "react";

/* ─── FONTS & GLOBAL CSS ────────────────────────────────────────────────────── */
(() => {
  const l = document.createElement("link");
  l.href = "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&display=swap";
  l.rel = "stylesheet"; document.head.appendChild(l);
  const s = document.createElement("style");
  s.textContent = `
    *{box-sizing:border-box;margin:0;padding:0;}
    html,body{background:#fff;font-family:'Inter',sans-serif;}
    ::-webkit-scrollbar{width:2px;}
    ::-webkit-scrollbar-thumb{background:#CC0000;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes popIn{0%{transform:scale(0.7);opacity:0}65%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
    @keyframes trophy{0%{transform:scale(0) rotate(-15deg);opacity:0}70%{transform:scale(1.1) rotate(3deg)}100%{transform:scale(1) rotate(0);opacity:1}}
    @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(600deg);opacity:0}}
    @keyframes goalSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
    @keyframes rerollSpin{0%{opacity:1;transform:scale(1) rotate(0)}40%{opacity:0;transform:scale(0.7) rotate(180deg)}60%{opacity:0;transform:scale(0.7) rotate(180deg)}100%{opacity:1;transform:scale(1) rotate(360deg)}}
    @keyframes liveBar{from{width:0}to{width:100%}}

    .fadeUp  { animation: fadeUp  .3s ease both; }
    .popIn   { animation: popIn   .35s cubic-bezier(.34,1.56,.64,1) both; }
    .trophy  { animation: trophy  .55s cubic-bezier(.34,1.56,.64,1) both; }
    .goalSlide { animation: goalSlide .25s ease both; }
    .rerollSpin { animation: rerollSpin .5s ease both; }

    /* Typography helpers */
    .t-display { font-family:'Archivo Black',sans-serif; }
    .t-body    { font-family:'Inter',sans-serif; }
  `;
  document.head.appendChild(s);
})();

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────────── */
const C = {
  white:   "#FFFFFF",
  bg:      "#FFFFFF",
  surface: "#F5F5F5",
  border:  "#E8E8E8",
  red:     "#CC0000",
  redHov:  "#AA0000",
  black:   "#0A0A0A",
  ink:     "#111111",
  muted:   "#888888",
  faint:   "#CCCCCC",
  yellow:  "#E5A200",
  gold:    "#F2C000",
  green:   "#2E6B38",
  greenDk: "#1E4A26",
  stripe:  "#356040",
};

/* typography shortcuts */
const F = {
  display: "'Archivo Black', sans-serif",
  body:    "'Inter', sans-serif",
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
function groupColor(g){if(g==="GOL")return C.yellow;if(g==="DEF")return C.red;if(g==="MID")return"#1A5FAA";return"#158040";}
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

/* ─── SPFC SQUADS — corrected & verified ───────────────────────────────────── */
const SQUADS=[
  {year:1980,ed:"Libertadores 1980",champion:false,players:[
    {name:"Waldir Peres",shirt:1,pos:"GOL",rating:80},{name:"Oscar",shirt:5,pos:"ZAG",rating:82},
    {name:"Aílton",shirt:4,pos:"ZAG",rating:75},{name:"Décio",shirt:3,pos:"LD",rating:74},
    {name:"Zé Maria",shirt:6,pos:"LE",rating:73},{name:"Mauro",shirt:8,pos:"VOL",rating:76},
    {name:"Gilberto",shirt:2,pos:"MC",rating:74},{name:"Mário Tilico",shirt:7,pos:"ME",rating:75},
    {name:"Paulinho",shirt:11,pos:"MD",rating:77},{name:"Serginho Chulapa",shirt:9,pos:"CA",rating:83},
    {name:"Dirceu Lopes",shirt:10,pos:"CA",rating:79},
  ]},
  {year:1986,ed:"Libertadores 1986",champion:false,players:[
    {name:"Waldir Peres",shirt:1,pos:"GOL",rating:81},{name:"Oscar",shirt:5,pos:"ZAG",rating:84},
    {name:"Mauro Galvão",shirt:4,pos:"ZAG",rating:80},{name:"Rodrigo",shirt:2,pos:"LD",rating:76},
    {name:"Zé Carlos",shirt:3,pos:"LE",rating:75},{name:"Andrade",shirt:8,pos:"VOL",rating:79},
    {name:"Renato",shirt:10,pos:"MC",rating:77},{name:"Biro-Biro",shirt:7,pos:"ME",rating:78},
    {name:"Müller",shirt:9,pos:"CA",rating:85},{name:"Casagrande",shirt:11,pos:"CA",rating:81},
    {name:"Careca",shirt:10,pos:"CA",rating:90},
  ]},
  {year:1987,ed:"Libertadores 1987",champion:false,players:[
    {name:"Waldir Peres",shirt:1,pos:"GOL",rating:80},{name:"Oscar",shirt:5,pos:"ZAG",rating:83},
    {name:"Mauro Galvão",shirt:4,pos:"ZAG",rating:81},{name:"Rodrigo",shirt:2,pos:"LD",rating:76},
    {name:"Zé Carlos",shirt:3,pos:"LE",rating:75},{name:"Andrade",shirt:8,pos:"VOL",rating:78},
    {name:"Renato",shirt:10,pos:"MC",rating:78},{name:"Biro-Biro",shirt:7,pos:"ME",rating:79},
    {name:"Müller",shirt:9,pos:"CA",rating:86},{name:"Casagrande",shirt:11,pos:"CA",rating:80},
    {name:"Careca",shirt:10,pos:"CA",rating:91},
  ]},
  {year:1992,ed:"Libertadores 1992",champion:false,players:[
    {name:"Zetti",shirt:1,pos:"GOL",rating:84},
    {name:"Ronaldão",shirt:5,pos:"ZAG",rating:80},
    {name:"Adílson",shirt:4,pos:"ZAG",rating:82},
    {name:"Cafu",shirt:2,pos:"LD",rating:88},
    {name:"Leonardo",shirt:3,pos:"LE",rating:83},
    {name:"Mazinho",shirt:8,pos:"VOL",rating:82},
    {name:"Pintado",shirt:6,pos:"VOL",rating:79},
    {name:"Raí",shirt:10,pos:"MC",rating:89},
    {name:"Müller",shirt:9,pos:"CA",rating:84},
    {name:"Palhinha",shirt:7,pos:"MD",rating:77},
    {name:"Gilmar",shirt:11,pos:"CA",rating:78},
  ]},
  // 1993 — CAMPEÃO real
  {year:1993,ed:"Libertadores 1993",champion:true,players:[
    {name:"Zetti",shirt:1,pos:"GOL",rating:85},{name:"Adílson",shirt:4,pos:"ZAG",rating:83},
    {name:"Ronaldão",shirt:5,pos:"ZAG",rating:82},{name:"Cafu",shirt:2,pos:"LD",rating:90},
    {name:"Leonardo",shirt:3,pos:"LE",rating:84},{name:"Mazinho",shirt:8,pos:"VOL",rating:83},
    {name:"Pintado",shirt:6,pos:"VOL",rating:80},{name:"Raí",shirt:10,pos:"MC",rating:92},
    {name:"Gilmar",shirt:7,pos:"MD",rating:79},{name:"Müller",shirt:9,pos:"CA",rating:85},
    {name:"Palhinha",shirt:11,pos:"CA",rating:80},
  ]},
  // 1994 — NÃO foi campeão (perdeu a final para Vélez Sársfield)
  {year:1994,ed:"Libertadores 1994",champion:false,players:[
    {name:"Zetti",shirt:1,pos:"GOL",rating:85},{name:"Adílson",shirt:4,pos:"ZAG",rating:83},
    {name:"Ronaldão",shirt:5,pos:"ZAG",rating:83},{name:"Cafu",shirt:2,pos:"LD",rating:91},
    {name:"Leonardo",shirt:3,pos:"LE",rating:85},{name:"Mazinho",shirt:8,pos:"VOL",rating:83},
    {name:"Pintado",shirt:6,pos:"VOL",rating:80},{name:"Raí",shirt:10,pos:"MC",rating:92},
    {name:"Gilmar",shirt:7,pos:"MD",rating:79},{name:"Müller",shirt:9,pos:"CA",rating:85},
    {name:"Palhinha",shirt:11,pos:"CA",rating:81},
  ]},
  {year:1995,ed:"Libertadores 1995",champion:false,players:[
    {name:"Zetti",shirt:1,pos:"GOL",rating:84},{name:"Adílson",shirt:4,pos:"ZAG",rating:82},
    {name:"Ronaldão",shirt:5,pos:"ZAG",rating:82},{name:"Cafu",shirt:2,pos:"LD",rating:91},
    {name:"Cláudio",shirt:3,pos:"LE",rating:77},{name:"Dinho",shirt:8,pos:"VOL",rating:80},
    {name:"Carlos Miguel",shirt:6,pos:"MC",rating:78},{name:"Raí",shirt:10,pos:"MC",rating:91},
    {name:"Sandro Hiroshi",shirt:7,pos:"MD",rating:78},{name:"Dodô",shirt:9,pos:"CA",rating:82},
    {name:"Palhinha",shirt:11,pos:"CA",rating:80},
  ]},
  // 1999 — elenco correto do SPFC (sem Amoroso, que só veio em 2001/2005)
  {year:1999,ed:"Libertadores 1999",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:86},
    {name:"Cléber",shirt:4,pos:"ZAG",rating:79},
    {name:"Toné",shirt:5,pos:"ZAG",rating:78},
    {name:"Fabão",shirt:2,pos:"LD",rating:80},
    {name:"Júnior",shirt:3,pos:"LE",rating:78},
    {name:"Emerson",shirt:8,pos:"VOL",rating:83},
    {name:"Marcos Assunção",shirt:6,pos:"MC",rating:82},
    {name:"Robson",shirt:10,pos:"MC",rating:79},
    {name:"Danilo",shirt:7,pos:"MD",rating:79},
    {name:"Luizão",shirt:9,pos:"CA",rating:84},
    {name:"Dodô",shirt:11,pos:"CA",rating:80},
  ]},
  // 2004 — Anderson Polga nunca jogou no SPFC; substituído por Lúcio (cedido) → usar Alex Silva + Gustavo Nery
  {year:2004,ed:"Libertadores 2004",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:88},{name:"Alex Silva",shirt:4,pos:"ZAG",rating:81},
    {name:"Rodrigo Fabri",shirt:5,pos:"ZAG",rating:79},{name:"Cicinho",shirt:2,pos:"LD",rating:84},
    {name:"Gustavo Nery",shirt:3,pos:"LE",rating:81},{name:"Mineiro",shirt:8,pos:"VOL",rating:84},
    {name:"Josué",shirt:6,pos:"VOL",rating:83},{name:"Danilo",shirt:10,pos:"MC",rating:82},
    {name:"Diego Tardelli",shirt:7,pos:"MD",rating:81},{name:"Luís Fabiano",shirt:9,pos:"CA",rating:86},
    {name:"Grafite",shirt:11,pos:"CA",rating:84},
  ]},
  // 2005 — CAMPEÃO real; Amoroso sim estava aqui
  {year:2005,ed:"Libertadores 2005",champion:true,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:89},{name:"Alex Silva",shirt:4,pos:"ZAG",rating:82},
    {name:"Rodrigo Fabri",shirt:5,pos:"ZAG",rating:80},{name:"Cicinho",shirt:2,pos:"LD",rating:85},
    {name:"Gustavo Nery",shirt:3,pos:"LE",rating:82},{name:"Mineiro",shirt:8,pos:"VOL",rating:85},
    {name:"Josué",shirt:6,pos:"VOL",rating:84},{name:"Danilo",shirt:10,pos:"MC",rating:83},
    {name:"Amoroso",shirt:7,pos:"CA",rating:84},{name:"Luís Fabiano",shirt:9,pos:"CA",rating:88},
    {name:"Grafite",shirt:11,pos:"CA",rating:85},
  ]},
  {year:2008,ed:"Libertadores 2008",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:87},{name:"Alex Silva",shirt:4,pos:"ZAG",rating:82},
    {name:"Junior",shirt:5,pos:"ZAG",rating:80},{name:"Edcarlos",shirt:2,pos:"LD",rating:81},
    {name:"Richarlyson",shirt:3,pos:"LE",rating:81},{name:"Mineiro",shirt:8,pos:"VOL",rating:83},
    {name:"Danilo",shirt:6,pos:"MC",rating:82},{name:"Hernanes",shirt:10,pos:"MC",rating:85},
    {name:"Diego Tardelli",shirt:7,pos:"MD",rating:83},{name:"Luís Fabiano",shirt:9,pos:"CA",rating:89},
    {name:"Borges",shirt:11,pos:"CA",rating:82},
  ]},
  {year:2009,ed:"Libertadores 2009",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:87},{name:"Alex Silva",shirt:4,pos:"ZAG",rating:82},
    {name:"Miranda",shirt:5,pos:"ZAG",rating:83},{name:"Edcarlos",shirt:2,pos:"LD",rating:81},
    {name:"Junior",shirt:3,pos:"LE",rating:80},{name:"Mineiro",shirt:8,pos:"VOL",rating:82},
    {name:"Hernanes",shirt:10,pos:"VOL",rating:86},{name:"Richarlyson",shirt:6,pos:"MC",rating:81},
    {name:"Dagoberto",shirt:7,pos:"CA",rating:80},{name:"Luís Fabiano",shirt:9,pos:"CA",rating:90},
    {name:"Borges",shirt:11,pos:"CA",rating:83},
  ]},
  {year:2012,ed:"Libertadores 2012",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:86},{name:"Rhodolfo",shirt:4,pos:"ZAG",rating:81},
    {name:"Miranda",shirt:5,pos:"ZAG",rating:85},{name:"Douglas",shirt:2,pos:"LD",rating:80},
    {name:"Wellington",shirt:3,pos:"LE",rating:79},{name:"Hernanes",shirt:8,pos:"VOL",rating:87},
    {name:"Casemiro",shirt:6,pos:"VOL",rating:81},{name:"Paulo Henrique Ganso",shirt:10,pos:"MC",rating:86},
    {name:"Jadson",shirt:7,pos:"MD",rating:83},{name:"Lucas Moura",shirt:11,pos:"ME",rating:88},
    {name:"Osvaldo",shirt:9,pos:"CA",rating:82},
  ]},
  {year:2013,ed:"Libertadores 2013",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:85},{name:"Rhodolfo",shirt:4,pos:"ZAG",rating:80},
    {name:"Miranda",shirt:5,pos:"ZAG",rating:86},{name:"Douglas",shirt:2,pos:"LD",rating:80},
    {name:"Wellington",shirt:3,pos:"LE",rating:79},{name:"Casemiro",shirt:6,pos:"VOL",rating:83},
    {name:"Jadson",shirt:8,pos:"MC",rating:83},{name:"Paulo Henrique Ganso",shirt:10,pos:"MC",rating:85},
    {name:"Willian José",shirt:7,pos:"MD",rating:79},{name:"Osvaldo",shirt:9,pos:"CA",rating:82},
    {name:"Aloísio",shirt:11,pos:"CA",rating:80},
  ]},
  {year:2016,ed:"Libertadores 2016",champion:false,players:[
    {name:"Rogério Ceni",shirt:1,pos:"GOL",rating:84},{name:"Rodrigo Caio",shirt:4,pos:"ZAG",rating:83},
    {name:"Lugano",shirt:5,pos:"ZAG",rating:83},{name:"Maicon",shirt:2,pos:"LD",rating:82},
    {name:"Reinaldo",shirt:3,pos:"LE",rating:82},{name:"Wesley",shirt:6,pos:"VOL",rating:80},
    {name:"Ganso",shirt:8,pos:"MC",rating:83},{name:"Cueva",shirt:10,pos:"MC",rating:85},
    {name:"Centurión",shirt:7,pos:"MD",rating:84},{name:"Calleri",shirt:9,pos:"CA",rating:83},
    {name:"Chavez",shirt:11,pos:"ME",rating:79},
  ]},
  {year:2019,ed:"Libertadores 2019",champion:false,players:[
    {name:"Tiago Volpi",shirt:1,pos:"GOL",rating:82},{name:"Bruno Alves",shirt:4,pos:"ZAG",rating:82},
    {name:"Arboleda",shirt:5,pos:"ZAG",rating:83},{name:"Juanfran",shirt:2,pos:"LD",rating:81},
    {name:"Reinaldo",shirt:3,pos:"LE",rating:82},{name:"Tchê Tchê",shirt:8,pos:"VOL",rating:81},
    {name:"Liziero",shirt:6,pos:"VOL",rating:79},{name:"Luan",shirt:10,pos:"MC",rating:82},
    {name:"Toró",shirt:7,pos:"ME",rating:79},{name:"Pablo",shirt:9,pos:"CA",rating:82},
    {name:"Pato",shirt:11,pos:"CA",rating:83},
  ]},
  {year:2021,ed:"Libertadores 2021",champion:false,players:[
    {name:"Tiago Volpi",shirt:1,pos:"GOL",rating:83},{name:"Arboleda",shirt:4,pos:"ZAG",rating:84},
    {name:"Miranda",shirt:5,pos:"ZAG",rating:83},{name:"Reinaldo",shirt:6,pos:"LE",rating:82},
    {name:"Léo",shirt:3,pos:"LE",rating:80},{name:"Liziero",shirt:8,pos:"VOL",rating:80},
    {name:"Luan",shirt:10,pos:"MC",rating:82},{name:"Gabriel Sara",shirt:7,pos:"MC",rating:81},
    {name:"Eder",shirt:9,pos:"CA",rating:81},{name:"Luciano",shirt:11,pos:"CA",rating:84},
    {name:"Pablo",shirt:23,pos:"CA",rating:82},
  ]},
  {year:2022,ed:"Libertadores 2022",champion:false,players:[
    {name:"Felipe Alves",shirt:1,pos:"GOL",rating:81},{name:"Arboleda",shirt:4,pos:"ZAG",rating:84},
    {name:"Miranda",shirt:5,pos:"ZAG",rating:82},{name:"Rafinha",shirt:2,pos:"LD",rating:83},
    {name:"Welington",shirt:3,pos:"LE",rating:81},{name:"Pablo Maia",shirt:8,pos:"VOL",rating:82},
    {name:"Igor Gomes",shirt:6,pos:"MC",rating:81},{name:"Nestor",shirt:10,pos:"MC",rating:81},
    {name:"Rigoni",shirt:7,pos:"MD",rating:80},{name:"Calleri",shirt:9,pos:"CA",rating:85},
    {name:"Luciano",shirt:11,pos:"CA",rating:84},
  ]},
  {year:2023,ed:"Libertadores 2023",champion:false,players:[
    {name:"Rafael",shirt:1,pos:"GOL",rating:84},{name:"Arboleda",shirt:4,pos:"ZAG",rating:84},
    {name:"Beraldo",shirt:5,pos:"ZAG",rating:81},{name:"Rafinha",shirt:2,pos:"LD",rating:83},
    {name:"Welington",shirt:3,pos:"LE",rating:82},{name:"Pablo Maia",shirt:8,pos:"VOL",rating:83},
    {name:"Alisson",shirt:6,pos:"MC",rating:82},{name:"Michel Araújo",shirt:10,pos:"MC",rating:81},
    {name:"Rodriguinho",shirt:7,pos:"MD",rating:80},{name:"Calleri",shirt:9,pos:"CA",rating:86},
    {name:"Luciano",shirt:11,pos:"CA",rating:85},
  ]},
  {year:2024,ed:"Libertadores 2024",champion:false,players:[
    {name:"Rafael",shirt:1,pos:"GOL",rating:84},{name:"Arboleda",shirt:4,pos:"ZAG",rating:84},
    {name:"Alan Franco",shirt:5,pos:"ZAG",rating:82},{name:"Rafinha",shirt:2,pos:"LD",rating:82},
    {name:"Welington",shirt:3,pos:"LE",rating:82},{name:"Pablo Maia",shirt:8,pos:"VOL",rating:84},
    {name:"Alisson",shirt:6,pos:"MC",rating:83},{name:"Ferreirinha",shirt:7,pos:"MD",rating:82},
    {name:"André Silva",shirt:99,pos:"CA",rating:81},{name:"Calleri",shirt:9,pos:"CA",rating:86},
    {name:"Luciano",shirt:11,pos:"CA",rating:85},
  ]},
  {year:2025,ed:"Libertadores 2025",champion:false,players:[
    {name:"Rafael",shirt:1,pos:"GOL",rating:84},{name:"Arboleda",shirt:4,pos:"ZAG",rating:83},
    {name:"Alan Franco",shirt:5,pos:"ZAG",rating:82},{name:"Ferraresi",shirt:2,pos:"LD",rating:82},
    {name:"Welington",shirt:3,pos:"LE",rating:83},{name:"Pablo Maia",shirt:8,pos:"VOL",rating:85},
    {name:"Bobadilla",shirt:6,pos:"VOL",rating:82},{name:"Oscar",shirt:10,pos:"MC",rating:84},
    {name:"Ferreirinha",shirt:7,pos:"MD",rating:83},{name:"Calleri",shirt:9,pos:"CA",rating:85},
    {name:"Luciano",shirt:11,pos:"CA",rating:84},
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
    evs.push({min:getMin(),team:"sp",name:sc.name,pos:sc.pos});
  }
  for(let i=0;i<oppG;i++){
    evs.push({min:getMin(),team:"opp",name:oppScorer(opp),club:oppLabel(opp)});
  }
  evs.sort((a,b)=>a.min-b.min);
  return{myG,oppG,win:myG>oppG,draw:myG===oppG,evs};
}

function buildPenalties(players,opp){
  const takers=shuffle([...players.filter(p=>p.pos==="CA"||p.pos==="ME"||p.pos==="MD"),
                        ...players.filter(p=>p.pos==="MC"||p.pos==="VOL"||p.pos==="LD"||p.pos==="LE")]).slice(0,5);
  const oppTakers=(opp.scorers||["Cobrador 1","Cobrador 2","Cobrador 3","Cobrador 4","Cobrador 5"]).slice(0,5);
  const kicks=[];let spScore=0,oppScore=0;let spWin=null;
  for(let i=0;i<5;i++){
    const spC=Math.random()<0.76;const oppC=Math.random()<0.74;
    if(spC)spScore++;if(oppC)oppScore++;
    kicks.push({idx:i,spName:takers[i]?.name||`Jogador ${i+1}`,spConvert:spC,
      oppName:oppTakers[i]||`Cobrador ${i+1}`,oppConvert:oppC,spScore,oppScore});
    const rem=4-i;
    if(spScore-oppScore>rem){spWin=true;break;}
    if(oppScore-spScore>rem){spWin=false;break;}
  }
  if(spWin===null)spWin=Math.random()<0.5;
  return{kicks,spWin};
}

function buildTournament(team){
  const r=avgR(team);
  const opps=shuffle(ALL_OPPONENTS);
  const groupOpps=opps.slice(0,3);
  const koOpps=opps.slice(3,7);

  const groupMatches=groupOpps.map((opp,i)=>({
    phase:"group",matchNum:i+1,label:`Grupo — Jogo ${i+1}`,opp,
    ...buildMatchEvents(team,r,opp.rating,opp),
  }));

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
  const koMatches=KO_ROUNDS.map((round,i)=>({
    phase:"ko",round,label:round,opp:koOpps[i],
    ...buildMatchEvents(team,r,koOpps[i].rating,koOpps[i]),
  }));
  return{groupMatches,pts:spPts,gd:spGD,qualified,koMatches,groupTable:allRows};
}

/* ─── PITCH ──────────────────────────────────────────────────────────────────── */
function Pitch({formation,players,compact=false}){
  const slots=FORMATIONS[formation]||FORMATIONS["4-3-3"];
  const assigned=assignToSlots(formation,players);
  return(
    <div style={{width:"100%",position:"relative"}}>
      <div style={{width:"100%",paddingBottom:compact?"130%":"155%",
        background:`repeating-linear-gradient(180deg,${C.green} 0,${C.green} 36px,${C.stripe} 36px,${C.stripe} 72px)`,
        borderRadius:8,border:`1.5px solid ${C.greenDark}`,position:"relative",overflow:"hidden"}}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 100 155" preserveAspectRatio="none">
          <rect x="3" y="3" width="94" height="149" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth=".7"/>
          <line x1="3" y1="77.5" x2="97" y2="77.5" stroke="rgba(255,255,255,.28)" strokeWidth=".7"/>
          <circle cx="50" cy="77.5" r="13" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth=".7"/>
          <circle cx="50" cy="77.5" r="1.2" fill="rgba(255,255,255,.5)"/>
          <rect x="22" y="3" width="56" height="22" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth=".6"/>
          <rect x="32" y="3" width="36" height="11" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth=".5"/>
          <rect x="22" y="130" width="56" height="22" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth=".6"/>
          <rect x="32" y="141" width="36" height="11" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth=".5"/>
          <path d="M32 25 A13 13 0 0 0 68 25" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth=".5"/>
          <path d="M32 130 A13 13 0 0 1 68 130" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth=".5"/>
          <rect x="39" y="0" width="22" height="4" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.25)" strokeWidth=".4"/>
          <rect x="39" y="151" width="22" height="4" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.25)" strokeWidth=".4"/>
        </svg>
        {slots.map((slot,i)=>{
          const p=assigned[i];const col=groupColor(slot.group);const sz=compact?28:34;
          return(
            <div key={i} style={{position:"absolute",left:`${slot.x}%`,top:`${slot.y}%`,transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",zIndex:5}}>
              {p?(
                <div className="popIn" style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{width:sz,height:sz,borderRadius:"50%",background:col,border:"2px solid rgba(255,255,255,.92)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:compact?7:8,fontWeight:900,color:"#fff",fontFamily:F.display,boxShadow:"0 2px 8px rgba(0,0,0,.45)"}}>{p.shirt}</div>
                  <div style={{marginTop:2,background:"rgba(0,0,0,.78)",borderRadius:3,padding:"1px 4px",fontSize:compact?6:7.5,color:"#fff",fontWeight:700,whiteSpace:"nowrap",maxWidth:56,overflow:"hidden",textOverflow:"ellipsis",textAlign:"center"}}>
                    {p.name.split(" ").slice(-1)[0]}{p._year?` '${String(p._year).slice(-2)}`:""}
                  </div>
                </div>
              ):(
                <div style={{width:compact?26:34,height:compact?26:34,borderRadius:"50%",border:"1.5px dashed rgba(255,255,255,.45)",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.14)"}}>
                  <span style={{fontSize:compact?6:7.5,color:"rgba(255,255,255,.6)",fontWeight:700}}>{slot.slot}</span>
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
  const ps=Array.from({length:32},(_,i)=>({id:i,left:Math.random()*100,delay:Math.random()*2,dur:1.8+Math.random()*1.5,color:[C.red,C.yellow,C.black,C.white,"#FF5555","#FFD700"][i%6],size:5+Math.random()*8}));
  return(<div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:999}}>{ps.map(p=><div key={p.id} style={{position:"absolute",left:`${p.left}%`,top:-20,width:p.size,height:p.size,background:p.color,borderRadius:Math.random()>.5?"50%":"2px",animation:`confettiFall ${p.dur}s ease-in ${p.delay}s both`}}/>)}</div>);
}

/* ─── SLOT MACHINE — items pre-built so list never flashes empty ─────────────── */
function SlotMachine({squads,onDone}){
  const IH=56,DUR=2200,CENTER=2;

  // Pre-compute everything synchronously so first render already has items
  const initRef=useRef(null);
  if(!initRef.current){
    const chosen=squads[0|Math.random()*squads.length];
    const prefix=[...shuffle(squads),...shuffle(squads),...shuffle(squads)];
    const landingIdx=prefix.length;
    const list=[...prefix,chosen,...shuffle(squads),...shuffle(squads)];
    const targetOffset=(landingIdx-CENTER)*IH;
    const extraSpin=Math.round(squads.length*3+Math.random()*squads.length)*IH;
    initRef.current={chosen,list,landingIdx,targetOffset,totalTravel:extraSpin+targetOffset};
  }
  const{chosen,list,targetOffset,totalTravel}=initRef.current;

  const [offset,setOffset]=useState(0);
  const [done,setDone]=useState(false);
  const raf=useRef();

  useEffect(()=>{
    const t0=performance.now();
    const ease=t=>1-Math.pow(1-t,4);
    const tick=now=>{
      const p=Math.min((now-t0)/DUR,1);
      setOffset(ease(p)*totalTravel);
      if(p<1){raf.current=requestAnimationFrame(tick);}
      else{setOffset(targetOffset);setDone(true);setTimeout(()=>onDone(chosen),700);}
    };
    raf.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 20px",gap:14}}>
      <div style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:700}}>SORTEANDO ELENCO…</div>
      <div style={{width:"100%",maxWidth:300,height:IH*5,overflow:"hidden",
        border:`2px solid ${done?C.red:C.border}`,background:C.white,
        position:"relative",boxShadow:done?`0 0 0 3px ${C.red}18`:"none",transition:"border-color .4s,box-shadow .4s"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:64,background:"linear-gradient(to bottom,rgba(255,255,255,.97),transparent)",zIndex:3,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:64,background:"linear-gradient(to top,rgba(255,255,255,.97),transparent)",zIndex:3,pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:IH*CENTER,left:0,right:0,height:IH,
          background:done?"rgba(204,0,0,0.06)":"rgba(0,0,0,0.025)",
          borderTop:`1.5px solid ${done?C.red:C.border}`,borderBottom:`1.5px solid ${done?C.red:C.border}`,
          zIndex:2,pointerEvents:"none",transition:"all .4s"}}/>
        {/* list is always populated from ref — no flash */}
        <div style={{transform:`translateY(-${offset}px)`,willChange:"transform"}}>
          {list.map((sq,i)=>(
            <div key={i} style={{height:IH,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 18px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontFamily:F.display,fontSize:24,color:C.ink,letterSpacing:2,lineHeight:1}}>{sq.year}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:1,fontWeight:500}}>{sq.ed}</div>
            </div>
          ))}
        </div>
      </div>
      {done&&(
        <div className="fadeUp" style={{textAlign:"center"}}>
          {chosen.champion&&<div style={{fontSize:10,color:C.red,fontWeight:800,letterSpacing:2,marginBottom:3}}>🏆 ANO CAMPEÃO</div>}
          <div style={{fontFamily:F.display,fontSize:16,fontWeight:900,color:C.ink}}>{chosen.ed}</div>
        </div>
      )}
    </div>
  );
}

/* ─── REROLL ANIM ────────────────────────────────────────────────────────────── */
function RerollAnim({onDone}){
  useEffect(()=>{const t=setTimeout(onDone,600);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"absolute",inset:0,background:"rgba(240,234,224,0.94)",zIndex:20,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,borderRadius:8}}>
      <div className="rerollSpin" style={{fontSize:36}}>🎲</div>
      <div style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:700}}>SORTEANDO…</div>
    </div>
  );
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
  const [penalties,setPenalties]=useState(null);
  const [history,setHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem("7rikas5")||"[]");}catch{return[];}});

  function saveHist(e){const h=[e,...history].slice(0,15);setHistory(h);try{localStorage.setItem("7rikas5",JSON.stringify(h));}catch{}}

  function newGame(){
    setTeam([]);setUsedYrs([]);setDrawIdx(0);setFormation("4-3-3");setRerolls(3);
    setTournament(null);setMatchIdx(0);setEliminated(false);setChamp(false);setPenalties(null);
    setPhase("formation-pick");
  }

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
    const avail=SQUADS.filter(s=>!usedYrs.includes(s.year)&&s.year!==squad?.year);
    if(!avail.length)return;
    setSquad(avail[0|Math.random()*avail.length]);
  }

  function startSim(){
    const t=buildTournament(team);
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
          if(ev.team==="sp")setSpG(g=>g+1);else setOppG(g=>g+1);
          setEvents(prev=>[ev,...prev]);setFlash(true);setTimeout(()=>setFlash(false),600);
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
      if(!tournament.qualified){setEliminated(true);saveHist({date:new Date().toLocaleDateString("pt-BR"),champ:false,phase:"Grupos",formation});setPhase("result");}
      else{setMatchIdx(3);setLivePhase("idle");}
      return;
    }
    if(currentPhase==="penalties"){
      const pen=penalties;
      if(!pen?.spWin){setEliminated(true);saveHist({date:new Date().toLocaleDateString("pt-BR"),champ:false,phase:m.round,formation});setPhase("result");}
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
      if(!m.win){setEliminated(true);saveHist({date:new Date().toLocaleDateString("pt-BR"),champ:false,phase:m.round,formation});setPhase("result");}
      else if(isLastKO){setChamp(true);saveHist({date:new Date().toLocaleDateString("pt-BR"),champ:true,phase:"Campeão",formation});setPhase("result");}
      else{setMatchIdx(i=>i+1);setLivePhase("idle");}
    }
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:F.body,maxWidth:480,margin:"0 auto"}}>
      {phase==="intro"&&<IntroScreen onStart={newGame} history={history}/>}
      {phase==="formation-pick"&&<FormationPickScreen onConfirm={confirmFormation}/>}
      {phase==="draft"&&<DraftScreen showSlot={showSlot} squad={squad} drawIdx={drawIdx} team={team} formation={formation} rerolls={rerolls} showReroll={showReroll} onSlotDone={handleSlotDone} onPick={pickPlayer} onReroll={doReroll} afterReroll={afterReroll} usedYrs={usedYrs}/>}
      {phase==="lineup"&&<LineupScreen team={team} formation={formation} setFormation={setFormation} onSim={startSim}/>}
      {phase==="sim"&&tournament&&<SimScreen allMatches={allMatches} matchIdx={matchIdx} livePhase={livePhase} minute={minute} spG={spG} oppG={oppG} events={events} flash={flash} tournament={tournament} penalties={penalties} onKickoff={kickoff} onAdvance={(ph)=>advance(ph)}/>}
      {phase==="result"&&<ResultScreen champ={champ} allMatches={allMatches} team={team} formation={formation} tournament={tournament} onRestart={newGame} onHome={()=>setPhase("intro")}/>}
    </div>
  );
}

/* ─── HEADER ─────────────────────────────────────────────────────────────────── */
function Header({left=null,right=null,dark=false}){
  const bg=dark?C.black:C.white;
  const border=dark?"none":`1px solid ${C.border}`;
  return(
    <div style={{background:bg,borderBottom:border,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
      <div style={{minWidth:56}}>{left}</div>
      <div style={{textAlign:"center"}}>
        <span style={{fontFamily:F.display,fontSize:18,color:dark?C.white:C.ink,letterSpacing:1,lineHeight:1}}>
          <span style={{color:C.red}}>7</span>RIKAS
        </span>
      </div>
      <div style={{minWidth:56,textAlign:"right"}}>{right}</div>
    </div>
  );
}

/* ─── INTRO ──────────────────────────────────────────────────────────────────── */
function IntroScreen({onStart,history}){
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.white}}>
      {/* Hero — full red block like the reference */}
      <div style={{background:C.red,padding:"52px 28px 44px",position:"relative",overflow:"hidden"}}>
        <div style={{fontFamily:F.display,fontSize:72,color:C.white,lineHeight:.9,letterSpacing:-1}}>
          7RIKAS
        </div>
        <div style={{marginTop:16,fontSize:13,color:"rgba(255,255,255,0.7)",fontFamily:F.body,lineHeight:1.5,maxWidth:280}}>
          Uma jornada do SPFC rumo à glória eterna<br/>
          <span style={{color:"rgba(255,255,255,0.45)"}}>ou ódio profundo.</span>
        </div>
        <div style={{marginTop:8,fontSize:11,color:"rgba(255,255,255,0.4)",fontFamily:F.body}}>
          Uma adaptação by Órfãos de Edcarlos
        </div>
        {/* big flag watermark */}
        <div style={{position:"absolute",right:-10,bottom:-20,fontSize:120,opacity:.12,pointerEvents:"none",userSelect:"none"}}>🇾🇪</div>
      </div>

      {/* Content */}
      <div style={{flex:1,padding:"32px 24px",display:"flex",flexDirection:"column",gap:0}}>
        {/* Three taglines — clean list style like reference */}
        {[
          ["⚽","Sorteie os elencos do SPFC e monte seu time."],
          ["🏆","Dispute contra times clássicos da Liberta."],
          ["😬","Existe risco de Rafael Tolói."],
        ].map(([icon,text],i,arr)=>(
          <div key={text} style={{
            display:"flex",gap:16,alignItems:"flex-start",
            padding:"20px 0",
            borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none",
          }}>
            <span style={{fontSize:20,lineHeight:1,marginTop:1,flexShrink:0}}>{icon}</span>
            <span style={{fontSize:15,color:C.ink,lineHeight:1.5,fontFamily:F.body,fontWeight:500}}>{text}</span>
          </div>
        ))}

        <button onClick={onStart} style={{
          marginTop:32,
          background:C.black,color:C.white,border:"none",
          padding:"18px 0",width:"100%",cursor:"pointer",
          fontFamily:F.display,fontSize:16,letterSpacing:2,
          transition:"background .15s",
        }}
          onMouseEnter={e=>e.currentTarget.style.background=C.red}
          onMouseLeave={e=>e.currentTarget.style.background=C.black}
        >
          ROLAR 🎲
        </button>

        {history.length>0&&(
          <div style={{marginTop:36}}>
            <div style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:600,marginBottom:12,fontFamily:F.body}}>HISTÓRICO</div>
            {history.slice(0,4).map((h,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:13,fontWeight:600,color:h.champ?C.red:C.ink,fontFamily:F.body}}>
                  {h.champ?"🏆 Campeão":h.phase?`❌ ${h.phase}`:"❌ Eliminado"}
                </span>
                <span style={{fontSize:11,color:C.muted,fontFamily:F.body}}>{h.date} · {h.formation}</span>
              </div>
            ))}
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
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.white}}>
      <Header/>
      <div style={{padding:"28px 24px 0",flexShrink:0}}>
        <div style={{fontFamily:F.display,fontSize:28,color:C.ink,lineHeight:1,letterSpacing:-0.5}}>
          Escolha sua<br/><span style={{color:C.red}}>formação</span>
        </div>
        <div style={{fontSize:13,color:C.muted,marginTop:8,fontFamily:F.body}}>
          Defina o esquema antes de montar o elenco.
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"24px 24px 120px"}}>
        {/* Formation list — clean rows */}
        <div style={{display:"flex",flexDirection:"column",gap:0,marginBottom:28}}>
          {Object.keys(FORMATIONS).map((f,i,arr)=>(
            <div key={f} onClick={()=>setSelected(f)} style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"18px 0",
              borderBottom:`1px solid ${C.border}`,
              cursor:"pointer",
            }}>
              <div>
                <div style={{fontFamily:F.display,fontSize:22,color:selected===f?C.red:C.ink,letterSpacing:-.5,lineHeight:1}}>{f}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:4,fontFamily:F.body}}>{descriptions[f]}</div>
              </div>
              <div style={{
                width:24,height:24,borderRadius:"50%",
                border:`2px solid ${selected===f?C.red:C.faint}`,
                background:selected===f?C.red:"transparent",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,
              }}>
                {selected===f&&<div style={{width:8,height:8,borderRadius:"50%",background:C.white}}/>}
              </div>
            </div>
          ))}
        </div>

        {/* Pitch preview */}
        <div style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:600,marginBottom:12,fontFamily:F.body}}>PRÉVIA</div>
        <div style={{position:"relative",width:"100%"}}>
          <div style={{
            width:"100%",paddingBottom:"125%",
            background:`repeating-linear-gradient(180deg,${C.green} 0,${C.green} 36px,${C.stripe} 36px,${C.stripe} 72px)`,
            position:"relative",overflow:"hidden",
          }}>
            <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 100 125" preserveAspectRatio="none">
              <rect x="2" y="2" width="96" height="121" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth=".7"/>
              <line x1="2" y1="62.5" x2="98" y2="62.5" stroke="rgba(255,255,255,.22)" strokeWidth=".7"/>
              <circle cx="50" cy="62.5" r="12" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth=".6"/>
              <rect x="22" y="2" width="56" height="19" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth=".5"/>
              <rect x="22" y="104" width="56" height="19" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth=".5"/>
            </svg>
            {slots.map((slot,i)=>{
              const y=slot.y*(125/155);
              return(
                <div key={i} style={{position:"absolute",left:`${slot.x}%`,top:`${y}%`,transform:"translate(-50%,-50%)",zIndex:5}}>
                  <div style={{
                    width:30,height:30,borderRadius:"50%",
                    background:selected===slot.slot?C.red:groupColor(slot.group),
                    border:"2px solid rgba(255,255,255,.9)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:7,fontWeight:700,color:"#fff",fontFamily:F.body,
                    boxShadow:"0 1px 6px rgba(0,0,0,.35)",
                  }}>{slot.slot}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"16px 24px",background:C.white,borderTop:`1px solid ${C.border}`,zIndex:50}}>
        <button onClick={()=>onConfirm(selected)} style={{
          background:C.black,color:C.white,border:"none",
          padding:"18px 0",width:"100%",cursor:"pointer",
          fontFamily:F.display,fontSize:15,letterSpacing:2,
          transition:"background .15s",
        }}
          onMouseEnter={e=>e.currentTarget.style.background=C.red}
          onMouseLeave={e=>e.currentTarget.style.background=C.black}
        >
          JOGAR COM {selected}
        </button>
      </div>
    </div>
  );
}

/* ─── DRAFT ──────────────────────────────────────────────────────────────────── */
function DraftScreen({showSlot,squad,drawIdx,team,formation,rerolls,showReroll,onSlotDone,onPick,onReroll,afterReroll,usedYrs}){
  const avail=SQUADS.filter(s=>!usedYrs.includes(s.year)&&s.year!==squad?.year);
  const open=openGroups(formation,team);

  const progressDots=(
    <div style={{display:"flex",gap:4,alignItems:"center"}}>
      {Array.from({length:11}).map((_,i)=>(
        <div key={i} style={{
          width:i<drawIdx?20:i===drawIdx?8:6,
          height:6,
          background:i<drawIdx?C.red:i===drawIdx?C.ink:C.faint,
          transition:"all .3s",
        }}/>
      ))}
    </div>
  );

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.white}}>
      <Header
        left={progressDots}
        right={<span style={{fontFamily:F.display,fontSize:13,color:C.red,letterSpacing:1}}>{drawIdx+1}/11</span>}
      />
      {showSlot?(
        <SlotMachine squads={avail.length>3?avail:SQUADS} onDone={onSlotDone}/>
      ):squad?(
        <>
          {/* Squad banner */}
          <div style={{
            background:squad.champion?C.red:C.black,
            padding:"20px 24px",flexShrink:0,position:"relative",overflow:"hidden",
          }}>
            {squad.champion&&<div style={{position:"absolute",right:20,top:"50%",transform:"translateY(-50%)",fontSize:48,opacity:.15,pointerEvents:"none"}}>🏆</div>}
            <div style={{fontSize:11,letterSpacing:3,color:"rgba(255,255,255,.5)",fontFamily:F.body,fontWeight:600,marginBottom:4}}>
              {squad.champion?"ANO CAMPEÃO ·":""} ELENCO {squad.year}
            </div>
            <div style={{fontFamily:F.display,fontSize:24,color:C.white,lineHeight:1,letterSpacing:-.5}}>{squad.ed}</div>
            <div style={{marginTop:12,display:"flex",alignItems:"center",gap:10}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:8,height:8,background:i<rerolls?"rgba(255,255,255,.8)":"rgba(255,255,255,.2)"}}/>
              ))}
              <button onClick={onReroll} disabled={rerolls<=0} style={{
                marginLeft:4,padding:"4px 12px",fontSize:11,fontWeight:600,cursor:rerolls>0?"pointer":"not-allowed",
                background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",
                color:rerolls>0?"rgba(255,255,255,.8)":"rgba(255,255,255,.25)",fontFamily:F.body,
              }}>⟳ outro elenco</button>
            </div>
          </div>

          {/* Instruction strip */}
          <div style={{borderBottom:`1px solid ${C.border}`,padding:"10px 24px"}}>
            <span style={{fontSize:11,letterSpacing:2,color:C.muted,fontWeight:600,fontFamily:F.body}}>
              ESCOLHA 1 JOGADOR — {drawIdx+1}/11
            </span>
          </div>

          {/* Scrollable body: list above, pitch below */}
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",position:"relative"}}>
            {showReroll&&<RerollAnim onDone={afterReroll}/>}

            {/* Player list */}
            <div style={{padding:"16px 24px 0",flexShrink:0}}>
              {squad.players.map((p,i)=>{
                const isOpen=open.has(posToGroup(p.pos));
                return <PlayerRow key={i} player={p} year={squad.year} onPick={()=>onPick(p)} disabled={!isOpen}/>;
              })}
            </div>

            {/* Divider label */}
            <div style={{padding:"20px 24px 8px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
              <div style={{flex:1,height:1,background:C.border}}/>
              <span style={{fontSize:10,letterSpacing:2,color:C.muted,fontWeight:600,fontFamily:F.body,whiteSpace:"nowrap"}}>TIME EM CONSTRUÇÃO</span>
              <div style={{flex:1,height:1,background:C.border}}/>
            </div>

            {/* Pitch */}
            <div style={{padding:"0 24px 24px",flexShrink:0}}>
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
  const col=groupColor(posToGroup(player.pos));
  return(
    <div
      onMouseEnter={()=>!disabled&&setHov(true)}
      onMouseLeave={()=>setHov(false)}
      onClick={()=>!disabled&&onPick()}
      style={{
        display:"flex",alignItems:"center",gap:14,
        padding:"14px 0",
        borderBottom:`1px solid ${C.border}`,
        cursor:disabled?"not-allowed":"pointer",
        opacity:disabled?0.3:1,
        background:hov&&!disabled?"rgba(204,0,0,.03)":"transparent",
        transition:"background .1s, opacity .1s",
      }}
    >
      {/* Pos badge */}
      <div style={{
        width:36,height:36,background:disabled?C.faint:col,
        display:"flex",alignItems:"center",justifyContent:"center",
        flexShrink:0,
      }}>
        <span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:F.body,letterSpacing:.3}}>{player.pos}</span>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:15,fontWeight:600,color:disabled?C.muted:C.ink,fontFamily:F.body,lineHeight:1.2}}>
          {player.name}
        </div>
        <div style={{fontSize:11,color:C.muted,marginTop:2,fontFamily:F.body}}>
          {year}{disabled?" · posição preenchida":""}
        </div>
      </div>
      <div style={{fontFamily:F.display,fontSize:26,color:disabled?C.faint:player.rating>=88?C.red:C.ink,flexShrink:0}}>
        {player.rating}
      </div>
    </div>
  );
}

/* ─── LINEUP ─────────────────────────────────────────────────────────────────── */
function LineupScreen({team,formation,setFormation,onSim}){
  const [tab,setTab]=useState("pitch");
  const rating=avgR(team).toFixed(1);
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.white}}>
      <Header
        right={<span style={{fontFamily:F.display,fontSize:15,color:C.red}}>{rating}</span>}
      />
      {/* Formation picker */}
      <div style={{padding:"0 24px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:0,flexShrink:0}}>
        {Object.keys(FORMATIONS).map(f=>(
          <button key={f} onClick={()=>setFormation(f)} style={{
            padding:"12px 14px",fontSize:12,fontWeight:600,
            background:"transparent",border:"none",cursor:"pointer",fontFamily:F.body,
            color:formation===f?C.ink:C.muted,
            borderBottom:formation===f?`2px solid ${C.ink}`:"2px solid transparent",
            transition:"color .15s",
          }}>{f}</button>
        ))}
      </div>
      {/* Tab bar */}
      <div style={{borderBottom:`1px solid ${C.border}`,display:"flex",flexShrink:0}}>
        {[["pitch","Campo"],["list","Elenco"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1,padding:"12px",fontSize:12,fontWeight:600,fontFamily:F.body,
            background:"transparent",border:"none",cursor:"pointer",
            color:tab===t?C.red:C.muted,
            borderBottom:tab===t?`2px solid ${C.red}`:"2px solid transparent",
          }}>{l}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 24px 120px"}}>
        {tab==="pitch"?<Pitch formation={formation} players={team}/>:(
          <div>
            {team.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:36,height:36,background:groupColor(posToGroup(p.pos)),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:F.body}}>{p.pos}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600,color:C.ink,fontFamily:F.body}}>
                    {p.name}
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2,fontFamily:F.body}}>{p._year}{p._champion?" · 🏆":""}</div>
                </div>
                <div style={{fontFamily:F.display,fontSize:24,color:p.rating>=88?C.red:C.ink}}>{p.rating}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"16px 24px",background:C.white,borderTop:`1px solid ${C.border}`,zIndex:50}}>
        <button onClick={onSim} style={{
          background:C.black,color:C.white,border:"none",
          padding:"18px 0",width:"100%",cursor:"pointer",
          fontFamily:F.display,fontSize:15,letterSpacing:2,
          transition:"background .15s",
        }}
          onMouseEnter={e=>e.currentTarget.style.background=C.red}
          onMouseLeave={e=>e.currentTarget.style.background=C.black}
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
  const scoreBg=isDone?(m.win?C.red:C.black):C.black;
  const doneBg=m.draw?C.yellow:m.win?C.red:C.black;
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
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.white}}>
      <Header right={dots}/>

      {/* Previous results strip */}
      {matchIdx>0&&(
        <div style={{borderBottom:`1px solid ${C.border}`,padding:"8px 24px",display:"flex",gap:12,overflowX:"auto",flexShrink:0}}>
          {allMatches.slice(0,matchIdx).map((prev,i)=>(
            <div key={i} style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
              <span style={{fontSize:10,color:C.muted,fontWeight:600,fontFamily:F.body}}>{prev.phase==="group"?`G${i+1}`:prev.round?.slice(0,3).toUpperCase()}</span>
              <span style={{fontFamily:F.display,fontSize:14,color:prev.win?C.red:C.ink}}>{prev.myG}–{prev.oppG}</span>
              <span style={{fontSize:12}}>{prev.opp.flag}</span>
            </div>
          ))}
        </div>
      )}

      {/* Scoreboard — always black bg */}
      <div style={{background:scoreBg,padding:"24px",transition:"background .5s",flexShrink:0}}>
        <div style={{textAlign:"center",marginBottom:12}}>
          <span style={{fontSize:10,letterSpacing:3,color:"rgba(255,255,255,.35)",fontFamily:F.body,fontWeight:600}}>
            {m.label?.toUpperCase()}
          </span>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:6}}>🇾🇪</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:600,fontFamily:F.body,letterSpacing:1}}>SÃO PAULO</div>
          </div>
          <div style={{textAlign:"center",minWidth:120}}>
            {isIdle
              ? <div style={{fontFamily:F.display,fontSize:44,color:"rgba(255,255,255,.2)",letterSpacing:4}}>–  –</div>
              : <div style={{fontFamily:F.display,fontSize:56,color:C.white,letterSpacing:6,lineHeight:1}}>{spG}  {oppG}</div>
            }
            {isLive&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:6}}>
                <div style={{width:6,height:6,background:C.red,animation:"pulse 1s infinite"}}/>
                <span style={{fontFamily:F.body,fontSize:12,color:"rgba(255,255,255,.5)",fontWeight:600,letterSpacing:2}}>{min2}'</span>
              </div>
            )}
            {isDone&&(
              <div style={{fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:600,fontFamily:F.body,letterSpacing:2,marginTop:6}}>
                {m.win?"VITÓRIA":m.draw&&isKO?"EMPATE":m.draw?"EMPATE":"DERROTA"}
              </div>
            )}
          </div>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:6}}>{m.opp.flag}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.5)",fontWeight:600,fontFamily:F.body}}>{oppLabel(m.opp)}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.25)",marginTop:2,fontFamily:F.body}}>{m.opp.country}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{flex:1,overflowY:"auto",padding:"0 0 110px"}}>
        {isIdle&&(
          <div style={{padding:"48px 24px",textAlign:"center"}}>
            <div style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:600,fontFamily:F.body,marginBottom:20}}>
              {isGroup?"FASE DE GRUPOS":m.round?.toUpperCase()}
            </div>
            <div style={{fontFamily:F.display,fontSize:26,color:C.ink,lineHeight:1.1,marginBottom:8,letterSpacing:-.5}}>
              🇾🇪 São Paulo<br/>×<br/>{m.opp.flag} {oppLabel(m.opp)}
            </div>
            <div style={{marginTop:32}}>
              <button onClick={onKickoff} style={{
                background:C.black,color:C.white,border:"none",
                padding:"18px 56px",cursor:"pointer",
                fontFamily:F.display,fontSize:15,letterSpacing:2,
                transition:"background .15s",
              }}
                onMouseEnter={e=>e.currentTarget.style.background=C.red}
                onMouseLeave={e=>e.currentTarget.style.background=C.black}
              >APITAR ▶</button>
            </div>
          </div>
        )}

        {isGroupResult&&<GroupResultCard tournament={tournament} onContinue={()=>onAdvance("groupResult")}/>}
        {isPenalties&&penalties&&<PenaltyScreen penalties={penalties} opp={m.opp} onContinue={()=>onAdvance("penalties")}/>}

        {(isLive||isDone)&&(
          <div>
            <div style={{padding:"12px 24px",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:600,fontFamily:F.body}}>LANCES</span>
            </div>
            {events.length===0&&isLive&&(
              <div style={{padding:"32px 24px",textAlign:"center",color:C.muted,fontSize:13,fontFamily:F.body,animation:"pulse 2s infinite"}}>
                Aguardando lance…
              </div>
            )}
            {events.map((ev,i)=>(
              <div key={i} className={i===0?"goalSlide":""} style={{
                display:"flex",alignItems:"center",gap:14,
                padding:"14px 24px",borderBottom:`1px solid ${C.border}`,
                background:ev.team==="sp"?"rgba(204,0,0,.03)":C.white,
              }}>
                <span style={{fontFamily:F.body,fontSize:12,color:C.muted,fontWeight:600,minWidth:32}}>{ev.min}'</span>
                <span style={{fontSize:16}}>⚽</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:ev.team==="sp"?C.red:C.ink,fontFamily:F.body}}>{ev.name}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2,fontFamily:F.body}}>{ev.team==="sp"?ev.pos:ev.club}</div>
                </div>
                <span style={{fontSize:18}}>{ev.team==="sp"?"🇾🇪":m.opp.flag}</span>
              </div>
            ))}
            {isLive&&(
              <div style={{padding:"14px 24px",display:"flex",gap:8,alignItems:"center"}}>
                <div style={{width:6,height:6,background:C.red,animation:"pulse 1s infinite",flexShrink:0}}/>
                <span style={{fontSize:12,color:C.muted,fontWeight:500,fontFamily:F.body}}>{min2}' em andamento</span>
              </div>
            )}
          </div>
        )}
      </div>

      {isDone&&!isGroupResult&&!isPenalties&&(
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"16px 24px",background:C.white,borderTop:`1px solid ${C.border}`,zIndex:50}}>
          <button onClick={()=>onAdvance("done")} style={{
            background:doneBg,color:doneFg,border:"none",
            padding:"18px 0",width:"100%",cursor:"pointer",
            fontFamily:F.display,fontSize:15,letterSpacing:2,
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
    <div style={{padding:"24px 24px"}}>
      <div style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:600,fontFamily:F.body,marginBottom:20}}>FASE DE GRUPOS — CLASSIFICAÇÃO</div>

      {/* Table */}
      <div style={{border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:24}}>
        <div style={{background:C.black,padding:"10px 16px",display:"flex",alignItems:"center"}}>
          <span style={{fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:600,fontFamily:F.body,flex:1}}>TIME</span>
          {["J","V","E","D","GP","GC","PTS"].map(h=>(
            <span key={h} style={{fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:600,fontFamily:F.body,minWidth:28,textAlign:"center"}}>{h}</span>
          ))}
        </div>
        {groupTable.map((row,i)=>(
          <div key={i} style={{
            padding:"12px 16px",display:"flex",alignItems:"center",
            background:row.isSP?"rgba(204,0,0,.04)":C.white,
            borderTop:`1px solid ${C.border}`,
          }}>
            <div style={{flex:1,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:C.muted,fontWeight:600,fontFamily:F.body,minWidth:16}}>{i+1}</span>
              <span style={{fontSize:16}}>{row.flag}</span>
              <span style={{fontSize:13,fontWeight:row.isSP?700:500,color:C.ink,fontFamily:F.body}}>{row.name}</span>
              {i<2&&<span style={{fontSize:9,color:C.red,fontWeight:700,fontFamily:F.body}}>✓</span>}
            </div>
            {[row.w+row.d+row.l,row.w,row.d,row.l,row.gf,row.ga,row.pts].map((v,j)=>(
              <span key={j} style={{fontSize:13,fontWeight:j===6?700:400,color:j===6?(row.isSP?C.red:C.ink):C.muted,minWidth:28,textAlign:"center",fontFamily:F.body}}>{v}</span>
            ))}
          </div>
        ))}
      </div>

      <div style={{textAlign:"center",padding:"16px 0 24px"}}>
        {qualified?(
          <>
            <div style={{fontFamily:F.display,fontSize:22,color:C.ink,letterSpacing:-.5,marginBottom:6}}>São Paulo classificado!</div>
            <div style={{fontSize:13,color:C.muted,fontFamily:F.body}}>{pts} pontos · {groupTable.findIndex(r=>r.isSP)+1}º do grupo</div>
          </>
        ):(
          <>
            <div style={{fontFamily:F.display,fontSize:22,color:C.ink,letterSpacing:-.5,marginBottom:6}}>São Paulo eliminado</div>
            <div style={{fontSize:13,color:C.muted,fontFamily:F.body}}>{pts} ponto{pts!==1?"s":""} · {groupTable.findIndex(r=>r.isSP)+1}º do grupo</div>
          </>
        )}
      </div>

      <button onClick={onContinue} style={{
        background:qualified?C.black:C.red,color:C.white,border:"none",
        padding:"18px 0",width:"100%",cursor:"pointer",
        fontFamily:F.display,fontSize:15,letterSpacing:2,
      }}
        onMouseEnter={e=>e.currentTarget.style.background=C.red}
        onMouseLeave={e=>e.currentTarget.style.background=qualified?C.black:C.red}
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
    <div style={{padding:"24px"}}>
      {/* Scoreboard */}
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:600,fontFamily:F.body,marginBottom:16}}>DISPUTA DE PÊNALTIS</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:4}}>🇾🇪</div>
            <div style={{fontSize:10,color:C.muted,fontWeight:600,fontFamily:F.body}}>SÃO PAULO</div>
          </div>
          <div style={{fontFamily:F.display,fontSize:52,color:C.ink,letterSpacing:4,lineHeight:1}}>
            {spScore}<span style={{fontSize:28,color:C.faint}}> × </span>{oppScore}
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:4}}>{opp.flag}</div>
            <div style={{fontSize:10,color:C.muted,fontWeight:600,fontFamily:F.body,maxWidth:60,lineHeight:1.3}}>{opp.name}</div>
          </div>
        </div>
      </div>

      {/* Kicks */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {kicks.slice(0,revealed).map((k,i)=>(
          <div key={i} className="goalSlide" style={{display:"flex",gap:8,alignItems:"stretch"}}>
            {/* SP side */}
            <div style={{flex:1,background:k.spConvert?"rgba(204,0,0,.05)":C.surface,borderLeft:`3px solid ${k.spConvert?C.red:C.faint}`,padding:"10px 12px"}}>
              <div style={{fontSize:13,fontWeight:600,color:C.ink,fontFamily:F.body}}>{k.spName}</div>
              <div style={{fontSize:11,color:k.spConvert?C.red:C.muted,marginTop:2,fontFamily:F.body,fontWeight:600}}>
                {k.spConvert?"⚽ GOOOOL!":"❌ Defendida"}
              </div>
            </div>
            <div style={{width:24,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:10,color:C.muted,fontFamily:F.body,fontWeight:600}}>{i+1}</span>
            </div>
            {/* OPP side */}
            <div style={{flex:1,background:k.oppConvert?C.surface:"rgba(0,0,0,.02)",borderRight:`3px solid ${k.oppConvert?C.ink:C.faint}`,padding:"10px 12px",textAlign:"right"}}>
              <div style={{fontSize:13,fontWeight:600,color:C.ink,fontFamily:F.body}}>{k.oppName}</div>
              <div style={{fontSize:11,color:k.oppConvert?C.ink:C.muted,marginTop:2,fontFamily:F.body,fontWeight:600}}>
                {k.oppConvert?"⚽ GOOOOL!":"❌ Defendida"}
              </div>
            </div>
          </div>
        ))}
        {!done&&(
          <div style={{textAlign:"center",padding:"16px",color:C.muted,fontSize:13,fontFamily:F.body,animation:"pulse 1s infinite"}}>
            Próximo cobrador…
          </div>
        )}
      </div>

      {done&&(
        <>
          <div style={{textAlign:"center",padding:"16px 0 24px"}}>
            <div style={{fontFamily:F.display,fontSize:24,color:C.ink,letterSpacing:-.5,marginBottom:4}}>
              {spWin?"São Paulo vence!":oppLabel(opp)+" vence"}
            </div>
            <div style={{fontSize:13,color:C.muted,fontFamily:F.body}}>Disputa de pênaltis</div>
          </div>
          <button onClick={onContinue} style={{
            background:spWin?C.black:C.red,color:C.white,border:"none",
            padding:"18px 0",width:"100%",cursor:"pointer",
            fontFamily:F.display,fontSize:15,letterSpacing:2,
          }}>
            {spWin?"PRÓXIMO JOGO":"VER RESULTADO"}
          </button>
        </>
      )}
    </div>
  );
}

/* ─── RESULT SCREEN ──────────────────────────────────────────────────────────── */
function ResultScreen({champ,allMatches,team,formation,tournament,onRestart,onHome}){
  const[tab,setTab]=useState("matches");
  const[cardStatus,setCardStatus]=useState("idle");

  async function handleCardAction(action){
    setCardStatus("generating");
    await new Promise(r=>setTimeout(r,100));
    try{
      const canvas=generateCampaignCard(champ,allMatches,team,formation,tournament);
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

  const lastMatch=allMatches[matchIdx>0?matchIdx-1:0];
  // Determine the actual phase where elimination happened
  const elimPhase=!tournament?.qualified
    ? "Fase de Grupos"
    : lastMatch?.round||lastMatch?.label||"";

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:C.white}}>
      {champ&&<Confetti/>}

      {/* Hero */}
      <div style={{background:champ?C.red:C.black,padding:"48px 24px 36px",position:"relative",overflow:"hidden",flexShrink:0}}>
        {champ&&<div style={{position:"absolute",right:-20,top:"50%",transform:"translateY(-50%)",fontSize:160,opacity:.08,pointerEvents:"none"}}>🏆</div>}
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontSize:10,letterSpacing:3,color:"rgba(255,255,255,.4)",fontWeight:600,fontFamily:F.body,marginBottom:12}}>
            {champ?"CAMPEÃO DA LIBERTADORES":"ELIMINADO"}
          </div>
          {champ?(
            <>
              <div className="trophy" style={{fontSize:52,marginBottom:12}}>🏆</div>
              <div style={{fontFamily:F.display,fontSize:36,color:C.white,lineHeight:.95,letterSpacing:-.5}}>São Paulo<br/>conquista<br/>a América</div>
            </>
          ):(
            <>
              <div style={{fontSize:44,marginBottom:12}}>😤</div>
              <div style={{fontFamily:F.display,fontSize:36,color:C.white,lineHeight:.95,letterSpacing:-.5}}>
                Caiu nas<br/><span style={{color:"rgba(255,255,255,.5)"}}>{elimPhase}</span>
              </div>
              <div style={{marginTop:14,fontSize:13,color:"rgba(255,255,255,.5)",fontFamily:F.body,fontWeight:600,letterSpacing:2}}>
                TEM QUE COBRAR!
              </div>
            </>
          )}
        </div>
      </div>

      {/* Share buttons */}
      <div style={{padding:"16px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0}}>
        <button onClick={()=>handleCardAction("download")} disabled={cardStatus==="generating"} style={{
          flex:1,background:cardStatus==="done"?"#158040":C.black,color:C.white,border:"none",
          padding:"13px 0",cursor:cardStatus==="generating"?"wait":"pointer",
          fontFamily:F.body,fontSize:12,fontWeight:600,letterSpacing:.5,
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          transition:"background .15s",
        }}>
          {cardStatus==="generating"?"⏳":cardStatus==="done"?"✓ Baixado":"⬇ Baixar card"}
        </button>
        <button onClick={()=>handleCardAction("whatsapp")} disabled={cardStatus==="generating"} style={{
          flex:1,background:"#25D366",color:"#fff",border:"none",
          padding:"13px 0",cursor:cardStatus==="generating"?"wait":"pointer",
          fontFamily:F.body,fontSize:12,fontWeight:600,letterSpacing:.5,
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,
        }}>
          💬 Compartilhar
        </button>
      </div>

      {/* Tabs */}
      <div style={{borderBottom:`1px solid ${C.border}`,display:"flex",flexShrink:0}}>
        {[["matches","Jogos"],["squad","Elenco"],["pitch","Campo"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            flex:1,padding:"12px",fontSize:12,fontWeight:600,fontFamily:F.body,
            background:"transparent",border:"none",cursor:"pointer",
            color:tab===t?C.red:C.muted,
            borderBottom:tab===t?`2px solid ${C.red}`:"2px solid transparent",
          }}>{l}</button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"20px 24px 110px"}}>
        {tab==="matches"&&tournament&&(
          <div>
            <div style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:600,fontFamily:F.body,marginBottom:16}}>FASE DE GRUPOS</div>
            {tournament.groupMatches.map((m,i)=><MatchRow key={i} m={m} label={`Jogo ${i+1}`}/>)}
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
              <span style={{fontSize:13,fontWeight:600,color:C.ink,fontFamily:F.body}}>{tournament.pts} pts · SG {tournament.gd>0?"+":""}{tournament.gd}</span>
              <span style={{fontSize:12,fontWeight:700,color:tournament.qualified?C.red:C.muted,fontFamily:F.body}}>{tournament.qualified?"✓ Classificado":"✗ Eliminado"}</span>
            </div>
            {tournament.koMatches.some(m=>allMatches.includes(m))&&(
              <div style={{fontSize:10,letterSpacing:3,color:C.muted,fontWeight:600,fontFamily:F.body,marginBottom:16}}>MATA-MATA</div>
            )}
            {tournament.koMatches.filter(m=>allMatches.includes(m)).map((m,i)=><MatchRow key={i} m={m} label={m.round}/>)}
          </div>
        )}
        {tab==="squad"&&(
          <div>
            {team.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:36,height:36,background:groupColor(posToGroup(p.pos)),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:F.body}}>{p.pos}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:C.ink,fontFamily:F.body}}>{p.name}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2,fontFamily:F.body}}>{p._year}{p._champion?" · 🏆":""}</div>
                </div>
                <div style={{fontFamily:F.display,fontSize:24,color:p.rating>=88?C.red:C.ink}}>{p.rating}</div>
              </div>
            ))}
          </div>
        )}
        {tab==="pitch"&&<Pitch formation={formation} players={team}/>}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"16px 24px",background:C.white,borderTop:`1px solid ${C.border}`,display:"flex",gap:10,zIndex:50}}>
        <button onClick={onRestart} style={{
          flex:1,background:C.black,color:C.white,border:"none",
          padding:"16px 0",cursor:"pointer",fontFamily:F.display,fontSize:14,letterSpacing:2,
          transition:"background .15s",
        }}
          onMouseEnter={e=>e.currentTarget.style.background=C.red}
          onMouseLeave={e=>e.currentTarget.style.background=C.black}
        >ROLAR DE NOVO</button>
        <button onClick={onHome} style={{
          flex:.45,background:"transparent",color:C.muted,border:`1px solid ${C.border}`,
          padding:"16px 0",cursor:"pointer",fontFamily:F.body,fontSize:12,fontWeight:600,
        }}>Início</button>
      </div>
    </div>
  );
}

function MatchRow({m,label}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:`1px solid ${C.border}`}}>
      <div>
        <div style={{fontSize:10,color:C.muted,letterSpacing:2,fontWeight:600,fontFamily:F.body,marginBottom:4}}>{label?.toUpperCase()}</div>
        <div style={{fontSize:14,fontWeight:600,color:C.ink,fontFamily:F.body}}>{m.opp.flag} {oppLabel(m.opp)}</div>
        <div style={{fontSize:11,color:C.muted,marginTop:2,fontFamily:F.body}}>{m.opp.country}</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontFamily:F.display,fontSize:28,color:m.win?C.red:C.ink,letterSpacing:1}}>{m.myG}–{m.oppG}</div>
        <div style={{fontSize:10,fontWeight:700,color:m.win?C.red:C.muted,fontFamily:F.body,letterSpacing:1}}>{m.win?"VITÓRIA":m.draw?"EMPATE":"DERROTA"}</div>
      </div>
    </div>
  );
}
function generateCampaignCard(champ,allMatches,team,formation,tournament){
  const W=1080,H=1920;
  const canvas=document.createElement("canvas");
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext("2d");

  const RED="#CC0000",BLACK="#0A0A0A",INK="#111111";
  const MUTED="#AAAAAA",BORDER="#E8E8E8",WHITE="#FFFFFF",SURFACE="#F7F7F7";
  const PAD=80;

  function fillR(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
  function hline(y2,c){
    ctx.save();ctx.strokeStyle=c||BORDER;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(PAD,y2);ctx.lineTo(W-PAD,y2);ctx.stroke();ctx.restore();
  }
  function tx(str,x,y,font,color,align){
    ctx.save();ctx.font=font;ctx.fillStyle=color||INK;ctx.textAlign=align||"left";
    ctx.fillText(String(str),x,y);ctx.restore();
  }

  // background
  fillR(0,0,W,H,WHITE);

  // ── TÍTULO ──
  const TY=230;
  ctx.save();
  ctx.font="bold 148px Arial Black, Arial";
  ctx.fillStyle=RED;
  const w7=ctx.measureText("7").width;
  ctx.fillText("7",PAD,TY);
  ctx.fillStyle=BLACK;
  ctx.fillText("RIKAS",PAD+w7,TY);
  ctx.restore();
  tx("Uma adaptação by Órfãos de Edcarlos",PAD,TY+58,"400 25px Arial",MUTED);
  fillR(PAD,TY+94,W-PAD*2,2,RED);

  // ── RESULTADO ──
  const RY=TY+200;
  // determine elimination phase correctly
  const koPlayed=allMatches.filter(m=>m.phase==="ko");
  const elimPhase=!tournament?.qualified
    ? "Fase de Grupos"
    : (koPlayed.slice(-1)[0]?.round||"");
  const elimText=elimPhase==="Fase de Grupos"?"na Fase de Grupos":"nas "+elimPhase;

  if(champ){
    tx("🏆 CAMPEÃO!",W/2,RY,"bold 82px Arial Black, Arial",RED,"center");
    tx("BUSCO RIVAL!",W/2,RY+84,"bold 46px Arial Black, Arial",BLACK,"center");
  } else {
    tx("😤 ELIMINADO.",W/2,RY,"bold 74px Arial Black, Arial",BLACK,"center");
    tx("TEM QUE COBRAR!",W/2,RY+80,"bold 46px Arial Black, Arial",RED,"center");
    tx("Caiu "+elimText,W/2,RY+136,"400 28px Arial",MUTED,"center");
  }
  tx(formation+"  ·  Média "+avgR(team).toFixed(1),W-PAD,RY+(champ?160:196),"400 24px Arial",MUTED,"right");

  // ── ELENCO ──
  const SQ=RY+(champ?230:270);
  const ROW=88;
  const SQH=48+team.length*ROW;

  ctx.save();ctx.strokeStyle=BORDER;ctx.lineWidth=1;
  ctx.strokeRect(PAD,SQ,W-PAD*2,SQH);ctx.restore();

  fillR(PAD,SQ,W-PAD*2,48,BLACK);
  tx("ELENCO DOS SONHOS",PAD+24,SQ+31,"bold 18px Arial","rgba(255,255,255,0.45)");
  tx("RTG",W-PAD-24,SQ+31,"bold 18px Arial","rgba(255,255,255,0.3)","right");

  const PC={GOL:"#B87A00",ZAG:RED,LD:RED,LE:RED,VOL:"#1A5FAA",MC:"#1A5FAA",MD:"#1A5FAA",ME:"#1A5FAA",CA:"#1A7A38"};
  team.forEach((p,i)=>{
    const ry=SQ+48+i*ROW;
    if(i%2===0) fillR(PAD,ry,W-PAD*2,ROW,SURFACE);
    ctx.save();ctx.strokeStyle=BORDER;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(PAD,ry);ctx.lineTo(W-PAD,ry);ctx.stroke();ctx.restore();
    const pc=PC[p.pos]||"#666";
    fillR(PAD+18,ry+ROW/2-15,56,30,pc);
    tx(p.pos,PAD+46,ry+ROW/2+9,"bold 17px Arial",WHITE,"center");
    tx(p.name,PAD+94,ry+ROW/2-4,"bold 36px Arial",INK);
    tx(String(p._year),PAD+94,ry+ROW/2+28,"400 21px Arial",MUTED);
    const rc=p.rating>=88?RED:p.rating>=84?"#444":MUTED;
    tx(String(p.rating),W-PAD-24,ry+ROW/2+15,"bold 48px Arial",rc,"right");
  });
  ctx.save();ctx.strokeStyle=BORDER;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(PAD,SQ+SQH);ctx.lineTo(W-PAD,SQ+SQH);ctx.stroke();ctx.restore();

  // ── CAMPANHA ──
  let cy=SQ+SQH+56;
  tx("CAMPANHA",PAD,cy,"bold 17px Arial",MUTED);
  cy+=12;fillR(PAD,cy,W-PAD*2,1,"#F0F0F0");cy+=36;

  const gMs=tournament?.groupMatches||[];
  const kMs=allMatches.filter(m=>m.phase==="ko");
  [...gMs,...kMs].forEach((m,i)=>{
    const lbl=m.phase==="group"?"Grupo "+(i+1):m.round;
    const col=m.win?RED:m.draw?"#888":"#CCCCCC";
    tx(lbl,PAD,cy,"400 21px Arial",MUTED);
    tx(m.opp.flag+" "+oppLabel(m.opp),PAD+148,cy,"400 26px Arial",INK);
    tx(m.myG+"–"+m.oppG,W-PAD-76,cy,"bold 26px Arial",col,"right");
    tx(m.win?"V":m.draw?"E":"D",W-PAD-16,cy,"bold 22px Arial",col,"right");
    cy+=40;
  });

  // ── ANÁLISE ──
  cy+=24;fillR(PAD,cy,W-PAD*2,1,BORDER);cy+=30;
  tx("ANÁLISE COM ZÉ BIRA E MARKO LOCO",PAD,cy,"bold 17px Arial",MUTED);
  cy+=32;

  const wins=allMatches.filter(m=>m.win).length;
  const draws=allMatches.filter(m=>m.draw).length;
  const losses=allMatches.filter(m=>!m.win&&!m.draw).length;
  const goals=allMatches.reduce((s,m)=>s+m.myG,0);
  const avg=avgR(team).toFixed(1);
  let summary;
  if(champ){
    summary=wins===allMatches.length
      ? "Campeão invicto! "+wins+" vitórias, "+goals+" gols. Elenco de "+avg+" de média. Absurdo."
      : wins+"V "+draws+"E "+losses+"D. "+goals+" gols marcados. Média "+avg+". Mereceu.";
  } else if(!tournament?.qualified){
    summary="Nem saiu da fase de grupos. "+wins+"V "+draws+"E "+losses+"D. Média "+avg+". Precisa estudar mais táticas.";
  } else {
    summary=wins+"V "+draws+"E "+losses+"D ao longo da campanha. "+goals+" gols no total, média "+avg+". Quase chegou lá.";
  }

  // word-wrap
  ctx.save();ctx.font="400 24px Arial";ctx.fillStyle=INK;
  const words=summary.split(" ");let lineStr="",lineY2=cy;
  for(const word of words){
    const test=lineStr?lineStr+" "+word:word;
    if(ctx.measureText(test).width>W-PAD*2&&lineStr){
      ctx.fillText(lineStr,PAD,lineY2);lineStr=word;lineY2+=34;
    }else{lineStr=test;}
  }
  if(lineStr){ctx.fillText(lineStr,PAD,lineY2);}
  ctx.restore();

  // ── RODAPÉ ──
  const FY=H-100;
  fillR(PAD,FY,W-PAD*2,1,BORDER);
  tx("markitomesquita.github.io/7rikas",W/2,FY+50,"400 24px Arial",MUTED,"center");
  tx("Jogue você também →",W/2,FY+86,"bold 22px Arial",RED,"center");

  return canvas;
}
