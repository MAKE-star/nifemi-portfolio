/* ============================================================================
   Oluwanifemi Kujebe — portfolio (hostable static build)

   PERSISTENCE MODEL (cloud / instant):
   - All editable content lives in `S` (overrides) layered over `D` (defaults).
   - On load we fetch the latest content from Supabase so EVERY visitor sees
     current content instantly. localStorage is used as an offline cache so the
     page renders immediately and still works if the network is slow.
   - When a signed-in editor changes anything, we save to Supabase (debounced),
     so the change is live for everyone on their next load — no re-deploy.
   - Resume + photos upload to a public Supabase Storage bucket; we store the
     public URL in the content row (keeps the row small, syncs across devices).
   - Login is real: Supabase magic-link email auth, restricted to the editor
     email(s) in config.js AND enforced server-side by the Row Level Security
     policy you created in SQL. The client checks are UX; RLS is the real lock.
   ========================================================================== */

const STORE_KEY = 'nifemi_portfolio_v1';

/* ---- config comes from config.js (window.NIFEMI_CONFIG) ---- */
const CFG = window.NIFEMI_CONFIG || {};
const EDITORS = (CFG.EDITORS || []).map(e => e.toLowerCase());

/* ---- Supabase client (cloud sync + auth) ---- */
let sb = null;
try {
  if (window.supabase && CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY) {
    sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
  }
} catch (e) { console.warn('Supabase init failed', e); }

/* ---- fonts offered in the style tool ---- */
const FONTS = {
  Fraunces: "'Fraunces',Georgia,serif",
  Inter: "'Inter',system-ui,sans-serif",
  'DM Mono': "'DM Mono',ui-monospace,monospace",
};

/* ---- default content (from her CV) ---- */
const D = {
  fn: 'Oluwanifemi', ln: 'Kujebe',
  hello: 'Executive Assistant · Operations · HR',
  c1: 'Executive Assistant', c2: 'Operations & HR',
  loc: 'Lagos, Nigeria · Remote, worldwide',
  av: 'Available for remote roles',
  t1: 'Experience', t1v: '4+ years',
  t2: 'Delivery', t2v: '30% faster at Rare Flower',
  t3: 'Focus', t3v: 'Systems that scale',
  b1: 'Work with me', rs_l: 'Download resume',

  ab_e: '01 / About',
  ab_big: 'I bring more than efficiency. I bring elevation.',
  ab1: 'Highly organized Executive and Human Resources Assistant with 4+ years of experience in operations, customer service, recruitment, onboarding and workflow optimization. Skilled in managing executive support, client communication and administrative processes while improving efficiency and keeping accurate records.',
  ab2: 'Beyond executive assistance, I play an active role in HR support, including recruitment coordination, onboarding, documentation and internal communication. My approach is proactive, people-focused and detail-driven, so leaders can focus on strategy while the business runs smoothly behind the scenes.',
  ka_h: 'Key achievements',

  m_e: '02 / Experience', m_h1: 'Professional', m_h2: 'experience.',

  w_e: '03 / Work', w_h1: 'Selected', w_h2: 'work.',
  w_hint: 'Tap a card to expand it. Use the arrows to move through the gallery.',

  s1n: '4+', s1l: 'Years of experience',
  s2n: '30%', s2l: 'Faster delivery at Rare Flower',
  s3n: '14%', s3l: 'LinkedIn growth in 2 months',
  s4n: '100%', s4l: 'Record accuracy maintained',

  k_e: '05 / Capabilities', k_h1: 'Every system,', k_h2: 'every detail.',
  k_lead: 'From the executive inbox to HR pipelines and vendor deliverables, I build the quiet machinery that keeps a business moving — documented, repeatable and calm under pressure.',

  lk_e: '04 / Links', lk_h1: 'Project', lk_h2: 'links.',
  lk_hint: 'A library of real deliverables and samples. Links open in a new tab.',

  t_e: '06 / Reviews', t_h1: 'Client', t_h2: 'reviews.',

  e_e: '07 / Background', e_h1: 'Training &', e_h2: 'credentials.',
  cert_h: 'Certifications',
  cert_hint: 'Tap a certificate with an image to view it full size.',

  c_e: '08 / Contact', c_h1: 'Let us make work', c_h2: 'run smoothly.',
  c_p: 'Open to Executive Assistant, Operations and HR roles — remote, worldwide.',
  ph: '+234 814 469 3622',
  em: 'oluwanifemikujebe@gmail.com',
  li: 'https://www.linkedin.com/in/oluwanifemi-kujebe/',
  li_l: 'Connect on LinkedIn',
};

