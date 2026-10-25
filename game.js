(() => {
  "use strict";

  const SAVE_KEY = "cookie_infinite_save_v1";
  const SUPABASE_URL = "https://higsdxoctgstoyrvvids.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_f-U-p0OpH_ontauAcm-rWA_Wx8-ZPnH";
  const ADMIN_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/admin-announcement`;
  const PLAYER_USERNAME_KEY = "cookie_infinite_username_v1";
  const ADMIN_MESSAGE_KEY = "cookie_infinite_admin_announcement_v1"; // legacy fallback only
  let adminUnlocked = false;
  let adminSessionCode = "";
  let globalMessageId = null;
  let usernamePromptShown = false;
  const adminLogEntries = [];
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const buildings = [
    { id: "cursor", name: "Cursor", icon: "👆", base: 15, cps: 0.1, desc: "Clicks the cookie for you. Tiny but mighty." },
    { id: "grandma", name: "Grandma", icon: "👵", base: 100, cps: 1, desc: "A kind grandma with a secret recipe." },
    { id: "farm", name: "Cookie farm", icon: "🌾", base: 1100, cps: 8, desc: "Grows cookie dough in rich soil." },
    { id: "mine", name: "Cookie mine", icon: "⛏️", base: 12000, cps: 47, desc: "Digs deep for chocolate chips." },
    { id: "factory", name: "Factory", icon: "🏭", base: 130000, cps: 260, desc: "Industrial-scale cookie production." },
    { id: "bank", name: "Cookie bank", icon: "🏦", base: 1400000, cps: 1400, desc: "Your money makes more cookies." },
    { id: "temple", name: "Cookie temple", icon: "🛕", base: 20000000, cps: 7800, desc: "Pray to the ancient biscuit gods." },
    { id: "wizard", name: "Wizard tower", icon: "🧙", base: 330000000, cps: 44000, desc: "Magically duplicates every crumb." },
    { id: "shipment", name: "Cookie shipment", icon: "🚀", base: 5100000000, cps: 260000, desc: "Cookies delivered from another planet." },
    { id: "alchemy", name: "Alchemy lab", icon: "⚗️", base: 75000000000, cps: 1600000, desc: "Turns ordinary matter into cookies." },
    { id: "portal", name: "Cookie portal", icon: "🌀", base: 1000000000000, cps: 10000000, desc: "Opens a portal to the Cookieverse." },
    { id: "time", name: "Time machine", icon: "⏳", base: 14000000000000, cps: 65000000, desc: "Borrows cookies from tomorrow." },
    { id: "reactor", name: "Antimatter reactor", icon: "☢️", base: 170000000000000, cps: 430000000, desc: "Matter and antimatter: both cookies." },
    { id: "universe", name: "Cookie universe", icon: "🌌", base: 2100000000000000, cps: 2900000000, desc: "An entire universe made of cookies." },
    { id: "multiverse", name: "Multiverse engine", icon: "♾️", base: 26000000000000000, cps: 21000000000, desc: "Every possible timeline bakes cookies." }
  ];

  const upgradeIcons = ["🍪","🧁","🍫","🥨","🍩","🥮","🍰","🥠","🍯","🥛","🧈","🌾"];
  const cpsUpgradeNames = ["Crumb Collector","Cookie Conveyor","Sugar Engine","Biscuit Workshop","Dough Dynamo","Chocolate Mill","Golden Bakery","Crumb Reactor","Cookie Foundry","Pastry Network","Sugar Refinery","Baking Satellite"];
  const clickUpgradeNames = ["Gentle Tap","Quick Fingers","Cookie Grip","Precision Click","Double Knuckle","Turbo Tap","Sugar Rush Technique","Golden Touch Technique","Rapid Crumble","Master Baker Click"];
  const upgrades = [];
  for (let i = 1; i <= 90; i++) {
    const tier = Math.floor((i - 1) / 12) + 1;
    const within = ((i - 1) % 12) + 1;
    const cost = Math.ceil(25 * Math.pow(1.72, i - 1));
    const cpsBonus = Number((0.2 * Math.pow(1.52, i - 1)).toPrecision(5));
    upgrades.push({ id:`cps-upgrade-${i}`, category:"cps", name:`${cpsUpgradeNames[(i - 1) % cpsUpgradeNames.length]} ${tier}-${within}`, icon:upgradeIcons[(i - 1) % upgradeIcons.length], cost, desc:`Adds ${cpsBonus.toLocaleString("en-US")} cookies per second.`, cpsBonus });
  }
  for (let i = 1; i <= 90; i++) {
    const tier = Math.floor((i - 1) / 10) + 1;
    const within = ((i - 1) % 10) + 1;
    const cost = Math.ceil(40 * Math.pow(1.78, i - 1));
    const clickBonus = Number((1 * Math.pow(1.43, i - 1)).toPrecision(5));
    upgrades.push({ id:`click-upgrade-${i}`, category:"click", name:`${clickUpgradeNames[(i - 1) % clickUpgradeNames.length]} ${tier}-${within}`, icon:upgradeIcons[(i + 4) % upgradeIcons.length], cost, desc:`Adds ${clickBonus.toLocaleString("en-US")} cookies per click.`, clickBonus });
  }

  const achievements = [
    { id:"first", name:"First crumb", icon:"🍪", desc:"Bake your very first cookie.", test:s=>s.totalBaked>=1 },
    { id:"hundred", name:"Snack time", icon:"🥛", desc:"Bake 100 cookies total.", test:s=>s.totalBaked>=100 },
    { id:"thousand", name:"Cookie jar", icon:"🫙", desc:"Bake 1,000 cookies total.", test:s=>s.totalBaked>=1000 },
    { id:"million", name:"Cookie millionaire", icon:"💰", desc:"Bake 1 million cookies total.", test:s=>s.totalBaked>=1e6 },
    { id:"billion", name:"Billionaire baker", icon:"🤑", desc:"Bake 1 billion cookies total.", test:s=>s.totalBaked>=1e9 },
    { id:"trillion", name:"Trillionaire", icon:"🌠", desc:"Bake 1 trillion cookies total.", test:s=>s.totalBaked>=1e12 },
    { id:"clicks100", name:"Click enthusiast", icon:"👆", desc:"Click the big cookie 100 times.", test:s=>s.totalClicks>=100 },
    { id:"clicks1000", name:"Finger of doom", icon:"☠️", desc:"Click the big cookie 1,000 times.", test:s=>s.totalClicks>=1000 },
    { id:"first-building", name:"First employee", icon:"🏭", desc:"Buy your first building.", test:s=>totalBuildings(s)>0 },
    { id:"ten-buildings", name:"Cookie corporation", icon:"🏢", desc:"Own 10 buildings in total.", test:s=>totalBuildings(s)>=10 },
    { id:"all-buildings", name:"Industrial legend", icon:"🏗️", desc:"Own 100 buildings in total.", test:s=>totalBuildings(s)>=100 },
    { id:"first-upgrade", name:"Research funded", icon:"🧪", desc:"Buy your first upgrade.", test:s=>s.upgrades.length>=1 },
    { id:"golden-one", name:"Golden opportunity", icon:"✨", desc:"Catch a golden cookie.", test:s=>s.goldenCaught>=1 },
    { id:"golden-ten", name:"Golden magnet", icon:"🧲", desc:"Catch 10 golden cookies.", test:s=>s.goldenCaught>=10 },
    { id:"rebirth-one", name:"New beginnings", icon:"♻️", desc:"Rebirth for the first time.", test:s=>s.rebirths>=1 },
    { id:"prestige-ten", name:"Ascended baker", icon:"👑", desc:"Earn 10 prestige points.", test:s=>s.prestige>=10 },
    { id:"skin", name:"Fashionable cookie", icon:"🎨", desc:"Unlock a special cookie skin.", test:s=>s.skins.length>=2 },
    { id:"million-cps", name:"Cookie tsunami", icon:"🌊", desc:"Reach 1 million cookies per second.", test:s=>getCps(s)>=1e6 }
  ];

  const skins = [
    { id:"classic", name:"Classic chocolate", icon:"🍪", cost:0, desc:"The original cookie. A timeless legend." },
    { id:"golden", name:"Golden fortune", icon:"🌟", cost:100000, desc:"Shines like a treasure chest." },
    { id:"mint", name:"Mint chip", icon:"🌿", cost:5000000, desc:"Cool, fresh, minty goodness." },
    { id:"void", name:"Void cookie", icon:"🌌", cost:1000000000, desc:"Baked in the space between stars." },
    { id:"rainbow", name:"Rainbow cosmic", icon:"🌈", cost:1000000000000, desc:"A cookie beyond the laws of flavor." }
  ];

  function freshState() {
    return { cookies:0, totalBaked:0, runBaked:0, totalClicks:0, buildings:{}, upgrades:[], prestige:0, rebirths:0, goldenCaught:0, achievements:[], skins:["classic"], activeSkin:"classic", clickPower:1, sound:true, lastTick:Date.now(), lastSave:Date.now(), goldenUntil:0, goldenNext:Date.now()+30000, goldenBuffUntil:0, goldenBuffMult:1, goldenBuffLabel:"", lifetimeCpsPeak:0 };
  }
  let state = freshState();
  let lastRender = 0;
  let lastGoldenSecond = -1;
  let audioContext = null;

  function totalBuildings(s=state) { return Object.values(s.buildings).reduce((a,b)=>a+(Number(b)||0),0); }
  function getBaseCps(s=state) { return buildings.reduce((sum,b)=>sum+(s.buildings[b.id]||0)*b.cps,0); }
  function getMultiplier(s=state) {
    // Rebirth prestige is permanent; upgrades themselves are flat additions, never boosts.
    return 1 + (s.prestige||0)*0.1;
  }
  function getCps(s=state) {
    const added = (s.upgrades||[]).reduce((sum,id)=>{const u=upgrades.find(x=>x.id===id);return sum+(u&&u.category==="cps"?u.cpsBonus:0);},0);
    return (getBaseCps(s)+added)*getMultiplier(s);
  }
  function getClickPower(s=state) {
    const added = (s.upgrades||[]).reduce((sum,id)=>{const u=upgrades.find(x=>x.id===id);return sum+(u&&u.category==="click"?u.clickBonus:0);},0);
    return (1+added)*(1+(s.prestige||0)*0.1);
  }
  function getGoldenMultiplier() { return 1; }
  function format(value) {
    if (!Number.isFinite(value)) return "∞";
    if (value < 1000) return Math.floor(value).toLocaleString("en-US");
    const units=["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc","Ud","Dd","Td","Qad","Qid","Sxd","Spd","Ocd","Nod","Vg"];
    let tier=-1, n=value;
    while(n>=1000 && tier<units.length-1){n/=1000;tier++;}
    return n.toLocaleString("en-US",{maximumFractionDigits:n<10?2:n<100?1:0})+units[tier];
  }
  function fullNumber(value) { return Number(value).toLocaleString("en-US",{maximumFractionDigits:2}); }
  function buildingCost(b) { return Math.ceil(b.base*Math.pow(1.15,state.buildings[b.id]||0)); }
  function getNextUpgradeCost(u) { return u.cost; }
  function canAfford(cost) { return state.cookies >= cost; }
  function toast(title, message) {
    const el=document.createElement("div");el.className="toast";el.innerHTML=`<strong>${escapeHtml(title)}</strong><br>${escapeHtml(message)}`;
    $("#toast-area").appendChild(el);setTimeout(()=>el.remove(),3500);
  }
  function escapeHtml(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function sound(freq=440,duration=.06,type="sine") {
    if(!state.sound)return;
    try { audioContext ||= new (window.AudioContext||window.webkitAudioContext)(); const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(.04,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+duration); } catch(e) {}
  }
  function saveGame(show=false) {
    state.lastSave=Date.now();state.lastTick=Date.now();
    try { localStorage.setItem(SAVE_KEY,JSON.stringify(state)); $("#save-status").innerHTML='<span class="status-dot"></span> Saved locally'; $("#footer-save").textContent="Your progress is saved in this browser."; if(show)toast("Game saved","Your cookie empire is safe on this browser."); }
    catch(e){$("#save-status").textContent="Save unavailable";if(show)toast("Save failed","Your browser may be blocking local storage.");}
  }
  function loadGame() {
    try {
      const raw=localStorage.getItem(SAVE_KEY);
      if(!raw)return;
      const parsed=JSON.parse(raw);
      const base=freshState();
      state={...base,...parsed,buildings:{...base.buildings,...(parsed.buildings||{})},upgrades:Array.isArray(parsed.upgrades)?parsed.upgrades:[],achievements:Array.isArray(parsed.achievements)?parsed.achievements:[],skins:Array.isArray(parsed.skins)&&parsed.skins.length?parsed.skins:["classic"]};
      state.cookies=Math.max(0,Number(state.cookies)||0);state.totalBaked=Math.max(state.cookies,Number(state.totalBaked)||0);state.runBaked=Math.max(0,Number(state.runBaked)||0);
      state.upgrades=state.upgrades.filter(id=>upgrades.some(u=>u.id===id));
      state.goldenBuffUntil=0;state.goldenBuffMult=1;state.goldenBuffLabel="";
      const elapsed=Math.min(8*60*60,Math.max(0,(Date.now()-(Number(state.lastTick)||Date.now()))/1000));
      if(elapsed>5){const earned=getCps(state)*elapsed;state.cookies+=earned;state.totalBaked+=earned;state.runBaked+=earned;toast("Welcome back!",`Your bakery made ${format(earned)} cookies while you were away.`);}
      state.lastTick=Date.now();
    } catch(e) { state=freshState(); }
  }
  function buyBuilding(id) {
    const b=buildings.find(x=>x.id===id);if(!b)return;
    const cost=buildingCost(b);if(!canAfford(cost))return;
    state.cookies-=cost;state.buildings[id]=(state.buildings[id]||0)+1;
    sound(340,.05,"triangle");checkAchievements();renderAll();
  }
  function buyUpgrade(id) {
    const u=upgrades.find(x=>x.id===id);if(!u||state.upgrades.includes(id)||!canAfford(u.cost))return;
    state.cookies-=u.cost;state.upgrades.push(id);sound(560,.1,"sine");toast("Upgrade purchased",u.name+" is now active.");checkAchievements();renderAll();saveGame();
  }
  function clickCookie() {
    const gain=getClickPower();state.cookies+=gain;state.totalBaked+=gain;state.runBaked+=gain;state.totalClicks++;
    spawnFloat("+"+format(gain));sound(260+Math.random()*100,.045,"triangle");checkAchievements();renderCounters();
    $("#main-cookie").animate([{transform:"scale(1)"},{transform:"scale(.94) rotate(-2deg)"},{transform:"scale(1)"}],{duration:130});
  }
  function spawnFloat(text) {
    const container=$("#click-floats"),el=document.createElement("span");el.className="float-text";el.textContent=text;
    const x=25+Math.random()*50,y=42+Math.random()*22;el.style.left=x+"%";el.style.top=y+"%";container.appendChild(el);setTimeout(()=>el.remove(),950);
  }
  function spawnGolden() {
    state.goldenUntil=Date.now()+12000;$("#golden-cookie").classList.remove("hidden");toast("Golden cookie!", "Quick! Click the glowing cookie for a huge reward.");
  }
  function collectGolden() {
    if(state.goldenUntil<Date.now())return;
    state.goldenUntil=0;state.goldenCaught++;$("#golden-cookie").classList.add("hidden");
    const reward=Math.max(13,getCps()*60+getClickPower()*100);
    state.cookies+=reward;state.totalBaked+=reward;state.runBaked+=reward;
    toast("Golden cookie collected!",`You found ${format(reward)} bonus cookies.`);
    state.goldenNext=Date.now()+25000+Math.random()*45000;sound(880,.18,"sine");checkAchievements();renderAll();
  }
  function checkAchievements() {
    for(const a of achievements){
      if(!state.achievements.includes(a.id)&&a.test(state)){
        state.achievements.push(a.id);toast("🏆 Achievement unlocked",a.name);sound(700,.12,"sine");
      }
    }
  }
  function prestigeGain() {
    if(state.totalBaked<1e9)return 0;
    return Math.max(1,Math.floor(Math.sqrt(state.totalBaked/1e9)));
  }
  function doRebirth() {
    const gain=prestigeGain();if(!gain)return;
    const nextPrestige=state.prestige+gain,nextRebirths=state.rebirths+1,total=state.totalBaked,golden=state.goldenCaught,clicks=state.totalClicks,ach=[...state.achievements],skinsOwned=[...state.skins],skin=state.activeSkin,soundOn=state.sound,peak=state.lifetimeCpsPeak;
    state=freshState();state.prestige=nextPrestige;state.rebirths=nextRebirths;state.totalBaked=total;state.runBaked=0;state.goldenCaught=golden;state.totalClicks=clicks;state.achievements=ach;state.skins=skinsOwned;state.activeSkin=skin;state.sound=soundOn;state.lifetimeCpsPeak=peak;
    state.goldenNext=Date.now()+30000;checkAchievements();saveGame();renderAll();toast("REBIRTH COMPLETE!",`You gained ${gain} prestige point${gain===1?"":"s"}! Permanent production bonus: +${nextPrestige*10}%.`);sound(660,.3,"sine");
  }
  function buySkin(id) {
    const skin=skins.find(s=>s.id===id);if(!skin)return;
    if(!state.skins.includes(id)){if(!canAfford(skin.cost))return;state.cookies-=skin.cost;state.skins.push(id);toast("Skin unlocked",skin.name+" is yours!");checkAchievements();}
    state.activeSkin=id;renderAll();sound(480,.08,"triangle");
  }
  function renderCounters() {
    $("#cookie-count").textContent=format(state.cookies);$("#total-baked").textContent=format(state.totalBaked);$("#total-clicks").textContent=format(state.totalClicks);
    $("#building-count").textContent=format(totalBuildings());$("#cps").textContent=format(getCps());$("#click-power").textContent="+"+format(getClickPower());
    $("#prestige-chip").textContent="✨ "+format(state.prestige)+" Prestige";
    $("#prestige-gain").textContent=format(prestigeGain());$("#prestige-bonus").textContent="+"+format(state.prestige*10)+"%";
    $("#rebirth-button").disabled=prestigeGain()<=0;
    $("#rebirth-button").textContent=prestigeGain()>0?`✨ Rebirth for ${format(prestigeGain())} prestige point${prestigeGain()===1?"":"s"}`:"✨ Rebirth (need 1 billion lifetime cookies)";
    $("#main-cookie").className="main-cookie skin-"+(state.activeSkin||"classic");
    $("#sound-toggle").textContent=state.sound?"🔊":"🔇";
    $("#cookie-label").textContent="cookies in the vault";
    const remaining=state.goldenUntil-Date.now();
    if(remaining>0){$("#golden-cookie").classList.remove("hidden");$("#golden-timer").textContent=Math.ceil(remaining/1000)+"s LEFT";}
    else{$("#golden-cookie").classList.add("hidden");$("#golden-timer").textContent="SEARCHING";}
  }
  function renderBuildings() {
    $("#building-list").innerHTML=buildings.map(b=>{
      const count=state.buildings[b.id]||0,cost=buildingCost(b),afford=canAfford(cost);
      return `<article class="building-card ${afford?"":"unaffordable"}"><div class="item-icon">${b.icon}</div><div class="item-info"><h3>${b.name}</h3><p>${b.desc}</p><p class="owned-line">Owned: ${format(count)} · +${format(b.cps)} CPS each</p></div><div class="item-action"><span class="price">🍪 ${format(cost)}</span><button class="buy-button" data-buy-building="${b.id}" ${afford?"":"disabled"}>BUY +1</button></div></article>`;
    }).join("");
  }
  function renderUpgrades() {
    const available=upgrades.filter(u=>!state.upgrades.includes(u.id));
    $("#upgrade-count").textContent=state.upgrades.filter(id=>upgrades.some(u=>u.id===id)).length+" / 180 owned";
    $("#upgrade-badge").classList.toggle("hidden",!available.some(u=>canAfford(u.cost)));
    const renderUpgradeCards = list => list.map(u=>{
      const owned=state.upgrades.includes(u.id),afford=canAfford(u.cost);
      return `<article class="upgrade-card ${afford||owned?"":"unaffordable"}"><div class="item-icon">${u.icon}</div><div class="item-info"><h3>${u.name}</h3><p>${u.desc}</p></div><div class="item-action">${owned?'<span class="owned-stamp">OWNED ✓</span>':`<span class="price">🍪 ${format(u.cost)}</span><button class="buy-button" data-buy-upgrade="${u.id}" ${afford?"":"disabled"}>BUY</button>`}</div></article>`;
    }).join("");
    $("#upgrade-cps-list").innerHTML=renderUpgradeCards(upgrades.filter(u=>u.category==="cps"));
    $("#upgrade-click-list").innerHTML=renderUpgradeCards(upgrades.filter(u=>u.category==="click"));
  }
  function renderAchievements() {
    const done=state.achievements.length;$("#achievement-progress").textContent=done+" / "+achievements.length;$("#achievement-progress-bar").style.width=(done/achievements.length*100)+"%";
    $("#achievement-list").innerHTML=achievements.map(a=>{
      const unlocked=state.achievements.includes(a.id);
      return `<article class="achievement-card ${unlocked?"unlocked":""}"><div class="item-icon">${a.icon}</div><div class="item-info"><h3>${a.name}</h3><p>${a.desc}</p></div><span class="check">${unlocked?"✓":"🔒"}</span></article>`;
    }).join("");
  }
  function renderSkins() {
    $("#skin-owned").textContent=state.skins.length+" owned";
    $("#skin-list").innerHTML=skins.map(s=>{
      const owned=state.skins.includes(s.id),selected=state.activeSkin===s.id,afford=canAfford(s.cost);
      return `<article class="skin-card ${selected?"selected":""}"><div class="skin-preview ${s.id}"></div><div class="item-info"><h3>${s.name}</h3><p>${s.desc}</p></div><div class="item-action">${selected?'<span class="owned-stamp">EQUIPPED</span>':owned?`<button class="buy-button" data-buy-skin="${s.id}">EQUIP</button>`:`<span class="price">🍪 ${format(s.cost)}</span><button class="buy-button" data-buy-skin="${s.id}" ${afford?"":"disabled"}>UNLOCK</button>`}</div></article>`;
    }).join("");
  }
  function renderAll() { renderCounters();renderBuildings();renderUpgrades();renderAchievements();renderSkins();renderAdminMessage(); }
  function getPlayerUsername() {
    try { return localStorage.getItem(PLAYER_USERNAME_KEY) || ""; } catch (e) { return ""; }
  }
  function setPlayerUsername(value) {
    const username = String(value || "").trim();
    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
      toast("Invalid username", "Use 3–16 letters, numbers, or underscores.");
      return false;
    }
    try { localStorage.setItem(PLAYER_USERNAME_KEY, username); } catch (e) {}
    renderPlayerUsername();
    toast("Username saved", "Welcome, " + username + "!");
    return true;
  }
  function renderPlayerUsername() {
    const el = $("#player-username");
    if (el) el.textContent = "👤 " + (getPlayerUsername() || "Choose username");
  }
  function openUsernameEditor() {
    const current = getPlayerUsername();
    const value = prompt("Choose your Cookie Infinite username (3–16 letters, numbers, or underscores):", current);
    if (value !== null && setPlayerUsername(value)) saveGame();
  }
  async function supabaseRequest(path, options = {}) {
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...options,
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    const bodyText = await response.text();
    let body = null;
    try { body = bodyText ? JSON.parse(bodyText) : null; } catch (e) { body = bodyText; }
    if (!response.ok) throw new Error(body?.error || body?.message || `Supabase request failed (${response.status})`);
    return body;
  }
  function renderAnnouncement(message, username = "Theee_Cash", id = null) {
    const clean = String(message || "").trim();
    const banner = $("#global-announcement");
    $("#global-announcement-text").textContent = clean;
    const byline = $("#global-announcement-byline");
    if (byline) byline.textContent = clean ? `Posted by ${username || "Theee_Cash"}` : "";
    banner.classList.toggle("hidden", !clean);
    globalMessageId = id;
    const preview = $("#admin-announcement-preview");
    if (preview) {
      preview.textContent = clean ? `Posted by ${username || "Theee_Cash"}: ${clean}` : "";
      preview.classList.toggle("hidden", !clean || !adminUnlocked);
    }
  }
  async function loadGlobalAnnouncement() {
    try {
      const rows = await supabaseRequest("/rest/v1/global_messages?select=id,username,message,created_at&order=created_at.desc&limit=1", { method: "GET" });
      if (Array.isArray(rows) && rows.length) {
        renderAnnouncement(rows[0].message, rows[0].username, rows[0].id);
      } else {
        renderAnnouncement("");
      }
    } catch (error) {
      // Keep the game playable if the network is offline; don't pretend a local message is global.
      const legacy = (() => { try { return localStorage.getItem(ADMIN_MESSAGE_KEY) || ""; } catch (e) { return ""; } })();
      if (legacy && !globalMessageId) renderAnnouncement(legacy, "This browser (local only)");
      console.warn("Could not load global announcement:", error.message);
    }
  }
  async function adminFunction(action, extra = {}) {
    const response = await fetch(ADMIN_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
      },
      body: JSON.stringify({ action, adminCode: adminSessionCode, username: "Theee_Cash", ...extra })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.error || `Admin request failed (${response.status})`);
    return data;
  }
  function renderAdminMessage() {
    loadGlobalAnnouncement();
  }
  function addAdminLog(message) {
    adminLogEntries.unshift({ time: new Date().toLocaleTimeString(), message });
    adminLogEntries.splice(12);
    const log = $("#admin-log");
    log.innerHTML = adminLogEntries.map(entry => `<div class="admin-log-entry"><time>${escapeHtml(entry.time)}</time>${escapeHtml(entry.message)}</div>`).join("");
  }
  function openAdminPanel() {
    if (!adminUnlocked) {
      $("#admin-login-error").classList.add("hidden");
      $("#admin-code").value = "";
      $("#admin-login-modal").classList.remove("hidden");
      setTimeout(() => $("#admin-code").focus(), 50);
      return;
    }
    showTab("admin");
  }
  function showTab(tabName) {
    $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tabName));
    $$(".tab-content").forEach(c => c.classList.toggle("hidden", c.id !== "tab-" + tabName));
    if (tabName === "upgrades") {
      const activeCategory = document.querySelector("[data-upgrade-category].active")?.dataset.upgradeCategory || "cps";
      $("#upgrade-cps-panel").classList.toggle("hidden", activeCategory !== "cps");
      $("#upgrade-click-panel").classList.toggle("hidden", activeCategory !== "click");
    }
  }
  function unlockAdmin() {
    adminUnlocked = true;
    $("#admin-login-modal").classList.add("hidden");
    $("#admin-tab-button").classList.remove("hidden");
    addAdminLog("Admin panel unlocked in this browser.");
    showTab("admin");
    renderAdminMessage();
    toast("Admin access granted", "Control room unlocked for this browser session.");
  }
  function tick() {
    const now=Date.now(),delta=Math.min(2,Math.max(0,(now-(state.lastTick||now))/1000));state.lastTick=now;
    if(delta>0){const earned=getCps()*delta;state.cookies+=earned;state.totalBaked+=earned;state.runBaked+=earned;}
    if(state.goldenUntil&&now>=state.goldenUntil){state.goldenUntil=0;state.goldenNext=now+25000+Math.random()*45000;$("#golden-cookie").classList.add("hidden");}
    if(!state.goldenUntil&&now>=state.goldenNext)spawnGolden();
    if(now-state.lastSave>10000)saveGame();
    if(now-lastRender>180){lastRender=now;state.lifetimeCpsPeak=Math.max(state.lifetimeCpsPeak,getCps());checkAchievements();renderAll();}
  }

  $("#cookie-button").addEventListener("click",clickCookie);
  $("#cookie-button").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();clickCookie();}});
  $("#golden-cookie").addEventListener("click",collectGolden);
  $("#save-button").addEventListener("click",()=>saveGame(true));
  $("#sound-toggle").addEventListener("click",()=>{state.sound=!state.sound;renderCounters();saveGame();if(state.sound)sound(500,.08);});
  $("#reset-button").addEventListener("click",()=>$("#confirm-modal").classList.remove("hidden"));
  $("#cancel-reset").addEventListener("click",()=>$("#confirm-modal").classList.add("hidden"));
  $("#confirm-reset").addEventListener("click",()=>{localStorage.removeItem(SAVE_KEY);state=freshState();$("#confirm-modal").classList.add("hidden");renderAll();saveGame();toast("Fresh start","Your bakery has been reset.");});
  $("#rebirth-button").addEventListener("click",doRebirth);
  $$(".tab").forEach(btn=>btn.addEventListener("click",event=>{
    event.preventDefault();
    if(btn.dataset.tab === "admin" && !adminUnlocked) return;
    showTab(btn.dataset.tab);
  }));
  $("#admin-open").addEventListener("click", openAdminPanel);
  $("#cancel-admin-login").addEventListener("click", () => $("#admin-login-modal").classList.add("hidden"));
  $("#admin-login-form").addEventListener("submit", async e => {
    e.preventDefault();
    const code = $("#admin-code").value;
    adminSessionCode = code;
    const submit = $("#admin-login-form").querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      await adminFunction("verify");
      unlockAdmin();
    } catch (error) {
      adminSessionCode = "";
      $("#admin-login-error").textContent = error.message.includes("Failed to fetch")
        ? "Admin verification is not configured yet. Deploy the Supabase Edge Function first."
        : "Incorrect code or admin service unavailable. Try again.";
      $("#admin-login-error").classList.remove("hidden");
      sound(150,.12,"square");
    } finally { submit.disabled = false; }
  });
  $("#send-admin-message").addEventListener("click", async () => {
    if(!adminUnlocked) return;
    const message=$("#admin-message").value.trim();
    if(!message){toast("Message is empty", "Type an announcement first.");return;}
    const button = $("#send-admin-message"); button.disabled = true;
    try {
      const result = await adminFunction("publish", { message });
      $("#admin-message").value = "";
      await loadGlobalAnnouncement();
      addAdminLog("Published global announcement: " + message.slice(0,70));
      toast("Global announcement published", "All players can see this message.");
    } catch (error) {
      toast("Could not publish globally", error.message + ". Check that the admin-announcement Edge Function is deployed.");
    } finally { button.disabled = false; }
  });
  $("#clear-admin-message").addEventListener("click", async () => {
    if(!adminUnlocked)return;
    const button = $("#clear-admin-message"); button.disabled = true;
    try {
      await adminFunction("clear");
      $("#admin-message").value=""; renderAnnouncement("");
      addAdminLog("Cleared the global announcement.");
      toast("Global announcement cleared", "The banner was removed for all players.");
    } catch (error) {
      toast("Could not clear announcement", error.message + ". Check that the admin-announcement Edge Function is deployed.");
    } finally { button.disabled = false; }
  });
  $("#dismiss-announcement").addEventListener("click", () => $("#global-announcement").classList.add("hidden"));
  $("#admin-add-cookies").addEventListener("click", () => {
    if(!adminUnlocked)return;const amount=Number($("#admin-cookie-amount").value);
    if(!Number.isFinite(amount)||amount<=0){toast("Invalid amount", "Enter a number greater than zero.");return;}
    state.cookies+=amount;state.totalBaked+=amount;addAdminLog("Added "+format(amount)+" cookies.");checkAchievements();renderAll();saveGame();toast("Cookies granted", format(amount)+" cookies added.");
  });
  $("#admin-set-prestige").addEventListener("click", () => {
    if(!adminUnlocked)return;const amount=Math.floor(Number($("#admin-prestige-amount").value));
    if(!Number.isFinite(amount)||amount<0){toast("Invalid prestige", "Enter zero or a positive whole number.");return;}
    state.prestige=amount;addAdminLog("Set prestige to "+amount+".");checkAchievements();renderAll();saveGame();toast("Prestige updated", "Prestige is now "+format(amount)+".");
  });
  $("#admin-unlock-all").addEventListener("click", () => {
    if(!adminUnlocked)return;
    state.upgrades=upgrades.map(u=>u.id);state.skins=skins.map(s=>s.id);state.achievements=achievements.map(a=>a.id);
    addAdminLog("Unlocked every upgrade, skin and achievement.");renderAll();saveGame();toast("Everything unlocked", "All upgrades, skins and trophies are unlocked.");
  });
  $("#admin-golden").addEventListener("click", () => {if(!adminUnlocked)return;state.goldenUntil=Date.now()+12000;$("#golden-cookie").classList.remove("hidden");addAdminLog("Spawned a golden cookie.");toast("Golden cookie spawned", "Click the golden cookie on the main panel!");});
  $("#admin-save").addEventListener("click", () => {if(!adminUnlocked)return;saveGame(true);addAdminLog("Manually saved the game.");});
  $("#admin-logout").addEventListener("click", () => {adminUnlocked=false;adminSessionCode="";$("#admin-tab-button").classList.add("hidden");showTab("upgrades");addAdminLog("Admin panel locked.");toast("Admin panel locked", "Enter the code again to unlock it.");});
  const usernameButton = $("#change-username");
  if (usernameButton) usernameButton.addEventListener("click", openUsernameEditor);
  $("#building-list").addEventListener("click",e=>{const b=e.target.closest("[data-buy-building]");if(b)buyBuilding(b.dataset.buyBuilding);});
  [$("#upgrade-cps-list"),$("#upgrade-click-list")].forEach(list=>list.addEventListener("click",e=>{const b=e.target.closest("[data-buy-upgrade]");if(b)buyUpgrade(b.dataset.buyUpgrade);}));
  $$("[data-upgrade-category]").forEach(btn=>btn.addEventListener("click",()=>{
    const category=btn.dataset.upgradeCategory;
    $$("[data-upgrade-category]").forEach(b=>b.classList.toggle("active",b===btn));
    $("#upgrade-cps-panel").classList.toggle("hidden",category!=="cps");
    $("#upgrade-click-panel").classList.toggle("hidden",category!=="click");
  }));
  const tradeSkinSelect=$("#trade-skin-select");
  if(tradeSkinSelect) tradeSkinSelect.innerHTML='<option value="">Trading backend setup required</option>';
  $("#skin-list").addEventListener("click",e=>{const b=e.target.closest("[data-buy-skin]");if(b)buySkin(b.dataset.buySkin);});
  window.addEventListener("beforeunload",()=>saveGame());
  document.addEventListener("visibilitychange",()=>{if(document.hidden)saveGame();});

  loadGame();
  if(!state.goldenNext||state.goldenNext<Date.now())state.goldenNext=Date.now()+20000;
  renderAll();
  // Always open the Upgrades page on startup; otherwise every tab-content section
  // starts hidden in the HTML and the game appears to have no pages.
  showTab("upgrades");
  // Ensure CPS is the initial upgrade category and the two category buttons are visible.
  $$('[data-upgrade-category]').forEach(btn => btn.classList.toggle('active', btn.dataset.upgradeCategory === 'cps'));
  $('#upgrade-cps-panel').classList.remove('hidden');
  $('#upgrade-click-panel').classList.add('hidden');
  renderPlayerUsername();
  if (!getPlayerUsername() && !usernamePromptShown) {
    usernamePromptShown = true;
    setTimeout(openUsernameEditor, 800);
  }
  loadGlobalAnnouncement();
  setInterval(loadGlobalAnnouncement, 15000);
  setInterval(tick,100);
  setInterval(()=>saveGame(),10000);
  setTimeout(()=>toast("Welcome to Cookie Infinite","Click the giant cookie to start your empire!"),600);
})();
