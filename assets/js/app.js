/* ============================================================
   CUAL / FLIGHT LOG — interaction layer
   no dependencies
   ============================================================ */
(function () {
  'use strict';

  const C = window.CUAL_CONFIG || {};
  const M = window.CUAL_MEMBERS || { people: [], founders: [], departments: [], projectMeta: {} };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = (n, l) => String(n).padStart(l, '0');

  /* 移动端性能闸门（2026-10-19）：
     手机/窄屏上把 requestAnimationFrame 动画统一压到 ~30fps（所有动画
     都用时间戳驱动，时长不变，只是帧率减半），GPU/CPU 开销明显下降。 */
  const MOBILE = matchMedia('(max-width: 820px)').matches ||
    (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches);
  window.__cualMobile = MOBILE;
  if (MOBILE && !window.__cualRafThrottled) {
    window.__cualRafThrottled = true;
    const nativeRAF = window.requestAnimationFrame.bind(window);
    const queue = [];
    let running = false, last = 0;
    const pump = (now) => {
      running = false;
      if (now - last < 30) { running = true; nativeRAF(pump); return; }
      last = now;
      const batch = queue.splice(0, queue.length);
      for (let i = 0; i < batch.length; i++) {
        try { batch[i](now); } catch (e) { console.error(e); }
      }
      if (queue.length) { running = true; nativeRAF(pump); }
    };
    window.requestAnimationFrame = (cb) => {
      queue.push(cb);
      if (!running) { running = true; nativeRAF(pump); }
      return queue.length;
    };
  }

  /* ------------------------------------------------------------------
     sections
  ------------------------------------------------------------------ */
  const NAV = [
    { id: 'facts', label: '概况', num: '01' },
    { id: 'projects', label: '项目', num: '02' },
    { id: 'story', label: '历程', num: '03' },
    { id: 'record', label: '战绩', num: '04' },
    { id: 'crew', label: '成员', num: '05' },
    { id: 'frames', label: '影像', num: '06' },
    { id: 'join', label: '加入', num: '07' },
    { id: 'contact', label: '联系', num: '08' }
  ];
  const SECTIONS = ['home'].concat(NAV.map(n => n.id))
    .map(id => document.getElementById(id)).filter(Boolean);

  /* ------------------------------------------------------------------
     static text
  ------------------------------------------------------------------ */
  const headlineProject = (title) => {
    const m = String(title).match(/^(CADC|CUADC)\s*[—\-–]?\s*(.+)$/);
    if (m) return { group: m[1], name: m[2].trim() };
    const parts = String(title).split('—');
    return { group: (parts[0] || 'CUAL').trim(), name: (parts[1] || title).trim() };
  };

  /* ------------------------------------------------------------------
     nav / ticker / hero
  ------------------------------------------------------------------ */
  function renderNav() {
    $('#barNav').innerHTML = NAV.slice(0, 7).map(n =>
      `<a href="#${n.id}" data-nav="${n.id}"><em>${n.num}</em>${n.label}</a>`
    ).join('');
    $('#footNav').innerHTML = NAV.map(n => `<a href="#${n.id}">${n.label}</a>`).join('')
      + `<a href="#frames">影像集</a>`;
    const EN = { home: 'COVER', facts: 'FACTS', projects: 'MISSIONS', story: 'LOGBOOK', record: 'RECORD', crew: 'CREW', frames: 'FRAMES', join: 'JOIN', contact: 'CONTACT' };
    const list = $('#menuList');
    if (list) list.innerHTML = `<a href="#home" data-menu="home"><em>00</em><span>首屏</span><i>COVER</i></a>` + NAV.map(n =>
      `<a href="#${n.id}" data-menu="${n.id}"><em>${n.num}</em><span>${n.label}</span><i>${EN[n.id] || ''}</i></a>`
    ).join('');
  }

  function renderHero() {
    const home = C.home || {};
    $('#heroLede').innerHTML =
      `以创新为翼，以蓝天为梦。实验室 <b>2023</b> 年从「无人之翼」社团起步，<b>2024</b> 年正式组建；` +
      `目前 <b>34</b> 架自制飞行器、<b>26</b> 项国家级奖项，` +
      `在 CADC 与 CUADC 的赛场上持续飞行。`;

    const projects = home.projects || [];
    $('#missionList').innerHTML = projects.map((p, i) => {
      const t = headlineProject(p.title);
      return `<li><span class="mi">M${pad(i + 1, 2)}</span><span class="mt">${t.name}</span><span class="my">${t.group}</span></li>`;
    }).join('');

    const items = [
      '2026 CADC 微型折叠飞行器 2×一等奖',
      '2026 CADC 模拟搜救 团体二等奖',
      '2026 CUADC 三项全能 国赛二等奖 / 三等奖',
      '2025 CUADC 精准打击 国赛一等奖',
      '26 项国家级奖项',
      '34 架自制飞行器',
      'CADC · CUADC',
      'EST. 2023 / TIANJIN'
    ].map(t => `<span>${t}</span>`).join('');
    $('#tickerTrack').innerHTML = items + items;
  }

  /* ------------------------------------------------------------------
     facts
  ------------------------------------------------------------------ */
  function renderFacts() {
    const home = C.home || {};
    const stats = home.stats || [];
    $('#stats').innerHTML = stats.map((s, i) => {
      const raw = String(s.number);
      const m = raw.match(/^([\d.]+)(.*)$/) || [raw, raw, ''];
      return `<div class="stat rv">
        <span class="sl">${pad(i + 1, 2)} / ${s.label}</span>
        <div class="sn"><b data-count="${m[1]}">0</b>${m[2] ? `<small>${m[2]}</small>` : ''}</div>
      </div>`;
    }).join('');

    const about = C.about || {};
    const intro = about.intro || [];
    const lead = intro[0] || '';
    const rest = intro.slice(1);
    $('#about').innerHTML = `
      <div class="about-lead rv">${hlNumbers(lead)}</div>
      <div class="about-body rv">${rest.map(p => `<p>${hlNumbers(p)}</p>`).join('')}</div>`;

    const mv = [about.mission, about.vision].filter(Boolean);
    $('#mv').innerHTML = mv.map((m, i) => `
      <div class="mv-item rv">
        <h3><span>${i === 0 ? '使命' : '愿景'}</span>${i === 0 ? 'MISSION' : 'VISION'}</h3>
        <p>${m.text}</p>
      </div>`).join('');
  }

  function hlNumbers(html) {
    return String(html).replace(/(\d+)\s*(项|架|座|年)/g, '<span class="hl">$1 $2</span>');
  }

  /* ------------------------------------------------------------------
     projects
  ------------------------------------------------------------------ */
  const PROJ_IMAGES = [
    'assets/images/项目/proj-1.jpg',
    'assets/images/项目/proj-2.jpg',
    'assets/images/项目/proj-3.jpg',
    'assets/images/项目/proj-4.jpg'
  ];

  function renderProjects() {
    const list = (C.projects && C.projects.projects) || [];
    $('#projList').innerHTML = list.map((p, i) => {
      const t = headlineProject(p.title);
      const result = (p.result || '').replace(/^[^：]*：/, '');
      return `<article class="proj rv${i === 0 ? ' open' : ''}">
        <button class="proj-head" type="button" aria-expanded="${i === 0}">
          <span class="proj-idx">${pad(i + 1, 2)}</span>
          <h3>${t.name}</h3>
          <span class="proj-code">${t.group}</span>
          <span class="proj-result">${result}</span>
          <span class="proj-plus" aria-hidden="true"></span>
        </button>
        <div class="proj-body">
          <div class="proj-inner">
            <div>
              <p class="proj-desc">${p.description}</p>
              <div class="proj-meta">
                <span>PLATFORM <b>${t.group}</b></span>
                <span>STATUS <b>ACTIVE</b></span>
                <span>RESULT <b>${result}</b></span>
              </div>
            </div>
            <figure class="proj-figure" data-tag="AIRFRAME / ${pad(i + 1, 2)}">
              <img src="${PROJ_IMAGES[i % PROJ_IMAGES.length]}" alt="CUAL ${t.name} 项目飞行器" loading="lazy" decoding="async">
            </figure>
          </div>
        </div>
      </article>`;
    }).join('');

    const future = (C.projects && C.projects.future) || [];
    $('#future').innerHTML = future.map((f, i) => `
      <article class="rv">
        <span class="fi">N${pad(i + 1, 2)} / NEXT</span>
        <h4>${f.title}</h4>
        <p>${f.description}</p>
      </article>`).join('');
  }

  /* ------------------------------------------------------------------
     story
  ------------------------------------------------------------------ */
  function renderStory() {
    const hist = (C.about && C.about.history) || [];
    $('#timeline').innerHTML = hist.map((h, i) => `
      <li class="tl-item rv" data-year="${h.year}">
        <div class="tl-year">${h.year}</div>
        <div class="tl-body">
          <h3>${h.title}</h3>
          <ul>${(h.items || []).map(it => `<li>${it}</li>`).join('')}</ul>
        </div>
      </li>`).join('');
    $('#storyGhost').textContent = hist.length ? hist[0].year : '';
  }

  /* ------------------------------------------------------------------
     record
  ------------------------------------------------------------------ */
  function renderRecord() {
    const A = (C.achievements) || {};
    const stats = A.stats || [];
    $('#awardBig').textContent = stats[0] ? stats[0].number : '26';
    $('#recordMini').innerHTML = stats.slice(1).map(s =>
      `<div><b>${s.number}</b><span>${s.label}</span></div>`).join('');

    const years = (A.timeline || []).map(y => y.year);
    $('#yearFilter').innerHTML = `<button class="chip" type="button" data-year="all" aria-pressed="true">全部</button>` +
      years.map(y => `<button class="chip" type="button" data-year="${y}" aria-pressed="false">${y}</button>`).join('');

    $('#log').innerHTML = (A.timeline || []).map(group => {
      let count = 0;
      const comps = (group.competitions || []).map((c, ci) => {
        count += (c.awards || []).length;
        return `<div class="competition">
          <p class="comp-name"><i>${pad(ci + 1, 2)}</i>${c.name}</p>
          ${(c.awards || []).map(a => `<div class="award">
            <span class="ap">${a.project}</span>
            <span class="ad">${a.detail}</span>
            <span class="am">${a.members || '—'}</span>
          </div>`).join('')}
        </div>`;
      }).join('');
      return `<div class="log-year" data-year="${group.year}">
        <div class="ly-label"><b>${group.year}</b><span>${count} ENTRIES</span></div>
        <div class="ly-body">${comps}</div>
      </div>`;
    }).join('');
  }

  /* ------------------------------------------------------------------
     crew
  ------------------------------------------------------------------ */
  let crewFilter = { project: 'all', dept: 'all', year: 'all' };

  function personProjects(p) {
    return (p.projects || []).map(x => x.project);
  }
  function personDepts(p) {
    const set = new Set();
    (p.projects || []).forEach(x => (x.departments || []).forEach(d => set.add(d)));
    return Array.from(set);
  }

  function renderCrew() {
    const adv = C.advisor || {};
    $('#advisor').innerHTML = `<div class="adv-avatar rv">${adv.avatar || '杨'}</div>
      <div class="adv-name rv">
        <h3>${adv.name}</h3>
        <span class="role">${adv.title}</span>
        <p class="dept">${adv.department} · ${adv.email}${adv.phone ? ' · ' + adv.phone : ''}</p>
      </div>
      <div class="adv-body rv">
        <p>${adv.background}</p>
        <div class="ah-label">研究方向<em>RESEARCH</em></div>
        <div class="adv-tags">${(adv.research || '').split('·').map(t => `<span>${t.trim()}</span>`).join('')}</div>
      </div>
      ${(adv.achievements || []).length ? `<div class="adv-ach rv">
        <div class="ah-label">主要成果<em>ACHIEVEMENTS</em></div>
        <ul>${adv.achievements.map(x => `<li>${x}</li>`).join('')}</ul>
      </div>` : ''}`;

    const depts = M.departments || [];
    $('#projFilter').innerHTML = `<button class="chip" type="button" data-project="all" aria-pressed="true">全部</button>` +
      Object.keys(M.projectMeta || {}).map(k => `<button class="chip" type="button" data-project="${k}" aria-pressed="false">${k}</button>`).join('');
    $('#deptFilter').innerHTML = `<button class="chip" type="button" data-dept="all" aria-pressed="true">全部</button>` +
      depts.map(d => `<button class="chip" type="button" data-dept="${d}" aria-pressed="false">${d}</button>`).join('');

    const years = Array.from(new Set((M.people || []).flatMap(p => (p.projects || []).map(x => x.cohort)).filter(Boolean))).sort().reverse();
    $('#cohortFilter').innerHTML = `<button class="chip" type="button" data-year="all" aria-pressed="true">全部</button>` +
      years.map(y => `<button class="chip" type="button" data-year="${y}" aria-pressed="false">${y} 届</button>`).join('');
    const nMembers = (M.people || []).length, nFounders = (M.founders || []).length;
    if ($('#tabCountMembers')) $('#tabCountMembers').textContent = nMembers;
    if ($('#tabCountFounders')) $('#tabCountFounders').textContent = nFounders;

    const people = (M.people || []).slice().sort((a, b) => String(a.name).localeCompare(String(b.name), 'zh-Hans-CN'));
    $('#crewGrid').innerHTML = people.map((p, i) => {
      const projs = personProjects(p);
      const ds = personDepts(p);
      const leader = (p.projects || []).some(x => x.leader);
      const cohorts = Array.from(new Set((p.projects || []).map(x => x.cohort))).sort();
      return `<article class="crew-card" data-projects="${projs.join('|')}" data-depts="${ds.join('|')}" data-cohorts="${cohorts.join('|')}">
        <span class="cn-idx">${pad(i + 1, 2)}</span>
        <div class="cn-name">${p.name}${leader ? '<span class="leader" title="项目负责人"></span>' : ''}</div>
        <div class="cn-meta"><b>${projs.join(' / ')}</b><br>${cohorts.join(' / ')} 届</div>
        <div class="cn-tags">${ds.map(d => `<span>${d}</span>`).join('')}</div>
      </article>`;
    }).join('');

    $('#founders').innerHTML = (M.founders || []).map(f =>
      `<div class="fd"><b>${f.name}</b><span>${f.role} / 2023</span></div>`).join('');

    applyCrewFilter();
  }

  function applyCrewFilter() {
    let n = 0;
    $$('#crewGrid .crew-card').forEach(card => {
      const projs = (card.dataset.projects || '').split('|');
      const depts = (card.dataset.depts || '').split('|');
      const cohorts = (card.dataset.cohorts || '').split('|');
      const okP = crewFilter.project === 'all' || projs.includes(crewFilter.project);
      const okD = crewFilter.dept === 'all' || depts.includes(crewFilter.dept);
      const okY = crewFilter.year === 'all' || cohorts.includes(crewFilter.year);
      const show = okP && okD && okY;
      card.classList.toggle('hide', !show);
      if (show) n++;
    });
    $('#crewCount').textContent = n;

    // 移动端抽拉：同步分组计数、隐藏空组、筛选时自动展开
    const grid = $('#crewGrid');
    if (grid && grid.dataset.grouped === '1') {
      const active = crewFilter.project !== 'all' || crewFilter.dept !== 'all' || crewFilter.year !== 'all';
      $$('#crewGrid .crew-acc').forEach(g => {
        const shown = $$('.crew-card', g).filter(c => !c.classList.contains('hide')).length;
        const nEl = g.querySelector('.cg-n');
        if (nEl) nEl.textContent = shown + ' 人';
        g.classList.toggle('hide', shown === 0);
        if (active && shown > 0) g.classList.add('open');
        const btn = g.querySelector('.cg-h');
        if (btn) btn.setAttribute('aria-expanded', g.classList.contains('open') ? 'true' : 'false');
      });
    }
  }

  /* ------------------------------------------------------------------
     mobile: 战绩 / 成员 抽拉（仅 <=820px）
  ------------------------------------------------------------------ */
  function initMobileCollapse() {
    if (!window.matchMedia('(max-width: 820px)').matches) return;
    document.documentElement.classList.add('acc-mode');

    // 战绩：每年的 ly-label 变成开关
    $$('#log .log-year').forEach((y, i) => {
      const label = y.querySelector('.ly-label');
      if (!label || label.dataset.acc === '1') return;
      label.dataset.acc = '1';
      label.classList.add('acc-h');
      label.setAttribute('role', 'button');
      label.setAttribute('tabindex', '0');
      const setOpen = (open) => {
        y.classList.toggle('open', open);
        label.setAttribute('aria-expanded', String(open));
      };
      setOpen(i === 0);           // 默认只展开最近一年
      const flip = () => setOpen(!y.classList.contains('open'));
      label.addEventListener('click', flip);
      label.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
      });
    });

    // 成员：按主项目分组，每组一个抽拉面板
    const grid = $('#crewGrid');
    if (grid && grid.dataset.grouped !== '1') {
      grid.dataset.grouped = '1';
      const order = Object.keys(M.projectMeta || {});
      const buckets = new Map();
      $$('#crewGrid .crew-card').forEach(card => {
        const projs = (card.dataset.projects || '').split('|').filter(Boolean);
        const key = projs[0] || '其他';
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(card);
      });
      const keys = Array.from(buckets.keys()).sort((a, b) => {
        const ia = order.indexOf(a), ib = order.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
      const frag = document.createDocumentFragment();
      keys.forEach(k => {
        const wrap = document.createElement('section');
        wrap.className = 'crew-acc';
        wrap.dataset.group = k;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'acc-h cg-h';
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<span class="cg-name">' + k + '</span><span class="cg-n">' + buckets.get(k).length + ' 人</span>';

        const body = document.createElement('div');
        body.className = 'cg-b';
        buckets.get(k).forEach(card => body.appendChild(card));

        btn.addEventListener('click', () => {
          const open = !wrap.classList.contains('open');
          wrap.classList.toggle('open', open);
          btn.setAttribute('aria-expanded', String(open));
        });

        wrap.appendChild(btn);
        wrap.appendChild(body);
        frag.appendChild(wrap);
      });
      grid.textContent = '';
      grid.appendChild(frag);
    }
  }

  /* ------------------------------------------------------------------
     frames
  ------------------------------------------------------------------ */
  const RAILS = (function () {
    const host = $('#rails');
    const cats = window.CUAL_PHOTOS || [];
    if (!host) return [];
    const cycle = ['wide', '', 'tall', '', '', 'wide', '', 'tall', '', ''];
    host.innerHTML = cats.map(cat => `
      <div class="frame-group">
        <div class="frame-group-head"><h3>${cat.cn}</h3><span>${cat.en} · ${pad(cat.items.length, 2)}</span></div>
        <div class="rail${cat.id === 'daily' ? ' masonry' : ''}" id="rail-${cat.id}" data-cat="${cat.id}"></div>
      </div>`).join('');
    return cats.map(cat => ({
      el: '#rail-' + cat.id,
      layout: cat.items.map((_, i) => cycle[i % cycle.length]),
      items: cat.items
    }));
  })();
  let galleryItems = [];

  function renderFrames() {
    RAILS.forEach(rail => {
      const host = $(rail.el);
      host.innerHTML = rail.items.map(([src, cap], i) =>
        `<figure class="${rail.layout[i] || ''}" data-src="${src}" data-cap="${cap}">
          <img src="${src}" alt="${cap}" loading="lazy" decoding="async">
          <span class="idx">${pad(i + 1, 2)}</span>
          <figcaption>${cap}</figcaption>
        </figure>`).join('');
      host.dataset.items = JSON.stringify(rail.items);
    });

    galleryItems = $$('.rail figure').map(f => ({ src: f.dataset.src, cap: f.dataset.cap }));
  }

  /* ------------------------------------------------------------------
     join / contact / footer
  ------------------------------------------------------------------ */
  function renderJoin() {
    const R = C.recruit || {};
    $('#joinIntro').innerHTML = (R.intro || []).map(p => `<p>${p}</p>`).join('')
      + `<p class="targets">${R.targets || ''}</p>`;

    $('#joinStats').innerHTML = (R.highlights || []).map(h =>
      `<div><b>${h.number}</b><span>${h.label}</span></div>`).join('');

    $('#directions').innerHTML = (R.directions || []).map((d, i) => `
      <article class="dir-row rv">
        <span class="dir-idx">${pad(i + 1, 2)}</span>
        <h3>${d.title}</h3>
        <p>${d.desc}</p>
        <div class="dir-tags">${(d.tags || '').split(',').map(t => `<span>${t.trim()}</span>`).join('')}</div>
      </article>`).join('');

    $('#process').innerHTML = (R.timeline || []).map(t => `
      <li><span class="st">${t.step}</span><div class="pt"><b>${t.time}</b><span>${t.desc}</span></div></li>`).join('');

    $('#why').innerHTML = (R.why || []).map(w => `
      <li><div><b>${w.title}</b><span>${w.desc}</span></div></li>`).join('');

    $('#faq').innerHTML = (R.faq || []).map((f, i) => `
      <div class="faq-item">
        <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-${i}">
          <span>${f.q}</span><span class="fq-plus" aria-hidden="true"></span>
        </button>
        <div class="faq-a" id="faq-a-${i}"><div><p>${f.a}</p></div></div>
      </div>`).join('');

    const qr = (R.apply && R.apply.qr) || 'assets/images/通用/2026新生群.jpg';
    $('#qrImg').src = qr;

    const Ct = C.contact || {};
    $('#mailLink').textContent = Ct.email || '';
    $('#mailLink').href = 'mailto:' + (Ct.email || '');
    $('#contactRows').innerHTML = `
      <div><dt>地址</dt><dd>${Ct.address || ''}</dd></div>
      <div><dt>学院</dt><dd>${Ct.department || ''}</dd></div>
      <div><dt>咨询</dt><dd>${Ct.consultation || ''}</dd></div>
      <div><dt>社团</dt><dd>${Ct.club || ''}</dd></div>
      <div><dt>地图</dt><dd>${(Ct.map && Ct.map.title) || ''} · ${(Ct.map && Ct.map.subtitle) || ''}</dd></div>`;

    $('#sponsorList').innerHTML = ((C.sponsors && C.sponsors.items) || []).map(s => {
      const inv = /CADDX|CUAV/i.test(s.name) ? ' class="inv"' : '';
      const img = `<img${inv} src="${s.logo}" alt="${s.name}" loading="lazy" decoding="async">`;
      return s.link
        ? `<a href="${s.link}" target="_blank" rel="noopener" aria-label="${s.name}">${img}</a>`
        : `<span class="sp" aria-label="${s.name}">${img}</span>`;
    }).join('');
    $('#copyright').textContent = (C.site && C.site.footer) || '© 2026 CUAL';
  }

  /* ------------------------------------------------------------------
     motion helpers
  ------------------------------------------------------------------ */
  function initReveal() {
    if (reduce) { $$('.rv').forEach(el => el.classList.add('in')); return; }
    $$('.rv').forEach(el => {
      const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(x => x.classList.contains('rv')) : [];
      const idx = Math.max(0, siblings.indexOf(el));
      el.style.transitionDelay = Math.min(idx * 60, 300) + 'ms';
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.rv').forEach(el => io.observe(el));
  }

  function initCounters() {
    const nums = $$('[data-count]');
    if (!nums.length) return;
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      if (reduce) { el.textContent = String(target); return; }
      const dur = 1300, t0 = performance.now();
      const tick = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = String(Math.round(target * e));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = String(target);
      };
      requestAnimationFrame(tick);
    };
    if (reduce) { nums.forEach(run); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach(en => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    nums.forEach(n => io.observe(n));
  }

  function initAccordions() {
    $$('.proj-head').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.proj');
        const open = !item.classList.contains('open');
        $$('.proj').forEach(p => {
          p.classList.remove('open');
          const b = $('.proj-head', p);
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (open) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });

    $$('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const open = !item.classList.contains('open');
        item.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
    });
  }

  function initFilters() {
    $('#yearFilter').addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      $$('#yearFilter .chip').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      const y = b.dataset.year;
      $$('.log-year').forEach(g => {
        g.classList.toggle('hide', y !== 'all' && g.dataset.year !== y);
        if (document.documentElement.classList.contains('acc-mode') && y !== 'all' && g.dataset.year === y) {
          g.classList.add('open');
          const l = g.querySelector('.ly-label');
          if (l) l.setAttribute('aria-expanded', 'true');
        }
      });
    });

    $('#projFilter').addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      $$('#projFilter .chip').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      crewFilter.project = b.dataset.project;
      applyCrewFilter();
    });
    $('#deptFilter').addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      $$('#deptFilter .chip').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      crewFilter.dept = b.dataset.dept;
      applyCrewFilter();
    });
    $('#cohortFilter').addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      $$('#cohortFilter .chip').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      crewFilter.year = b.dataset.year;
      applyCrewFilter();
    });
    $('#crewTabs').addEventListener('click', (e) => {
      const t = e.target.closest('.tab');
      if (!t) return;
      $$('#crewTabs .tab').forEach(x => x.setAttribute('aria-selected', x === t ? 'true' : 'false'));
      $('#crew').classList.toggle('view-founders', t.dataset.view === 'founders');
    });
  }

  /* ------------------------------------------------------------------
     影像 · 日常：瀑布流（按图片比例算 grid 行跨度）
  ------------------------------------------------------------------ */
  function initMasonry() {
    const rail = $('.rail.masonry');
    if (!rail) return;
    const GAP = 12, UNIT = 8, PITCH = UNIT + GAP;
    const SPEED = 68;   // px/s（手机端再折减）

    if (!rail._masonry) {
      const inner = document.createElement('div');
      inner.className = 'masonry-inner';
      const track = document.createElement('div');
      track.className = 'masonry-track';
      $$('figure', rail).forEach(f => track.appendChild(f));
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      inner.appendChild(track);
      inner.appendChild(clone);
      rail.innerHTML = '';
      rail.appendChild(inner);
      rail._masonry = { inner: inner, tracks: [track, clone] };
    }

    const inner = rail._masonry.inner;
    const tracks = rail._masonry.tracks;

    const layout = () => {
      const figs = $$('figure', tracks[0]);
      if (!figs.length) return;
      const colW = figs[0].getBoundingClientRect().width;
      if (!colW) return;
      tracks.forEach(track => {
        $$('figure', track).forEach(f => {
          const img = $('img', f);
          const ratio = (img && img.naturalWidth && img.naturalHeight)
            ? img.naturalHeight / img.naturalWidth : 0.75;
          const h = Math.max(90, Math.round(colW * ratio));
          f.style.height = h + 'px';
          f.style.gridRowEnd = 'span ' + Math.ceil((h + GAP) / PITCH);
        });
      });
      rail._masonry.loopH = tracks[0].offsetHeight + GAP;
    };

    layout();
    $$('img', rail).forEach(img => {
      if (img.complete && img.naturalWidth) return;
      img.addEventListener('load', layout, { once: true });
    });
    let rt = 0;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(layout, 160);
    });

    // 缓滚：内容向上走，到一轮高度后无缝回到起点
    let y = 0, hover = false, dragging = false, visible = false, last = performance.now();
    const slow = window.__cualMobile === true ? 0.7 : 1;
    rail.addEventListener('pointerenter', () => { hover = true; });
    rail.addEventListener('pointerleave', () => { hover = false; });
    rail.addEventListener('pointerdown', () => { dragging = true; });
    window.addEventListener('pointerup', () => { dragging = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(rail);
    } else {
      visible = true;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 鼠标拖动：按住上下拖，松手继续自走
    let dragState = null;
    let dragMoved = 0, downFig = null, tapDone = false;
    rail.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      dragState = { startY: e.clientY, startX: e.clientX, base: y };
      dragMoved = 0;
      downFig = e.target.closest('figure');
      dragging = true;
      rail.classList.add('dragging');
      try { rail.setPointerCapture(e.pointerId); } catch (err) {}
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragState) return;
      const loopH = rail._masonry.loopH || 0;
      const dy = e.clientY - dragState.startY;
      dragMoved = Math.max(dragMoved, Math.abs(dy), Math.abs(e.clientX - dragState.startX));
      let ny = dragState.base + dy;
      if (loopH > 0) {
        while (ny > 0) ny -= loopH;
        while (ny <= -loopH) ny += loopH;
      }
      y = ny;
      inner.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
    });
    const endDrag = (isTap) => {
      if (!dragState) return;
      const fig = downFig;
      const tapped = isTap && dragMoved <= 6 && !!fig;
      dragState = null;
      dragging = false;
      dragMoved = 0;
      downFig = null;
      rail.classList.remove('dragging');
      if (tapped) {          // 触屏没有可靠的 click，点按在这里直接开灯箱
        tapDone = true;
        const idx = galleryItems.findIndex(g => g.src === fig.dataset.src);
        openLightbox(idx < 0 ? 0 : idx);
      }
    };
    window.addEventListener('pointerup', () => endDrag(true));
    window.addEventListener('pointercancel', () => endDrag(false));

    // 点击放大：按下后拖动过就不算点击
    rail.addEventListener('click', (e) => {
      if (tapDone) { tapDone = false; e.preventDefault(); e.stopPropagation(); return; }
      if (dragMoved > 6) { e.preventDefault(); e.stopPropagation(); dragMoved = 0; return; }
      const fig = e.target.closest('figure') || downFig;
      dragMoved = 0;
      if (!fig) return;
      const idx = galleryItems.findIndex(g => g.src === fig.dataset.src);
      openLightbox(idx < 0 ? 0 : idx);
    });
    rail.addEventListener('dragstart', e => e.preventDefault());

    const tick = (now) => {
      const dt = Math.min(80, now - last);
      last = now;
      const loopH = rail._masonry.loopH || 0;
      if (!reduce && loopH > 0 && visible && !document.hidden && !hover && !dragging) {
        y -= (SPEED * slow * dt) / 1000;
        if (y <= -loopH) y += loopH;
        inner.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      } else if (reduce) {
        inner.style.transform = 'translate3d(0,0,0)';
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------
     rails + lightbox
  ------------------------------------------------------------------ */
  function initRails() {
    $$('.rail').forEach(rail => {
      let down = false, startX = 0, startL = 0, moved = 0, downFig = null;
      rail.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        if (rail.classList.contains('masonry')) return;   // 日常栏是纵向拖动，交给 initMasonry
        down = true; moved = 0;
        downFig = e.target.closest('figure');
        startX = e.clientX; startL = rail.scrollLeft;
        rail.classList.add('dragging');
        rail.setPointerCapture(e.pointerId);
      });
      rail.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dx = e.clientX - startX;
        moved = Math.max(moved, Math.abs(dx));
        rail.scrollLeft = startL - dx;
      });
      const end = (e) => {
        if (!down) return;
        down = false;
        rail.classList.remove('dragging');
        try { rail.releasePointerCapture(e.pointerId); } catch (err) {}
      };
      rail.addEventListener('pointerup', end);
      rail.addEventListener('pointercancel', end);
      rail.addEventListener('click', (e) => {
        if (rail.classList.contains('masonry')) return;   // 纵向拖动后不误开灯箱
        if (moved > 6) { e.preventDefault(); e.stopPropagation(); return; }
        const fig = e.target.closest('figure') || downFig;
        if (!fig) return;
        const idx = galleryItems.findIndex(g => g.src === fig.dataset.src);
        openLightbox(idx < 0 ? 0 : idx);
      });
      rail.addEventListener('dragstart', e => e.preventDefault());
    });
  }

  function initRailAutoScroll() {
    if (!('IntersectionObserver' in window)) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const slow = window.__cualMobile === true ? 0.9 : 1;   // 移动端也接近全速
    $$('.rail').forEach(rail => {
      const n = rail.querySelectorAll('figure').length;
      if (n < 2) return;
      const speed = (n > 20 ? 40 : n > 10 ? 46 : 54) * slow;   // px/s
      let visible = false, hover = false, dragging = false;
      let dir = 1, acc = 0, last = performance.now();
      new IntersectionObserver(es => {
        es.forEach(e => { visible = e.isIntersecting; });
      }, { rootMargin: '160px' }).observe(rail);
      rail.addEventListener('pointerenter', () => { hover = true; });
      rail.addEventListener('pointerleave', () => { hover = false; });
      rail.addEventListener('pointerdown', () => { dragging = true; });
      rail.addEventListener('pointerup', () => { dragging = false; });
      rail.addEventListener('pointercancel', () => { dragging = false; });

      const tick = (now) => {
        const dt = Math.min(64, now - last);
        last = now;
        const lbOpen = lb && lb.classList.contains('open');
        if (!document.hidden && visible && !hover && !dragging && !lbOpen) {
          const max = rail.scrollWidth - rail.clientWidth;
          if (max > 8) {
            acc += (speed * dt) / 1000 * dir;
            if (Math.abs(acc) >= 0.5) {
              const step = Math.trunc(acc);
              acc -= step;
              let next = rail.scrollLeft + step;
              if (next >= max) { next = max; dir = -1; }
              else if (next <= 0) { next = 0; dir = 1; }
              rail.scrollLeft = next;
            }
          }
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ------------------------------------------------------------------
     hero flight: 两架飞机沿两条航线对向循环，可拖动
  ------------------------------------------------------------------ */
  function initHeroFlight() {
    const svg = $('#heroRoute');
    const p1 = $('#routePath');
    const p2 = $('#routePath2');
    if (!svg || !p1 || !p2) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const NS = 'http://www.w3.org/2000/svg';
    const planes = [
      { g: $('#planeA'), path: p1, p: 0.10, dir: 1, speed: 0.042 },
      { g: $('#planeB'), path: p2, p: 0.86, dir: -1, speed: 0.034 }
    ].filter(o => o.g && o.path);

    planes.forEach(o => {
      try { o.len = o.path.getTotalLength(); } catch (e) { o.len = 0; }
      o.samples = [];
      const N = 240;
      for (let i = 0; i <= N; i++) {
        try { o.samples.push(o.path.getPointAtLength(o.len * i / N)); } catch (e) { }
      }
    });

    const place = (o) => {
      if (!o.len) return;
      const at = (t) => o.path.getPointAtLength(Math.max(0, Math.min(o.len, t)));
      const pt = at(o.len * o.p);
      const eps = o.len * 0.006;
      const q = at(o.len * o.p + (o.dir > 0 ? eps : -eps));
      const deg = Math.atan2(q.y - pt.y, q.x - pt.x) * 180 / Math.PI;
      o.g.setAttribute('transform', `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)}) rotate(${deg.toFixed(1)})`);
    };

    planes.forEach(place);

    let visible = true, dragging = null;
    let last = performance.now();

    const toLocal = (evt) => {
      const m = svg.getScreenCTM();
      if (!m) return null;
      const inv = m.inverse();
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      const q = pt.matrixTransform(inv);
      return { x: q.x, y: q.y };
    };

    const dragTo = (o, evt) => {
      const loc = toLocal(evt);
      if (!loc || !o.samples.length) return;
      let best = 0, bestD = Infinity;
      for (let i = 0; i < o.samples.length; i++) {
        const s = o.samples[i];
        const dx = s.x - loc.x, dy = s.y - loc.y;
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = i; }
      }
      o.p = best / (o.samples.length - 1);
      place(o);
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging.dragging = false;
      dragging.g.classList.remove('dragging');
      dragging = null;
    };

    window.addEventListener('pointermove', (evt) => {
      if (dragging) dragTo(dragging, evt);
    }, { passive: true });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);


    const planeClient = (o) => {
      const m = svg.getScreenCTM();
      const tr = o.g.getAttribute('transform') || '';
      const mm = tr.match(/translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)\s*\)/);
      if (!m || !mm) return null;
      const sp = svg.createSVGPoint();
      sp.x = parseFloat(mm[1]); sp.y = parseFloat(mm[2]);
      const c = sp.matrixTransform(m);
      return { x: c.x, y: c.y };
    };

    const HIT = 24;   // 命中半径（含光晕，px）

    const nearPlane = (evt) => {
      for (const o of planes) {
        const c = planeClient(o);
        if (!c) continue;
        const dx = evt.clientX - c.x, dy = evt.clientY - c.y;
        if (dx * dx + dy * dy <= HIT * HIT) return o;
      }
      return null;
    };

    document.addEventListener('pointerdown', (evt) => {
      if (evt.button !== 0) return;
      const o = nearPlane(evt);
      if (!o) return;
      evt.preventDefault();
      dragging = o;
      o.dragging = true;
      o.g.classList.add('dragging');
      dragTo(o, evt);
    }, { capture: true });

    document.addEventListener('pointermove', (evt) => {
      if (dragging) return;
      document.documentElement.style.cursor = nearPlane(evt) ? 'grab' : '';
    }, { passive: true });

    planes.forEach(o => {
      o.g.addEventListener('dragstart', e => e.preventDefault());
    });

    const tick = (now) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (visible && !document.hidden) {
        planes.forEach(o => {
          if (o.dragging || !o.len) return;
          o.p += o.speed * o.dir * dt;
          if (o.p > 1) o.p -= 1;
          if (o.p < 0) o.p += 1;
          place(o);
        });
      }
      requestAnimationFrame(tick);
    };

    if (reduce) {
      planes.forEach(place);
    } else {
      requestAnimationFrame(tick);
    }
  }

  const lb = $('#lightbox');
  let lbIndex = 0, lbLastFocus = null;

  function paintLightbox() {
    const it = galleryItems[lbIndex];
    if (!it) return;
    $('#lbImg').src = it.src;
    $('#lbImg').alt = it.cap;
    $('#lbCap').textContent = it.cap;
    $('#lbCount').textContent = pad(lbIndex + 1, 2) + ' / ' + pad(galleryItems.length, 2);
  }

  function openLightbox(i) {
    if (!galleryItems.length) return;
    lbIndex = (i + galleryItems.length) % galleryItems.length;
    lbLastFocus = document.activeElement;
    lb.hidden = false;
    paintLightbox();
    document.body.classList.add('locked');
    requestAnimationFrame(() => lb.classList.add('open'));
    $('#lbClose').focus();
  }
  function closeLightbox() {
    lb.classList.remove('open');
    setTimeout(() => {
      lb.hidden = true;
      document.body.classList.remove('locked');
      if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus();
    }, reduce ? 0 : 260);
  }
  function stepLightbox(d) {
    lbIndex = (lbIndex + d + galleryItems.length) % galleryItems.length;
    paintLightbox();
  }
  function initLightbox() {
    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', () => stepLightbox(-1));
    $('#lbNext').addEventListener('click', () => stepLightbox(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });
  }

  /* ------------------------------------------------------------------
     scroll systems
  ------------------------------------------------------------------ */
  function initScroll() {
    const bar = $('#bar');
    const altFill = $('#altFill');
    const altNum = $('#altNum');
    const navLinks = $$('#barNav a');
    const altTicks = $('#altTicks');
    const tlItems = $$('.tl-item');
    const ghost = $('#storyGhost');
    const path = $('#routePath');
    let pathLen = 0;
    let progress = 0, targetProgress = 0, lastY = 0, ticking = false;

    if (path) { try { pathLen = path.getTotalLength(); } catch (e) { pathLen = 0; } }

    if (altTicks) {
      altTicks.innerHTML = SECTIONS.map(s =>
        `<button type="button" data-go="${s.id}" title="${s.dataset.name || s.id}" aria-label="${s.dataset.name || s.id}"></button>`).join('');
    }

    const update = () => {
      const y = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      const p = max > 0 ? clamp(y / max, 0, 1) : 0;

      bar.classList.toggle('solid', y > 60);

      // current section
      let current = SECTIONS[0];
      SECTIONS.forEach(s => { if (s.offsetTop - vh * 0.42 <= y) current = s; });
      const dark = current.dataset.theme === 'dark';
      document.body.classList.toggle('dark-grid', dark);
      document.body.classList.toggle('on-dark', dark);

      navLinks.forEach(a => a.classList.toggle('active', a.dataset.nav === current.id));
      if (altTicks) {
        $$('button', altTicks).forEach(b => b.classList.toggle('active', b.dataset.go === current.id));
      }
      altFill.style.transform = `scaleY(${p})`;
      altNum.textContent = pad(Math.round(p * 1200), 4);
      const nameEl = $('#altName');
      if (nameEl) nameEl.textContent = current.dataset.name || current.id;

      // route dot
      if (pathLen) {
        const t = clamp(y / vh, 0, 1);
        const pt = path.getPointAtLength(pathLen * (0.04 + t * 0.72));
        const dot = $('#routeDot');
        if (dot) { dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); }
      }

      // story ghost year
      if (tlItems.length) {
        let best = tlItems[0], bestD = Infinity;
        tlItems.forEach(it => {
          const r = it.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - vh * 0.48);
          if (d < bestD) { bestD = d; best = it; }
          it.classList.toggle('active', false);
        });
        best.classList.add('active');
        if (ghost && ghost.textContent !== best.dataset.year) ghost.textContent = best.dataset.year;
      }

      // 历程页大字：随滚动滑动，位移范围锁在本节内
      const storySec = $('#story');
      const ghostEl = ghost ? ghost.parentElement : null;
      if (storySec && ghostEl) {
        if (reduce) {
          ghostEl.style.transform = '';
        } else {
          const r = storySec.getBoundingClientRect();
          const span = r.height + vh;
          const sp = clamp((vh - r.top) / (span || 1), 0, 1);   // 0=刚进入，1=已离开
          const amp = Math.min(560, r.height * 0.45);
          const dy = (sp - 0.5) * 2 * amp;
          const dx = (sp - 0.5) * -190;
          ghostEl.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
        }
      }

      targetProgress = p;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    if (altTicks) {
      altTicks.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        const t = document.getElementById(b.dataset.go);
        if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      });
    }
  }

  /* ------------------------------------------------------------------
     grid toggle + clock + cursor
  ------------------------------------------------------------------ */
  function initGrid() {
    const btn = $('#gridBtn');
    const toggle = () => {
      const on = !document.body.classList.contains('grid-on');
      document.body.classList.toggle('grid-on', on);
      btn.setAttribute('aria-pressed', String(on));
    };
    btn.addEventListener('click', toggle);
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        toggle();
      }
    });
  }

  /* 背景音乐：首次交互后起播（浏览器自动播放策略限制），按钮切换静音并记住选择 */
  function initBgm() {
    const audio = $('#bgm'), btn = $('#bgmBtn');
    if (!audio || !btn) return;
    const KEY = 'cual.bgm';
    let want = true;
    try { want = localStorage.getItem(KEY) !== 'off'; } catch (e) {}
    audio.volume = 0.34;

    const paint = () => {
      btn.setAttribute('aria-pressed', want ? 'true' : 'false');
      const t = btn.querySelector('.bgm-txt');
      if (t) t.textContent = want ? 'SOUND ON' : 'SOUND OFF';
    };
    const start = () => {
      if (!want) return;
      const p = audio.play();
      if (p && p.catch) p.catch(() => {});   // 被策略拦下就等下次手势
    };
    paint();

    /* 第一次手势（点击/按键/滚动/触摸）再起播 */
    const kick = () => {
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
      window.removeEventListener('wheel', kick);
      window.removeEventListener('touchstart', kick);
      start();
    };
    window.addEventListener('pointerdown', kick, { passive: true });
    window.addEventListener('keydown', kick);
    window.addEventListener('wheel', kick, { passive: true });
    window.addEventListener('touchstart', kick, { passive: true });

    btn.addEventListener('click', () => {
      want = !want;
      try { localStorage.setItem(KEY, want ? 'on' : 'off'); } catch (e) {}
      paint();
      if (want) start(); else audio.pause();
    });

    /* 页面不在最前（切标签/最小化/切到别的窗口）就停，回来再续 */
    let away = false;
    const pauseForAway = () => {
      if (!away) { away = true; if (!audio.paused) audio.pause(); }
    };
    const resumeIfBack = () => {
      if (away && want && !document.hidden) { away = false; start(); }
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseForAway(); else resumeIfBack();
    });
    window.addEventListener('blur', pauseForAway);
    window.addEventListener('focus', resumeIfBack);
    window.addEventListener('pagehide', pauseForAway);
  }

  function initMenu() {
    const panel = $('#menuPanel'), btn = $('#menuBtn'), close = $('#menuClose');
    if (!panel || !btn) return;
    const open = () => {
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    };
    const shut = () => {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };
    btn.addEventListener('click', () => { panel.hidden ? open() : shut(); });
    if (close) close.addEventListener('click', shut);
    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) { shut(); return; }
      if (e.target === panel) shut();          // 点抽屉外的遮罩关闭
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) shut(); });

    /* 触摸手势：右边缘向左滑打开，抽屉上向右滑关闭 */
    let sw = null;
    document.addEventListener('pointerdown', (e) => {
      if (!window.matchMedia('(max-width:1000px)').matches) return;   // 桌面不启用边缘滑动
      if (panel.hidden) {
        if (window.innerWidth - e.clientX <= 26) {
          sw = { x: e.clientX, y: e.clientY, mode: 'open' };
          if (e.cancelable) e.preventDefault();          // 别顺手选中文字
        }
      } else {
        sw = { x: e.clientX, y: e.clientY, mode: 'close' };
      }
    }, { passive: false });
    document.addEventListener('pointermove', (e) => {
      if (!sw) return;
      const dx = e.clientX - sw.x, dy = Math.abs(e.clientY - sw.y);
      if (sw.mode === 'open' && dx < -46 && dy < 70) {
        open();
        const sel = window.getSelection();
        if (sel) sel.removeAllRanges();
        sw = null;
        return;
      }
      if (sw.mode === 'close' && dx > 62 && dy < 70) { shut(); sw = null; return; }
      if (Math.abs(dx) > 130 || dy > 95) sw = null;
    }, { passive: true });
    document.addEventListener('dragstart', (e) => { if (sw) e.preventDefault(); });   // 滑动时别拖出链接
    document.addEventListener('pointerup', () => { sw = null; }, { passive: true });
    document.addEventListener('pointercancel', () => { sw = null; }, { passive: true });
  }

  function initClock() {
    const el = $('#clock');
    const fmt = () => {
      try {
        return new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).format(new Date()) + ' CST';
      } catch (e) { return ''; }
    };
    const tick = () => { el.textContent = fmt(); };
    tick();
    setInterval(tick, 1000);
  }

  function initCursor() {
    if (!fine || reduce) return;
    const ring = $('.cursor-ring');
    const dot = $('.cursor-dot');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, active = false;

    const move = (e) => {
      x = e.clientX; y = e.clientY;
      if (!active) { active = true; document.body.classList.add('has-cursor'); }
      dot.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    };
    document.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', (e) => {
      const hot = e.target.closest('a,button,figure,.crew-card,.proj-head,.rail');
      ring.classList.toggle('is-hot', !!hot);
    });
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------------
     hero shader — wind tunnel contour field
  ------------------------------------------------------------------ */
  function initHeroShader() {
    const cv = $('#heroCanvas');
    if (!cv) return;
    const gl = cv.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const FS = `
      precision highp float;
      uniform vec2 uRes;
      uniform float uTime;
      float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
        return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
      }
      float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*noise(p);p=p*2.03+vec2(7.1,3.9);a*=.5;}return s;}
      void main(){
        vec2 uv=(gl_FragCoord.xy*2.-uRes)/uRes.y;
        vec3 paper=vec3(.945,.933,.898);
        vec3 orange=vec3(1.,.29,.07);
        // 等高线：与历程页同一种画法（fbm + 等值线），但格子更小、线更粗更亮
        float t=uTime*.020;
        vec2 p=uv*vec2(1.10,1.58)+vec2(-t*1.10,t*.34);
        float f=fbm(p*1.25);
        float lv=abs(fract(f*17.)-.5);
        float major=1.-smoothstep(.0,.075,lv);
        float lvB=abs(fract(f*17.*3.)-.5);
        float minor=1.-smoothstep(.0,.026,lvB);
        // 范围收缩：以右中为心的椭圆，半径比历程页小
        float aspect=uRes.x/max(uRes.y,1.0);
        vec2 ctr=vec2(mix(.04,.37,clamp((aspect-.55)/.9,0.,1.)),.155);
        float d=length((uv-ctr)*vec2(.98,1.24));
        float mask=1.-smoothstep(.10,1.12,d);
        vec3 col=mix(paper,orange,.26);
        float breathe=.90+.10*sin(uTime*.55);
        float alpha=(major*.98+minor*.18)*mask*breathe;
        gl_FragColor=vec4(col,alpha);
      }`;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('[hero shader]', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[hero link]', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, 'uRes'),
      time: gl.getUniformLocation(prog, 'uTime'),
      mouse: gl.getUniformLocation(prog, 'uMouse'),
      scroll: gl.getUniformLocation(prog, 'uScroll')
    };
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let w = 0, h = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, window.__cualMobile ? 1 : 1.25);
      const r = cv.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * dpr));
      h = Math.max(1, Math.round(r.height * dpr));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w; cv.height = h; gl.viewport(0, 0, w, h);
      }
    };

    let visible = true, start = performance.now();
    const draw = (now) => {
      if (document.hidden) return;
      size();
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.time, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const reduceMotionHero = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = (now) => {
      if (visible && !document.hidden) draw(now);
      requestAnimationFrame(loop);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(cv);
    }
    window.addEventListener('resize', () => draw(performance.now()));
    if (reduceMotionHero) requestAnimationFrame(() => draw(performance.now()));
    else requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------------
     section shaders (story wind / contact dots)
  ------------------------------------------------------------------ */
  function initSectionShader(id, mode) {
    const cv = $('#' + id);
    if (!cv) return;
    const gl = cv.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const FS = `
      precision mediump float;
      uniform vec2 uRes; uniform float uTime; uniform float uMode;
      float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
        return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
      }
      float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*noise(p);p=p*2.03+vec2(7.1,3.9);a*=.5;}return s;}
      void main(){
        vec2 uv=(gl_FragCoord.xy*2.-uRes)/uRes.y;
        float t=uTime*.022;
        vec3 paper=vec3(.945,.933,.898);
        vec3 orange=vec3(1.,.29,.07);
        vec3 ink=vec3(.047,.047,.043);
        vec3 col=paper;
        float a=0.;
        if(uMode<1.5){
          vec2 p=uv*vec2(1.05,1.65);
          float f=fbm(p*1.15+vec2(-t*1.25,t*.22));
          float line=1.-smoothstep(.0,.040,abs(fract(f*16.)-.5));
          float m=1.-smoothstep(.30,1.55,length(uv*vec2(.70,1.0)));
          col=mix(paper,orange,.35);
          a=line*.45*m;
        } else {
          vec2 g=uv*vec2(46.,36.);
          vec2 idc=floor(g); vec2 fr=fract(g)-.5;
          float n=fbm(idc*.38+vec2(t*.45,t*.16));
          float r=.11+.27*n;
          float d=1.-smoothstep(r,r+.07,length(fr));
          float m=1.-smoothstep(.45,1.65,length(uv));
          col=mix(ink,orange,n*.45);
          a=d*.14*m;
        }
        gl_FragColor=vec4(col,a);
      }`;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('[section shader]', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {
      res: gl.getUniformLocation(prog, 'uRes'),
      time: gl.getUniformLocation(prog, 'uTime'),
      mode: gl.getUniformLocation(prog, 'uMode')
    };
    gl.uniform1f(U.mode, mode);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let w = 0, h = 0, dpr = 1, visible = true, start = performance.now();
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, window.__cualMobile ? 1 : 1.5);
      const r = cv.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * dpr));
      h = Math.max(1, Math.round(r.height * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(cv);
    }
    window.addEventListener('resize', size);

    const draw = (now) => {
      if (!visible || document.hidden) return;
      size();
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.time, (now - start) / 1000);
      gl.uniform1f(U.mode, mode);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      const once = () => draw(performance.now());
      requestAnimationFrame(once);
      window.addEventListener('load', once);
      window.addEventListener('resize', once);
      setTimeout(once, 700);
    } else {
      let tick = 0;
      const loop = (now) => { if ((tick++ & 1) === 0) draw(now); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

  /* ------------------------------------------------------------------
     interactive 3D airframe (canvas 2d projection)
  ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
     shader ground plane, driven by the same 3D camera as the wireframe
  ------------------------------------------------------------------ */
  function initSimFloor() {
    const cv = $('#simFloor');
    if (!cv) return null;  // 背景网格已移除：真机模型铺满 stage
    const gl = cv.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return null;

    const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const FS = `
      precision mediump float;
      uniform vec2 uRes; uniform float uTime, uYaw, uPitch, uZoom;
      float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
        return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
      }
      float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*noise(p);p=p*2.02+vec2(5.2,9.1);a*=.5;}return s;}
      void main(){
        vec2 uv=(gl_FragCoord.xy*2.-uRes)/uRes.y;
        float aspect=uRes.x/max(uRes.y,1.);
        float d=4.4/uZoom;
        float cy=cos(uYaw), sy=sin(uYaw), cp=cos(uPitch), sp=sin(uPitch);
        vec3 ro=vec3(sy*cp, .55+sp, cy*cp)*d;
        vec3 ta=vec3(0.,-.15,0.);
        vec3 fw=normalize(ta-ro);
        vec3 rt=normalize(cross(fw,vec3(0.,1.,0.)));
        vec3 up=cross(rt,fw);
        float th=tan(radians(22.));
        vec3 rd=normalize(fw+rt*uv.x*th*aspect+up*uv.y*th);
        vec3 col=vec3(0.); float a=0.;
        if(rd.y<0.){
          float t=(-.62-ro.y)/rd.y;
          if(t>0.){
            vec3 p=ro+rd*t;
            float dist=length(p.xz);
            float h=fbm(p.xz*.55+vec2(uTime*.03,0.));
            float line=1.-smoothstep(.0,.035,abs(fract(h*12.)-.5));
            float ring=max(1.-smoothstep(.0,.025,abs(dist-2.0))*0.7,
                           1.-smoothstep(.0,.020,abs(dist-2.45))*0.4);
            float ang=atan(p.z,p.x);
            float sweep=pow(max(0.,cos(ang-uTime*.8)),40.);
            float fade=exp(-t*.10);
            col=mix(vec3(.945,.933,.898),vec3(1.,.29,.07),clamp(ring*.8+sweep*.5,0.,1.));
            a=(line*.55+ring*.55+sweep*.35)*fade;
          }
        }
        gl_FragColor=vec4(col,a);
      }`;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('[sim floor]', gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {
      res: gl.getUniformLocation(prog, 'uRes'), time: gl.getUniformLocation(prog, 'uTime'),
      yaw: gl.getUniformLocation(prog, 'uYaw'), pitch: gl.getUniformLocation(prog, 'uPitch'), zoom: gl.getUniformLocation(prog, 'uZoom')
    };
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let w = 0, h = 0;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, window.__cualMobile ? 1 : 1.5);
      const r = cv.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * dpr));
      h = Math.max(1, Math.round(r.height * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    };
    window.addEventListener('resize', size);

    return (yaw, pitch, zoom, time) => {
      size();
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.res, w, h);
      gl.uniform1f(U.time, time / 1000);
      gl.uniform1f(U.yaw, yaw);
      gl.uniform1f(U.pitch, pitch);
      gl.uniform1f(U.zoom, zoom);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  }

  function initSim() {
    const stage = $('#sim'), cv = $('#simCanvas');
    if (!stage || !cv || cv.dataset.model) return;  // 真机模型由 sim-model.js 接管
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const floor = initSimFloor();

    const P = [], F = [];
    const seg = (a, b, c) => { P.push(a, b); F.push(c || 0); };
    const box = (cx, cy, cz, w, h, d, c) => {
      const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2, z0 = cz - d / 2, z1 = cz + d / 2;
      const v = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
      [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([i, j]) => seg(v[i], v[j], c));
    };
    const ring = (cx, cy, cz, r, n, c, axis) => {
      let prev = null;
      for (let i = 0; i <= n; i++) {
        const a = i / n * Math.PI * 2;
        let p;
        if (axis === 'x') p = [cx, cy + Math.cos(a) * r, cz + Math.sin(a) * r];
        else if (axis === 'z') p = [cx + Math.cos(a) * r, cy, cz + Math.sin(a) * r];
        else p = [cx + Math.cos(a) * r, cy + Math.sin(a) * r, cz];
        if (prev) seg(prev, p, c);
        prev = p;
      }
    };

    // airframe
    box(0, .05, 0, 1.06, .10, 1.26, 1);
    box(0, -.05, 0, .78, .06, .96, 1);
    box(0, .16, .06, .52, .14, .80, 1);            // battery
    box(0, -.16, .40, .24, .22, .26, 2);           // gimbal
    const M = [[1.22, 0, 1.22], [-1.22, 0, 1.22], [-1.22, 0, -1.22], [1.22, 0, -1.22]];
    M.forEach(([x, , z], i) => {
      seg([x * .27, 0, z * .27], [x, 0, z], 1);
      seg([x * .27, .06, z * .27], [x, .06, z], 1);
      seg([x * .27, 0, z * .27], [x * .27, .06, z * .27], 1);
      seg([x, -.02, z], [x, .16, z], 2);
      ring(x, .17, z, .09, 10, 2, 'y');
      ring(x, .17, z, .52, 24, 3, 'y');
      for (let b = 0; b < 3; b++) {
        const a = b * Math.PI * 2 / 3 + i * .55;
        seg([x, .17, z], [x + Math.cos(a) * .5, .17, z + Math.sin(a) * .5], 3);
      }
      ring(x, .30, z, .12, 12, 2, 'y');
      ring(x, .02, z, .09, 10, 2, 'y');
    });
    // landing skids
    [-1, 1].forEach(s => {
      const x = .46 * s;
      seg([x, -.08, -.42], [x, -.52, -.42], 1);
      seg([x, -.08, .42], [x, -.52, .42], 1);
      seg([x, -.52, -.56], [x, -.52, .56], 1);
      seg([x, -.08, .42], [x, -.52, .42], 1);
    });
    // antenna
    seg([0, .22, -.34], [0, .62, -.52], 2);
    // ground rings
    ring(0, -.62, 0, 1.95, 48, 4, 'y');
    ring(0, -.62, 0, 2.45, 64, 5, 'y');
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      seg([Math.cos(a) * 2.0, -.62, Math.sin(a) * 2.0], [Math.cos(a) * 2.38, -.62, Math.sin(a) * 2.38], 4);
    }
    // north tick
    seg([0, -.62, -2.55], [0, -.62, -2.8], 2);

    const COL = [
      'rgba(241,238,229,',  // 0 frame
      'rgba(241,238,229,',  // 1 frame dim
      'rgba(255,74,18,',    // 2 accent
      'rgba(255,74,18,',    // 3 prop
      'rgba(241,238,229,',  // 4 ground
      'rgba(241,238,229,'   // 5 ground faint
    ];

    let yaw = .72, pitch = .34, zoom = 1, auto = true, visible = true, drag = false;
    let lx = 0, ly = 0, w = 0, h = 0, dpr = 1;

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, window.__cualMobile ? 1 : 2);
      const r = stage.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const resize = new ResizeObserver(size);
    resize.observe(stage);
    size();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const scale = Math.min(w, h) * (w < 520 ? .235 : .275) * zoom;
      const cx = w / 2, cy0 = h * .52;
      const pts = P.map(p => {
        const x1 = p[0] * cy + p[2] * sy;
        const z1 = -p[0] * sy + p[2] * cy;
        const y2 = p[1] * cp - z1 * sp;
        const z2 = p[1] * sp + z1 * cp;
        const k = 1 / (1 + z2 * .16);
        return [cx + x1 * scale * k, cy0 - y2 * scale * k, z2];
      });

      const order = [];
      for (let i = 0; i < F.length; i++) {
        order.push([(pts[i * 2][2] + pts[i * 2 + 1][2]) / 2, i]);
      }
      order.sort((a, b) => a[0] - b[0]);
      for (const [z, i] of order) {
        const a = pts[i * 2], b = pts[i * 2 + 1];
        const f = F[i];
        const depth = clamp(.55 - z * .14, .18, 1);
        const alpha = (f === 4 ? .16 : f === 5 ? .08 : f === 3 ? .62 : .9) * depth;
        ctx.strokeStyle = COL[f] + alpha.toFixed(3) + ')';
        ctx.lineWidth = f === 2 || f === 3 ? 1.25 : .95;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }

      // motor glow points
      ctx.fillStyle = 'rgba(255,74,18,.9)';
      M.forEach(([x, , z]) => {
        const p = [x * cy + z * sy, -x * sy + z * cy];
        const y2 = .17 * cp - p[1] * sp, z2 = .17 * sp + p[1] * cp;
        const k = 1 / (1 + z2 * .16);
        const sx = cx + p[0] * scale * k, sy2 = cy0 - y2 * scale * k;
        ctx.beginPath(); ctx.arc(sx, sy2, 1.7, 0, Math.PI * 2); ctx.fill();
      });

      const deg = ((yaw * 180 / Math.PI) % 360 + 360) % 360;
      const yl = $('#simYaw');
      if (yl) yl.textContent = 'YAW ' + String(Math.round(deg)).padStart(3, '0') + '°';
      if (floor) floor(yaw, pitch, zoom, reduce ? 0 : performance.now());
    };

    const loop = () => {
      if (visible && !document.hidden) {
        if (auto && !drag && !reduce) yaw += .0032;
        draw();
      }
      requestAnimationFrame(loop);
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: .05 }).observe(stage);
    }

    cv.addEventListener('pointerdown', (e) => {
      drag = true; auto = false; lx = e.clientX; ly = e.clientY;
      stage.classList.add('dragging');
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', (e) => {
      if (!drag) return;
      yaw += (e.clientX - lx) * .008;
      pitch = clamp(pitch + (e.clientY - ly) * .006, -.12, 1.02);
      lx = e.clientX; ly = e.clientY;
    });
    const end = () => {
      drag = false; stage.classList.remove('dragging');
      setTimeout(() => { auto = true; }, 1200);
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoom = clamp(zoom - e.deltaY * .0012, .62, 1.75);
    }, { passive: false });
    cv.addEventListener('keydown', (e) => {
      const k = e.key;
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_', ' '].includes(k)) return;
      e.preventDefault();
      auto = false;
      if (k === 'ArrowLeft') yaw -= .14;
      if (k === 'ArrowRight') yaw += .14;
      if (k === 'ArrowUp') pitch = clamp(pitch - .08, -.12, 1.02);
      if (k === 'ArrowDown') pitch = clamp(pitch + .08, -.12, 1.02);
      if (k === '+' || k === '=') zoom = clamp(zoom + .08, .62, 1.75);
      if (k === '-' || k === '_') zoom = clamp(zoom - .08, .62, 1.75);
      if (k === ' ') auto = true;
    });

    requestAnimationFrame(loop);
  }

  function initHeroIntro() {
    const hero = $('#home');
    if (!hero) return;
    const play = () => hero.classList.add('hero-in');
    if (reduce) { play(); return; }
    // 开场动画接管：等它播完（或被跳过）再放首屏入场
    if (window.CUAL_INTRO) {
      document.addEventListener('cual:intro-end', () => setTimeout(play, 90), { once: true });
      setTimeout(play, 40000);
      return;
    }
    const start = () => setTimeout(play, document.getElementById('boot') ? 700 : 60);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    setTimeout(play, 3000);
  }

  function initBoot() {
    const boot = $('#boot');
    if (!boot) return;
    const out = () => {
      if (boot.classList.contains('done')) return;
      boot.classList.add('done');
      setTimeout(() => { if (boot.parentNode) boot.parentNode.removeChild(boot); }, 1300);
    };
    // 开场动画接管释放时机
    if (window.CUAL_INTRO) {
      document.addEventListener('cual:intro-end', out, { once: true });
      setTimeout(out, 40000);
      return;
    }
    window.addEventListener('load', () => setTimeout(out, reduce ? 0 : 520));
    setTimeout(out, 2800);
  }

  /* ------------------------------------------------------------------
     init
  ------------------------------------------------------------------ */
  function init() {
    renderNav();
    renderHero();
    renderFacts();
    renderProjects();
    renderStory();
    renderRecord();
    renderCrew();
    renderFrames();
    renderJoin();

    initReveal();
    initCounters();
    initAccordions();
    initFilters();
    initMobileCollapse();
    initRails();
    initMasonry();
    initRailAutoScroll();
    initLightbox();
    initHeroShader();
    initHeroFlight();
    initSectionShader('storyShader', 1);
    initSectionShader('contactShader', 2);
    initSim();
    initScroll();
    initGrid();
    initMenu();
    initClock();
    initCursor();
    initBgm();
    initHeroIntro();
    initBoot();

    // image failure: keep layout, mark figure
    document.addEventListener('error', (e) => {
      const img = e.target;
      if (img.tagName === 'IMG') img.style.opacity = '0.15';
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
