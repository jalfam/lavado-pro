// truncated-safe JS for v4 (washer + dryer)
const categories=[
{id:"deportiva",label:"Ropa deportiva"},
{id:"delicada",label:"Delicada / lencería"},
{id:"jeans",label:"Jeans / mezclilla"},
{id:"bedding",label:"Ropa de cama"},
{id:"cobijaElectrica",label:"Cobija eléctrica"},
{id:"tapetes",label:"Tapetes textiles"},
{id:"toallas",label:"Toallas"},
{id:"traposCocina",label:"Trapos de cocina"},
{id:"pijamas",label:"Pijamas"},
{id:"mixta",label:"Carga mixta"}];
const fabrics=[
{id:"algodon",label:"Algodón / jersey"},
{id:"modal",label:"Modal / viscosa / rayón"},
{id:"satin",label:"Satín / seda sintética"},
{id:"franela",label:"Franela / polar"},
{id:"mezclilla",label:"Mezclilla / lona"},
{id:"microfibra",label:"Microfibra / poliéster"}];
const AUTOSUGGEST=["trapos de cocina","tapetes textiles","toallas","cobija eléctrica","cobija de masaje con aceite","edredón","sábanas","jeans","pijamas","ropa deportiva","ropa delicada","carga mixta"];
const state={category:null,fabric:null,soil:"light",steam:"auto",hsteam:"auto",rinse:"auto",oil:false,smartthings:false,desc:"",dryer:"auto"};
const steps=[...document.querySelectorAll(".step")];
function goto(i){steps.forEach((s,k)=>s.hidden=k!==(i-1));window.scrollTo({top:0,behavior:"smooth"});}
function renderChips(g,items,key){const el=document.getElementById(g);el.innerHTML="";items.forEach(it=>{const b=document.createElement("button");b.textContent=it.label;b.dataset.id=it.id;b.addEventListener("click",()=>{[...el.querySelectorAll("button")].forEach(x=>x.classList.remove("active"));b.classList.add("active");state[key]=it.id;});el.appendChild(b);});}
function seg(id,key,attr){const el=document.getElementById(id);el.addEventListener("click",e=>{if(e.target.tagName!=="BUTTON")return;[...el.querySelectorAll("button")].forEach(x=>x.classList.remove("active"));e.target.classList.add("active");state[key]=e.target.dataset[attr];});}
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
function inferCategory(text){const map=[{k:["trapo","paño","cocina","microfibra"],id:"traposCocina"},{k:["tapete","alfombra chico"],id:"tapetes"},{k:["toalla"],id:"toallas"},{k:["cobija eléctrica","calienta","eléctrica"],id:"cobijaElectrica"},{k:["cobija","edredón","sábana","funda","bedding"],id:"bedding"},{k:["jean","mezclilla","denim"],id:"jeans"},{k:["pijama","sleepwear"],id:"pijamas"},{k:["deportiva","dryfit","sport","gym"],id:"deportiva"},{k:["seda","satín","encaje","lencería","delicad"],id:"delicada"}];for(const m of map){if(m.k.some(w=>text.includes(w)))return m.id;}return "mixta";}
function activateChip(groupId,catId){const group=document.getElementById(groupId);const buttons=[...group.querySelectorAll("button")];const idx=categories.findIndex(c=>c.id===catId);if(idx>=0&&buttons[idx]){buttons.forEach(x=>x.classList.remove("active"));buttons[idx].classList.add("active");}}
function next(){const cur=steps.findIndex(s=>!s.hidden)+1;if(cur===1&&!state.category){const desc=(document.getElementById("desc").value||"").toLowerCase();if(desc.trim().length>0){state.category=inferCategory(desc);activateChip("catGroup",state.category);goto(cur+1);return;}alert("Elige un chip o escribe algo para que se infiera la categoría.");return;}if(cur===2&&!state.fabric){alert("Elige la tela.");return;}goto(cur+1);}
document.querySelectorAll(".next").forEach(b=>b.addEventListener("click",next));
document.querySelectorAll(".prev").forEach(b=>b.addEventListener("click",()=>{const cur=steps.findIndex(s=>!s.hidden)+1;goto(cur-1);}));
document.querySelector(".generate").addEventListener("click",()=>{gen();goto(4);saveRecent();renderRecents();});
document.querySelector(".new").addEventListener("click",()=>location.reload());
document.getElementById("desc").addEventListener("input",e=>state.desc=e.target.value);
document.getElementById("oil").addEventListener("change",e=>state.oil=e.target.checked);
document.getElementById("smartthings").addEventListener("change",e=>state.smartthings=e.target.checked);
renderChips("catGroup",categories,"category");renderChips("fabricGroup",fabrics,"fabric");seg("soil","soil","soil");seg("steam","steam","steam");seg("hsteam","hsteam","hsteam");seg("rinse","rinse","rinse");seg("dryerPref","dryer","dryer");goto(1);
const dl=document.getElementById("suggestions");dl.innerHTML=AUTOSUGGEST.map(s=>`<option value="${s}">`).join("");
function getRecents(){try{return JSON.parse(localStorage.getItem("recentWashes")||"[]");}catch(_){return [];}}
function saveRecent(){const rec=getRecents();const entry={ts:Date.now(),state:{...state}};rec.unshift(entry);const unique=[];const seen=new Set();for(const r of rec){const key=JSON.stringify({c:r.state.category,f:r.state.fabric,soil:r.state.soil,oil:r.state.oil,steam:r.state.steam,hsteam:r.state.hsteam,rinse:r.state.rinse,d:r.state.dryer});if(!seen.has(key)){seen.add(key);unique.push(r);}if(unique.length>=5)break;}localStorage.setItem("recentWashes",JSON.stringify(unique));}
function renderRecents(){const rec=getRecents();const card=document.getElementById("recentsCard");const wrap=document.getElementById("recents");if(rec.length===0){card.hidden=true;wrap.innerHTML="";return;}card.hidden=false;wrap.innerHTML="";rec.forEach((r)=>{const meta=recLabel(r.state);const row=document.createElement("div");row.className="recItem";const m=document.createElement("div");m.className="recMeta";m.textContent=meta;const btn=document.createElement("button");btn.className="recBtn";btn.textContent="Usar";btn.onclick=()=>{Object.assign(state,r.state);activateChip("catGroup",state.category);activateChip("fabricGroup",state.fabric);goto(3);};row.appendChild(m);row.appendChild(btn);wrap.appendChild(row);});}
function recLabel(s){const cat=(categories.find(c=>c.id===s.category)||{}).label||"Mixta";const fab=(fabrics.find(f=>f.id===s.fabric)||{}).label||"—";const oil=s.oil?"con aceite":"sin aceite";return `${cat} • ${fab} • ${s.soil} • ${oil}`;}
renderRecents();
function gen(){const r={cycle:"Normal",temp:"Cold",spin:"Medium",soil:"Normal",extras:[],detergent:"Líquido",stPreset:null,why:[]};
const d={cycle:"Normal",heat:"Medio",dryness:"Normal Dry",notes:[],stPreset:null,skip:false,air:false};
switch(state.category){case"deportiva":Object.assign(r,{cycle:"Delicates",temp:"Cold",spin:"Medium",soil:state.soil==="heavy"?"Normal":state.soil,detergent:"Sport (sin suavizante)",stPreset:"Ropa deportiva"});r.extras.push("Extra Rinse");d.cycle="Active Wear";d.heat="Medio";d.dryness="Damp Dry";d.notes.push("Evita sobre-secado para no dañar elasticidad.");break;
case"delicada":Object.assign(r,{cycle:"Delicates",temp:"Cold",spin:"Low",soil:"Light",detergent:"Suave",stPreset:"Delicates"});d.cycle="Delicates";d.heat="Bajo";d.dryness="Damp Dry";d.notes.push("Ideal colgar al aire. Secadora sólo si etiqueta lo permite.");break;
case"jeans":Object.assign(r,{cycle:"Denim",temp:"Cold",spin:"Medium",soil:state.soil,detergent:"Regular",stPreset:"Denim"});d.cycle="Jeans";d.heat="Alto";d.dryness="More Dry";d.notes.push("Voltea al revés para cuidar color.");break;
case"bedding":Object.assign(r,{cycle:"Bedding",temp:"Warm",spin:"Medium",soil:state.soil,detergent:"Potente",stPreset:"Bedding"});r.extras.push("Extra Rinse");d.cycle="Bedding";d.heat="Medio-Alto";d.dryness="More Dry";d.notes.push("Añade pelotas de secado para esponjar.");break;
case"cobijaElectrica":Object.assign(r,{cycle:"Bedding (personalizado)",temp:"Cold",spin:"Low",soil:"Light",detergent:"Suave",stPreset:"Cobija eléctrica"});r.extras.push("Sin Steam");d.skip=true;d.notes.push("No secar en secadora: secado plano al aire, sin calor.");break;
case"tapetes":Object.assign(r,{cycle:"Bedding",temp:"Warm",spin:"Medium",soil:state.soil,detergent:"Potente",stPreset:"Bedding"});r.extras.push("Extra Rinse");d.skip=true;d.notes.push("Mejor secar al aire. Evita secadora por peso y bases antideslizantes.");break;
case"toallas":Object.assign(r,{cycle:"Normal",temp:"Warm",spin:"High",soil:state.soil,detergent:"Regular",stPreset:"Normal + Extra Rinse"});r.extras.push("Extra Rinse");d.cycle="Normal";d.heat="Alto";d.dryness="More Dry";d.notes.push("Evita suavizante en lavado para mantener absorción.");break;
case"traposCocina":Object.assign(r,{cycle:"Normal",temp:"Warm",spin:"High",soil:state.soil==='light'?'Normal':state.soil,detergent:"Enzimático potente",stPreset:"Normal + Extra Rinse"});r.extras.push("Extra Rinse");d.cycle="Normal";d.heat="Medio-Alto";d.dryness="More Dry";d.notes.push("Si hubo mucha grasa, usar Sanitize/Steam Sanitize+ si está disponible.");break;
case"pijamas":Object.assign(r,{cycle:"Delicates",temp:"Cold",spin:"Medium",soil:state.soil,detergent:"Suave",stPreset:"Delicates"});d.cycle="Delicates";d.heat="Bajo-Medio";d.dryness="Normal Dry";d.notes.push("Para franela, se permite Medio. Para modal/satín, mejor colgar.");break;
case"mixta":Object.assign(r,{cycle:"Normal",temp:"Cold",spin:"Medium",soil:state.soil,detergent:"Regular",stPreset:"AI Wash/Normal"});d.cycle="Normal";d.heat="Medio";d.dryness="Normal Dry";break;}
if(state.fabric==="modal"||state.fabric==="satin"){r.temp="Cold";r.spin="Low";if(r.cycle.includes("Bedding"))r.cycle="Bedding (personalizado)";d.heat="Bajo";d.dryness="Damp Dry";d.notes.push("Modal/satín: preferible secar al aire.");}
if(state.fabric==="franela"&&(state.category==="bedding"||state.category==="pijamas")){r.temp="Warm";}
if(state.fabric==="mezclilla"){r.cycle="Denim";r.spin="Medium";d.cycle="Jeans";d.heat="Alto";}
if(state.soil==="heavy"){r.temp=r.temp==="Cold"?"Warm":r.temp;if(!r.extras.includes("Extra Rinse"))r.extras.push("Extra Rinse");}
if(state.oil){r.temp="Warm";if(!r.extras.includes("Extra Rinse"))r.extras.push("Extra Rinse");r.detergent="Enzimático potente";if(state.category==="traposCocina"||state.category==="toallas"){d.dryness="More Dry";}}
let steamAllowed=!(state.fabric==="modal"||state.fabric==="satin"||state.category==="cobijaElectrica");if(state.steam==="on"&&steamAllowed){if(!r.extras.includes("Steam"))r.extras.push("Steam");}
if(state.steam==="off"||!steamAllowed){r.extras=r.extras.filter(x=>x!=="Steam");}
let hSteamEligible=["algodon","franela","microfibra","mezclilla"].includes(state.fabric)&&["toallas","traposCocina","bedding","jeans","mixta"].includes(state.category);
if(state.hsteam==="on"&&hSteamEligible){r.cycle="Hygiene Steam";r.spin=r.spin==="Low"?"Medium":r.spin;r.temp="Auto del ciclo";}
if(state.hsteam==="auto"&&hSteamEligible&&(state.oil||state.soil!=="light")){r.cycle="Hygiene Steam";r.spin=r.spin==="Low"?"Medium":r.spin;r.temp="Auto del ciclo";}
if(state.rinse==="on"&&!r.extras.includes("Extra Rinse"))r.extras.push("Extra Rinse");if(state.rinse==="off")r.extras=r.extras.filter(x=>x!=="Extra Rinse");
if(state.dryer==="skip"){d.skip=true;d.notes.push("Elegiste no usar secadora.");}
if(state.dryer==="air"){d.air=true;d.notes.push("Secado al aire: extiende en superficie plana o cuelga en sombra con ventilación.");}
const result=document.getElementById("result"),tips=document.getElementById("tips"),explain=document.getElementById("explain");const washerPreset=state.smartthings?`<li><strong>SmartThings (lavadora):</strong> ${r.stPreset||"—"}</li>`:"";
const dryerPreset=state.smartthings&&d.cycle&&!d.skip&&!d.air?`<li><strong>SmartThings (secadora):</strong> ${d.cycle}</li>`:"";
const dryerBlock=d.skip?`<p><strong>Secadora:</strong> No usar. ${d.notes.join(" ")}</p>`: d.air?`<p><strong>Secado:</strong> Al aire. ${d.notes.join(" ")}</p>`:`<ul class="bullets"><li><strong>Secadora (DVG24C6370V/AX):</strong> ${d.cycle}</li><li><strong>Calor:</strong> ${d.heat}</li><li><strong>Nivel de secado:</strong> ${d.dryness}</li></ul><p class="hint">${d.notes.join(" ")||""}</p>`;
result.innerHTML=`
  <h3>Lavadora</h3>
  <ul class="bullets">
    <li><strong>Ciclo:</strong> ${r.cycle}</li>
    <li><strong>Temperatura:</strong> ${r.temp}</li>
    <li><strong>Centrifugado:</strong> ${r.spin}</li>
    <li><strong>Suciedad:</strong> ${cap(state.soil)}</li>
    <li><strong>Detergente:</strong> ${r.detergent}</li>
    <li><strong>Extras:</strong> ${r.extras.length?r.extras.join(", "):"—"}</li>
    ${washerPreset}
  </ul>
  <h3>Secado</h3>
  ${dryerBlock}
  ${dryerPreset}
`;
const tipsArr=[];if(state.category==="bedding")tipsArr.push("En secadora, usa pelotas de secado para esponjar.");if(state.category==="tapetes")tipsArr.push("Seca al aire para evitar daño de base.");if(state.category==="deportiva")tipsArr.push("Evita suavizante en lavado y sobre-secado.");if(state.category==="traposCocina")tipsArr.push("Si hay grasa, prelavado enzimático + considera Sanitize en secadora.");if(state.oil)tipsArr.push("Pretrata aceite y usa enjuague extra.");tipsArr.push("No sobrecargues: 2/3 del tambor en secadora.");tips.innerHTML=`<ul class="bullets"><li>${tipsArr.join("</li><li>")}</li></ul>`;
explain.innerHTML=`<p>Lavado: reglas por tipo de tejido y suciedad. Secadora: recomendaciones por resistencia del tejido, absorción y sensores de humedad.</p>`;
const drum=document.getElementById("drumReminder");const categoriesTrigger=["traposCocina","bedding","tapetes"];const shouldRemind=state.oil||categoriesTrigger.includes(state.category);const lastRun=localStorage.getItem("drumCleanLast");const now=new Date();const daysSince=lastRun?Math.round((now-new Date(lastRun))/(1000*60*60*24)):null;let msg="";if(shouldRemind){msg="Sugerido: ejecuta <strong>Drum Clean+</strong> al terminar esta carga (residuos de grasa/volumen).";}else if(daysSince===null||daysSince>=60){msg="Recuerda correr <strong>Drum Clean+</strong> cada 2–3 meses.";}
if(msg){drum.hidden=false;drum.innerHTML=`<p>${msg} <button id="markDrum" class="secondary">Marcar como realizado</button></p>`;document.getElementById("markDrum").onclick=()=>{localStorage.setItem("drumCleanLast",new Date().toISOString());drum.innerHTML="<p>Listo. Guardé la fecha de Drum Clean+.</p>";};}else{drum.hidden=true;}}
document.getElementById("share").addEventListener("click",async()=>{const res=document.getElementById("result").innerText+"\nTips:\n"+document.getElementById("tips").innerText;if(navigator.share){try{await navigator.share({title:"Configuración de lavado/ secado",text:res});}catch(e){}}else{await navigator.clipboard.writeText(res);alert("Configuración copiada.");}});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();const a=document.getElementById("install");a.hidden=false;a.onclick=()=>e.prompt();});