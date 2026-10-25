(() => {
  "use strict";

  // COOKIE INFINITE — GAME ENGINE
  // 90 buildings • 90 CPS upgrades • 90 click upgrades
  // No temporary boosts or frenzy mechanics.

  const SAVE_KEY = "cookie_infinite_save_v1";
  const SUPABASE_URL = "https://higsdxoctgstoyrvvids.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_f-U-p0OpH_ontauAcm-rWA_Wx8-ZPnH";
  const ADMIN_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/admin-announcement`;
  const PLAYER_USERNAME_KEY = "cookie_infinite_username_v1";
  const ADMIN_MESSAGE_KEY = "cookie_infinite_admin_announcement_v1";

  let adminUnlocked = false;
  let adminSessionCode = "";
  let globalMessageId = null;
  let usernamePromptShown = false;
  let lastRender = 0;
  let audioContext = null;
  const adminLogEntries = [];

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  // ============================================================
  // ALL 90 BUILDINGS — ONE ARRAY, ALL VALUES WRITTEN DIRECTLY
  // ============================================================

  const buildings = [
    { id:"cursor", name:"Cursor", icon:"👆", base:15, cps:0.1, desc:"Clicks the cookie for you. Tiny but mighty." },
    { id:"grandma", name:"Grandma", icon:"👵", base:100, cps:1, desc:"A kind grandma with a secret recipe." },
    { id:"farm", name:"Cookie farm", icon:"🌾", base:1100, cps:8, desc:"Grows cookie dough in rich soil." },
    { id:"mine", name:"Cookie mine", icon:"⛏️", base:12000, cps:47, desc:"Digs deep for chocolate chips." },
    { id:"factory", name:"Factory", icon:"🏭", base:130000, cps:260, desc:"Industrial-scale cookie production." },
    { id:"bank", name:"Cookie bank", icon:"🏦", base:1400000, cps:1400, desc:"Your money makes more cookies." },
    { id:"temple", name:"Cookie temple", icon:"🛕", base:20000000, cps:7800, desc:"Pray to the ancient biscuit gods." },
    { id:"wizard", name:"Wizard tower", icon:"🧙", base:330000000, cps:44000, desc:"Magically duplicates every crumb." },
    { id:"shipment", name:"Cookie shipment", icon:"🚀", base:5100000000, cps:260000, desc:"Cookies delivered from another planet." },
    { id:"alchemy", name:"Alchemy lab", icon:"⚗️", base:75000000000, cps:1600000, desc:"Turns ordinary matter into cookies." },
    { id:"portal", name:"Cookie portal", icon:"🌀", base:1000000000000, cps:10000000, desc:"Opens a portal to the Cookieverse." },
    { id:"time", name:"Time machine", icon:"⏳", base:14000000000000, cps:65000000, desc:"Borrows cookies from tomorrow." },
    { id:"reactor", name:"Antimatter reactor", icon:"☢️", base:170000000000000, cps:430000000, desc:"Matter and antimatter: both cookies." },
    { id:"universe", name:"Cookie universe", icon:"🌌", base:2100000000000000, cps:2900000000, desc:"An entire universe made of cookies." },
    { id:"multiverse", name:"Multiverse engine", icon:"♾️", base:26000000000000000, cps:21000000000, desc:"Every possible timeline bakes cookies." },

    { id:"moon", name:"Moon bakery", icon:"🌙", base:40300000000000000, cps:34650000000, desc:"Bakes cookies on the moon." },
    { id:"mars", name:"Mars colony", icon:"🔴", base:62465000000000000, cps:57200000000, desc:"A colony dedicated to cookie production." },
    { id:"asteroid", name:"Asteroid mine", icon:"☄️", base:96820750000000000, cps:94380000000, desc:"Harvests cookie ingredients from asteroids." },
    { id:"star", name:"Star forge", icon:"⭐", base:150072162500000000, cps:155727000000, desc:"Forges cookies from stellar energy." },
    { id:"nebula", name:"Nebula kitchen", icon:"🌠", base:232611851875000000, cps:257450550000, desc:"Bakes cookies inside a nebula." },
    { id:"galaxy", name:"Galaxy bakery", icon:"🌌", base:360548370406250000, cps:424793407500, desc:"An entire galaxy bakes cookies." },
    { id:"blackhole", name:"Black hole oven", icon:"🕳️", base:558850974129687500, cps:701909122375, desc:"Compresses ingredients into cookies." },
    { id:"dimension", name:"Dimension factory", icon:"🪐", base:866219010901015625, cps:1158150051919, desc:"Imports cookies from other dimensions." },
    { id:"quantum", name:"Quantum kitchen", icon:"⚛️", base:1342649461896574219, cps:1910947585666, desc:"Bakes cookies in multiple states." },
    { id:"robot", name:"Cookie robot army", icon:"🤖", base:2081106665949690030, cps:3153063516349, desc:"Robots bake around the clock." },
    { id:"drone", name:"Delivery drone fleet", icon:"🛸", base:3225715332222019550, cps:5202564801975, desc:"Automated cookie delivery and production." },
    { id:"clone", name:"Cookie cloning lab", icon:"🧬", base:4999868784944125000, cps:8584231923260, desc:"Duplicates every cookie." },
    { id:"hologram", name:"Hologram bakery", icon:"💠", base:7749796636663393750, cps:14163982673379, desc:"Creates cookies with advanced technology." },
    { id:"crystal", name:"Crystal mine", icon:"💎", base:12012184886828260313, cps:23370571411075, desc:"Extracts rare cookie crystals." },
    { id:"volcano", name:"Volcano oven", icon:"🌋", base:18618886574583803484, cps:38561442828274, desc:"Uses volcanic heat to bake." },
    { id:"ocean", name:"Ocean factory", icon:"🌊", base:28859274190504895300, cps:63626380666652, desc:"Harvests ingredients from the ocean." },
    { id:"forest", name:"Enchanted forest", icon:"🌳", base:44731875095282587700, cps:104983528099976, desc:"Magical trees grow cookie ingredients." },
    { id:"castle", name:"Cookie castle", icon:"🏰", base:69334406497788011000, cps:173222821364961, desc:"A kingdom-wide cookie operation." },
    { id:"dragon", name:"Dragon bakery", icon:"🐉", base:107468329071071417000, cps:285817654252186, desc:"Dragons bake with their fiery breath." },
    { id:"phoenix", name:"Phoenix oven", icon:"🔥", base:166575910060160696000, cps:471599629515107, desc:"Rebirths burnt cookies into fresh ones." },
    { id:"ice", name:"Ice cream factory", icon:"🍨", base:258192660593249079000, cps:778139388699926, desc:"Produces frozen cookie creations." },
    { id:"candy", name:"Candy laboratory", icon:"🍬", base:400198624919541072000, cps:1283939991354880, desc:"Combines candy science with baking." },
    { id:"chocolate", name:"Chocolate mountain", icon:"🍫", base:620307868625288662000, cps:2118500985715550, desc:"Mines mountains of chocolate." },
    { id:"rainbow", name:"Rainbow converter", icon:"🌈", base:961477196369197425000, cps:3495526626430670, desc:"Turns rainbow energy into cookies." },
    { id:"dream", name:"Dream bakery", icon:"💭", base:1488299654377256010000, cps:5767628943600660, desc:"Bakes cookies from dreams." },
    { id:"nightmare", name:"Nightmare factory", icon:"🌑", base:2306864464284746820000, cps:9516597766941090, desc:"Turns nightmares into cookie supplies." },
    { id:"timekeeper", name:"Timekeeper station", icon:"⌛", base:3575649929641357570000, cps:15702386315402800, desc:"Coordinates cookie production across time." },
    { id:"past", name:"Past-era bakery", icon:"📜", base:5542257390944104220000, cps:25908937420414600, desc:"Uses recipes from ancient civilizations." },
    { id:"future", name:"Future bakery", icon:"🚄", base:8580508955963361540000, cps:42749746743684100, desc:"Uses technology from the distant future." },
    { id:"dimensioncore", name:"Dimension core", icon:"🔮", base:13299788881743210500000, cps:70537082077078700, desc:"Powers cross-dimensional cookie production." },
    { id:"antimatter", name:"Antimatter bakery", icon:"💥", base:20614672766601976300000, cps:116386185427180000, desc:"Uses exotic matter to bake cookies." },
    { id:"singularity", name:"Singularity engine", icon:"🌀", base:31952742838233063200000, cps:192037205954847000, desc:"Produces cookies at a singularity." },
    { id:"wormhole", name:"Wormhole kitchen", icon:"🕸️", base:49526601399261248000000, cps:316861389825498000, desc:"Connects distant bakeries." },
    { id:"stargate", name:"Stargate bakery", icon:"🚪", base:76766232168854934400000, cps:522821293212072000, desc:"Imports ingredients through cosmic gates." },
    { id:"cosmic", name:"Cosmic oven", icon:"✨", base:118987659861725149000000, cps:862654633300919000, desc:"Harnesses the power of the cosmos." },
    { id:"celestial", name:"Celestial bakery", icon:"😇", base:184430872785673981000000, cps:1423380144946510000, desc:"A divine cookie operation." },
    { id:"divine", name:"Divine cookie forge", icon:"⚜️", base:285868852818794671000000, cps:2348577239161750000, desc:"Creates legendary cookies." },
    { id:"mythic", name:"Mythic bakery", icon:"🐲", base:443597722869131740000000, cps:3875152444616890000, desc:"Uses ingredients from ancient myths." },
    { id:"titan", name:"Titan cookie press", icon:"🗿", base:687576469447654197000000, cps:6394001533627900000, desc:"Presses enormous batches of cookies." },
    { id:"colossus", name:"Colossus factory", icon:"🏗️", base:1065743522648879000000000, cps:10550102530486000000, desc:"A giant factory built for massive output." },
    { id:"infinity", name:"Infinity bakery", icon:"♾️", base:1651902460105762450000000, cps:17407669175301900000, desc:"Keeps baking beyond ordinary limits." },
    { id:"eternity", name:"Eternity oven", icon:"🔱", base:2560448813163931800000000, cps:28722654139248100000, desc:"Bakes through eternity." },
    { id:"reality", name:"Reality machine", icon:"🌐", base:3968695660404094300000000, cps:47492384329759400000, desc:"Turns reality itself into cookies." },
    { id:"simulation", name:"Simulation bakery", icon:"🖥️", base:6141478263626346000000000, cps:78362434144103000000, desc:"Bakes cookies inside a simulation." },
    { id:"matrix", name:"Cookie matrix", icon:"🔷", base:9529291308620841000000000, cps:129297016337770000000, desc:"Connects millions of baking systems." },
    { id:"datacenter", name:"Cookie data center", icon:"🗄️", base:14770451528362304000000000, cps:213340077957821000000, desc:"Processes cookie production data." },
    { id:"supercomputer", name:"Supercomputer bakery", icon:"💻", base:22894199868961572000000000, cps:352011128630404000000, desc:"Calculates the perfect cookie recipe." },
    { id:"nanobot", name:"Nanobot swarm", icon:"🦠", base:35436009896990437000000000, cps:580818362240167000000, desc:"Tiny machines build cookies atom by atom." },
    { id:"megastructure", name:"Megastructure oven", icon:"🏢", base:54925815340335180000000000, cps:958350297696276000000, desc:"An enormous industrial baking structure." },
    { id:"dyson", name:"Dyson cookie sphere", icon:"☀️", base:85135013777519530000000000, cps:1581277991198850000000, desc:"Harvests the power of a star." },
    { id:"quasar", name:"Quasar bakery", icon:"💫", base:131959271355655280000000000, cps:2609108685478100000000, desc:"Uses quasar energy for production." },
    { id:"pulsar", name:"Pulsar factory", icon:"📡", base:204536871601265690000000000, cps:4305029331048870000000, desc:"Bakes with pulses of cosmic energy." },
    { id:"neutron", name:"Neutron star oven", icon:"🌟", base:317032151982961800000000000, cps:7103298396230630000000, desc:"Uses extreme stellar pressure." },
    { id:"supernova", name:"Supernova bakery", icon:"💥", base:491899835573591000000000000, cps:11720442353780500000000, desc:"Explosive cookie production." },
    { id:"cosmos", name:"Cosmos engine", icon:"🌌", base:762444744139066000000000000, cps:19338729883737800000000, desc:"Turns the cosmos into a bakery." },
    { id:"omniverse", name:"Omniverse factory", icon:"🪬", base:1181789353415552000000000000, cps:31908904308117400000000, desc:"Produces cookies across universes." },
    { id:"timeless", name:"Timeless cookie forge", icon:"🕰️", base:1831773497794116000000000000, cps:52649692008493700000000, desc:"Operates outside the flow of time." },
    { id:"godlike", name:"Godlike bakery", icon:"⚡", base:2839248921580880000000000000, cps:86971991814014700000000, desc:"Produces cookies on a legendary scale." },
    { id:"transcendent", name:"Transcendent oven", icon:"🪽", base:4400835828450364000000000000, cps:143503786493124000000000, desc:"Bakes beyond known dimensions." },
    { id:"origin", name:"Origin cookie maker", icon:"🌅", base:6821295534098065000000000000, cps:236781247713654000000000, desc:"Returns to the beginning of cookie creation." },
    { id:"creator", name:"Creator's workshop", icon:"🛠️", base:10573058077852000000000000000, cps:390688058228527000000000, desc:"Builds new ways to produce cookies." },
    { id:"cosmicforge", name:"Cosmic forge", icon:"🔨", base:16388240020670600000000000000, cps:644635296076070000000000, desc:"Forges cookies from cosmic matter." },
    { id:"worldmaker", name:"Worldmaker machine", icon:"🌍", base:25401772032039400000000000000, cps:1063640738525520000000000, desc:"Creates worlds full of cookies." },
    { id:"starforge", name:"Star system bakery", icon:"☀️", base:39372796649661000000000000000, cps:1755007218567110000000000, desc:"Uses an entire star system." },
    { id:"realityforge", name:"Reality forge", icon:"🪄", base:61027834806974500000000000000, cps:2895761910635730000000000, desc:"Forges new realities for baking." },
    { id:"megaverse", name:"Megaverse factory", icon:"🌐", base:94593143950810500000000000000, cps:4788013157548940000000000, desc:"Operates across a megaverse." },
    { id:"ultraverse", name:"Ultraverse engine", icon:"🌀", base:146619373123756000000000000000, cps:7900221739955750000000000, desc:"Connects countless realities." },
    { id:"omnibaker", name:"Omni-baker", icon:"👑", base:227259028341822000000000000000, cps:13035365870926900000000000, desc:"Bakes everywhere at once." },
    { id:"absolute", name:"Absolute cookie machine", icon:"💠", base:352251494930824000000000000000, cps:21508353687029400000000000, desc:"Pushes cookie production to the limit." },
    { id:"infinitecore", name:"Infinite core", icon:"🔆", base:545989817142777000000000000000, cps:35488883783598500000000000, desc:"Powers an endless cookie supply." },
    { id:"finaloven", name:"The final oven", icon:"🍪", base:846284216571304000000000000000, cps:58556658242937500000000000, desc:"The ultimate cookie-producing machine." },
    { id:"beyond", name:"Beyond the multiverse", icon:"🌌", base:1311740535685520000000000000000, cps:96618486100846900000000000, desc:"Bakes cookies beyond all known realities." }
  ];

  // ============================================================
  // UPGRADES — 90 CPS AND 90 CLICK UPGRADES
  // These are permanent upgrades, not temporary boosts.
  // ============================================================

  const upgradeIcons = ["🍪","🧁","🍫","🥨","🍩","🥮","🍰","🥠","🍯","🥛","🧈","🌾"];
  const cpsUpgradeNames = ["Crumb Collector","Cookie Conveyor","Sugar Engine","Biscuit Workshop","Dough Dynamo","Chocolate Mill","Golden Bakery","Crumb Reactor","Cookie Foundry","Pastry Network","Sugar Refinery","Baking Satellite"];
  const clickUpgradeNames = ["Gentle Tap","Quick Fingers","Cookie Grip","Precision Click","Double Knuckle","Turbo Tap","Sugar Rush Technique","Golden Touch Technique","Rapid Crumble","Master Baker Click"];
  const upgrades = [];

  for (let i = 1; i <= 90; i++) {
    const tier = Math.floor((i - 1) / 12) + 1;
    const within = ((i - 1) % 12) + 1;
    const cost = Math.ceil(25 * Math.pow(1.72, i - 1));
    const cpsBonus = Number((0.2 * Math.pow(1.52, i - 1)).toPrecision(5));

    upgrades.push({
      id: `cps-upgrade-${i}`,
      category: "cps",
      name: `${cpsUpgradeNames[(i - 1) % cpsUpgradeNames.length]} ${tier}-${within}`,
      icon: upgradeIcons[(i - 1) % upgradeIcons.length],
      cost,
      desc: `Adds ${cpsBonus.toLocaleString("en-US")} cookies per second permanently.`,
      cpsBonus
    });
  }

  for (let i = 1; i <= 90; i++) {
    const tier = Math.floor((i - 1) / 10) + 1;
    const within = ((i - 1) % 10) + 1;
    const cost = Math.ceil(40 * Math.pow(1.78, i - 1));
    const clickBonus = Number((1 * Math.pow(1.43, i - 1)).toPrecision(5));

    upgrades.push({
      id: `click-upgrade-${i}`,
      category: "click",
      name: `${clickUpgradeNames[(i - 1) % clickUpgradeNames.length]} ${tier}-${within}`,
      icon: upgradeIcons[(i + 4) % upgradeIcons.length],
      cost,
      desc: `Adds ${clickBonus.toLocaleString("en-US")} cookies per click permanently.`,
      clickBonus
    });
  }

  // ============================================================
  // ACHIEVEMENTS
  // ============================================================

  const achievements = [
    { id:"first", name:"First crumb", icon:"🍪", desc:"Bake your first cookie.", test:s=>s.totalBaked>=1 },
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
    { id:"rebirth-one", name:"New beginnings", icon:"♻️", desc:"Rebirth once.", test:s=>s.rebirths>=1 },
    { id:"prestige-ten", name:"Ascended baker", icon:"👑", desc:"Earn 10 prestige points.", test:s=>s.prestige>=10 },
    { id:"skin", name:"Fashionable cookie", icon:"🎨", desc:"Unlock a special cookie skin.", test:s=>s.skins.length>=2 },
    { id:"million-cps", name:"Cookie tsunami", icon:"🌊", desc:"Reach 1 million cookies per second.", test:s=>getCps(s)>=1e6 }
  ];

  // ============================================================
  // SKINS
  // ============================================================

  const skins = [
    { id:"classic", name:"Classic chocolate", icon:"🍪", cost:0, desc:"The original cookie. A timeless legend." },
    { id:"golden", name:"Golden fortune", icon:"🌟", cost:100000, desc:"Shines like a treasure chest." },
    { id:"mint", name:"Mint chip", icon:"🌿", cost:5000000, desc:"Cool, fresh, minty goodness." },
    { id:"void", name:"Void cookie", icon:"🌌", cost:1000000000, desc:"Baked in the space between stars." },
    { id:"rainbow", name:"Rainbow cosmic", icon:"🌈", cost:1000000000000, desc:"A cookie beyond the laws of flavor." }
  ];

  function freshState() {
    return {
      cookies: 0, totalBaked: 0, runBaked: 0, totalClicks: 0,
      buildings: {}, upgrades: [], prestige: 0, rebirths: 0,
      goldenCaught: 0, achievements: [], skins: ["classic"],
      activeSkin: "classic", sound: true, lastTick: Date.now(),
      lastSave: Date.now(), goldenUntil: 0,
      goldenNext: Date.now() + 30000, lifetimeCpsPeak: 0
    };
  }

  let state = freshState();

  // ============================================================
  // CORE CALCULATIONS
  // ============================================================

  function totalBuildings(s = state) {
    return Object.values(s.buildings).reduce((sum, count) => sum + (Number(count) || 0), 0);
  }

  function getBaseCps(s = state) {
    return buildings.reduce((sum, b) => sum + (s.buildings[b.id] || 0) * b.cps, 0);
  }

  function getMultiplier(s = state) {
    return 1 + (s.prestige || 0) * 0.1;
  }

  function getCps(s = state) {
    const added = (s.upgrades || []).reduce((sum, id) => {
      const upgrade = upgrades.find(item => item.id === id);
      return sum + (upgrade && upgrade.category === "cps" ? upgrade.cpsBonus : 0);
    }, 0);
    return (getBaseCps(s) + added) * getMultiplier(s);
  }

  function getClickPower(s = state) {
    const added = (s.upgrades || []).reduce((sum, id) => {
      const upgrade = upgrades.find(item => item.id === id);
      return sum + (upgrade && upgrade.category === "click" ? upgrade.clickBonus : 0);
    }, 0);
    return (1 + added) * getMultiplier(s);
  }

  function format(value) {
    if (!Number.isFinite(value)) return "∞";
    if (value < 1000) return Math.floor(value).toLocaleString("en-US");

    const units = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc","Ud","Dd","Td","Qad","Qid","Sxd","Spd","Ocd","Nod","Vg"];
    let tier = -1;
    let number = value;

    while (number >= 1000 && tier < units.length - 1) {
      number /= 1000;
      tier++;
    }

    return number.toLocaleString("en-US", {
      maximumFractionDigits: number < 10 ? 2 : number < 100 ? 1 : 0
    }) + units[tier];
  }

  function buildingCost(building) {
    return Math.ceil(building.base * Math.pow(1.15, state.buildings[building.id] || 0));
  }

  function canAfford(cost) {
    return state.cookies >= cost;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    })[char]);
  }

  function toast(title, message) {
    const area = $("#toast-area");
    if (!area) return;

    const element = document.createElement("div");
    element.className = "toast";
    element.innerHTML = `<strong>${escapeHtml(title)}</strong><br>${escapeHtml(message)}`;
    area.appendChild(element);
    setTimeout(() => element.remove(), 3500);
  }

  function sound(frequency = 440, duration = 0.06, type = "sine") {
    if (!state.sound) return;

    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.04, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {}
  }

  // ============================================================
  // SAVING AND LOADING
  // ============================================================

  function saveGame(show = false) {
    state.lastSave = Date.now();
    state.lastTick = Date.now();

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));

      if ($("#save-status")) $("#save-status").innerHTML = '<span class="status-dot"></span> Saved locally';
      if ($("#footer-save")) $("#footer-save").textContent = "Your progress is saved in this browser.";

      if (show) toast("Game saved", "Your cookie empire is safe on this browser.");
    } catch (error) {
      if ($("#save-status")) $("#save-status").textContent = "Save unavailable";
      if (show) toast("Save failed", "Your browser may be blocking local storage.");
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const base = freshState();

      state = {
        ...base,
        ...parsed,
        buildings: { ...base.buildings, ...(parsed.buildings || {}) },
        upgrades: Array.isArray(parsed.upgrades) ? parsed.upgrades : [],
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
        skins: Array.isArray(parsed.skins) && parsed.skins.length ? parsed.skins : ["classic"]
      };

      state.cookies = Math.max(0, Number(state.cookies) || 0);
      state.totalBaked = Math.max(state.cookies, Number(state.totalBaked) || 0);
      state.runBaked = Math.max(0, Number(state.runBaked) || 0);

      state.upgrades = state.upgrades.filter(id => upgrades.some(upgrade => upgrade.id === id));

      const elapsed = Math.min(8 * 60 * 60, Math.max(0, (Date.now() - (Number(state.lastTick) || Date.now())) / 1000));

      if (elapsed > 5) {
        const earned = getCps(state) * elapsed;
        state.cookies += earned;
        state.totalBaked += earned;
        state.runBaked += earned;
        toast("Welcome back!", `Your bakery made ${format(earned)} cookies while you were away.`);
      }

      state.lastTick = Date.now();
    } catch (error) {
      state = freshState();
    }
  }

  // ============================================================
  // PURCHASING
  // ============================================================

  function buyBuilding(id) {
    const building = buildings.find(item => item.id === id);
    if (!building) return;

    const cost = buildingCost(building);
    if (!canAfford(cost)) return;

    state.cookies -= cost;
    state.buildings[id] = (state.buildings[id] || 0) + 1;

    sound(340, 0.05, "triangle");
    checkAchievements();
    renderAll();
    saveGame();
  }

  function buyUpgrade(id) {
    const upgrade = upgrades.find(item => item.id === id);
    if (!upgrade || state.upgrades.includes(id) || !canAfford(upgrade.cost)) return;

    state.cookies -= upgrade.cost;
    state.upgrades.push(id);

    sound(560, 0.1, "sine");
    toast("Upgrade purchased", upgrade.name + " is now permanently active.");
    checkAchievements();
    renderAll();
    saveGame();
  }

  function clickCookie() {
    const gain = getClickPower();

    state.cookies += gain;
    state.totalBaked += gain;
    state.runBaked += gain;
    state.totalClicks++;

    spawnFloat("+" + format(gain));
    sound(260 + Math.random() * 100, 0.045, "triangle");
    checkAchievements();
    renderCounters();

    $("#main-cookie")?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(.94) rotate(-2deg)" }, { transform: "scale(1)" }],
      { duration: 130 }
    );
  }

  function spawnFloat(value) {
    const container = $("#click-floats");
    if (!container) return;

    const element = document.createElement("span");
    element.className = "float-text";
    element.textContent = value;
    element.style.left = (25 + Math.random() * 50) + "%";
    element.style.top = (42 + Math.random() * 22) + "%";
    container.appendChild(element);
    setTimeout(() => element.remove(), 950);
  }

  // Golden cookies award cookies only. They do not activate boosts.
  function spawnGolden() {
    state.goldenUntil = Date.now() + 12000;
    $("#golden-cookie")?.classList.remove("hidden");
    toast("Golden cookie!", "Click it before it disappears for bonus cookies.");
  }

  function collectGolden() {
    if (state.goldenUntil < Date.now()) return;

    state.goldenUntil = 0;
    state.goldenCaught++;
    $("#golden-cookie")?.classList.add("hidden");

    const reward = Math.max(13, getCps() * 60 + getClickPower() * 100);

    state.cookies += reward;
    state.totalBaked += reward;
    state.runBaked += reward;
    state.goldenNext = Date.now() + 25000 + Math.random() * 45000;

    toast("Golden cookie collected!", `You found ${format(reward)} bonus cookies.`);
    sound(880, 0.18, "sine");
    checkAchievements();
    renderAll();
    saveGame();
  }

  function checkAchievements() {
    for (const achievement of achievements) {
      if (!state.achievements.includes(achievement.id) && achievement.test(state)) {
        state.achievements.push(achievement.id);
        toast("🏆 Achievement unlocked", achievement.name);
        sound(700, 0.12, "sine");
      }
    }
  }

  // ============================================================
  // REBIRTH
  // ============================================================

  function prestigeGain() {
    if (state.totalBaked < 1e9) return 0;
    return Math.max(1, Math.floor(Math.sqrt(state.totalBaked / 1e9)));
  }

  function doRebirth() {
    const gain = prestigeGain();
    if (!gain) return;

    const nextPrestige = state.prestige + gain;
    const nextRebirths = state.rebirths + 1;
    const total = state.totalBaked;
    const golden = state.goldenCaught;
    const clicks = state.totalClicks;
    const earnedAchievements = [...state.achievements];
    const ownedSkins = [...state.skins];
    const activeSkin = state.activeSkin;
    const soundOn = state.sound;
    const peak = state.lifetimeCpsPeak;

    state = freshState();
    state.prestige = nextPrestige;
    state.rebirths = nextRebirths;
    state.totalBaked = total;
    state.runBaked = 0;
    state.goldenCaught = golden;
    state.totalClicks = clicks;
    state.achievements = earnedAchievements;
    state.skins = ownedSkins;
    state.activeSkin = activeSkin;
    state.sound = soundOn;
    state.lifetimeCpsPeak = peak;
    state.goldenNext = Date.now() + 30000;

    checkAchievements();
    saveGame();
    renderAll();

    toast("REBIRTH COMPLETE!", `You gained ${gain} prestige point${gain === 1 ? "" : "s"}! Permanent production bonus: +${nextPrestige * 10}%.`);
    sound(660, 0.3, "sine");
  }

  // ============================================================
  // SKINS
  // ============================================================

  function buySkin(id) {
    const skin = skins.find(item => item.id === id);
    if (!skin) return;

    if (!state.skins.includes(id)) {
      if (!canAfford(skin.cost)) return;
      state.cookies -= skin.cost;
      state.skins.push(id);
      toast("Skin unlocked", skin.name + " is yours!");
      checkAchievements();
    }

    state.activeSkin = id;
    renderAll();
    saveGame();
    sound(480, 0.08, "triangle");
  }

  // ============================================================
  // RENDERING
  // ============================================================

  function renderCounters() {
    if ($("#cookie-count")) $("#cookie-count").textContent = format(state.cookies);
    if ($("#total-baked")) $("#total-baked").textContent = format(state.totalBaked);
    if ($("#total-clicks")) $("#total-clicks").textContent = format(state.totalClicks);
    if ($("#building-count")) $("#building-count").textContent = format(totalBuildings());
    if ($("#cps")) $("#cps").textContent = format(getCps());
    if ($("#click-power")) $("#click-power").textContent = "+" + format(getClickPower());
    if ($("#prestige-chip")) $("#prestige-chip").textContent = "✨ " + format(state.prestige) + " Prestige";
    if ($("#prestige-gain")) $("#prestige-gain").textContent = format(prestigeGain());
    if ($("#prestige-bonus")) $("#prestige-bonus").textContent = "+" + format(state.prestige * 10) + "%";

    const rebirthButton = $("#rebirth-button");
    if (rebirthButton) {
      rebirthButton.disabled = prestigeGain() <= 0;
      rebirthButton.textContent = prestigeGain() > 0
        ? `✨ Rebirth for ${format(prestigeGain())} prestige point${prestigeGain() === 1 ? "" : "s"}`
        : "✨ Rebirth (need 1 billion lifetime cookies)";
    }

    if ($("#main-cookie")) $("#main-cookie").className = "main-cookie skin-" + (state.activeSkin || "classic");
    if ($("#sound-toggle")) $("#sound-toggle").textContent = state.sound ? "🔊" : "🔇";
    if ($("#cookie-label")) $("#cookie-label").textContent = "cookies in the vault";

    const remaining = state.goldenUntil - Date.now();
    if (remaining > 0) {
      $("#golden-cookie")?.classList.remove("hidden");
      if ($("#golden-timer")) $("#golden-timer").textContent = Math.ceil(remaining / 1000) + "s LEFT";
    } else {
      $("#golden-cookie")?.classList.add("hidden");
      if ($("#golden-timer")) $("#golden-timer").textContent = "SEARCHING";
    }
  }

  function renderBuildings() {
    const list = $("#building-list");
    if (!list) return;

    list.innerHTML = buildings.map(building => {
      const count = state.buildings[building.id] || 0;
      const cost = buildingCost(building);
      const affordable = canAfford(cost);

      return `<article class="building-card ${affordable ? "" : "unaffordable"}">
        <div class="item-icon">${building.icon}</div>
        <div class="item-info">
          <h3>${building.name}</h3>
          <p>${building.desc}</p>
          <p class="owned-line">Owned: ${format(count)} · +${format(building.cps)} CPS each</p>
        </div>
        <div class="item-action">
          <span class="price">🍪 ${format(cost)}</span>
          <button class="buy-button" data-buy-building="${building.id}" ${affordable ? "" : "disabled"}>BUY +1</button>
        </div>
      </article>`;
    }).join("");
  }

  function renderUpgrades() {
    const available = upgrades.filter(upgrade => !state.upgrades.includes(upgrade.id));
    const ownedCps = state.upgrades.filter(id => upgrades.some(item => item.id === id && item.category === "cps")).length;
    const ownedClick = state.upgrades.filter(id => upgrades.some(item => item.id === id && item.category === "click")).length;

    if ($("#upgrade-count")) $("#upgrade-count").textContent = `CPS ${ownedCps}/90 · CLICK ${ownedClick}/90`;
    $("#upgrade-badge")?.classList.toggle("hidden", !available.some(upgrade => canAfford(upgrade.cost)));

    const renderCards = list => list.map(upgrade => {
      const owned = state.upgrades.includes(upgrade.id);
      const affordable = canAfford(upgrade.cost);

      return `<article class="upgrade-card ${affordable || owned ? "" : "unaffordable"}">
        <div class="item-icon">${upgrade.icon}</div>
        <div class="item-info">
          <h3>${upgrade.name}</h3>
          <p>${upgrade.desc}</p>
        </div>
        <div class="item-action">
          ${owned
            ? '<span class="owned-stamp">OWNED ✓</span>'
            : `<span class="price">🍪 ${format(upgrade.cost)}</span>
               <button class="buy-button" data-buy-upgrade="${upgrade.id}" ${affordable ? "" : "disabled"}>BUY</button>`}
        </div>
      </article>`;
    }).join("");

    if ($("#upgrade-cps-list")) $("#upgrade-cps-list").innerHTML = renderCards(upgrades.filter(item => item.category === "cps"));
    if ($("#upgrade-click-list")) $("#upgrade-click-list").innerHTML = renderCards(upgrades.filter(item => item.category === "click"));
  }

  function renderAchievements() {
    const list = $("#achievement-list");
    if (!list) return;

    const done = state.achievements.length;
    if ($("#achievement-progress")) $("#achievement-progress").textContent = done + " / " + achievements.length;
    if ($("#achievement-progress-bar")) $("#achievement-progress-bar").style.width = (done / achievements.length * 100) + "%";

    list.innerHTML = achievements.map(achievement => {
      const unlocked = state.achievements.includes(achievement.id);

      return `<article class="achievement-card ${unlocked ? "unlocked" : ""}">
        <div class="item-icon">${achievement.icon}</div>
        <div class="item-info"><h3>${achievement.name}</h3><p>${achievement.desc}</p></div>
        <span class="check">${unlocked ? "✓" : "🔒"}</span>
      </article>`;
    }).join("");
  }

  function renderSkins() {
    const list = $("#skin-list");
    if (!list) return;

    if ($("#skin-owned")) $("#skin-owned").textContent = state.skins.length + " owned";

    list.innerHTML = skins.map(skin => {
      const owned = state.skins.includes(skin.id);
      const selected = state.activeSkin === skin.id;
      const affordable = canAfford(skin.cost);

      return `<article class="skin-card ${selected ? "selected" : ""}">
        <div class="skin-preview ${skin.id}"></div>
        <div class="item-info"><h3>${skin.name}</h3><p>${skin.desc}</p></div>
        <div class="item-action">
          ${selected
            ? '<span class="owned-stamp">EQUIPPED</span>'
            : owned
              ? `<button class="buy-button" data-buy-skin="${skin.id}">EQUIP</button>`
              : `<span class="price">🍪 ${format(skin.cost)}</span>
                 <button class="buy-button" data-buy-skin="${skin.id}" ${affordable ? "" : "disabled"}>UNLOCK</button>`}
        </div>
      </article>`;
    }).join("");
  }

  // ============================================================
  // USERNAME
  // ============================================================

  function getPlayerUsername() {
    try {
      return localStorage.getItem(PLAYER_USERNAME_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function setPlayerUsername(value) {
    const username = String(value || "").trim();

    if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
      toast("Invalid username", "Use 3–16 letters, numbers, or underscores.");
      return false;
    }

    try {
      localStorage.setItem(PLAYER_USERNAME_KEY, username);
    } catch (error) {}

    renderPlayerUsername();
    toast("Username saved", "Welcome, " + username + "!");
    return true;
  }

  function renderPlayerUsername() {
    const element = $("#player-username");
    if (element) element.textContent = "👤 " + (getPlayerUsername() || "Choose username");
  }

  function openUsernameEditor() {
    const value = prompt(
      "Choose your Cookie Infinite username (3–16 letters, numbers, or underscores):",
      getPlayerUsername()
    );

    if (value !== null && setPlayerUsername(value)) saveGame();
  }

  // ============================================================
  // SUPABASE GLOBAL ANNOUNCEMENTS
  // ============================================================

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

    try {
      body = bodyText ? JSON.parse(bodyText) : null;
    } catch (error) {
      body = bodyText;
    }

    if (!response.ok) {
      throw new Error(body?.error || body?.message || `Supabase request failed (${response.status})`);
    }

    return body;
  }

  function renderAnnouncement(message, username = "Theee_Cash", id = null) {
    const clean = String(message || "").trim();
    const banner = $("#global-announcement");
    const messageElement = $("#global-announcement-text");
    const byline = $("#global-announcement-byline");

    if (messageElement) messageElement.textContent = clean;
    if (byline) byline.textContent = clean ? `Posted by ${username || "Theee_Cash"}` : "";
    if (banner) banner.classList.toggle("hidden", !clean);

    globalMessageId = id;

    const preview = $("#admin-announcement-preview");
    if (preview) {
      preview.textContent = clean ? `Posted by ${username || "Theee_Cash"}: ${clean}` : "";
      preview.classList.toggle("hidden", !clean || !adminUnlocked);
    }
  }

  async function loadGlobalAnnouncement() {
    try {
      const rows = await supabaseRequest(
        "/rest/v1/global_messages?select=id,username,message,created_at&order=created_at.desc&limit=1",
        { method: "GET" }
      );

      if (Array.isArray(rows) && rows.length) {
        renderAnnouncement(rows[0].message, rows[0].username, rows[0].id);
      } else {
        renderAnnouncement("");
      }
    } catch (error) {
      const legacy = (() => {
        try {
          return localStorage.getItem(ADMIN_MESSAGE_KEY) || "";
        } catch (e) {
          return "";
        }
      })();

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
      body: JSON.stringify({
        action,
        adminCode: adminSessionCode,
        username: "Theee_Cash",
        ...extra
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      throw new Error(data.error || `Admin request failed (${response.status})`);
    }

    return data;
  }

  function renderAdminMessage() {
    loadGlobalAnnouncement();
  }

  // ============================================================
  // ADMIN PANEL
  // ============================================================

  function addAdminLog(message) {
    adminLogEntries.unshift({ time: new Date().toLocaleTimeString(), message });
    adminLogEntries.splice(12);

    const log = $("#admin-log");
    if (!log) return;

    log.innerHTML = adminLogEntries.map(entry =>
      `<div class="admin-log-entry"><time>${escapeHtml(entry.time)}</time> ${escapeHtml(entry.message)}</div>`
    ).join("");
  }

  function showTab(tabName) {
    $$(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.tab === tabName));
    $$(".tab-content").forEach(panel => panel.classList.toggle("hidden", panel.id !== "tab-" + tabName));

    if (tabName === "upgrades") {
      const category = document.querySelector("[data-upgrade-category].active")?.dataset.upgradeCategory || "cps";
      $("#upgrade-cps-panel")?.classList.toggle("hidden", category !== "cps");
      $("#upgrade-click-panel")?.classList.toggle("hidden", category !== "click");
    }
  }

  function openAdminPanel() {
    if (!adminUnlocked) {
      $("#admin-login-error")?.classList.add("hidden");
      if ($("#admin-code")) $("#admin-code").value = "";
      $("#admin-login-modal")?.classList.remove("hidden");
      setTimeout(() => $("#admin-code")?.focus(), 50);
      return;
    }

    showTab("admin");
  }

  function unlockAdmin() {
    adminUnlocked = true;
    $("#admin-login-modal")?.classList.add("hidden");
    $("#admin-tab-button")?.classList.remove("hidden");

    addAdminLog("Admin panel unlocked in this browser.");
    showTab("admin");
    renderAdminMessage();
    toast("Admin access granted", "Control room unlocked for this browser session.");
  }

  // ============================================================
  // GAME LOOP — NO TEMPORARY BOOSTS
  // ============================================================

  function tick() {
    const now = Date.now();
    const delta = Math.min(2, Math.max(0, (now - (state.lastTick || now)) / 1000));
    state.lastTick = now;

    if (delta > 0) {
      const earned = getCps() * delta;
      state.cookies += earned;
      state.totalBaked += earned;
      state.runBaked += earned;
    }

    if (state.goldenUntil && now >= state.goldenUntil) {
      state.goldenUntil = 0;
      state.goldenNext = now + 25000 + Math.random() * 45000;
      $("#golden-cookie")?.classList.add("hidden");
    }

    if (!state.goldenUntil && now >= state.goldenNext) spawnGolden();

    if (now - state.lastSave > 10000) saveGame();

    if (now - lastRender > 180) {
      lastRender = now;
      state.lifetimeCpsPeak = Math.max(state.lifetimeCpsPeak, getCps());
      checkAchievements();
      renderAll();
    }
  }

  function renderAll() {
    renderCounters();
    renderBuildings();
    renderUpgrades();
    renderAchievements();
    renderSkins();
    renderPlayerUsername();
    renderAdminMessage();
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================

  const cookieButton = $("#cookie-button") || $("#main-cookie");
  cookieButton?.addEventListener("click", clickCookie);

  cookieButton?.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      clickCookie();
    }
  });

  $("#golden-cookie")?.addEventListener("click", collectGolden);
  $("#save-button")?.addEventListener("click", () => saveGame(true));

  $("#sound-toggle")?.addEventListener("click", () => {
    state.sound = !state.sound;
    renderCounters();
    saveGame();
    if (state.sound) sound(500, 0.08);
  });

  $("#reset-button")?.addEventListener("click", () => $("#confirm-modal")?.classList.remove("hidden"));
  $("#cancel-reset")?.addEventListener("click", () => $("#confirm-modal")?.classList.add("hidden"));

  $("#confirm-reset")?.addEventListener("click", () => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {}

    state = freshState();
    $("#confirm-modal")?.classList.add("hidden");
    renderAll();
    saveGame();
    toast("Fresh start", "Your bakery has been reset.");
  });

  $("#rebirth-button")?.addEventListener("click", doRebirth);

  $$(".tab").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();

      if (button.dataset.tab === "admin" && !adminUnlocked) {
        openAdminPanel();
        return;
      }

      showTab(button.dataset.tab);
    });
  });

  $("#admin-open")?.addEventListener("click", openAdminPanel);

  $("#cancel-admin-login")?.addEventListener("click", () => {
    $("#admin-login-modal")?.classList.add("hidden");
  });

  $("#admin-login-form")?.addEventListener("submit", async event => {
    event.preventDefault();

    adminSessionCode = $("#admin-code")?.value || "";

    const submit = $("#admin-login-form")?.querySelector('button[type="submit"]');
    if (submit) submit.disabled = true;

    try {
      await adminFunction("verify");
      unlockAdmin();
    } catch (error) {
      adminSessionCode = "";

      const errorElement = $("#admin-login-error");
      if (errorElement) {
        errorElement.textContent = error.message.includes("Failed to fetch")
          ? "Admin verification is not configured yet. Deploy the Supabase Edge Function first."
          : "Incorrect code or admin service unavailable. Try again.";
        errorElement.classList.remove("hidden");
      }

      sound(150, 0.12, "square");
    } finally {
      if (submit) submit.disabled = false;
    }
  });

  $("#send-admin-message")?.addEventListener("click", async () => {
    if (!adminUnlocked) return;

    const input = $("#admin-message");
    const message = input?.value.trim() || "";

    if (!message) {
      toast("Message is empty", "Type an announcement first.");
      return;
    }

    const button = $("#send-admin-message");
    if (button) button.disabled = true;

    try {
      await adminFunction("publish", { message });
      if (input) input.value = "";
      await loadGlobalAnnouncement();

      addAdminLog("Published global announcement: " + message.slice(0, 70));
      toast("Global announcement published", "All players can see this message.");
    } catch (error) {
      toast("Could not publish globally", error.message + ". Check that the admin-announcement Edge Function is deployed.");
    } finally {
      if (button) button.disabled = false;
    }
  });

  $("#clear-admin-message")?.addEventListener("click", async () => {
    if (!adminUnlocked) return;

    const button = $("#clear-admin-message");
    if (button) button.disabled = true;

    try {
      await adminFunction("clear");
      if ($("#admin-message")) $("#admin-message").value = "";
      renderAnnouncement("");

      addAdminLog("Cleared the global announcement.");
      toast("Global announcement cleared", "The banner was removed for all players.");
    } catch (error) {
      toast("Could not clear announcement", error.message + ". Check that the admin-announcement Edge Function is deployed.");
    } finally {
      if (button) button.disabled = false;
    }
  });

  $("#dismiss-announcement")?.addEventListener("click", () => {
    $("#global-announcement")?.classList.add("hidden");
  });

  $("#admin-add-cookies")?.addEventListener("click", () => {
    if (!adminUnlocked) return;

    const amount = Number($("#admin-cookie-amount")?.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast("Invalid amount", "Enter a number greater than zero.");
      return;
    }

    state.cookies += amount;
    state.totalBaked += amount;

    addAdminLog("Added " + format(amount) + " cookies.");
    checkAchievements();
    renderAll();
    saveGame();
    toast("Cookies granted", format(amount) + " cookies added.");
  });

  $("#admin-set-prestige")?.addEventListener("click", () => {
    if (!adminUnlocked) return;

    const amount = Math.floor(Number($("#admin-prestige-amount")?.value));
    if (!Number.isFinite(amount) || amount < 0) {
      toast("Invalid prestige", "Enter zero or a positive whole number.");
      return;
    }

    state.prestige = amount;
    addAdminLog("Set prestige to " + amount + ".");
    checkAchievements();
    renderAll();
    saveGame();
    toast("Prestige updated", "Prestige is now " + format(amount) + ".");
  });

  $("#admin-unlock-all")?.addEventListener("click", () => {
    if (!adminUnlocked) return;

    state.upgrades = upgrades.map(upgrade => upgrade.id);
    state.skins = skins.map(skin => skin.id);
    state.achievements = achievements.map(achievement => achievement.id);

    addAdminLog("Unlocked every upgrade, skin and achievement.");
    renderAll();
    saveGame();
    toast("Everything unlocked", "All upgrades, skins and trophies are unlocked.");
  });

  $("#admin-golden")?.addEventListener("click", () => {
    if (!adminUnlocked) return;

    state.goldenUntil = Date.now() + 12000;
    $("#golden-cookie")?.classList.remove("hidden");

    addAdminLog("Spawned a golden cookie.");
    toast("Golden cookie spawned", "Click the golden cookie on the main panel!");
  });

  $("#admin-save")?.addEventListener("click", () => {
    if (!adminUnlocked) return;
    saveGame(true);
    addAdminLog("Manually saved the game.");
  });

  $("#admin-logout")?.addEventListener("click", () => {
    adminUnlocked = false;
    adminSessionCode = "";
    $("#admin-tab-button")?.classList.add("hidden");
    showTab("upgrades");
    addAdminLog("Admin panel locked.");
    toast("Admin panel locked", "Enter the code again to unlock it.");
  });

  $("#change-username")?.addEventListener("click", openUsernameEditor);

  $("#building-list")?.addEventListener("click", event => {
    const button = event.target.closest("[data-buy-building]");
    if (button) buyBuilding(button.dataset.buyBuilding);
  });

  $("#upgrade-cps-list")?.addEventListener("click", event => {
    const button = event.target.closest("[data-buy-upgrade]");
    if (button) buyUpgrade(button.dataset.buyUpgrade);
  });

  $("#upgrade-click-list")?.addEventListener("click", event => {
    const button = event.target.closest("[data-buy-upgrade]");
    if (button) buyUpgrade(button.dataset.buyUpgrade);
  });

  $$("[data-upgrade-category]").forEach(button => {
    button.addEventListener("click", () => {
      const category = button.dataset.upgradeCategory;

      $$("[data-upgrade-category]").forEach(other => {
        other.classList.toggle("active", other === button);
      });

      $("#upgrade-cps-panel")?.classList.toggle("hidden", category !== "cps");
      $("#upgrade-click-panel")?.classList.toggle("hidden", category !== "click");
    });
  });

  const tradeSkinSelect = $("#trade-skin-select");
  if (tradeSkinSelect) {
    tradeSkinSelect.innerHTML = '<option value="">Trading backend setup required</option>';
  }

  $("#skin-list")?.addEventListener("click", event => {
    const button = event.target.closest("[data-buy-skin]");
    if (button) buySkin(button.dataset.buySkin);
  });

  window.addEventListener("beforeunload", () => saveGame());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) saveGame();
  });

  // ============================================================
  // STARTUP
  // ============================================================

  loadGame();

  if (!state.goldenNext || state.goldenNext < Date.now()) {
    state.goldenNext = Date.now() + 20000;
  }

  renderAll();
  showTab("upgrades");

  $$("[data-upgrade-category]").forEach(button => {
    button.classList.toggle("active", button.dataset.upgradeCategory === "cps");
  });

  $("#upgrade-cps-panel")?.classList.remove("hidden");
  $("#upgrade-click-panel")?.classList.add("hidden");

  renderPlayerUsername();

  if (!getPlayerUsername() && !usernamePromptShown) {
    usernamePromptShown = true;
    setTimeout(openUsernameEditor, 800);
  }

  loadGlobalAnnouncement();
  setInterval(loadGlobalAnnouncement, 15000);
  setInterval(tick, 100);
  setInterval(() => saveGame(), 10000);

  setTimeout(() => {
    toast("Welcome to Cookie Infinite", "Click the giant cookie to start your empire!");
  }, 600);
})();