/* list-type defaults rendered as repeatable items; each gets a numeric id list */
const LISTS = {
  // experience roles
  exp: [
    { t: 'Executive Assistant, Operations & HR Assistant', c: 'Rare Flower Agency · USA · Remote', d: 'June 2025 – Present', s: 'Current',
      items: [
        'Executive Assistant to the Executive Director, managing schedules, correspondence, contracts, invoices and high-level administrative support.',
        'Prepared executive briefs, tracked high-level decisions and maintained discretion while liaising with internal and external stakeholders.',
        'Oversee agency operations and HR systems support — hiring, onboarding, staff training, talent database management and workflow monitoring — improving delivery time by 30%.',
        'Provide project management oversight, tracking deliverables and communicating progress to leadership.',
        'Lead outreach and lead generation, building partner pipelines and managing relationships with external organizations.',
        'Youth Symposium outreach: 13,988 views and 207 tickets sold (1.07% conversion). Re-educated Comedy: 170+ verified contacts.',
      ] },
    { t: 'Executive Assistant / HR Operations Lead', c: 'Curate VA · Canada · Remote', d: 'January 2025 – December 2025', s: 'Completed',
      items: [
        'Supported end-to-end recruitment: sourcing, screening, interview coordination and final selection of virtual assistants.',
        'Reviewed staff performance to support promotion, reassignment or termination decisions with structured feedback to leadership.',
        'Assigned hired staff to clients based on skill alignment, capability and client requirements.',
        'Trained new and existing staff on internal tools, platforms and workflows to improve productivity.',
        'Developed and implemented salary plans and compensation structures for staff and contractors.',
        'Acted as the central HR point of contact for staff-related issues and performance concerns.',
      ] },
    { t: 'LinkedIn Social Media Manager', c: 'Cybersecurity professional · UK · Remote', d: 'May – July 2025', s: 'Completed',
      items: [
        'Grew the page from 3,600 to 4,100 followers (14%) in 2 months with a full content strategy.',
        'Created 20+ storytelling, educational and thought-leadership posts, improving reach and engagement.',
        'Designed graphics, content calendars, captions and growth strategies — no paid ads.',
      ] },
    { t: 'Administrative Virtual Assistant / Customer Relations', c: 'Freelance · Remote', d: 'October 2024 – Present', s: 'Current',
      items: [
        'Managed day-to-day customer communication across email, bookings and DMs with timely, accurate responses.',
        "Redesigned a client's Instagram page, increasing engagement by 25% in three weeks.",
        'Supported recruitment, onboarding and document preparation for small-business clients.',
        'Organized records, reports, proposals and task trackers to support executive decision-making.',
      ] },
    { t: 'Data-Entry Assistant', c: 'Shades of Colours · Nigeria', d: 'September 2021 – May 2024', s: 'Completed',
      items: [
        'Maintained 100% accuracy in financial, customer and inventory records using CRM and spreadsheet systems.',
        'Processed orders, resolved concerns and improved customer satisfaction through daily interaction.',
        'Helped detect previous internal theft and financial inconsistencies through detailed data audits.',
        'Prepared weekly sales reports and tracked order statuses to strengthen the customer experience.',
      ] },
  ],

  ka: [
    'Improved delivery time by 30% by standardizing onboarding, training and workflow monitoring at Rare Flower Agency.',
    'Youth Symposium outreach achieved 13,988 views and 207 tickets sold (1.07% conversion).',
    'Built 170+ verified contacts for Re-educated Comedy and ran tailored outreach for the Abigail Hing Wen Book Tour.',
    "Grew a client's LinkedIn page from 3,600 to 4,100 followers (14%) in 2 months without paid ads.",
    "Redesigned a client's Instagram page, increasing engagement by 25% in three weeks.",
    'Maintained 100% accurate records and helped detect internal theft through detailed data audits.',
  ],

  caps: [
    { h: 'Executive Support', items: ['Calendar & schedule management', 'Inbox & correspondence', 'Executive briefs & reporting', 'Travel planning & itineraries', 'Contracts, NDAs & invoices', 'Stakeholder communication'] },
    { h: 'Operations & Workflow', items: ['Workflow & operations management', 'SOP development', 'Project oversight', 'Vendor & deliverables coordination', 'Data entry & records management'] },
    { h: 'HR & People', items: ['Recruitment & onboarding', 'Staff training', 'Performance monitoring', 'Talent database management', 'Compensation planning'] },
    { h: 'Outreach & Content', items: ['Lead generation & outreach', 'LinkedIn content strategy', 'Social media management', 'Graphic design', 'Research & reporting'] },
  ],

  // each tool: { n: name, img: optional logo URL }
  tools: [
    { n: 'Google Workspace' }, { n: 'Microsoft Office' }, { n: 'Canva' }, { n: 'ClickUp' },
    { n: 'Slack' }, { n: 'Asana' }, { n: 'Notion' }, { n: 'Trello' }, { n: 'Calendly' },
    { n: 'Zoom' }, { n: 'Microsoft Teams' }, { n: 'Airtable' }, { n: 'Dropbox' },
    { n: 'Mailchimp' }, { n: 'Miro' }, { n: 'Grammarly' }, { n: 'Zeffy' },
  ],

  tms: [
    { h: 'Dedicated and intelligent', q: 'Nifemi is an exceptional and outstanding individual. I have had the pleasure of working with her and have been consistently impressed by her dedication, intelligence and friendly demeanor. She brings innovation and a strong work ethic to the table.', b: 'Paul, Educational Enthusiast' },
    { h: 'Problem-solver and team-player', q: "Oluwanifemi's greatest strength is the ability to offer valuable advice and insights. She is a natural problem-solver and a team player, always looking for ways to improve and learn.", b: 'Simeon' },
    { h: 'Organized and reliable', q: 'Nifemi is highly skilled, organized and reliable, which helps make the entire process run smoothly. Working with her is easy and the results are always impressive.', b: 'Angela, Cosmetologist' },
    { h: 'Strong judgment', q: 'Nifemi handled a sensitive contract situation independently, recognizing when resolution was no longer productive. Her ability to assess fit, manage it professionally and provide clear, timely updates made the process smooth and well-handled.', b: 'Cassie Olson, Account Manager' },
  ],

  edu: [
    'Workflow Operations Management, Asana Academy (March 2025 – March 2026)',
    'Virtual Assistant Programme, ALX Africa (August – October 2024)',
    'B.Ed Christian Religious Studies, University of Lagos (January 2021 – present)',
  ],
  // each cert: { txt: label, img: optional image URL (tap to view), l: optional link }
  cert: [
    { txt: 'ALX Virtual Assistant Certification (October 2024)' },
    { txt: 'Asana Workflow Specialist Certification (awarded March 2026)' },
  ],

  // selected work gallery (graphics design etc.) — tap to enlarge, arrows to scroll
  // each work: { t, d, imgs:[urls], l: optional link }
  works: [
    { t: 'Calendar Management', d: 'Managing schedules with Google Calendar, Outlook, Notion and Calendly: prioritizing appointments, setting reminders and optimizing time for clients and teams.' },
    { t: 'Email Management', d: 'Organizing, prioritizing and responding to email with labels and clear follow-ups so correspondence stays timely with minimal delays.' },
    { t: 'Workflow & Project Management', d: 'Trello and Asana boards for a social content calendar and a 30-day campaign; implemented a workflow system that cut task completion time by 30%.' },
    { t: 'Meeting Agendas', d: 'Clear, time-conscious agendas that support team coordination, keep meetings productive and give every session a purpose.' },
    { t: 'Graphic Design', d: 'Product ads and promotional flyers designed in Canva — from food brands to beauty businesses.' },
  ],

  // project links section (mirrors her old portfolio) — grouped links, open in new tab
  // each group: { h: heading, items: [{ t: label, l: url }] }
  links: [
    { h: 'SOPs', items: [
      { t: 'ClickUp SOP for Account Managers and Operations Team', l: '' },
      { t: 'ProtonPass SOP', l: '' },
      { t: 'HR and Talent SOP', l: '' },
    ] },
    { h: 'Data Entry', items: [
      { t: 'Sales Data Consolidation and Organization', l: '' },
    ] },
    { h: 'Email Sample Templates', items: [
      { t: 'Follow up Emails', l: '' },
      { t: 'Welcome Emails', l: '' },
      { t: 'Meeting Confirmation Emails', l: '' },
    ] },
    { h: 'Travel and Itinerary Management', items: [
      { t: 'Travel Pack', l: '' },
      { t: 'Blue Fin Restaurant Reservation', l: '' },
    ] },
    { h: 'Research Work', items: [
      { t: 'Research 1', l: '' }, { t: 'Research 2', l: '' }, { t: 'Research 3', l: '' },
      { t: 'Research 4', l: '' }, { t: 'Research 5', l: '' }, { t: 'Research 6', l: '' },
    ] },
    { h: 'Social Media Management', items: [
      { t: 'Content Calendar and Baseline Audit', l: '' },
      { t: 'Tools and Budget Proposal', l: '' },
      { t: 'TikTok Content Strategy', l: '' },
    ] },
  ],
};

/* ============================================================================
   STATE: load overrides from localStorage, else from an embedded seed, else {}.
   S.t   = text overrides keyed by data-k
   S.img = base64 portrait
   S.resume = {n:name, d:dataURL}  (optional override of the file in /resume)
   S.st  = per-element style overrides
   S.th  = theme accent
   S.lists = overrides for repeatable lists (exp/ka/caps/tools/tms/edu/cert/works)
   ========================================================================== */
function loadState() {
  try {
    const ls = localStorage.getItem(STORE_KEY);
    if (ls) return JSON.parse(ls);
  } catch (e) {}
  const seed = document.getElementById('seed');
  if (seed) { try { return JSON.parse(seed.textContent) || {}; } catch (e) {} }
  return {};
}
let S = loadState();
S.t = S.t || {}; S.img = S.img || ''; S.resume = S.resume || null;
S.st = S.st || {}; S.th = S.th || {}; S.lists = S.lists || {};

/* deep clone of a default list, or the saved override if present */
function list(key) {
  if (S.lists[key]) return S.lists[key];
  return JSON.parse(JSON.stringify(LISTS[key]));
}
function setList(key, val) { S.lists[key] = val; persist(); }

const t = k => (S.t[k] !== undefined ? S.t[k] : (D[k] ?? ''));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/* editable text node */
const E = (k, tag = 'span') => `<${tag} data-k="${k}">${esc(t(k))}</${tag}>`;

/* local cache always; cloud save is debounced + only when signed in */
function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {}
  cloudSaveSoon();
}

