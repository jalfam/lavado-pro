// PWA v3: autocomplete & recent washes
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
const state={category:null,fabric:null,soil:"light",steam:"auto",hsteam:"auto",rinse:"auto",oil:false,smartthings:false,desc:""};
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
renderChips("catGroup",categories,"category");renderChips("fabricGroup",fabrics,"fabric");seg("soil","soil","soil");seg("steam","steam","steam");seg("hsteam","hsteam","hsteam");seg("rinse","rinse","rinse");goto(1);
// datalist options
const dl=document.getElementById("suggestions");dl.innerHTML=AUTOSUGGEST.map(s=>`<option value="${s}">`).join("");
// Recent washes
function getRecents(){try{return JSON.parse(localStorage.getItem("recentWashes")||"[]");}catch(_){return [];}}
function saveRecent(){const rec=getRecents();const entry={ts:Date.now(),state:{...state}};rec.unshift(entry);const unique=[];const seen=new Set();for(const r of rec){const key=JSON.stringify({c:r.state.category,f:r.state.fabric,soil:r.state.soil,oil:r.state.oil,steam:r.state.steam,hsteam:r.state.hsteam,rinse:r.state.rinse});if(!seen.has(key)){seen.add(key);unique.push(r);}if(unique.length>=5)break;}localStorage.setItem("recentWashes",JSON.stringify(unique));}
function renderRecents(){const rec=getRecents();const card=document.getElementById("recentsCard");const wrap=document.getElementById("recents");if(rec.length===0){card.hidden=true;wrap.innerHTML="";return;}card.hidden=false;wrap.innerHTML="";rec.forEach((r,i)=>{const meta=recLabel(r.state);const row=document.createElement("div");row.className="recItem";const m=document.createElement("div");m.className="recMeta";m.textContent=meta;const btn=document.createElement("button");btn.className="recBtn";btn.textContent="Usar";btn.onclick=()=>{Object.assign(state,r.state);activateChip("catGroup",state.category);activateChip("fabricGroup",state.fabric);goto(3);};row.appendChild(m);row.appendChild(btn);wrap.appendChild(row);});}
function recLabel(s){const cat=(categories.find(c=>c.id===s.category)||{}).label||"Mixta";const fab=(fabrics.find(f=>f.id===s.fabric)||{}).label||"—";const oil=s.oil?"con aceite":"sin aceite";return `${cat} • ${fab} • ${s.soil} • ${oil}`;}
renderRecents();
// engine
function gen(){const r={cycle:"Normal",temp:"Cold",spin:"Medium",soil:"Normal",extras:[],detergent:"Líquido",stPreset:null,why:[]};
switch(state.category){case"deportiva":Object.assign(r,{cycle:"Delicates",temp:"Cold",spin:"Medium",soil:state.soil==="heavy"?"Normal":state.soil,detergent:"Sport (sin suavizante)",stPreset:"Ropa deportiva"});r.extras.push("Extra Rinse");r.why.push("Telas técnicas: baja T° y enjuague extra.");break;
case"delicada":Object.assign(r,{cycle:"Delicates",temp:"Cold",spin:"Low",soil:"Light",detergent:"Suave",stPreset:"Delicates"});r.why.push("Movimiento suave + T° baja.");break;
case"jeans":Object.assign(r,{cycle:"Denim",temp:"Cold",spin:"Medium",soil:state.soil,detergent:"Regular",stPreset:"Denim"});r.why.push("Protege color y tejido.");break;
case"bedding":Object.assign(r,{cycle:"Bedding",temp:"Warm",spin:"Medium",soil:state.soil,detergent:"Potente",stPreset:"Bedding"});r.extras.push("Extra Rinse");r.why.push("Volumen alto: distribución + enjuague.");break;
case"cobijaElectrica":Object.assign(r,{cycle:"Bedding (personalizado)",temp:"Cold",spin:"Low",soil:"Light",detergent:"Suave",stPreset:"Cobija eléctrica"});r.extras.push("Sin Steam");r.why.push("Electrónica interna: baja T°.");break;
case"tapetes":Object.assign(r,{cycle:"Bedding",temp:"Warm",spin:"Medium",soil:state.soil,detergent:"Potente",stPreset:"Bedding"});r.extras.push("Extra Rinse");r.why.push("Tapetes pesados: Bedding equilibra.");break;
case"toallas":Object.assign(r,{cycle:"Normal",temp:"Warm",spin:"High",soil:state.soil,detergent:"Regular",stPreset:"Normal + Extra Rinse"});r.extras.push("Extra Rinse");r.why.push("Absorbentes y resistentes.");break;
case"traposCocina":Object.assign(r,{cycle:"Normal",temp:"Warm",spin:"High",soil:state.soil==="light"?"Normal":state.soil,detergent:"Enzimático potente",stPreset:"Normal + Extra Rinse"});r.extras.push("Extra Rinse");r.why.push("Grasa + bacterias: enzimas + agua tibia.");break;
case"pijamas":Object.assign(r,{cycle:"Delicates",temp:"Cold",spin:"Medium",soil:state.soil,detergent:"Suave",stPreset:"Delicates"});r.why.push("Tejidos suaves.");break;
case"mixta":Object.assign(r,{cycle:"Normal",temp:"Cold",spin:"Medium",soil:state.soil,detergent:"Regular",stPreset:"AI Wash/Normal"});r.why.push("Parámetros equilibrados.");break;}
if(state.fabric==="modal"||state.fabric==="satin"){r.temp="Cold";r.spin="Low";if(r.cycle.includes("Bedding"))r.cycle="Bedding (personalizado)";}
if(state.fabric==="franela"&&(state.category==="bedding"||state.category==="pijamas"))r.temp="Warm";if(state.fabric==="mezclilla"){r.cycle="Denim";r.spin="Medium";}
if(state.soil==="heavy"){r.temp=r.temp==="Cold"?"Warm":r.temp;if(!r.extras.includes("Extra Rinse"))r.extras.push("Extra Rinse");}
if(state.oil){r.temp="Warm";if(!r.extras.includes("Extra Rinse"))r.extras.push("Extra Rinse");r.detergent="Enzimático potente";}
let steamAllowed=!(state.fabric==="modal"||state.fabric==="satin"||state.category==="cobijaElectrica");if(state.steam==="on"&&steamAllowed){if(!r.extras.includes("Steam"))r.extras.push("Steam");}
if(state.steam==="off"||!steamAllowed){r.extras=r.extras.filter(x=>x!=="Steam");}
let hSteamEligible=["algodon","franela","microfibra","mezclilla"].includes(state.fabric)&&["toallas","traposCocina","bedding","jeans","mixta"].includes(state.category);
if(state.hsteam==="on"&&hSteamEligible){r.cycle="Hygiene Steam";r.spin=r.spin==="Low"?"Medium":r.spin;r.temp="Auto del ciclo";}
if(state.hsteam==="auto"&&hSteamEligible&&(state.oil||state.soil!=="light")){r.cycle="Hygiene Steam";r.spin=r.spin==="Low"?"Medium":r.spin;r.temp="Auto del ciclo";}
if(state.rinse==="on"&&!r.extras.includes("Extra Rinse"))r.extras.push("Extra Rinse");if(state.rinse==="off")r.extras=r.extras.filter(x=>x!=="Extra Rinse");
const result=document.getElementById("result"),tips=document.getElementById("tips"),explain=document.getElementById("explain");const preset=state.smartthings?`<li><strong>SmartThings:</strong> ${r.stPreset||"—"}</li>`:"";
result.innerHTML=`<ul class="bullets"><li><strong>Ciclo:</strong> ${r.cycle}</li><li><strong>Temperatura:</strong> ${r.temp}</li><li><strong>Centrifugado:</strong> ${r.spin}</li><li><strong>Suciedad:</strong> ${cap(state.soil)}</li><li><strong>Detergente:</strong> ${r.detergent}</li><li><strong>Extras:</strong> ${r.extras.length?r.extras.join(", "):"—"}</li>${preset}</ul>`;
const tipsArr=[];if(state.category==="bedding")tipsArr.push("Una pieza principal por lavado para mejor balance.");if(state.category==="tapetes")tipsArr.push("Añade 1 toalla grande para equilibrar el tambor.");if(state.category==="deportiva")tipsArr.push("Evita suavizante: reduce absorción.");if(state.category==="traposCocina")tipsArr.push("Pre-remoja 30 min con detergente + bicarbonato. Vinagre en el compartimento de suavizante.");if(state.oil)tipsArr.push("Pretrata zonas con aceite 20–30 min con detergente enzimático.");tipsArr.push("Deja ~30% del tambor libre; no sobrecargues.");tipsArr.push("Si queda olor: corre Drum Clean+ sin ropa.");tips.innerHTML=`<ul class="bullets"><li>${tipsArr.join("</li><li>")}</li></ul>`;
const drum=document.getElementById("drumReminder");const categoriesTrigger=["traposCocina","bedding","tapetes"];const shouldRemind=state.oil||categoriesTrigger.includes(state.category);const lastRun=localStorage.getItem("drumCleanLast");const now=new Date();const daysSince=lastRun?Math.round((now-new Date(lastRun))/(1000*60*60*24)):null;let msg="";if(shouldRemind){msg="Sugerido: ejecuta <strong>Drum Clean+</strong> al terminar esta carga (residuos de grasa/volumen).";}else if(daysSince===null||daysSince>=60){msg="Recuerda correr <strong>Drum Clean+</strong> cada 2–3 meses.";}
if(msg){drum.hidden=false;drum.innerHTML=`<p>${msg} <button id="markDrum" class="secondary">Marcar como realizado</button></p>`;document.getElementById("markDrum").onclick=()=>{localStorage.setItem("drumCleanLast",new Date().toISOString());drum.innerHTML="<p>Listo. Guardé la fecha de Drum Clean+.</p>";};}else{drum.hidden=true;}}
// share & install
document.getElementById("share").addEventListener("click",async()=>{const res=document.getElementById("result").innerText+"\nTips:\n"+document.getElementById("tips").innerText;if(navigator.share){try{await navigator.share({title:"Configuración de lavado",text:res});}catch(e){}}else{await navigator.clipboard.writeText(res);alert("Configuración copiada.");}});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();const a=document.getElementById("install");a.hidden=false;a.onclick=()=>e.prompt();});