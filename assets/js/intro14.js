/* ============================================================================
 * CUAL 首次进入开场 —— 「地面站 · 机群自检与起飞」剧情版（自 web-intro/ 移植）
 * ----------------------------------------------------------------------------
 * 原始页面动画：550C-source.html（Voidpocket 制作），本次改编为 47 机自检起飞。
 * 每次刷新都会播放（已取消 sessionStorage 去重）；站内跳转（点导航进另一个页面）不播。
 * logo 揭示 → 地面站启动 / 操作员授权 / 链路排查 / 航线装载 / 逐节点自检 /
 * 解锁起飞 → 揭开页面。右上角 SKIP 按钮、Esc、Space、点击任意处、触屏随时跳过；
 * 系统「减少动态效果」时不播放（直接显示页面）。
 * 遮罩 #dsh-intro 在首帧前创建（样式见 style.css「首次进入开场」段）；
 * 收场逻辑在 revealSite()：给 body 摘掉锁定、加 .loaded，交回 main.js 首屏入场。
 * ========================================================================== */

(function () {
  /* ── 站内跳转不播：点站内链接时打一个一次性标记，再叠加 navigation type / referrer 判断。
     刷新（F5、Ctrl+F5）与从外部进来仍然播放。 ── */
  function markInternalNav() {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      try {
        var u = new URL(a.href, location.href);
        if (u.origin !== location.origin) return;
        if (u.pathname === location.pathname && u.search === location.search) return;
        window.sessionStorage.setItem("cual-intro-nav", "1");
      } catch (err) {}
    }, true);
  }

  function skipReason() {
    var reason = "";
    try {
      var navs = performance.getEntriesByType && performance.getEntriesByType("navigation");
      var type = navs && navs[0] ? navs[0].type : "";
      var ref = document.referrer || "";
      var strip = function (s) { return String(s).split("#")[0].replace(/\/+$/, ""); };
      if (type === "back_forward") reason = "back_forward";
      else if (type === "navigate" && ref && ref.indexOf(location.origin) === 0 && strip(ref) !== strip(location.href)) reason = "internal";
    } catch (e) {}
    try {
      if (!reason && window.sessionStorage.getItem("cual-intro-nav") === "1") reason = "marked";
      window.sessionStorage.removeItem("cual-intro-nav");
    } catch (e) {}
    return reason;
  }

  markInternalNav();

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  /* 单页版：告诉 app.js 首屏与载入遮罩由本动画接管 */
  window.CUAL_INTRO = !reduce;
  if (reduce) return;

  function fatal() {
    window.__cualIntroActive = false;
    try {
      var el = document.getElementById("dsh-intro");
      if (el && el.parentNode) el.parentNode.removeChild(el);
      document.documentElement.classList.remove("dsh-intro-on");
    } catch (e2) {}
    try { document.dispatchEvent(new CustomEvent("cual:intro-end")); } catch (e3) {}
  }

  try {
    // 首帧前挂载遮罩：head 阶段 body 尚未生成，先挂到 <html>（fixed 全屏覆盖）
    var stage = document.createElement("div");
    stage.id = "dsh-intro";
    stage.setAttribute("aria-hidden", "true");
    stage.innerHTML = `<div id="intro14-boot">
  <div class="boot-stage">
    <img src="assets/images/通用/intro-logo-2026.svg" alt="CUAL Logo" id="bootLogo">
    <div class="boot-text" id="bootText">CAUC UAV LAB · GCS BOOT<span class="cursor"></span></div>
  </div>
</div>

<div id="app">
  <div id="hud-top">
    <span class="brand">◢ CUAL // UAV-LAB</span>
    <span class="sep">│</span>
    <span class="item">MODE <b>SWARM</b></span>
    <span class="item">AIRSPACE <b>ACC-07</b></span>
    <span class="item">SESSION <b id="h-session">————</b></span>
    <span class="spacer"></span>
    <span class="item">TIME <b id="h-time">00:00:00</b></span>
    <span class="sep">│</span>
    <span class="item live">● REC</span>
  </div>
  <div id="workspace">
    <section class="w" id="w-tele">
      <div class="w-head"><span class="led"></span>TELEMETRY / UAV</div>
      <div class="w-body" id="teleBody">
        <div class="sect">Radio</div>
        <div class="dt"><span class="k">DATA LINK</span><span class="v">900 MHz · 230 kbps</span></div>
        <div class="dt"><span class="k">VIDEO</span><span class="v">5.8 GHz · 双天线</span></div>
        <div class="dt"><span class="k">RTK</span><span class="v ok">FIX · 8.6 s</span></div>
        <div class="dt"><span class="k">SATS</span><span class="v">18</span></div>
        <div class="dt"><span class="k">HDOP</span><span class="v">0.7</span></div>
        <div class="dt"><span class="k">BARO</span><span class="v">971.2 hPa</span></div>
        <div class="sect">Link</div>
        <div class="dt"><span class="k">STATE</span><span class="v ok">CONNECTED</span></div>
        <div class="dt"><span class="k">FAILSAFE</span><span class="v">RTL · ENABLED</span></div>
        <div class="dt"><span class="k">FENCE</span><span class="v">2.0 km</span></div>
        <div class="dt"><span class="k">RTT</span><span class="v" id="h-krot">182 ms</span></div>
        <div class="sect">Metrics</div>
        <div class="dt"><span class="k">RSSI</span><span class="v" id="h-rsrp">-67 dBm</span></div>
        <div class="dt"><span class="k">SNR</span><span class="v" id="h-sinr">22.4 dB</span></div>
        <div class="dt"><span class="k">LOSS</span><span class="v" id="h-bler">0.12 %</span></div>
        <div class="dt"><span class="k">BATT</span><span class="v">23.9 V · 25.1 V</span></div>
        <div class="sect">Status</div>
        <div class="dt"><span class="k">LINK</span><span class="v warn" id="h-up">STANDBY</span></div>
        <div class="dt"><span class="k">FIRMWARE</span><span class="v warn" id="h-ca">VERIFYING</span></div>
        <div class="dt"><span class="k">FLEET</span><span class="v" id="h-nodes">47 / 47</span></div>
      </div>
    </section>
    <section class="w" id="w-main">
      <div class="w-head"><span class="led red"></span>CUAL CORE TERMINAL</div>
      <div class="w-body" id="mainBody"></div>
    </section>
    <section class="w" id="w-code">
      <div class="w-head"><span class="led"></span>FIRMWARE STREAM</div>
      <div class="w-body" id="codeBody"></div>
    </section>
    <section class="w" id="w-node">
      <div class="w-head"><span class="led red"></span>NODE MATRIX</div>
      <div class="w-body"><div id="nodeGrid"></div></div>
    </section>
  </div>
  <div id="hud-bot">
    <span class="item">STAGE <b id="b-stage">IDLE</b></span>
    <span class="item">NODE <b id="b-node">00 / 47</b></span>
    <span class="spacer"></span>
    <span class="item">SELFCHECK</span>
    <div class="prog"><div class="fill" id="b-fill"></div></div>
    <span class="pct" id="b-pct">0%</span>
    <span class="spacer"></span>
    <span class="item">FLEET <b id="b-net">HANGAR</b></span>
    <span class="item">CH <b>07</b></span>
    <span class="item">FPS <b id="b-fps">60</b></span>
  </div>
</div>

<div id="dim"></div>
<div id="final">FLEET IS AIRBORNE</div>
<button id="intro-skip" type="button" aria-label="跳过开场动画" title="跳过开场动画（Esc）">SKIP<span class="esc">ESC</span></button>
<div id="hint">— 点击任意处 / 按 ESC / 点右上 SKIP 跳过 —</div>`;
    document.documentElement.appendChild(stage);
    document.documentElement.classList.add("dsh-intro-on");
    window.__cualIntro = stage;
    window.__cualIntroActive = true;

const $ = s => document.querySelector(s);
const introStage = document.getElementById("dsh-intro");
const mainBody = $("#mainBody");
const codeBody = $("#codeBody");
const CANCELLED = Symbol("dsh-intro-cancelled");
let cancelled = false, revealed = false;
const pending = new Set();
/* 整体节奏系数：0.3 ≈ 全片约 5 秒（剧情、窗口与打字全保留，仅压缩等待），
   想再快/慢改这一个数即可（1 = 原版节奏约 15 秒，0.5 ≈ 8 秒） */
const SCALE = 0.3;
/* 可取消 sleep：跳过后所有 await 一步到位全部解除 */
function sleep(ms){
  return new Promise((resolve, reject) => {
    if (cancelled){ reject(CANCELLED); return; }
    const entry = { reject, timer: 0 };
    entry.timer = setTimeout(() => {
      pending.delete(entry);
      if (cancelled) reject(CANCELLED); else resolve();
    }, Math.max(1, Math.round(ms * SCALE)));
    pending.add(entry);
  });
}
let booting = false, launched = false;

/* ===== 开机动画 ===== */
function playBoot(){
  /* logo 以 <img> 方式淡入发光；更换 logo 只需替换 intro-logo-2026.svg */
  const logo = document.getElementById('bootLogo');
  const bootText = document.getElementById('bootText');
  setTimeout(() => logo.classList.add('show'), 300 * SCALE);
  setTimeout(() => bootText.classList.add('show'), 1800 * SCALE);
  setTimeout(() => { const h = document.getElementById("hint"); if (h) h.classList.add("show"); }, 1800 * SCALE);
  return 2800;
}

async function bootUp(){
  if (booting || launched || revealed) return;
  booting = true;
  try {
    const totalMs = playBoot();
    await sleep(totalMs + 300);
    const boot = $("#intro14-boot");
    boot.classList.add("fade");
    await sleep(600);
    if (boot.parentNode) boot.parentNode.removeChild(boot);
    $("#app").classList.add("visible");
    launched = true;
    await run();
    $("#final").classList.add("fade");
    await sleep(600);
    revealSite();
  } catch (e) {
    if (e !== CANCELLED) revealSite();
  }
}

function introActive(){
  const intro = document.getElementById("dsh-intro");
  return !!intro && !intro.classList.contains("done");
}

/* 收场：清掉所有挂起步骤与定时器，然后揭开正文 */
function cancelShow(){
  if (cancelled) return;
  cancelled = true;
  for (const entry of pending){ clearTimeout(entry.timer); if (entry.reject) entry.reject(CANCELLED); }
  pending.clear();
  try { stopCode(); } catch (e) {}
  try { stopLink(); } catch (e) {}
  if (clockTimer) clearInterval(clockTimer);
  if (fpsTimer) clearInterval(fpsTimer);
}
function revealSite(){
  if (revealed) return;
  revealed = true;
  cancelShow();
  const intro = document.getElementById("dsh-intro");
  document.documentElement.classList.remove("dsh-intro-on");
  try { document.dispatchEvent(new CustomEvent("cual:intro-end")); } catch (e2) {}
  window.__cualIntroActive = false;
  if (intro){
    intro.classList.add("done");
    setTimeout(() => { try { if (intro.parentNode) intro.parentNode.removeChild(intro); } catch (e) {} window.__cualIntro = null; }, 450);
  }
}
window.__cualIntroExit = revealSite;

/* 右上角 SKIP 按钮：显式跳过入口（Esc / 点击任意处同样有效） */
(function bindSkip(){
  var btn = document.getElementById("intro-skip");
  if (!btn) return;
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    revealSite();
  });
  btn.addEventListener("mousedown", function (e) { e.stopPropagation(); });
})();