/* ---- cloud save (debounced) ---- */
let saveTimer = 0, saveState = 'idle';
function cloudSaveSoon() {
  if (!sb || !authed) return;
  clearTimeout(saveTimer);
  setSaveState('pending');
  saveTimer = setTimeout(cloudSaveNow, 900);
}
async function cloudSaveNow() {
  if (!sb || !authed) return;
  setSaveState('saving');
  // prune text overrides equal to defaults to keep the row small
  const t2 = {}; Object.keys(S.t).forEach(k => { if (S.t[k] !== (D[k] ?? '')) t2[k] = S.t[k]; });
  const payload = { ...S, t: t2 };
  const { error } = await sb.from('site_content')
    .update({ data: payload, updated_at: new Date().toISOString() })
    .eq('id', CFG.ROW_ID || 'main');
  if (error) { setSaveState('error'); toast('Cloud save failed: ' + error.message); }
  else { setSaveState('saved'); }
}
function setSaveState(s) { saveState = s; bar(); }

/* ---- cloud load: fetch latest content for everyone ---- */
async function cloudLoad() {
  if (!sb) return false;
  try {
    const { data, error } = await sb.from('site_content')
      .select('data').eq('id', CFG.ROW_ID || 'main').single();
    if (error || !data || !data.data) return false;
    const cloud = data.data;
    if (cloud && typeof cloud === 'object') {
      S = cloud;
      S.t = S.t || {}; S.img = S.img || ''; S.resume = S.resume || null;
      S.st = S.st || {}; S.th = S.th || {}; S.lists = S.lists || {};
      try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {}
      return true;
    }
  } catch (e) { console.warn('cloudLoad failed', e); }
  return false;
}

/* ---- upload a Blob/File to Supabase Storage, return a public URL ----
   Falls back to a base64 data URL if cloud/storage is unavailable so the
   editor still sees the change on their device. */
async function cloudUpload(path, blobOrFile, contentType) {
  if (!sb || !authed) return null;
  const bucket = CFG.BUCKET || 'media';
  const { error } = await sb.storage.from(bucket).upload(path, blobOrFile, {
    upsert: true, contentType: contentType || blobOrFile.type || 'application/octet-stream',
    cacheControl: '3600',
  });
  if (error) { toast('Upload failed: ' + error.message); return null; }
  const { data } = sb.storage.from(bucket).getPublicUrl(path);
  // bust CDN cache so a replaced file shows immediately
  return data.publicUrl + '?v=' + Date.now();
}
const dataUrlToBlob = async (dataUrl) => (await fetch(dataUrl)).blob();

/* ============================================================================
   RENDER
   ========================================================================== */