/* 点击 / 触屏 / Esc / Space —— 开场期间随时跳过 */
window.addEventListener("keydown", e => {
  if (!introActive()) return;
  if (e.code === "Space" || e.key === " " || e.key === "Escape"){ e.preventDefault(); revealSite(); }
});
document.addEventListener("click", () => { if (introActive()) revealSite(); });
document.addEventListener("touchstart", () => { if (introActive()) revealSite(); }, { passive: true });

/* 自动开机：DOM 就绪即启动（触发后不再依赖图片等资源加载） */
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(bootUp, 250));
else setTimeout(bootUp, 250);

/* 兜底：无论中途发生什么，45s 后强制收场揭示页面 */
setTimeout(revealSite, 45000);

/* ===== 主终端日志 ===== */
function mainLine(text, cls = ""){
  const el = document.createElement("div");
  el.className = "ln " + cls;
  el.textContent = text;
  mainBody.appendChild(el);
  mainBody.scrollTop = mainBody.scrollHeight;
  return el;
}
async function type(text, cls = "", speed = 1){
  const el = mainLine("", cls);
  for (let i = 0; i < text.length; i += 6){
    el.textContent += text.slice(i, i + 6);
    mainBody.scrollTop = mainBody.scrollHeight;
    await sleep(speed);
  }
  await sleep(4);
}