function render() {
  const exp = list('exp'), ka = list('ka'), caps = list('caps'),
    tools = list('tools'), tms = list('tms'), edu = list('edu'),
    cert = list('cert'), works = list('works'), links = list('links');

  const li = (arr, path) => arr.map((v, i) =>
    `<li data-list="${path}" data-i="${i}"><span data-k="${path}.${i}">${esc(v)}</span>${delBtn()}</li>`).join('');

  const expHtml = exp.map((r, i) => `
    <div class="ms rv" data-list="exp" data-i="${i}">
      ${delBtn()}
      ${moveBtns()}
      <div class="no">0${i + 1}</div>
      <div>
        <h3 data-k="exp.${i}.t">${esc(r.t)}</h3>
        <div class="co"><span data-k="exp.${i}.c">${esc(r.c)}</span> · <span data-k="exp.${i}.d">${esc(r.d)}</span></div>
        <span class="tag mono" data-k="exp.${i}.s">${esc(r.s)}</span>
        <ul>${r.items.map((it, j) => `<li data-list="exp.${i}.items" data-i="${j}"><span data-k="exp.${i}.items.${j}">${esc(it)}</span>${delBtn()}</li>`).join('')}</ul>
        ${addBtn('exp.' + i + '.items', 'Add point')}
      </div>
    </div>`).join('');

  const capCards = caps.map((c, i) => `
    <div class="c rv" data-list="caps" data-i="${i}">
      ${delBtn()}
      <div class="cnum">0${i + 1}</div>
      <h4 data-k="caps.${i}.h">${esc(c.h)}</h4>
      <div class="ch">${c.items.map((it, j) => `<span class="chip" data-list="caps.${i}.items" data-i="${j}"><span data-k="caps.${i}.items.${j}">${esc(it)}</span>${delBtn()}</span>`).join('')}${addBtn('caps.' + i + '.items', '+ skill')}</div>
    </div>`).join('');

  const toolsHtml = tools.map((v, i) => {
    const name = typeof v === 'string' ? v : (v.n || '');
    const img = typeof v === 'object' ? v.img : '';
    return `<div class="tool" data-list="tools" data-i="${i}">
      ${delBtn()}
      <div class="toolimg" data-toolimg="${i}">${img ? `<img src="${esc(img)}" alt="${esc(name)} logo">` : `<span class="toolph">${esc((name[0] || '?').toUpperCase())}</span>`}</div>
      <div class="toolname" data-k="tools.${i}.n">${esc(name)}</div>
    </div>`;
  }).join('');

  const linksHtml = links.map((g, i) => `
    <div class="lkgroup rv" data-list="links" data-i="${i}">
      ${delBtn()}
      <h4 data-k="links.${i}.h">${esc(g.h)}</h4>
      <div class="lkitems">
        ${(g.items || []).map((it, j) => `
          <div class="lkitem" data-list="links.${i}.items" data-i="${j}">
            ${okUrl(it.l) ? `<a href="${esc(it.l)}" target="_blank" rel="noopener" class="lka"><span data-k="links.${i}.items.${j}.t">${esc(it.t)}</span> <span class="lkext">↗</span></a>`
              : `<span class="lka lkna"><span data-k="links.${i}.items.${j}.t">${esc(it.t)}</span></span>`}
            ${editing ? `<input class="lkurl" data-lkurl="${i}.${j}" placeholder="https://link (opens in new tab)" value="${esc(it.l || '')}">` : ''}
            ${delBtn()}
          </div>`).join('')}
      </div>
      ${addBtn('links.' + i + '.items', 'Add link')}
    </div>`).join('');

  const tmsHtml = tms.map((m, i) => `
    <div class="c rv" data-list="tms" data-i="${i}">
      ${delBtn()}
      <h4 data-k="tms.${i}.h">${esc(m.h)}</h4>
      <p data-k="tms.${i}.q">${esc(m.q)}</p>
      <div class="by mono" data-k="tms.${i}.b">${esc(m.b)}</div>
    </div>`).join('');

  const mq = tools.map(x => `<span>${esc(typeof x === 'string' ? x : (x.n || ''))}</span>`).join('');

  document.getElementById('app').innerHTML = `
  <section id="home" class="dark" data-sec="home"><div class="wrap hgrid">
    <div>
      <div class="hello mono">${E('hello')}</div>
      <h1>${E('fn')}<span class="l2">${E('ln')}</span></h1>
      <div class="role">${E('c1')} <b>${E('c2')}</b></div>
      <div class="meta mono"><span class="ok">● ${E('av')}</span> · ${E('loc')}</div>
      <div class="btns">
        <a class="btn fill" id="hire" href="#contact">${E('b1')}</a>
        <a class="btn" id="dl1" href="#">${E('rs_l')}</a>
      </div>
      <div class="ticks">${[1, 2, 3].map(i => `<div><i></i>${E('t' + i)} <b>${E('t' + i + 'v')}</b></div>`).join('')}</div>
    </div>
    <div class="badgeW"><div id="badge">
      <div class="top mono"><span>Profile</span><span>2026</span></div>
      <div class="ph" id="ph"><span>ON</span>${S.img ? `<img src="${S.img}" alt="Portrait of Oluwanifemi Kujebe">` : ''}<span class="hint mono">Tap to change photo</span></div>
      <div class="nm">${esc(t('fn'))} ${esc(t('ln'))}</div>
      <div class="sm mono">${esc(t('c1'))}</div>
    </div></div>
  </div></section>

  <section id="about" class="light" data-sec="about"><div class="wrap">
    <span class="eyebrow mono">${E('ab_e')}</span>
    <p class="big rv">${E('ab_big')}</p>
    <div class="two rv"><p>${E('ab1')}</p><p>${E('ab2')}</p></div>
    <div class="ka rv"><span class="eyebrow mono">${E('ka_h')}</span><ul>${li(ka, 'ka')}</ul>${addBtn('ka', 'Add achievement')}</div>
  </div></section>

  <section id="experience" class="light2" data-sec="experience"><div class="wrap">
    <span class="eyebrow mono">${E('m_e')}</span>
    <h2 class="rv">${E('m_h1')} <em>${E('m_h2')}</em></h2>
    ${expHtml}
    ${addBtn('exp', 'Add role')}
  </div></section>

  <section id="work" class="light" data-sec="work"><div class="wrap">
    <div class="workhead">
      <div><span class="eyebrow mono">${E('w_e')}</span><h2 class="rv" style="margin:0">${E('w_h1')} <em>${E('w_h2')}</em></h2></div>
      <div class="wnav"><button id="wprev" aria-label="Previous">‹</button><button id="wnext" aria-label="Next">›</button></div>
    </div>
    <p class="whint">${E('w_hint')}</p>
    <div class="wrail" id="wrail">
      ${works.map((w, i) => {
        const imgs = workImgs(w);
        const cover = imgs[0];
        const thumbs = imgs.map((src, j) =>
          `<div class="wthumb${j === 0 ? ' sel' : ''}" data-wthumb="${i}" data-j="${j}"><img src="${esc(src)}" alt="">${editing ? `<button class="wtdel" data-wimgdel="${i}" data-j="${j}" title="Remove image">×</button>` : ''}</div>`).join('');
        return `
        <div class="wc${i === 0 ? ' active' : ''}" data-wc="${i}" data-list="works" data-i="${i}">
          ${delBtn()}
          <div class="wi" data-wi="${i}">
            ${cover ? `<img class="wcover" data-wcover="${i}" src="${esc(cover)}" alt="">` : '<span class="mono">Tap to add image</span>'}
            ${imgs.length > 1 ? `<span class="wcount mono">${imgs.length} images</span>` : ''}
          </div>
          <div class="wb">
            <h4 data-k="works.${i}.t">${esc(w.t)}</h4>
            <p data-k="works.${i}.d">${esc(w.d)}</p>
            ${imgs.length ? `<div class="wthumbs">${thumbs}</div>` : ''}
            ${editing ? `<button class="btn secAdd wimgadd" data-wimgadd="${i}" style="display:inline-flex;margin-top:10px">+ Add image</button>` : ''}
            ${okUrl(w.l) ? `<a class="wl" href="${esc(w.l)}" target="_blank" rel="noopener">View work →</a>` : ''}
            <div class="wedit"><input data-wl="${i}" placeholder="Link (optional)" value="${esc(w.l || '')}"></div>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${addBtn('works', 'Add a work')}
  </div></section>

  <section id="links" class="light2" data-sec="links"><div class="wrap">
    <span class="eyebrow mono">${E('lk_e')}</span>
    <h2 class="rv">${E('lk_h1')} <em>${E('lk_h2')}</em></h2>
    <p class="whint" style="margin-bottom:30px">${E('lk_hint')}</p>
    <div class="lkgrid">${linksHtml}</div>
    ${addBtn('links', 'Add link group')}
  </div></section>

  <section class="dark" data-sec="stats" style="padding:0"><div class="sg">
    ${[1, 2, 3, 4].map(i => `<div class="rv"><b><span class="cnt" data-k="s${i}n">${esc(t('s' + i + 'n'))}</span></b><span class="mono" data-k="s${i}l">${esc(t('s' + i + 'l'))}</span></div>`).join('')}
  </div></section>

  <section id="capabilities" class="light" data-sec="capabilities"><div class="wrap">
    <span class="eyebrow mono">${E('k_e')}</span>
    <div class="capLead rv">
      <h2 style="margin:0">${E('k_h1')} <em>${E('k_h2')}</em></h2>
      <p>${E('k_lead')}</p>
    </div>
    <div class="capMetrics rv" style="margin-bottom:48px">
      ${[1, 2, 3, 4].map(i => `<div><b data-k="s${i}n">${esc(t('s' + i + 'n'))}</b><span data-k="s${i}l">${esc(t('s' + i + 'l'))}</span></div>`).join('')}
    </div>
    <div class="tk">${capCards}</div>
    ${addBtn('caps', 'Add capability group')}
    <div class="toolsWrap rv" style="margin-top:64px">
      <span class="eyebrow mono">Tools I work with</span>
      <div class="toolgrid">${toolsHtml}</div>
      ${addBtn('tools', 'Add tool')}
    </div>
  </div></section>

  <section class="dark" data-sec="tm"><div class="wrap">
    <span class="eyebrow mono">${E('t_e')}</span>
    <h2 class="rv">${E('t_h1')} <em>${E('t_h2')}</em></h2>
    <div class="tm">${tmsHtml}</div>
    ${addBtn('tms', 'Add testimonial')}
  </div></section>

  <div class="mq" data-sec="mq"><div class="tr">${mq}${mq}${mq}${mq}</div></div>

  <section id="background" class="light2" data-sec="background"><div class="wrap">
    <span class="eyebrow mono">${E('e_e')}</span>
    <h2 class="rv">${E('e_h1')} <em>${E('e_h2')}</em></h2>
    ${edu.map((v, i) => `<div class="er rv" data-list="edu" data-i="${i}" style="position:relative">${delBtn()}<span data-k="edu.${i}">${esc(v)}</span></div>`).join('')}
    ${addBtn('edu', 'Add training')}
    <span class="eyebrow mono" style="margin-top:48px">${E('cert_h')}</span>
    <p class="whint" style="margin:8px 0 4px">${E('cert_hint')}</p>
    ${cert.map((c, i) => {
      const txt = typeof c === 'string' ? c : (c.txt || '');
      const img = typeof c === 'object' ? c.img : '';
      const link = typeof c === 'object' ? c.l : '';
      const viewable = !!img;
      return `<div class="er cert${viewable ? ' viewable' : ''} rv" data-list="cert" data-i="${i}" ${viewable ? `data-certimg="${i}"` : ''} style="position:relative">
        ${delBtn()}
        <span class="certrow">
          <span data-k="cert.${i}.txt">${esc(txt)}</span>
          ${viewable ? '<span class="certview mono">View certificate ↗</span>' : ''}
          ${okUrl(link) ? `<a class="certlink mono" href="${esc(link)}" target="_blank" rel="noopener">Open link ↗</a>` : ''}
        </span>
        ${editing ? `<span class="certedit">
          <button class="btn secAdd certimgadd" data-certimgadd="${i}" style="display:inline-flex">${img ? 'Replace image' : '+ Add image'}</button>
          ${img ? `<button class="btn certimgdel" data-certimgdel="${i}">Remove image</button>` : ''}
          <input class="lkurl" data-certurl="${i}" placeholder="Link (optional, opens new tab)" value="${esc(link || '')}">
        </span>` : ''}
      </div>`;
    }).join('')}
    ${addBtn('cert', 'Add certification')}
  </div></section>

  <section id="contact" data-sec="contact"><div class="wrap">
    <span class="eyebrow mono">${E('c_e')}</span>
    <h2 class="rv">${E('c_h1')} <em>${E('c_h2')}</em></h2>
    <p>${E('c_p')}</p>
    <p class="mono" style="opacity:.7">${E('ph')}</p>
    <div class="btns" style="justify-content:center">
      <a class="btn fill" id="hire2" href="mailto:${esc(t('em'))}">${E('em')}</a>
      <a class="btn" id="dl2" href="#">${E('rs_l')}</a>
    </div>
    <div class="btns" style="justify-content:center;margin-top:14px">
      <a class="btn" id="li1" href="${esc(t('li'))}" target="_blank" rel="noopener">${E('li_l')}</a>
    </div>
  </div></section>

  <footer class="mono">© ${new Date().getFullYear()} ${esc(t('fn'))} ${esc(t('ln'))}</footer>`;

  wire();
  applyAll();
  // re-apply contentEditable after a re-render (without recursing into setEdit/render)
  if (editing) {
    document.body.classList.add('editing');
    document.querySelectorAll('[data-k]').forEach(e => (e.contentEditable = 'true'));
  }
}

const okUrl = u => /^https?:\/\//i.test(u || '');
/* normalize a work item's images into an array (supports the old single `img`) */
function workImgs(w) {
  if (Array.isArray(w.imgs)) return w.imgs.filter(Boolean);
  if (w.img) return [w.img];
  return [];
}
const delBtn = () => `<button class="itemDel" title="Delete" aria-label="Delete">×</button>`;
const addBtn = (path, label) => `<button class="btn secAdd" data-add="${path}">+ ${esc(label)}</button>`;
/* up/down reorder controls for an item inside a list (editor only) */
const moveBtns = () =>
  `<span class="itemMove">
    <button class="moveBtn moveUp" data-move="up" title="Move up" aria-label="Move up">↑</button>
    <button class="moveBtn moveDown" data-move="down" title="Move down" aria-label="Move down">↓</button>
  </span>`;

/* ============================================================================
   WIRING (runs after every render)
   ========================================================================== */
const $ = id => document.getElementById(id);
let editing = false;

/* small toast helper */
let toastTimer = 0;
function toast(msg) {
  const e = $('toast'); if (!e) return;
  e.textContent = msg; e.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => e.classList.remove('show'), 2600);
}

function wire() {
  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.rv').forEach(r => io.observe(r));

  // scroll progress
  const onScroll = () => {
    const h = document.documentElement;
    $('prog').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
  };
  removeEventListener('scroll', wire._s || (() => {}));
  wire._s = onScroll; addEventListener('scroll', onScroll, { passive: true });

  // hero glow follows pointer
  const home = $('home');
  if (home) home.onpointermove = e => {
    home.style.setProperty('--mx', e.clientX + 'px');
    home.style.setProperty('--my', (e.clientY - home.getBoundingClientRect().top) + 'px');
  };

  // "Work with me" + contact buttons scroll to contact smoothly (no mailto on hire)
  ['hire'].forEach(id => { const el = $(id); if (el) el.onclick = ev => { if (editing) return ev.preventDefault(); }; });

  // resume download (both buttons)
  ['dl1', 'dl2'].forEach(id => { const el = $(id); if (el) el.addEventListener('click', downloadResume); });

  // stat count-up
  document.querySelectorAll('[data-sec="stats"] .cnt').forEach(countUp);

  wireWork();
  wireEditingDom();
}

/* ---- resume: a real file in /resume by default; an uploaded override wins ---- */
const RESUME_PATH = 'resume/Oluwanifemi-Kujebe-CV.pdf';
function downloadResume(e) {
  if (e) e.preventDefault();
  if (editing) return;
  const a = document.createElement('a');
  if (S.resume && S.resume.u) {            // cloud (Supabase Storage) URL
    a.href = S.resume.u; a.target = '_blank';
    a.download = S.resume.n || 'Oluwanifemi-Kujebe-CV.pdf';
  } else if (S.resume && S.resume.d) {     // base64 fallback
    a.href = S.resume.d; a.download = S.resume.n || 'Oluwanifemi-Kujebe-CV.pdf';
  } else {                                 // bundled file shipped with the site
    a.href = RESUME_PATH; a.download = 'Oluwanifemi-Kujebe-CV.pdf'; a.target = '_blank';
  }
  document.body.appendChild(a); a.click(); a.remove();
}

/* ---- stat count-up ---- */
function countUp(el) {
  if (editing) return;
  const m = el.textContent.match(/^(\d+)(.*)$/); if (!m) return;
  const n = +m[1], sf = m[2]; let s = null;
  const f = ts => { if (s === null) s = ts; const p = Math.min((ts - s) / 1200, 1); el.textContent = Math.round(n * p) + sf; if (p < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}

/* ============================================================================
   SELECTED WORK — click to enlarge + arrow carousel
   ========================================================================== */
function wireWork() {
  const rail = $('wrail'); if (!rail) return;
  const cards = [...rail.querySelectorAll('.wc')];

  // click a card to make it the active (enlarged) one and center it
  cards.forEach(card => {
    card.addEventListener('click', e => {
      if (editing) return; // in edit mode clicks go to image/link controls
      if (e.target.closest('.wedit') || e.target.closest('.itemDel') ||
          e.target.closest('.wthumb') || e.target.closest('.wcover')) return;
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });

  // thumbnail click: swap the cover image (in view mode); in edit mode, delete is handled elsewhere
  rail.querySelectorAll('.wthumb').forEach(th => {
    th.addEventListener('click', e => {
      if (e.target.closest('.wtdel')) return;      // delete handled in wireEditingDom
      const wi = +th.dataset.wthumb, j = +th.dataset.j;
      const imgs = workImgs(list('works')[wi]);
      const cover = th.closest('.wc').querySelector('.wcover');
      if (cover && imgs[j]) {
        cover.src = imgs[j];
        th.closest('.wc').querySelectorAll('.wthumb').forEach(x => x.classList.remove('sel'));
        th.classList.add('sel');
      }
    });
  });

  // cover click: open the full gallery in the lightbox (view mode only)
  rail.querySelectorAll('.wcover').forEach(cov => {
    cov.addEventListener('click', e => {
      if (editing) return;
      e.stopPropagation();
      const wi = +cov.dataset.wcover;
      const imgs = workImgs(list('works')[wi]);
      // start from whichever thumb is currently selected
      const selThumb = cov.closest('.wc').querySelector('.wthumb.sel');
      const start = selThumb ? +selThumb.dataset.j : 0;
      if (imgs.length) openLightbox(imgs, start);
    });
  });

  const step = () => (rail.querySelector('.wc')?.offsetWidth || 320) + 22;
  const prev = $('wprev'), next = $('wnext');
  const upd = () => {
    if (!prev || !next) return;
    prev.disabled = rail.scrollLeft < 8;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
  };
  if (prev) prev.onclick = () => { rail.scrollBy({ left: -step(), behavior: 'smooth' }); };
  if (next) next.onclick = () => { rail.scrollBy({ left: step(), behavior: 'smooth' }); };
  rail.addEventListener('scroll', upd, { passive: true });
  setTimeout(upd, 50);
}

/* ============================================================================
   LIGHTBOX — view work galleries + certificates full size
   ========================================================================== */
let lbImgs = [], lbIdx = 0;
function openLightbox(imgs, start) {
  lbImgs = imgs.filter(Boolean); if (!lbImgs.length) return;
  lbIdx = Math.max(0, Math.min(start || 0, lbImgs.length - 1));
  lbRender(); $('lightbox').classList.add('show');
}
function closeLightbox() { $('lightbox').classList.remove('show'); lbImgs = []; }
function lbRender() {
  $('lbimg').src = lbImgs[lbIdx] || '';
  const multi = lbImgs.length > 1;
  $('lbprev').style.display = multi ? '' : 'none';
  $('lbnext').style.display = multi ? '' : 'none';
  $('lbcount').textContent = multi ? `${lbIdx + 1} / ${lbImgs.length}` : '';
}
function lbStep(d) { if (!lbImgs.length) return; lbIdx = (lbIdx + d + lbImgs.length) % lbImgs.length; lbRender(); }
$('lbclose').onclick = closeLightbox;
$('lbprev').onclick = () => lbStep(-1);
$('lbnext').onclick = () => lbStep(1);
$('lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!$('lightbox').classList.contains('show')) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') lbStep(-1);
  else if (e.key === 'ArrowRight') lbStep(1);
});

/* ============================================================================
   STYLING / THEME
   ========================================================================== */
function applyStyle(k) {
  const el = document.querySelector(`[data-k="${k}"]`); if (!el) return;
  const s = S.st[k] || {};
  el.style.color = s.c || '';
  el.style.fontFamily = s.f ? FONTS[s.f] : '';
  el.style.fontSize = s.z ? s.z + 'em' : '';
  el.style.fontWeight = s.w || '';
}
function applyTheme() {
  const r = document.documentElement.style;
  if (S.th.a) { r.setProperty('--gold', S.th.a); r.setProperty('--acc2', S.th.a); }
  else { r.removeProperty('--gold'); r.removeProperty('--acc2'); }
}
function applyAll() { Object.keys(S.st).forEach(applyStyle); applyTheme(); }

/* ============================================================================
   EDIT MODE
   ========================================================================== */
function setEdit(on) {
  const was = editing;
  editing = on;
  document.body.classList.toggle('editing', on);
  if (on) populateFontMenu();
  // re-render so the editor-only controls (add-image, cert/link inputs, etc.)
  // appear/disappear — they are conditionally built into the markup.
  if (was !== on) {
    render();  // render() calls wire(); contentEditable is set below after DOM exists
  }
  document.querySelectorAll('[data-k]').forEach(e => (e.contentEditable = on ? 'true' : 'false'));
  bar();
}
function bar() {
  const b = $('edbar');
  if (!b) return;
  if (!authed) { b.innerHTML = ''; return; }
  const status = {
    idle: '', pending: '● Saving…', saving: '● Saving…',
    saved: '✓ Saved to cloud', error: '⚠ Save failed',
  }[saveState] || '';
  const statusHtml = (editing && status) ? `<span class="savestate mono ${saveState}">${status}</span>` : '';
  b.innerHTML = editing
    ? `${statusHtml}<button class="btn mono" id="dn">Done</button>`
    : `<button class="btn fill mono" id="ed">Edit site</button><button class="btn mono" id="lo">Log out</button>`;
  if ($('ed')) $('ed').onclick = () => setEdit(true);
  if ($('dn')) $('dn').onclick = async () => {
    await cloudSaveNow();
    setEdit(false);
    toast(sb ? 'Saved to the cloud — live for everyone.' : 'Saved on this device.');
  };
  if ($('lo')) $('lo').onclick = logout;
}

/* capture typing into S.t and persist */
document.addEventListener('input', e => {
  const k = e.target.dataset && e.target.dataset.k;
  if (!k || !editing) return;
  const txt = e.target.textContent;
  if (k.includes('.')) {
    // list field: path like exp.0.t or caps.1.items.2 or ka.3
    setListField(k, txt);
  } else {
    S.t[k] = txt;
  }
  persist();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.dataset && e.target.dataset.k && editing) {
    const k = e.target.dataset.k;
    // allow newlines in long paragraphs/quotes + exp/caps bullet lists + plain ka/edu;
    // block Enter for short single-line fields (titles, tool names, cert labels, link labels)
    const multiline = /\b(q|d|ab1|ab2|k_lead|c_p)\b/.test(k)
      || /^(exp|caps)\.\d+\.items\.\d+$/.test(k)
      || /^(ka|edu)\.\d+$/.test(k);
    if (!multiline) e.preventDefault();
  }
});

/* write a dotted-path value back into S.lists */
function setListField(path, val) {
  const seg = path.split('.');
  const key = seg[0];
  const arr = list(key); // ensures override exists
  // migrate legacy primitives to the object shapes used now
  if (key === 'cert' && typeof arr[+seg[1]] === 'string') arr[+seg[1]] = { txt: arr[+seg[1]] };
  if (key === 'tools' && typeof arr[+seg[1]] === 'string') arr[+seg[1]] = { n: arr[+seg[1]] };
  let node = arr;
  for (let i = 1; i < seg.length - 1; i++) {
    const s = seg[i];
    node = Array.isArray(node) ? node[+s] : node[s];
  }
  const last = seg[seg.length - 1];
  if (Array.isArray(node)) node[+last] = val; else node[last] = val;
  S.lists[key] = arr;
}

/* generic add / delete + photo + work handlers */
function wireEditingDom() {
  const app = $('app');

  // view-mode: open a certificate image in the lightbox
  app.querySelectorAll('.cert.viewable').forEach(row => {
    row.addEventListener('click', e => {
      if (editing) return;
      if (e.target.closest('.certlink') || e.target.closest('.certedit')) return;
      const i = +row.dataset.certimg;
      const c = list('cert')[i];
      const img = typeof c === 'object' ? c.img : '';
      if (img) openLightbox([img], 0);
    });
  });

  app.onclick = e => {
    if (!editing) return;
    const add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); addItem(add.dataset.add); return; }
    // per-image delete inside a work card
    const wimgdel = e.target.closest('[data-wimgdel]');
    if (wimgdel) { e.preventDefault(); delWorkImg(+wimgdel.dataset.wimgdel, +wimgdel.dataset.j); return; }
    // add image to a work card (append)
    const wimgadd = e.target.closest('[data-wimgadd]');
    if (wimgadd) { e.preventDefault(); workTarget = +wimgadd.dataset.wimgadd; $('wfile').click(); return; }
    // cert image add / remove
    const certadd = e.target.closest('[data-certimgadd]');
    if (certadd) { e.preventDefault(); certTarget = +certadd.dataset.certimgadd; $('cfile').click(); return; }
    const certdel = e.target.closest('[data-certimgdel]');
    if (certdel) { e.preventDefault(); delCertImg(+certdel.dataset.certimgdel); return; }
    // tool image
    const timg = e.target.closest('[data-toolimg]');
    if (timg) { e.preventDefault(); toolTarget = +timg.dataset.toolimg; $('tfile').click(); return; }
    // generic item reorder (up/down)
    const mv = e.target.closest('.moveBtn');
    if (mv) { e.preventDefault(); const host = mv.closest('[data-list]'); if (host) moveItem(host.dataset.list, +host.dataset.i, mv.dataset.move); return; }
    // generic item delete
    const del = e.target.closest('.itemDel');
    if (del) { e.preventDefault(); const host = del.closest('[data-list]'); if (host) delItem(host.dataset.list, +host.dataset.i); return; }
    // empty work image placeholder -> add first image
    const wi = e.target.closest('[data-wi]');
    if (wi && !e.target.closest('.wcover')) { workTarget = +wi.dataset.wi; $('wfile').click(); return; }
    const ph = e.target.closest('#ph');
    if (ph) { $('file').click(); return; }
  };

  app.addEventListener('change', e => {
    const ds = e.target.dataset || {};
    // work link
    if (ds.wl !== undefined) {
      const works = list('works'); const w = works[+ds.wl];
      let v = e.target.value.trim(); if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
      w.l = okUrl(v) ? v : ''; setList('works', works); render(); return;
    }
    // link-item url  (data-lkurl="g.j")
    if (ds.lkurl !== undefined) {
      const [g, j] = ds.lkurl.split('.').map(Number);
      const links = list('links'); const it = links[g].items[j];
      let v = e.target.value.trim(); if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
      it.l = okUrl(v) ? v : ''; setList('links', links); render(); return;
    }
    // certificate url
    if (ds.certurl !== undefined) {
      const cert = list('cert'); const i = +ds.certurl;
      if (typeof cert[i] === 'string') cert[i] = { txt: cert[i] };
      let v = e.target.value.trim(); if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
      cert[i].l = okUrl(v) ? v : ''; setList('cert', cert); render(); return;
    }
  });

  // focus to select element for styling
  document.addEventListener('focusin', e => {
    if (!editing) return; const k = e.target.dataset && e.target.dataset.k;
    if (k) { sel = k; syncTool(); }
  });
}

/* remove one image from a work card's gallery */
function delWorkImg(wi, j) {
  const works = list('works');
  const imgs = workImgs(works[wi]);
  imgs.splice(j, 1);
  works[wi].imgs = imgs; delete works[wi].img;    // migrate to array form
  setList('works', works); render(); toast('Image removed.');
}
/* remove a certificate's image */
function delCertImg(i) {
  const cert = list('cert');
  if (typeof cert[i] === 'object') { delete cert[i].img; }
  setList('cert', cert); render(); toast('Certificate image removed.');
}

/* ADD a blank item that mirrors the section's template */
function addItem(path) {
  const seg = path.split('.');
  if (path === 'exp') { const a = list('exp'); a.push({ t: 'Role title', c: 'Company · Location', d: 'Dates', s: 'Current', items: ['What you did and the impact.'] }); setList('exp', a); }
  else if (path === 'ka') { const a = list('ka'); a.push('A new achievement.'); setList('ka', a); }
  else if (path === 'caps') { const a = list('caps'); a.push({ h: 'New group', items: ['New skill'] }); setList('caps', a); }
  else if (path === 'tools') { const a = list('tools'); a.push({ n: 'New tool', img: '' }); setList('tools', a); }
  else if (path === 'tms') { const a = list('tms'); a.push({ h: 'Headline', q: 'What the client said about working with you.', b: 'Name, Role' }); setList('tms', a); }
  else if (path === 'edu') { const a = list('edu'); a.push('New training or degree (dates).'); setList('edu', a); }
  else if (path === 'cert') { const a = list('cert'); a.push({ txt: 'New certification (date).', img: '', l: '' }); setList('cert', a); }
  else if (path === 'works') { const a = list('works'); a.push({ t: 'Project title', d: 'A short description of the project and your role.', imgs: [], l: '' }); setList('works', a); }
  else if (path === 'links') { const a = list('links'); a.push({ h: 'New group', items: [{ t: 'New link', l: '' }] }); setList('links', a); }
  else if (/^links\.\d+\.items$/.test(path)) { const a = list('links'); a[+seg[1]].items.push({ t: 'New link', l: '' }); setList('links', a); }
  else if (/^exp\.\d+\.items$/.test(path)) { const a = list('exp'); a[+seg[1]].items.push('New point.'); setList('exp', a); }
  else if (/^caps\.\d+\.items$/.test(path)) { const a = list('caps'); a[+seg[1]].items.push('New skill'); setList('caps', a); }
  render(); toast('Added.');
}

/* MOVE an item up or down within its list, by dotted path + index.
   Works for any list (exp, works, caps, ka, …) and for nested item lists
   like exp.0.items, because it resolves the same dotted path delItem does. */
function moveItem(path, i, dir) {
  const seg = path.split('.');
  const key = seg[0];
  const a = list(key);
  // resolve down to the array that actually holds the item
  let node = a;
  for (let s = 1; s < seg.length; s++) node = Array.isArray(node) ? (node[+seg[s]] ?? node[seg[s]]) : node[seg[s]];
  const arr = node;
  if (!Array.isArray(arr)) return;
  const j = dir === 'up' ? i - 1 : i + 1;
  if (j < 0 || j >= arr.length) return;           // already at an edge
  [arr[i], arr[j]] = [arr[j], arr[i]];            // swap neighbours
  setList(key, a); render();
  toast('Moved ' + (dir === 'up' ? 'up' : 'down') + '.');
}

/* DELETE an item from a list by dotted path + index */
function delItem(path, i) {
  const seg = path.split('.');
  const key = seg[0];
  const a = list(key);
  if (seg.length === 1) { a.splice(i, 1); }
  else {
    // nested like exp.0.items or caps.1.items
    let node = a;
    for (let s = 1; s < seg.length; s++) node = Array.isArray(node) ? node[+seg[s]] ?? node[seg[s]] : node[seg[s]];
    node.splice(i, 1);
  }
  setList(key, a); render(); toast('Removed.');
}

/* ---- photo upload (hero badge) ---- */
let workTarget = null;
$('file').onchange = e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  const im = new Image();
  im.onload = async () => {
    const c = document.createElement('canvas'); c.width = c.height = 700;
    const s = Math.min(im.width, im.height);
    c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 700, 700);
    const dataUrl = c.toDataURL('image/jpeg', .85);
    const url = await cloudUpload('portrait.jpg', await dataUrlToBlob(dataUrl), 'image/jpeg');
    S.img = url || dataUrl; persist(); render();
    toast(url ? 'Photo updated — live for everyone.' : 'Photo updated on this device.');
  };
  im.src = URL.createObjectURL(f);
};
/* ---- work image upload (APPENDS to the card's gallery) ---- */
let certTarget = null, toolTarget = null;
$('wfile').onchange = e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f || workTarget === null) return;
  const im = new Image();
  im.onload = async () => {
    // Keep the WHOLE image: scale down to fit within 1600px on the long edge
    // (no cropping). The card and lightbox both show it with object-fit:contain,
    // so nothing gets cut off. Transparent canvas → PNG so there are no black bars.
    const max = 1600, r = Math.min(1, max / Math.max(im.width, im.height));
    const c = document.createElement('canvas');
    c.width = Math.round(im.width * r); c.height = Math.round(im.height * r);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', .85);
    const idx = workTarget;
    const name = 'work-' + idx + '-' + Date.now() + '.jpg';
    const url = await cloudUpload(name, await dataUrlToBlob(dataUrl), 'image/jpeg');
    const works = list('works');
    const imgs = workImgs(works[idx]);
    imgs.push(url || dataUrl);
    works[idx].imgs = imgs; delete works[idx].img;   // migrate to array form
    setList('works', works); render();
    toast(url ? 'Image added — live for everyone.' : 'Image added on this device.');
  };
  im.src = URL.createObjectURL(f);
};
/* ---- certificate image upload (keeps original aspect, max 1400px) ---- */
$('cfile').onchange = e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f || certTarget === null) return;
  const im = new Image();
  im.onload = async () => {
    const max = 1400, r = Math.min(1, max / Math.max(im.width, im.height));
    const c = document.createElement('canvas'); c.width = im.width * r; c.height = im.height * r;
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', .85);
    const idx = certTarget;
    const url = await cloudUpload('cert-' + idx + '-' + Date.now() + '.jpg', await dataUrlToBlob(dataUrl), 'image/jpeg');
    const cert = list('cert');
    if (typeof cert[idx] === 'string') cert[idx] = { txt: cert[idx] };
    cert[idx].img = url || dataUrl;
    setList('cert', cert); render();
    toast(url ? 'Certificate image added — live for everyone.' : 'Certificate image added on this device.');
  };
  im.src = URL.createObjectURL(f);
};
/* ---- tool logo upload (square template, 160px) ---- */
$('tfile').onchange = e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f || toolTarget === null) return;
  const im = new Image();
  im.onload = async () => {
    const c = document.createElement('canvas'); c.width = c.height = 160;
    const s = Math.min(im.width, im.height);
    c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 160, 160);
    const dataUrl = c.toDataURL('image/png');
    const idx = toolTarget;
    const url = await cloudUpload('tool-' + idx + '-' + Date.now() + '.png', await dataUrlToBlob(dataUrl), 'image/png');
    const tools = list('tools');
    if (typeof tools[idx] === 'string') tools[idx] = { n: tools[idx] };
    tools[idx].img = url || dataUrl;
    setList('tools', tools); render();
    toast(url ? 'Tool logo added — live for everyone.' : 'Tool logo added on this device.');
  };
  im.src = URL.createObjectURL(f);
};
/* ---- resume upload / remove ---- */
$('rsu').onclick = () => $('rsf').click();
$('rsx').onclick = () => { S.resume = null; persist(); showResume(); toast('Using the bundled resume file.'); };
$('rsf').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  if (f.size > 8e6) return toast('Resume must be under 8 MB');
  const ext = (f.name.split('.').pop() || 'pdf').toLowerCase();
  const url = await cloudUpload('resume.' + ext, f, f.type);
  if (url) {
    S.resume = { n: f.name, u: url }; persist(); showResume();
    toast('Resume updated — live for everyone.');
  } else {
    // fallback: keep base64 locally when cloud isn't available
    const r = new FileReader();
    r.onload = () => { S.resume = { n: f.name, d: r.result }; persist(); showResume(); toast('Resume updated on this device.'); };
    r.readAsDataURL(f);
  }
};
function showResume() { if ($('rsn')) $('rsn').textContent = S.resume ? ('Uploaded: ' + S.resume.n) : 'Using bundled file'; }

/* ---- style tool ---- */
let sel = null;
const hex = c => { const m = (c || '').match(/\d+/g); return m ? '#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('') : '#000000'; };
function populateFontMenu() {
  const tf = $('tf'); if (tf.options.length > 1) return;
  Object.keys(FONTS).forEach(f => { const o = document.createElement('option'); o.textContent = f; tf.appendChild(o); });
}
function syncTool() {
  const el = sel && document.querySelector(`[data-k="${sel}"]`);
  $('tsel').textContent = el ? 'Editing: ' + el.textContent.slice(0, 22) : 'Click any text to style it';
  if (!el) return;
  $('tc').value = hex(getComputedStyle(el).color);
  $('tf').value = (S.st[sel] || {}).f || '';
}
const styleIt = fn => { if (!sel) return toast('Click a text first'); S.st[sel] = S.st[sel] || {}; fn(S.st[sel]); applyStyle(sel); persist(); };
$('tc').oninput = e => styleIt(s => s.c = e.target.value);
$('tf').onchange = e => styleIt(s => s.f = e.target.value);
$('tpl').onclick = () => styleIt(s => s.z = Math.min(2.5, +((s.z || 1) + .1).toFixed(2)));
$('tmn').onclick = () => styleIt(s => s.z = Math.max(.5, +((s.z || 1) - .1).toFixed(2)));
$('tbd').onclick = () => styleIt(s => s.w = s.w ? '' : '700');
$('th_a').oninput = e => { S.th.a = e.target.value; applyTheme(); persist(); };
let rstT = 0;
$('rst').onclick = () => {
  if (Date.now() - rstT > 4000) { rstT = Date.now(); return toast('Tap Reset styles again to confirm'); }
  S.st = {}; S.th = {}; document.documentElement.removeAttribute('style'); persist(); render(); toast('Styles reset.');
};

/* ============================================================================
   LOGIN (Supabase magic-link auth; RLS enforces writes server-side)
   ========================================================================== */
let authed = false;
function openLogin() { $('login').classList.add('show'); const em = $('lgEmail'); if (em) em.focus(); }
function closeLogin() { $('login').classList.remove('show'); $('lgErr').textContent = ''; }
$('ownerKey').onclick = () => { if (authed) { setEdit(!editing); } else openLogin(); };
$('lgCancel').onclick = closeLogin;

/* extra ways to reach sign-in (the dot is intentionally subtle):
   - press Shift + E anywhere
   - open the site with #edit in the URL, e.g. .../#edit  */
document.addEventListener('keydown', e => {
  if (e.shiftKey && (e.key === 'E' || e.key === 'e') &&
      !/^(input|textarea)$/i.test(e.target.tagName) && !e.target.isContentEditable) {
    if (authed) setEdit(!editing); else openLogin();
  }
});
if (location.hash.toLowerCase() === '#edit') {
  // open after boot so the modal exists
  setTimeout(() => { if (!authed) openLogin(); }, 300);
}
$('lgGo').onclick = tryLogin;
$('lgEmail').addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });

/* send a magic link to an approved editor email */
async function tryLogin() {
  const email = $('lgEmail').value.trim().toLowerCase();
  if (!email) { $('lgErr').textContent = 'Enter your email.'; return; }
  if (!EDITORS.includes(email)) {
    $('lgErr').textContent = 'That email is not an approved editor.';
    return;
  }
  if (!sb) { $('lgErr').textContent = 'Cloud editing is not configured.'; return; }
  $('lgErr').textContent = '';
  $('lgErr').style.color = '#8fc9a0';
  $('lgErr').textContent = 'Sending link…';
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: CFG.SITE_URL || location.origin },
  });
  if (error) {
    $('lgErr').style.color = '';
    $('lgErr').textContent = error.message;
  } else {
    $('lgErr').textContent = 'Check your email for the sign-in link.';
  }
}

/* react to Supabase auth state — this fires after the magic-link redirect */
function wireAuth() {
  if (!sb) return;
  sb.auth.onAuthStateChange((_evt, session) => {
    const email = session?.user?.email?.toLowerCase();
    if (session && email && EDITORS.includes(email)) {
      authed = true; closeLogin(); bar();
      toast('Signed in as ' + email + '. Click “Edit site”.');
      // clean the auth tokens out of the URL
      if (location.hash.includes('access_token')) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    } else if (!session) {
      authed = false; bar();
    }
  });
}

async function logout() {
  if (sb) { try { await sb.auth.signOut(); } catch (e) {} }
  authed = false; editing = false; document.body.classList.remove('editing');
  document.querySelectorAll('[data-k]').forEach(e => (e.contentEditable = 'false'));
  bar(); toast('Logged out.');
}

/* ============================================================================
   BOOT
   - render immediately from local cache/seed so the page is never blank
   - then fetch the latest content from the cloud and re-render
   - restore an existing Supabase session (keeps you signed in across visits)
   ========================================================================== */
render();
showResume();
bar();

(async () => {
  if (!sb) { bar(); return; }
  wireAuth();
  // restore session if already signed in
  try {
    const { data } = await sb.auth.getSession();
    const email = data?.session?.user?.email?.toLowerCase();
    if (email && EDITORS.includes(email)) authed = true;
  } catch (e) {}
  // pull latest cloud content for everyone (visitors + editors)
  const ok = await cloudLoad();
  if (ok) { render(); showResume(); }
  bar();
})();