/* ===== 代码流 ===== */
const CODE = [
  "// ── PX4 SecureBoot v1.14 ──────────────",
  "#include <px4_platform_common/px4_config.h>",
  "#include <px4_platform/crypto/sha256.h>",
  "#include <mavlink/v2.0/common/mavlink.h>",
  "",
  "static const u32 fw_magic = 0x50583431;",
  "static const u8  hw_rev[] = { 0x55, 0x0C };",
  "",
  "void px4_secure_boot(void){",
  "    u32 sig = read_reg(BOOT_SIG);",
  "    if (sig != fw_magic) panic(\"FW_SIG_MISMATCH\");",
  "    if (verify_signature(IMAG_BASE, IMAG_SIZE, root_ca))",
  "        jump_kernel();",
  "    else { set_rollback_slot(SLOT_A); reboot(); }",
  "}",
  "",
  "// ── NuttX RTOS scheduler ──────────────",
  "void nx_start(void){",
  "    for (int i = 0; i < CONFIG_MAX_TASKS; i++)",
  "        g_task[i].state = TSTATE_TASK_INACTIVE;",
  "    wd_start(&g_wdog, 2000);",
  "}",
  "",
  "// ── PX4 flight control ─────────────────",
  "void flight_controller(void *arg){",
  "    while (1) {",
  "        vehicle_attitude_s att;",
  "        orb_copy(ORB_ID(vehicle_attitude), att_sub, &att);",
  "        vehicle_local_position_s pos;",
  "        orb_copy(ORB_ID(vehicle_local_position), pos_sub, &pos);",
  "        control_allocator(att, pos);",
  "        if (safety_check(&pos) != PX4_OK) {",
  "            set_flight_mode(VEHICLE_MODE_LOITER); continue;",
  "        }",
  "        px4_usleep(5000);",
  "    }",
  "}",
  "",
  "// ── Geofence / NFZ ────────────────────",
  "static const struct geofence g_nfz[] = {",
  "    { .lat = 31.2304, .lon = 121.4737, .radius = 2000.0, .type = GF_HARD },",
  "    { .lat = 39.9042, .lon = 116.4074, .radius = 5000.0, .type = GF_HARD },",
  "    { .lat = 22.5431, .lon = 114.0579, .radius = 3000.0, .type = GF_HARD },",
  "};",
  "",
  "// ── Security / ARM lockout ─────────────",
  "void security_init(void){",
  "    revoke_ca(EXTERNAL_CA_ID);",
  "    batt_selftest(PACK_ALL, CELL_DELTA_MAX);",
  "    lock_payload(PAYLOAD_DISARM_ONLY);",
  "    mavlink_signing_enable(MAVLINK_SIGNING_FLAG_SIGN_OUTGOING);",
  "}",
  "",
  "void image_verify(void){",
  "    sha256_ctx c;",
  "    sha256_init(&c);",
  "    sha256_update(&c, IMAG_BASE, IMAG_SIZE);",
  "    if (!sha256_match(&c, g_expected_hash)) panic(\"HASH_FAIL\");",
  "}",
  "/* ── end of PX4 image ── */"
];
let codeTimer = null, codeI = 0, clockTimer = null, fpsTimer = null;
function pushCodeLine(){
  const raw = CODE[codeI++ % CODE.length];
  const el = document.createElement("div");
  el.className = "cln";
  if (/^\s*\/\//.test(raw) || /^\s*\/\*/.test(raw)) el.classList.add("cm");
  el.textContent = raw || " ";
  codeBody.appendChild(el);
  while (codeBody.childElementCount > 200) codeBody.removeChild(codeBody.firstChild);
  codeBody.scrollTop = codeBody.scrollHeight;
}
function startCode(ms = 40){ codeTimer = setInterval(pushCodeLine, ms); }
function setCodeSpeed(ms){ if (!codeTimer) return; clearInterval(codeTimer); codeTimer = setInterval(pushCodeLine, ms); }
function stopCode(){ if (codeTimer) clearInterval(codeTimer); codeTimer = null; }

let linkTimer = null;
function startLink(){
  const rsrp = $("#h-rsrp"), sinr = $("#h-sinr"), bler = $("#h-bler"), krot = $("#h-krot");
  linkTimer = setInterval(() => {
    rsrp.textContent = (-67 - Math.round(Math.random()*6)) + " dBm";
    sinr.textContent = (18 + Math.random()*8).toFixed(1) + " dB";
    bler.textContent = (Math.random()*0.8).toFixed(2) + " %";
    krot.textContent = (180 + Math.round(Math.random()*40)) + " ms";
  }, 340);
}
function stopLink(){ if (linkTimer) clearInterval(linkTimer); }
function startClock(){ clockTimer = setInterval(() => { const d = new Date(); $("#h-time").textContent = String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+":"+String(d.getSeconds()).padStart(2,"0"); }, 1000); }
function startFps(){ fpsTimer = setInterval(() => { $("#b-fps").textContent = (58 + Math.round(Math.random()*4)); }, 700); }

/* ===== 无人机图标 ===== */
const NODE_COUNT = 47;
const UAV_SVG = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="16" r="11" stroke="currentColor" stroke-width="2.2" fill="none"/><circle cx="50" cy="16" r="11" stroke="currentColor" stroke-width="2.2" fill="none"/><circle cx="14" cy="48" r="11" stroke="currentColor" stroke-width="2.2" fill="none"/><circle cx="50" cy="48" r="11" stroke="currentColor" stroke-width="2.2" fill="none"/><line x1="8" y1="16" x2="20" y2="16" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="11" y1="10" x2="17" y2="22" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="17" y1="10" x2="11" y2="22" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="44" y1="16" x2="56" y2="16" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="47" y1="10" x2="53" y2="22" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="53" y1="10" x2="47" y2="22" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="8" y1="48" x2="20" y2="48" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="11" y1="42" x2="17" y2="54" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="17" y1="42" x2="11" y2="54" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="44" y1="48" x2="56" y2="48" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="47" y1="42" x2="53" y2="54" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="53" y1="42" x2="47" y2="54" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="20" y1="16" x2="44" y2="16" stroke="currentColor" stroke-width="1.8" opacity="0.7"/><line x1="20" y1="48" x2="44" y2="48" stroke="currentColor" stroke-width="1.8" opacity="0.7"/><ellipse cx="32" cy="32" rx="9" ry="16" stroke="currentColor" stroke-width="2" fill="none"/><line x1="32" y1="16" x2="32" y2="48" stroke="currentColor" stroke-width="1" opacity="0.4"/><circle cx="32" cy="19" r="2" fill="currentColor"/><path d="M 32 12 L 28.5 17 L 35.5 17 Z" fill="currentColor" opacity="0.9"/></svg>`;
const nodeGrid = $("#nodeGrid");
const nodeIcons = [];
function buildNodes(){
  nodeGrid.innerHTML = ""; nodeIcons.length = 0;
  for (let i = 0; i < NODE_COUNT; i++){
    const d = document.createElement("div"); d.className = "uav";
    const svgWrap = document.createElement("div"); svgWrap.innerHTML = UAV_SVG; svgWrap.style.color = "#ff4a12";
    const id = document.createElement("div"); id.className = "id"; id.textContent = "U" + String(i+1).padStart(2,"0");
    const st = document.createElement("div"); st.className = "st"; st.textContent = "STANDBY";
    d.appendChild(svgWrap); d.appendChild(id); d.appendChild(st); nodeGrid.appendChild(d);
    nodeIcons.push({ el:d, colorEl:svgWrap, st });
  }
}
function setIcon(i, cls, text, color){
  const ic = nodeIcons[i]; if (!ic) return;
  ic.el.className = "uav " + cls; ic.colorEl.style.color = color; ic.st.textContent = text;
}
function setProgress(p, nodeLabel){
  p = Math.max(0, Math.min(100, p));
  $("#b-fill").style.width = p + "%";
  $("#b-pct").textContent = Math.round(p) + "%";
  if (nodeLabel) $("#b-node").textContent = nodeLabel;
}

/* ===== 窗口系统 ===== */
const activeWindows = [];
let zCounter = 500;
function openWindow(opt){
  return new Promise(resolve => {
    const el = document.createElement("div");
    el.className = "win-popup " + (opt.kind || "");
    zCounter++;
    const pos = computePosition(opt.pos, opt.widthHint || 700);
    el.style.left = pos.x + "px"; el.style.top = pos.y + "px"; el.style.zIndex = zCounter;
    const title = document.createElement("div");
    title.className = "wp-title";
    title.innerHTML = `<span class="wp-ico">${opt.icon||"▣"}</span><span class="wp-name">${opt.name||"WINDOW"}</span><span class="wp-controls"><span class="wp-btn" data-act="min">─</span><span class="wp-btn" data-act="max">□</span><span class="wp-btn" data-act="close">✕</span></span>`;
    el.appendChild(title);
    if (opt.kind === "danger"){ const s = document.createElement("div"); s.className = "wp-alert-strip"; el.appendChild(s); }
    const body = document.createElement("div"); body.className = "wp-body"; body.innerHTML = opt.content || ""; el.appendChild(body);
    const status = document.createElement("div"); status.className = "wp-status";
    status.innerHTML = `<span>${opt.status||"READY"}</span><span class="spacer"></span><span class="wp-clock">${nowStr()}</span>`;
    el.appendChild(status);
    introStage.appendChild(el); activeWindows.push(el);
    const clockEl = status.querySelector(".wp-clock");
    const clockTimer = setInterval(() => { if (clockEl) clockEl.textContent = nowStr(); }, 1000);
    title.querySelector('[data-act="close"]').addEventListener("click", () => closeSelf());
    requestAnimationFrame(() => el.classList.add("show"));
    if (typeof opt.onMount === "function") opt.onMount(el, body, status);
    let closed = false;
    function closeSelf(){
      if (closed) return; closed = true;
      clearInterval(clockTimer);
      el.classList.remove("show"); el.classList.add("closing");
      setTimeout(() => {
        el.remove();
        const i = activeWindows.indexOf(el);
        if (i >= 0) activeWindows.splice(i, 1);
        resolve();
      }, 200);
    }
    if (!opt.sticky && opt.duration != null) setTimeout(closeSelf, opt.duration * SCALE);
    el._close = closeSelf;
  });
}
function computePosition(pos, width){
  const W = innerWidth, H = innerHeight;
  const margin = 20, topbarH = 44, botbarH = 44;
  let x, y;
  if (pos && typeof pos === "object"){ x = pos.x; y = pos.y; }
  else if (pos === "center"){ x = W/2 - width/2; y = H/2 - 140; }
  else if (pos === "tr"){ x = W - width - margin; y = topbarH; }
  else if (pos === "tl"){ x = margin; y = topbarH; }
  else if (pos === "br"){ x = W - width - margin; y = H - botbarH - 320; }
  else if (pos === "l"){ x = margin + randOffset(20); y = H/2 - 180 + randOffset(50); }
  else {
    x = margin + Math.random() * Math.max(0, W - width - margin*2);
    y = topbarH + Math.random() * Math.max(0, H - topbarH - botbarH - 340);
  }
  x = Math.max(margin, Math.min(W - width - margin, x));
  y = Math.max(topbarH, Math.min(H - botbarH - 180, y));
  return { x, y };
}
function randOffset(m){ return Math.round((Math.random() - .5) * m); }
function nowStr(){
  const d = new Date();
  return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+":"+String(d.getSeconds()).padStart(2,"0");
}
function kvRows(pairs){
  return pairs.map(([k,v,c]) => `<div class="wp-row"><span class="k">${k}</span><span class="v ${c||""}">${v}</span></div>`).join("");
}
function miniLog(lines, cls = ""){
  return `<div class="wp-log ${cls}">${lines.map(l => `<div class="ll ${l.c||""}">${l.t||l}</div>`).join("")}</div>`;
}

/* ===== 主流程 ===== */
async function phaseBoot(){
  $("#b-stage").textContent = "BOOT";
  await type("[GCS] 地面站开机。", "sys");
  await type("[GCS] RTK 基站就绪，差分改正数据流正常。", "sys");
  await sleep(30);
  await type("[GCS] 气象台：风速 3.2 m/s，云底高 1200 m，适宜飞行。", "sys");
  await type("[GCS] 机库在位 47 架，电池 100%，桨叶检查完毕。", "sys");
  await type("[GCS] 数传 / 图传链路自检通过。", "sys");
  await type("[GCS] 电子围栏参数装载完毕。", "sys");
  await type("[GCS] 失联保护策略：RTL。", "sys");
  mainLine("");
  await type("[GCS] 等待操作员登录。", "warn");
  await sleep(80);
}

async function phaseAuth(){
  $("#b-stage").textContent = "AUTH";
  await type("> 操作员 LAB-01 登录，任务：47 机编队巡飞。", "cmd", 3);
  await sleep(60);
  openWindow({
    name:"FLIGHT AUTHORIZATION", icon:"▲", kind:"normal", pos:"tr", duration:1600, status:"AWAITING CONFIRM",
    content:`${kvRows([["OPERATOR","LAB-01","ok"],["LICENSE","CAAC · UTC-Ⅴ","ok"],["AIRSPACE","ACC-07 · 已批复","ok"],["MODE","SWARM · FORMATION","warn"],["SESSION","0x"+Math.random().toString(16).slice(2,8).toUpperCase()]])}<div class="wp-div"></div><div class="wp-note">本次任务将控制 47 架编队无人机进入 ACC-07 空域执行巡飞任务。</div><div class="wp-btns"><button class="wp-btn-b">DENY</button><button class="wp-btn-b primary">GRANT</button></div>`
  });
  await type("[GCS] 身份校验通过，空域批复有效。", "sys");
  await type("[GCS] 目标：47 机编队。", "sys");
  await type("[GCS] 任务下发开始。", "sys");
  mainLine("");
}

async function phaseLink(){
  $("#b-stage").textContent = "LINK";
  await type("[LINK] 数传链路：900 MHz，速率 230 kbps。", "inf");
  await type("[LINK] 图传链路：5.8 GHz，双天线分集。", "inf");
  await type("[LINK] RTK 差分：FIX 解，收敛 8.6 s。", "inf");
  await type("[LINK] 心跳周期：20 ms，丢包率 0.02%。", "inf");
  await type("[LINK] RSSI -67 dBm，链路质量良好。", "inf");
  mainLine("");
  openWindow({
    name:"LINK MONITOR", icon:"◇", kind:"info", pos:"tl", duration:1800, status:"TRACKING",
    content:`${kvRows([["LINK","900 MHz · 230 kbps","ok"],["VIDEO","5.8 GHz · DUAL","ok"],["RTK","FIX · 8.6 s","ok"],["RSSI","-67 dBm"],["RTT","38 ms"]])}<div class="wp-div"></div><div style="font-size:10px;letter-spacing:.2em;color:var(--text-faint);margin-bottom:6px;">RSSI TRACE</div><div class="wp-wave" id="linkWave"></div>`,
    onMount: (el, body) => {
      const wave = body.querySelector("#linkWave"); if (!wave) return;
      for (let i = 0; i < 48; i++) wave.appendChild(document.createElement("i"));
      const bars = wave.querySelectorAll("i");
      const t = setInterval(() => { if (!wave.isConnected){ clearInterval(t); return; } bars.forEach(b => b.style.height = (15 + Math.random()*85) + "%"); }, 90);
    }
  });
  await type("[LINK] 遥测链路抖动，检测到：", "inf");
  await type("    900 MHz 频段窄带干扰", "sub");
  await type("    遥测 RTT 升高 (210 ms)", "sub");
  await type("    图传马赛克增多", "sub");
  await type("    干扰源位置未知", "sub");
  mainLine("");
  openWindow({
    name:"SIGNAL INTERFERENCE", icon:"!", kind:"danger", pos:"l", duration:1900, status:"THREAT DETECTED",
    content:`${kvRows([["SOURCE","UNKNOWN","bad"],["RSSI","-71 → -94 dBm","bad"],["RTT","38 → 210 ms","bad"],["FHSS","STANDBY","warn"]])}<div class="wp-div"></div><div style="font-size:10px;letter-spacing:.2em;color:var(--text-faint);margin-bottom:6px;">TELEMETRY LOG</div>${miniLog([{t:"[09:12:41] rssi: -71 → -94 dBm"},{t:"[09:12:41] rtt: 38 → 210 ms",c:"warn"},{t:"[09:12:42] video: block rate 12%",c:"bad"},{t:"[09:12:42] fhss: hop 902.3 → 915.1 MHz",c:"hl"},{t:"[09:12:43] link: restored, rssi -69 dBm"}])}<div class="wp-note">考场周边电磁环境复杂，干扰源未知。建议立即切换跳频抗干扰。</div><div class="wp-btns"><button class="wp-btn-b primary">ACKNOWLEDGE</button></div>`
  });
  await type("[LINK] 判断：周边电磁环境复杂，干扰源未知。", "inf");
  await type("[LINK] 启用跳频抗干扰 (FHSS)。", "inf");
  await type("[LINK] 链路恢复正常，RSSI -69 dBm。", "ok");
  mainLine("");
}

async function phaseTunnel(){
  $("#b-stage").textContent = "PLAN";
  await type("[GCS] 编队航线装载：12 航点，巡航高度 120 m。", "sys");
  await type("[GCS] 航点间距 40 m，编队间距 15 m。", "sys");
  await type("[GCS] 巡航速度 18 m/s，爬升率 4 m/s。", "sys");
  await type("[GCS] 电子围栏半径 2.0 km，顶高 300 m。", "sys");
  mainLine("");
  await type("[GCS] 失联保护：RTL，返航点 = 起飞点。", "inf");
  await type("[GCS] 低电量返航阈值：24%。", "inf");
  await type("[GCS] 任务包生成完毕，开始上传。", "sys");
  await sleep(50);
  openWindow({
    name:"MISSION UPLOAD", icon:"▶", kind:"normal", pos:"br", sticky:true, status:"UPLOAD · ACTIVE",
    content:`${kvRows([["WAYPOINTS","12","ok"],["FORMATION","WEDGE · 47","warn"],["FENCE","2.0 km · ENABLED","ok"],["RTL","BATT 24%","ok"]])}<div class="wp-div"></div><div style="font-size:10px;letter-spacing:.2em;color:var(--text-faint);margin-bottom:6px;">UPLOAD PROGRESS</div><div class="wp-prog"><div class="f" id="injBar"></div></div><div style="font-size:12px;color:var(--text-dim);" id="injTxt">0%</div><div style="margin-top:10px;font-size:11.5px;color:var(--text-dim);">任务包写入 47 架无人机任务队列……</div>`,
    onMount: (el, body) => {
      const bar = body.querySelector("#injBar"); const txt = body.querySelector("#injTxt");
      let p = 0;
      const t = setInterval(() => {
        if (!bar || !bar.isConnected){ clearInterval(t); return; }
        p += Math.random() * 16; if (p >= 100){ p = 100; clearInterval(t); }
        bar.style.width = p + "%"; txt.textContent = Math.round(p) + "%";
      }, 130);
    }
  });
  await type("[GCS] 任务包写入 47 架无人机队列……", "inf");
  await type("[GCS] 上传完成，47 架全部确认。", "sys");
  mainLine("");
}

async function phaseIsolate(){
  $("#b-stage").textContent = "CHECKLIST";
  await type("[GCS] 起飞前检查单执行。", "sys");
  await type("[CHECK] GPS：18 颗星，HDOP 0.7。", "inf");
  await type("[CHECK] 磁罗盘偏差 1.2°，可接受。", "inf");
  $("#h-up").textContent = "ACTIVE";
  $("#b-net").textContent = "IN FENCE";
  await type("[CHECK] 气压计一致性通过。", "inf");
  await sleep(40);
  $("#h-ca").textContent = "PX4 · OK";
  $("#h-ca").classList.remove("warn"); $("#h-ca").classList.add("ok");
  await type("[CHECK] 固件哈希预校验通过。", "inf");
  mainLine("");
  await type("[GCS] 机队最低电压 23.9 V，高于返航阈值。", "sys");
  await type("[GCS] 载荷检查：云台 / 探照灯就绪。", "sys");
  await type("[GCS] 检查单完成，飞控待命。", "sys");
  mainLine("");
}

async function phaseRewrite(){
  $("#b-stage").textContent = "SELFCHECK";
  buildNodes();
  setCodeSpeed(20);
  openWindow({
    name:"FLEET SELFCHECK", icon:"◆", kind:"normal",
    pos:{x:Math.round(innerWidth*.05), y:Math.round(innerHeight*.14)},
    sticky:true, status:"SELFCHECK · 47 NODES",
    content:`${kvRows([["TARGET","FLEET-47"],["NODES","47","warn"],["STRATEGY","FULL DIAG + ONLINE"],["FAILSAFE","RTL · ENABLED","ok"],["AUTH","LAB-01","ok"]])}<div class="wp-div"></div><div class="wp-meter"><span class="big" id="ctrCount">00</span><span class="unit">/ 47 NODES</span></div><div class="wp-prog"><div class="f" id="ctrBar"></div></div>`,
    onMount: (el, body) => {
      el._updateCounter = (n) => {
        const c = body.querySelector("#ctrCount"); const b = body.querySelector("#ctrBar");
        if (c) c.textContent = String(n).padStart(2, "0");
        if (b) b.style.width = (n/47*100) + "%";
      };
    }
  });
  await type("[GCS] 开始逐节点自检。", "sys");
  mainLine("");
  let anomaly07 = false, anomaly23 = false;
  for (let i = 0; i < NODE_COUNT; i++){
    const id = String(i + 1).padStart(2, "0");
    setIcon(i, "writing", "CHECK", "#ff8a5c");
    setProgress(((i + 0.3) / NODE_COUNT) * 100, `${id} / ${NODE_COUNT}`);
    const cw = activeWindows.find(w => w.querySelector(".wp-name")?.textContent === "FLEET SELFCHECK");
    if (cw && cw._updateCounter) cw._updateCounter(i + 1);
    await sleep(8);
    if (i === 6 && !anomaly07){
      anomaly07 = true;
      setIcon(i, "writing", "CAL", "#d93a08");
      await type("[WARN] 节点 07 IMU 漂移超标 (0.82°/s)。", "warn");
      openWindow({
        name:"MAINTENANCE · UAV-07", icon:"⚠", kind:"danger",
        pos:{x:innerWidth-720, y:140}, duration:1400, status:"HANDLER ACTIVE",
        content:`${kvRows([["NODE","UAV-07","bad"],["FAULT","IMU DRIFT 0.82°/s","bad"],["LIMIT","0.50 °/s","warn"],["ACTION","ZERO-CAL · 12 s","warn"]])}<div class="wp-div"></div>${miniLog([{t:"[09:14:02] imu: drift 0.82 °/s (limit 0.50)",c:"warn"},{t:"[09:14:02] imu: zero-cal requested",c:"bad"},{t:"[09:14:14] imu: zero-cal done, drift 0.08 °/s",c:"hl"},{t:"[09:14:14] node: resume selfcheck"}])}<div class="wp-note">IMU 漂移超标。已原地零偏重校准（12 s），校准后恢复自检。</div>`
      });
      await type("[GCS] 重校准完成，节点 07 恢复自检。", "sys");
      await sleep(80);
    }
    if (i === 22 && !anomaly23){
      anomaly23 = true;
      setIcon(i, "writing", "SWAP", "#d93a08");
      await type("[WARN] 节点 23 电池电压偏低 (23.1 V)。", "warn");
      openWindow({
        name:"MAINTENANCE · UAV-23", icon:"⚠", kind:"danger",
        pos:{x:30, y:innerHeight-420}, duration:1400, status:"HANDLER ACTIVE",
        content:`${kvRows([["NODE","UAV-23","bad"],["FAULT","BATT LOW 23.1 V","bad"],["CHECK","CELL Δ 0.42 V","bad"],["ACTION","SWAP · RE-ONLINE","warn"]])}<div class="wp-div"></div>${miniLog([{t:"[09:14:41] batt: pack 23.1 V (min 23.9)",c:"warn"},{t:"[09:14:41] batt: cell delta 0.42 V",c:"bad"},{t:"[09:14:52] batt: swap done, 24.8 V",c:"hl"},{t:"[09:14:52] node: re-online"}])}<div class="wp-note">电池电压低于起飞标准。现场更换电池（24.8 V）后重新上线自检。</div>`
      });
      await type("[GCS] 更换电池完成，节点 23 重新上线。", "sys");
      await sleep(80);
    }
    setIcon(i, "done", "ONLINE", "#c9a227");
    setProgress(((i + 1) / NODE_COUNT) * 100, `${id} / ${NODE_COUNT}`);
    if ((i + 1) % 12 === 0) await type(`[GCS] 已完成 ${i + 1} / ${NODE_COUNT} 节点自检。`, "ok", 1);
    await sleep(10);
  }
  mainLine("");
  await type("[GCS] 全部节点自检完成。", "ok");
  await sleep(50);
  const cw = activeWindows.find(w => w.querySelector(".wp-name")?.textContent === "FLEET SELFCHECK");
  if (cw && cw._close) cw._close();
  openWindow({
    name:"SELFCHECK SUMMARY", icon:"✓", kind:"normal", pos:"center", duration:1500, status:"COMPLETE",
    content:`<div class="wp-meter"><span class="big">47</span><span class="unit">/ 47 NODES ONLINE</span></div><div class="wp-div"></div>${kvRows([["TOTAL","47","ok"],["ONLINE","47","ok"],["RECHECK","2","warn"],["ELAPSED","T-00:01:28"]])}<div class="wp-note">全部节点自检完成，机队进入起飞序列。</div><div class="wp-btns"><button class="wp-btn-b">VIEW LOG</button><button class="wp-btn-b primary">PROCEED</button></div>`
  });
}

async function phaseVerify(){
  $("#b-stage").textContent = "VERIFY";
  setCodeSpeed(40);
  await type("[GCS] 逐节点固件哈希复核。", "sys");
  await type("  HASH 3f9a…c210  ✔", "ok", 1);
  await type("  HASH 88be…41d7  ✔", "ok", 1);
  await type("  HASH 0c72…9af3  ✔", "ok", 1);
  await type("  HASH e5d1…77b0  ✔", "ok", 1);
  await type("  HASH a4c8…2d19  ✔", "ok", 1);
  await type("[GCS] 哈希匹配，固件一致。", "sys");
  mainLine("");
  await type("[GCS] 机队状态良好。", "sys");
}

async function phaseArm(){
  $("#b-stage").textContent = "LAUNCH";
  mainLine("");
  await type("[GCS] ⚠ 执行起飞程序。", "warn");
  await sleep(40);
  openWindow({
    name:"LAUNCH SEQUENCE", icon:"⏻", kind:"danger", pos:"center", duration:1700, status:"CONFIRMATION REQUIRED",
    content:`<div class="wp-meter"><span class="big" style="color:var(--red-b)">47</span><span class="unit">MOTORS WILL BE ARMED</span></div><div class="wp-div"></div>${kvRows([["COMMAND","MAV_CMD_ARM_DISARM (400)"],["PARAM1","1 · ARM","warn"],["PARAM2","0 · NORMAL"],["TARGET","ALL NODES · 47","warn"]])}<div class="wp-note">起飞程序将解锁全部 47 架无人机电机并进入编队爬升。请确认桨区净空。</div><div class="wp-btns"><button class="wp-btn-b">ABORT</button><button class="wp-btn-b primary">CONFIRM</button></div>`
  });
  await type("[GCS] 下发 MAV_CMD_COMPONENT_ARM_DISARM (400) 至全部节点。", "warn");
  await type("[GCS] 参数：param1=1 (ARM), param2=0 (Normal)。", "warn");
  await sleep(60);
  await type("[GCS] 等待 COMMAND_ACK 确认……", "warn");
  await sleep(80);
  await type("[GCS] 节点 01-47：COMMAND_ACK.result = MAV_RESULT_ACCEPTED。", "ok");
  await type("[GCS] 全部电机怠速确认。", "ok");
  await type("[GCS] 油门响应正常，起飞许可下发。", "ok");
  await type("[GCS] 编队进入爬升序列。", "ok");
  mainLine("");
  await type("[GCS] 地面站日志写入完成。", "sys");
  await type("[GCS] 操作员：LAB-01。", "sys");
  await type("[GCS] 授权：值班教员。", "sys");
  await type("[GCS] 结果：起飞成功。", "sys");
  mainLine("");
}

async function phaseFinish(){
  stopCode(); stopLink();
  setProgress(100, "47 / 47");
  $("#b-stage").textContent = "COMPLETE";
  $("#h-up").textContent = "AIRBORNE";
  $("#h-up").classList.remove("warn"); $("#h-up").classList.add("ok");
  $("#b-net").textContent = "AIRBORNE";
  await type("[GCS] 任务状态更新。", "sys", 4);
  await sleep(80);
  for (let i = 3; i >= 0; i--){ mainLine(`[T-00:00:0${i}]`, "t"); await sleep(160); }
  activeWindows.forEach(w => { if (w._close) w._close(); });
  await sleep(200);
  $("#final").classList.add("show");
  /* 结尾标语停留：基准 700 + 额外固定 0.5s（额外量除以 SCALE 换算，不受节奏系数影响） */
  await sleep(700 + 500 / SCALE);
  $("#hint").classList.add("show");
}

async function run(){
  const sid = "0x" + Math.random().toString(16).slice(2,10).toUpperCase();
  $("#h-session").textContent = sid;
  setProgress(0, "00 / 47");
  startClock(); startFps(); startLink(); startCode(45); buildNodes();
  await phaseBoot();
  await phaseAuth();
  await phaseLink();
  await phaseTunnel();
  await phaseIsolate();
  await phaseRewrite();
  await phaseVerify();
  await phaseArm();
  await phaseFinish();
}
  } catch (e) {
    fatal();
  }
})();
