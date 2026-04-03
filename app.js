// ============================================================
//  MCD Creator — app.js
// ============================================================

// ── Constants ────────────────────────────────────────────────
const ENT_W      = 160;   // entity box width
const ENT_HDR_H  = 32;   // entity header height
const ENT_ROW_H  = 24;   // height per attribute row
const ASC_R      = 42;   // association circle radius

const ATTR_TYPES = [
  'INT', 'BIGINT', 'SMALLINT',
  'VARCHAR(50)', 'VARCHAR(100)', 'VARCHAR(255)',
  'TEXT', 'CHAR(10)',
  'DATE', 'DATETIME', 'TIMESTAMP',
  'BOOLEAN',
  'FLOAT', 'DOUBLE', 'DECIMAL(10,2)',
];

// ── State ─────────────────────────────────────────────────────
const state = {
  entities:     [],   // { id, name, x, y, attributes:[{name,type,isPK}] }
  associations: [],   // { id, name, x, y }
  connections:  [],   // { id, assocId, entityId, cardinality }
  nextId: 1,

  tool: 'select',     // 'select' | 'connect' | 'delete'

  // connect flow
  connectStep:   0,   // 0 = idle, 1 = source selected
  connectSource: null, // { type, id }
  pendingConn:   null, // { entityId, assocId }

  selected: null,     // { type, id }

  // editing
  editEntityId: null,
  editAssocId:  null,
};

// ── DOM shortcuts ─────────────────────────────────────────────
const svg        = document.getElementById('canvas');
const layerConn  = document.getElementById('connections-layer');
const layerElems = document.getElementById('elements-layer');
const viewport   = document.getElementById('viewport');
const appRoot    = document.getElementById('app');
const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
const sidebarBackdrop     = document.getElementById('sidebar-backdrop');
const sidebarCloseBtn     = document.getElementById('sidebar-close');

const mobileBreakpoint = window.matchMedia('(max-width: 980px)');

function isMobileViewport() {
  return mobileBreakpoint.matches;
}

function setSidebarOpen(isOpen) {
  appRoot.classList.toggle('sidebar-open', isOpen);
  document.body.classList.toggle('sidebar-open', isOpen);
  sidebarBackdrop.classList.toggle('hidden', !isOpen);
}

function closeSidebarIfMobile() {
  if (isMobileViewport()) setSidebarOpen(false);
}

mobileSidebarToggle?.addEventListener('click', () => {
  setSidebarOpen(!appRoot.classList.contains('sidebar-open'));
});

sidebarCloseBtn?.addEventListener('click', () => {
  setSidebarOpen(false);
});

sidebarBackdrop?.addEventListener('click', () => {
  setSidebarOpen(false);
});

mobileBreakpoint.addEventListener('change', event => {
  if (!event.matches) setSidebarOpen(false);
});

document.querySelectorAll('#sidebar .btn, #sidebar a').forEach(element => {
  element.addEventListener('click', () => {
    if (element.id !== 'sidebar-close') closeSidebarIfMobile();
  });
});

// ── Zoom / Pan state ─────────────────────────────────────────
const camera = {
  zoom: 1,
  panX: 0,
  panY: 0,
  MIN_ZOOM: 0.15,
  MAX_ZOOM: 4,
};

function applyCamera() {
  viewport.setAttribute('transform',
    `translate(${camera.panX},${camera.panY}) scale(${camera.zoom})`);
  const pct = Math.round(camera.zoom * 100);
  document.getElementById('zoom-label').textContent = pct + '%';
}

function zoomAround(newZoom, pivotX, pivotY) {
  // pivotX/Y are in SVG client coordinates (before zoom)
  newZoom = Math.min(camera.MAX_ZOOM, Math.max(camera.MIN_ZOOM, newZoom));
  const scale = newZoom / camera.zoom;
  camera.panX = pivotX + (camera.panX - pivotX) * scale;
  camera.panY = pivotY + (camera.panY - pivotY) * scale;
  camera.zoom = newZoom;
  applyCamera();
}
// ── Utilities ────────────────────────────────────────────────
function uid() { return state.nextId++; }

function getEntity(id) { return state.entities.find(e => e.id === id); }
function getAssoc(id)  { return state.associations.find(a => a.id === id); }

function entHeight(ent) {
  return ENT_HDR_H + Math.max(1, ent.attributes.length) * ENT_ROW_H;
}

/** Center point of an entity */
function entCenter(ent) {
  return { x: ent.x + ENT_W / 2, y: ent.y + entHeight(ent) / 2 };
}

/** Intersection of line from entity center toward (tx,ty) with the entity border */
function entBorder(ent, tx, ty) {
  const cx = ent.x + ENT_W / 2;
  const cy = ent.y + entHeight(ent) / 2;
  const dx = tx - cx, dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const sx = Math.abs(dx) > 0 ? (ENT_W / 2) / Math.abs(dx) : Infinity;
  const sy = Math.abs(dy) > 0 ? (entHeight(ent) / 2) / Math.abs(dy) : Infinity;
  const s  = Math.min(sx, sy);
  return { x: cx + dx * s, y: cy + dy * s };
}

/** Intersection of line from assoc center toward (tx,ty) with the circle border */
function ascBorder(asc, tx, ty) {
  const dx = tx - asc.x, dy = ty - asc.y;
  if (dx === 0 && dy === 0) return { x: asc.x, y: asc.y };
  const len = Math.hypot(dx, dy) || 1;
  return { x: asc.x + (dx / len) * ASC_R, y: asc.y + (dy / len) * ASC_R };
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function svgPt(e) {
  const r = svg.getBoundingClientRect();
  return {
    x: (e.clientX - r.left - camera.panX) / camera.zoom,
    y: (e.clientY - r.top  - camera.panY) / camera.zoom,
  };
}

// Raw SVG-client coordinates (ignores zoom/pan) — used for zoomAround pivot
function svgRawPt(e) {
  const r = svg.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function svgEl(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

// ── Rendering ────────────────────────────────────────────────
function render() {
  renderConnections();
  renderElements();
}

function renderElements() {
  layerElems.innerHTML = '';
  state.associations.forEach(drawAssoc);
  state.entities.forEach(drawEntity);

  // Re-apply connect highlight after re-render
  if (state.tool === 'connect' && state.connectStep === 1 && state.connectSource) {
    const { type, id } = state.connectSource;
    const sel = layerElems.querySelector(`[data-type="${type}"][data-id="${id}"]`);
    if (sel) sel.classList.add('highlight');
  }
}

function drawEntity(ent) {
  const h   = entHeight(ent);
  const sel = state.selected?.type === 'entity' && state.selected?.id === ent.id;

  const g = svgEl('g');
  g.setAttribute('class', `entity-group${sel ? ' selected' : ''}`);
  g.setAttribute('transform', `translate(${ent.x},${ent.y})`);
  g.dataset.type = 'entity';
  g.dataset.id   = ent.id;

  // Drop shadow
  const shadow = svgEl('rect');
  shadow.setAttribute('width', ENT_W); shadow.setAttribute('height', h);
  shadow.setAttribute('rx', '5'); shadow.setAttribute('ry', '5');
  shadow.setAttribute('fill', 'rgba(0,0,0,0.12)');
  shadow.setAttribute('transform', 'translate(3,3)');
  g.appendChild(shadow);

  // Body (full rounded rect)
  const body = svgEl('rect');
  body.setAttribute('class', 'entity-body');
  body.setAttribute('width', ENT_W); body.setAttribute('height', h);
  body.setAttribute('rx', '5'); body.setAttribute('ry', '5');
  g.appendChild(body);

  // Header background (top rounded, bottom square)
  const hdr = svgEl('rect');
  hdr.setAttribute('class', 'entity-header');
  hdr.setAttribute('width', ENT_W); hdr.setAttribute('height', ENT_HDR_H);
  hdr.setAttribute('rx', '5'); hdr.setAttribute('ry', '5');
  g.appendChild(hdr);

  // Square the bottom corners of header
  const hdrFix = svgEl('rect');
  hdrFix.setAttribute('class', 'entity-header');
  hdrFix.setAttribute('y', ENT_HDR_H / 2);
  hdrFix.setAttribute('width', ENT_W); hdrFix.setAttribute('height', ENT_HDR_H / 2);
  g.appendChild(hdrFix);

  // Entity name
  const nameText = svgEl('text');
  nameText.setAttribute('class', 'entity-name-text');
  nameText.setAttribute('x', ENT_W / 2); nameText.setAttribute('y', ENT_HDR_H / 2);
  nameText.textContent = ent.name;
  g.appendChild(nameText);

  // Header bottom divider
  const hdiv = svgEl('line');
  hdiv.setAttribute('class', 'entity-divider');
  hdiv.setAttribute('x1', 0);  hdiv.setAttribute('y1', ENT_HDR_H);
  hdiv.setAttribute('x2', ENT_W); hdiv.setAttribute('y2', ENT_HDR_H);
  g.appendChild(hdiv);

  // Attributes
  if (ent.attributes.length === 0) {
    const ph = svgEl('text');
    ph.setAttribute('class', 'entity-attr-text');
    ph.setAttribute('x', 8); ph.setAttribute('y', ENT_HDR_H + ENT_ROW_H / 2);
    ph.setAttribute('fill', '#bbb'); ph.textContent = 'Double-clic pour éditer';
    g.appendChild(ph);
  } else {
    ent.attributes.forEach((attr, i) => {
      const y = ENT_HDR_H + i * ENT_ROW_H + ENT_ROW_H / 2;

      // Row divider (except first)
      if (i > 0) {
        const rdiv = svgEl('line');
        rdiv.setAttribute('class', 'entity-divider');
        rdiv.setAttribute('x1', 0); rdiv.setAttribute('y1', ENT_HDR_H + i * ENT_ROW_H);
        rdiv.setAttribute('x2', ENT_W); rdiv.setAttribute('y2', ENT_HDR_H + i * ENT_ROW_H);
        g.appendChild(rdiv);
      }

      const t = svgEl('text');
      t.setAttribute('class', attr.isPK ? 'entity-pk-text' : 'entity-attr-text');
      t.setAttribute('x', 10); t.setAttribute('y', y);
      t.textContent = (attr.isPK ? '# ' : '- ') + attr.name + ' : ' + attr.type;
      g.appendChild(t);
    });
  }

  layerElems.appendChild(g);
}

function drawAssoc(asc) {
  const sel = state.selected?.type === 'assoc' && state.selected?.id === asc.id;

  const g = svgEl('g');
  g.setAttribute('class', `assoc-group${sel ? ' selected' : ''}`);
  g.setAttribute('transform', `translate(${asc.x},${asc.y})`);
  g.dataset.type = 'assoc';
  g.dataset.id   = asc.id;

  // Drop shadow
  const shdw = svgEl('circle');
  shdw.setAttribute('cx', '3');
  shdw.setAttribute('cy', '3');
  shdw.setAttribute('r', ASC_R);
  shdw.setAttribute('fill', 'rgba(0,0,0,0.12)');
  g.appendChild(shdw);

  // Circle
  const d = svgEl('circle');
  d.setAttribute('class', 'assoc-diamond');
  d.setAttribute('cx', '0');
  d.setAttribute('cy', '0');
  d.setAttribute('r', ASC_R);
  g.appendChild(d);

  // Name text (supports two lines if too long)
  const words = asc.name.split(/[\s_]+/);
  if (words.length > 1 && asc.name.length > 10) {
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    const t1 = svgEl('text');
    t1.setAttribute('class', 'assoc-text'); t1.setAttribute('x', 0); t1.setAttribute('y', -8);
    t1.textContent = line1; g.appendChild(t1);
    const t2 = svgEl('text');
    t2.setAttribute('class', 'assoc-text'); t2.setAttribute('x', 0); t2.setAttribute('y', 8);
    t2.textContent = line2; g.appendChild(t2);
  } else {
    const t = svgEl('text');
    t.setAttribute('class', 'assoc-text'); t.setAttribute('x', 0); t.setAttribute('y', 0);
    t.textContent = asc.name; g.appendChild(t);
  }

  layerElems.appendChild(g);
}

function renderConnections() {
  layerConn.innerHTML = '';

  state.connections.forEach(conn => {
    const asc = getAssoc(conn.assocId);
    const ent = getEntity(conn.entityId);
    if (!asc || !ent) return;

    const ac  = { x: asc.x, y: asc.y };
    const ec  = entCenter(ent);
    const ep  = entBorder(ent, ac.x, ac.y);
    const ap  = ascBorder(asc, ec.x, ec.y);

    // Line
    const line = svgEl('line');
    line.setAttribute('class', 'conn-line');
    line.setAttribute('x1', ep.x); line.setAttribute('y1', ep.y);
    line.setAttribute('x2', ap.x); line.setAttribute('y2', ap.y);
    line.dataset.type = 'connection';
    line.dataset.id   = conn.id;
    layerConn.appendChild(line);

    // Cardinality label near entity
    const lx = ep.x + (ap.x - ep.x) * 0.18;
    const ly = ep.y + (ap.y - ep.y) * 0.18;
    // Perpendicular offset so label doesn't sit on the line
    const len   = Math.hypot(ap.x - ep.x, ap.y - ep.y) || 1;
    const nx    = -(ap.y - ep.y) / len * 12;
    const ny    =  (ap.x - ep.x) / len * 12;

    const card = svgEl('text');
    card.setAttribute('class', 'card-text');
    card.setAttribute('x', lx + nx); card.setAttribute('y', ly + ny);
    card.textContent = conn.cardinality;
    layerConn.appendChild(card);
  });
}

// ── Drag & Drop + Pan ────────────────────────────────────────
let drag    = null; // { type, id, ox, oy, sx, sy }  — element drag
let panning = null; // { startX, startY, startPanX, startPanY } — canvas pan

svg.addEventListener('mousedown', e => {
  const tgt = e.target.closest('[data-type="entity"],[data-type="assoc"]');

  // ── Click on background → start panning (select tool only)
  if (!tgt) {
    if (state.tool === 'select') {
      e.preventDefault();
      panning = {
        startX:    e.clientX,
        startY:    e.clientY,
        startPanX: camera.panX,
        startPanY: camera.panY,
      };
    }
    return;
  }

  const type = tgt.dataset.type;
  const id   = parseInt(tgt.dataset.id);

  if (state.tool === 'delete') {
    doDelete(type, id);
    return;
  }

  if (state.tool === 'connect') {
    handleConnect(type, id);
    return;
  }

  // select + drag element
  e.preventDefault();
  state.selected = { type, id };
  const pt  = svgPt(e);
  const obj = type === 'entity' ? getEntity(id) : getAssoc(id);
  drag = { type, id, sx: pt.x, sy: pt.y, ox: obj.x, oy: obj.y };
  render();
});

svg.addEventListener('mousemove', e => {
  if (panning) {
    camera.panX = panning.startPanX + (e.clientX - panning.startX);
    camera.panY = panning.startPanY + (e.clientY - panning.startY);
    applyCamera();
    return;
  }
  if (!drag) return;
  const pt = svgPt(e);
  const dx = pt.x - drag.sx, dy = pt.y - drag.sy;
  const obj = drag.type === 'entity' ? getEntity(drag.id) : getAssoc(drag.id);
  if (!obj) return;
  obj.x = Math.max(0, drag.ox + dx);
  obj.y = Math.max(0, drag.oy + dy);
  render();
});

svg.addEventListener('mouseup',    () => { drag = null; panning = null; });
svg.addEventListener('mouseleave', () => { drag = null; panning = null; });

// ── Zoom : molette ───────────────────────────────────────────
svg.addEventListener('wheel', e => {
  e.preventDefault();
  const pivot = svgRawPt(e);
  const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
  zoomAround(camera.zoom * factor, pivot.x, pivot.y);
}, { passive: false });

// ── Zoom : pinch tactile ──────────────────────────────────────
let lastPinchDist = null;
svg.addEventListener('touchstart', e => {
  if (e.touches.length === 2) lastPinchDist = Math.hypot(
    e.touches[0].clientX - e.touches[1].clientX,
    e.touches[0].clientY - e.touches[1].clientY
  );
}, { passive: true });
svg.addEventListener('touchmove', e => {
  if (e.touches.length !== 2 || lastPinchDist === null) return;
  const dist = Math.hypot(
    e.touches[0].clientX - e.touches[1].clientX,
    e.touches[0].clientY - e.touches[1].clientY
  );
  const r   = svg.getBoundingClientRect();
  const mx  = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
  const my  = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
  zoomAround(camera.zoom * (dist / lastPinchDist), mx, my);
  lastPinchDist = dist;
}, { passive: true });
svg.addEventListener('touchend', () => { lastPinchDist = null; }, { passive: true });

// ── Zoom : boutons de contrôle ────────────────────────────────
document.getElementById('btn-zoom-in').addEventListener('click', () => {
  const r = svg.getBoundingClientRect();
  zoomAround(camera.zoom * 1.25, r.width / 2, r.height / 2);
});
document.getElementById('btn-zoom-out').addEventListener('click', () => {
  const r = svg.getBoundingClientRect();
  zoomAround(camera.zoom / 1.25, r.width / 2, r.height / 2);
});
document.getElementById('btn-zoom-fit').addEventListener('click', fitToContent);

/**
 * Centre et adapte le zoom pour que tous les éléments soient visibles.
 * Si le canvas est vide, réinitialise la caméra.
 */
function fitToContent() {
  const all = [...state.entities, ...state.associations];
  if (all.length === 0) {
    camera.zoom = 1; camera.panX = 0; camera.panY = 0;
    applyCamera(); return;
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  state.entities.forEach(ent => {
    minX = Math.min(minX, ent.x);
    minY = Math.min(minY, ent.y);
    maxX = Math.max(maxX, ent.x + ENT_W);
    maxY = Math.max(maxY, ent.y + entHeight(ent));
  });
  state.associations.forEach(asc => {
    minX = Math.min(minX, asc.x - ASC_R);
    minY = Math.min(minY, asc.y - ASC_R);
    maxX = Math.max(maxX, asc.x + ASC_R);
    maxY = Math.max(maxY, asc.y + ASC_R);
  });

  const r       = svg.getBoundingClientRect();
  const pad     = 60;
  const contentW = maxX - minX + pad * 2;
  const contentH = maxY - minY + pad * 2;
  const newZoom  = Math.min(
    camera.MAX_ZOOM,
    Math.max(camera.MIN_ZOOM, Math.min(r.width / contentW, r.height / contentH))
  );
  camera.zoom = newZoom;
  camera.panX = (r.width  - contentW * newZoom) / 2 - (minX - pad) * newZoom;
  camera.panY = (r.height - contentH * newZoom) / 2 - (minY - pad) * newZoom;
  applyCamera();
}

// ── Zoom : raccourcis clavier ─────────────────────────────────
// (géré dans le bloc keydown ci-dessous)

svg.addEventListener('dblclick', e => {
  const tgt = e.target.closest('[data-type="entity"],[data-type="assoc"]');
  if (!tgt) return;
  const type = tgt.dataset.type;
  const id   = parseInt(tgt.dataset.id);
  if (type === 'entity') openEntityModal(id);
  else openAssocModal(id);
});

// Deselect on background click
svg.addEventListener('click', e => {
  const tgt = e.target.closest('[data-type]');
  if (!tgt) {
    if (state.tool === 'connect' && state.connectStep === 1) {
      cancelConnect();
    } else {
      state.selected = null;
      render();
    }
  }
});

// ── Keyboard ─────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  // Don't intercept shortcuts when typing in inputs/textareas
  if (document.activeElement.matches('input,textarea,select')) return;

  const r = svg.getBoundingClientRect();
  const cx = r.width / 2, cy = r.height / 2;

  if (e.key === 'Escape') {
    cancelConnect();
    state.selected = null;
    render();
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (state.selected) {
      doDelete(state.selected.type, state.selected.id);
      state.selected = null;
    }
  } else if (e.key === '=' || e.key === '+') {
    zoomAround(camera.zoom * 1.25, cx, cy);
  } else if (e.key === '-') {
    zoomAround(camera.zoom / 1.25, cx, cy);
  } else if (e.key === '0') {
    camera.zoom = 1; camera.panX = 0; camera.panY = 0; applyCamera();
  } else if (e.key === 'f' || e.key === 'F') {
    fitToContent();
  }
});

// ── Connect Logic ─────────────────────────────────────────────
function handleConnect(type, id) {
  if (state.connectStep === 0) {
    state.connectStep  = 1;
    state.connectSource = { type, id };
    updateHint();
    renderElements(); // will apply highlight
  } else {
    const src   = state.connectSource;
    state.connectStep   = 0;
    state.connectSource = null;

    let entityId, assocId;
    if (src.type === 'entity' && type === 'assoc') {
      entityId = src.id; assocId = id;
    } else if (src.type === 'assoc' && type === 'entity') {
      assocId = src.id; entityId = id;
    } else {
      showToast('Connectez une entité à une association.');
      updateHint();
      render();
      return;
    }

    if (state.connections.find(c => c.assocId === assocId && c.entityId === entityId)) {
      showToast('Cette connexion existe déjà.');
      updateHint();
      render();
      return;
    }

    state.pendingConn = { entityId, assocId };
    updateHint();
    render();
    openCardinalityModal();
  }
}

function cancelConnect() {
  state.connectStep   = 0;
  state.connectSource = null;
  updateHint();
  render();
}

// ── Delete ───────────────────────────────────────────────────
function doDelete(type, id) {
  if (type === 'entity') {
    state.entities    = state.entities.filter(e => e.id !== id);
    state.connections = state.connections.filter(c => c.entityId !== id);
  } else if (type === 'assoc') {
    state.associations = state.associations.filter(a => a.id !== id);
    state.connections  = state.connections.filter(c => c.assocId !== id);
  } else if (type === 'connection') {
    state.connections = state.connections.filter(c => c.id !== id);
  }
  render();
}

// ── Toolbar Buttons ───────────────────────────────────────────
document.getElementById('btn-add-entity').addEventListener('click', () => {
  const id  = uid();
  const r   = svg.getBoundingClientRect();
  const x   = Math.round(r.width  / 2 - ENT_W / 2 + randOff());
  const y   = Math.round(r.height / 2 - 60 + randOff());
  state.entities.push({
    id, name: 'ENTITE_' + id,
    x: Math.max(10, x), y: Math.max(10, y),
    attributes: [{ name: 'id', type: 'INT', isPK: true }],
  });
  state.selected = { type: 'entity', id };
  render();
  openEntityModal(id);
});

document.getElementById('btn-add-association').addEventListener('click', () => {
  const id = uid();
  const r  = svg.getBoundingClientRect();
  const x  = Math.round(r.width  / 2 + randOff());
  const y  = Math.round(r.height / 2 + randOff());
  state.associations.push({
    id, name: 'ASSOC_' + id,
    x: Math.max(ASC_R + 10, x), y: Math.max(ASC_R + 10, y),
  });
  render();
  openAssocModal(id);
});

document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.tool = btn.dataset.tool;
    cancelConnect();
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (state.tool !== 'select') { state.selected = null; render(); }
    updateHint();
  });
});

function randOff() { return (Math.random() - 0.5) * 120; }

function updateHint() {
  const el = document.getElementById('tool-hint');
  if (state.tool === 'select') {
    el.textContent = 'Cliquez pour sélectionner. Glissez pour déplacer. Double-clic pour éditer.';
  } else if (state.tool === 'delete') {
    el.textContent = 'Cliquez sur un élément pour le supprimer.';
  } else if (state.tool === 'connect') {
    if (state.connectStep === 0) {
      el.textContent = 'Étape 1 : cliquez sur une entité ou une association.';
    } else {
      const src = state.connectSource;
      const name = src.type === 'entity'
        ? getEntity(src.id)?.name
        : getAssoc(src.id)?.name;
      el.textContent = `Étape 2 : connecter "${name}" — cliquez sur la cible.`;
    }
  }
}

// ── Modal : Entité ────────────────────────────────────────────
function openEntityModal(id) {
  state.editEntityId = id;
  const ent = getEntity(id);
  if (!ent) return;
  document.getElementById('entity-name-input').value = ent.name;
  renderAttrList(ent.attributes);
  document.getElementById('modal-entity').classList.remove('hidden');
  document.getElementById('entity-name-input').focus();
}

function renderAttrList(attrs) {
  const list = document.getElementById('attributes-list');
  list.innerHTML = '';
  attrs.forEach((attr, i) => {
    const row = document.createElement('div');
    row.className = 'attr-row';
    row.innerHTML = `
      <input class="attr-name" type="text" value="${escHtml(attr.name)}" placeholder="Nom">
      <select class="attr-type">
        ${ATTR_TYPES.map(t => `<option${t === attr.type ? ' selected' : ''}>${escHtml(t)}</option>`).join('')}
      </select>
      <label class="pk-label">
        <input class="attr-pk" type="checkbox"${attr.isPK ? ' checked' : ''}> PK
      </label>
      <button class="btn-rm" data-i="${i}" title="Supprimer">&times;</button>
    `;
    list.appendChild(row);
  });
  list.querySelectorAll('.btn-rm').forEach(btn => {
    btn.addEventListener('click', () => {
      const ent = getEntity(state.editEntityId);
      if (ent) { ent.attributes.splice(parseInt(btn.dataset.i), 1); renderAttrList(ent.attributes); }
    });
  });
}

document.getElementById('btn-add-attr').addEventListener('click', () => {
  const ent = getEntity(state.editEntityId);
  if (!ent) return;
  ent.attributes.push({ name: 'attr' + (ent.attributes.length + 1), type: 'VARCHAR(50)', isPK: false });
  renderAttrList(ent.attributes);
});

document.getElementById('btn-entity-save').addEventListener('click', saveEntityModal);
document.getElementById('btn-entity-cancel').addEventListener('click', closeEntityModal);

function saveEntityModal() {
  const ent = getEntity(state.editEntityId);
  if (!ent) return;
  ent.name = document.getElementById('entity-name-input').value.trim() || ent.name;
  ent.attributes = Array.from(document.querySelectorAll('#attributes-list .attr-row')).map(row => ({
    name:  row.querySelector('.attr-name').value.trim() || 'attr',
    type:  row.querySelector('.attr-type').value,
    isPK:  row.querySelector('.attr-pk').checked,
  }));
  closeEntityModal();
  render();
}

function closeEntityModal() {
  document.getElementById('modal-entity').classList.add('hidden');
  state.editEntityId = null;
}

// ── Modal : Association ───────────────────────────────────────
function openAssocModal(id) {
  state.editAssocId = id;
  const asc = getAssoc(id);
  if (!asc) return;
  document.getElementById('assoc-name-input').value = asc.name;
  renderConnList(id);
  document.getElementById('modal-assoc').classList.remove('hidden');
  document.getElementById('assoc-name-input').focus();
}

function renderConnList(assocId) {
  const list  = document.getElementById('assoc-connections-list');
  const conns = state.connections.filter(c => c.assocId === assocId);
  list.innerHTML = '';
  if (conns.length === 0) {
    list.innerHTML = '<p style="font-size:12px;color:#aaa;margin-bottom:6px;">Aucune connexion — utilisez l\'outil ⇒ Connecter.</p>';
    return;
  }
  const label = document.createElement('p');
  label.style.cssText = 'font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:#888;margin-bottom:8px';
  label.textContent = 'Connexions';
  list.appendChild(label);
  conns.forEach(conn => {
    const ent = getEntity(conn.entityId);
    const row = document.createElement('div');
    row.className = 'conn-row';
    row.innerHTML = `
      <span>${escHtml(ent?.name ?? '?')}</span>
      <select data-cid="${conn.id}">
        ${['0,1','1,1','0,N','1,N'].map(v => `<option${v === conn.cardinality ? ' selected' : ''}>${v}</option>`).join('')}
      </select>
      <button class="btn-rm" data-cid="${conn.id}" title="Supprimer">&times;</button>
    `;
    list.appendChild(row);
  });
  list.querySelectorAll('.btn-rm').forEach(btn => {
    btn.addEventListener('click', () => {
      state.connections = state.connections.filter(c => c.id !== parseInt(btn.dataset.cid));
      renderConnList(assocId);
    });
  });
}

document.getElementById('btn-assoc-save').addEventListener('click', saveAssocModal);
document.getElementById('btn-assoc-cancel').addEventListener('click', closeAssocModal);

function saveAssocModal() {
  const asc = getAssoc(state.editAssocId);
  if (!asc) return;
  asc.name = document.getElementById('assoc-name-input').value.trim() || asc.name;
  document.querySelectorAll('#assoc-connections-list select[data-cid]').forEach(sel => {
    const conn = state.connections.find(c => c.id === parseInt(sel.dataset.cid));
    if (conn) conn.cardinality = sel.value;
  });
  closeAssocModal();
  render();
}

function closeAssocModal() {
  document.getElementById('modal-assoc').classList.add('hidden');
  state.editAssocId = null;
}

// ── Modal : Cardinalité ───────────────────────────────────────
function openCardinalityModal() {
  document.getElementById('cardinality-select').value = '1,1';
  document.getElementById('modal-cardinality').classList.remove('hidden');
}

document.getElementById('btn-card-ok').addEventListener('click', () => {
  if (!state.pendingConn) return;
  const cardinality = document.getElementById('cardinality-select').value;
  state.connections.push({
    id: uid(),
    assocId:     state.pendingConn.assocId,
    entityId:    state.pendingConn.entityId,
    cardinality,
  });
  state.pendingConn = null;
  document.getElementById('modal-cardinality').classList.add('hidden');
  render();
});

document.getElementById('btn-card-cancel').addEventListener('click', () => {
  state.pendingConn = null;
  document.getElementById('modal-cardinality').classList.add('hidden');
  render();
});

// ── Modal : SQL ───────────────────────────────────────────────
document.getElementById('btn-export-sql').addEventListener('click', () => {
  document.getElementById('sql-output').value = generateSQL();
  document.getElementById('modal-sql').classList.remove('hidden');
});

document.getElementById('btn-sql-copy').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('sql-output').value)
    .then(() => showToast('SQL copié dans le presse-papiers !'));
});

document.getElementById('btn-sql-download').addEventListener('click', () => {
  downloadBlob('schema.sql', document.getElementById('sql-output').value, 'text/plain');
});

document.getElementById('btn-sql-close').addEventListener('click', () => {
  document.getElementById('modal-sql').classList.add('hidden');
});

// ── SQL Generation ────────────────────────────────────────────

/**
 * Convertit un nom arbitraire en identifiant SQL snake_case valide.
 * Ex : "Mon Entité 2" → "mon_entite_2"
 */
function toSqlName(str) {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')                        // remplace tout caractère non-alphanum par _
    .replace(/^_+|_+$/g, '');                           // supprime les _ de début/fin
}

/**
 * Retourne la clé primaire (premier attribut isPK) d'une entité,
 * ou une valeur par défaut {name:'id', type:'INT'}.
 */
function getPK(ent) {
  return ent.attributes.find(a => a.isPK) ?? { name: 'id', type: 'INT' };
}

/**
 * Analyse les connexions d'une association et retourne son « type ».
 *
 * Chaque connexion a une cardinality du côté entité :
 *   - max = 1  si cardinalité '0,1' ou '1,1'
 *   - max = N  si cardinalité '0,N' ou '1,N'
 *
 * Règle MCD → MLD :
 *   - Si TOUTES les cardinalités max sont 1 (rare, erreur de modèle) → on traite comme binaire
 *   - Si UNE SEULE cardinalité max est N → la FK va dans la table côté max=1
 *   - Si PLUSIEURS cardinalités max sont N → table de jonction
 */
function analyzeAssoc(assocId) {
  const conns = state.connections.filter(c => c.assocId === assocId);
  if (conns.length < 2) return { type: 'skip', conns };

  const maxN = conns.filter(c => c.cardinality === '0,N' || c.cardinality === '1,N');
  const max1 = conns.filter(c => c.cardinality === '0,1' || c.cardinality === '1,1');

  if (maxN.length >= 2) return { type: 'junction', conns, maxN, max1 };
  if (maxN.length === 1) return { type: 'fk',       conns, maxN, max1 };
  return { type: 'fk', conns, maxN: [], max1: conns }; // tous max=1 → FK dans la première table
}

/**
 * Génère le script SQL complet depuis l'état courant du MCD.
 */
function generateSQL() {
  const lines = [];

  lines.push('-- ============================================================');
  lines.push('-- Script SQL généré par MCD Creator');
  lines.push('-- ' + new Date().toLocaleString('fr-FR'));
  lines.push('-- ============================================================');
  lines.push('');

  // ── 1. Tables des entités ──────────────────────────────────
  // Collecte des FK à injecter par entité (pour les relations type 'fk')
  // Map<entId, [{colName, colType, refTable, refCol, nullable}]>
  const fkByEntity = new Map();
  state.entities.forEach(e => fkByEntity.set(e.id, []));

  // Analyse toutes les associations pour pré-calculer les FK
  state.associations.forEach(asc => {
    const analysis = analyzeAssoc(asc.id);
    if (analysis.type !== 'fk') return;

    const { conns, maxN, max1 } = analysis;

    // La FK est portée par l'entité côté max=1 (ou la première si aucun max=N)
    const fkConns  = max1.length > 0 ? max1 : [conns[0]];
    const refConns = conns.filter(c => !fkConns.includes(c));

    fkConns.forEach(fc => {
      const fkEnt = getEntity(fc.entityId);
      if (!fkEnt) return;
      refConns.forEach(rc => {
        const refEnt = getEntity(rc.entityId);
        if (!refEnt) return;
        const pk = getPK(refEnt);
        fkByEntity.get(fkEnt.id)?.push({
          colName:  toSqlName(refEnt.name) + '_' + toSqlName(pk.name),
          colType:  pk.type,
          refTable: toSqlName(refEnt.name),
          refCol:   toSqlName(pk.name),
          nullable: fc.cardinality === '0,1',
          assocName: asc.name,
        });
      });
    });
  });

  // Génère les CREATE TABLE des entités
  state.entities.forEach(ent => {
    const tbl  = toSqlName(ent.name);
    const cols = [];
    const pks  = [];
    const fks  = [];

    // Colonnes propres
    ent.attributes.forEach(attr => {
      const col      = toSqlName(attr.name);
      const notNull  = attr.isPK ? ' NOT NULL' : '';
      cols.push(`  ${col} ${attr.type}${notNull}`);
      if (attr.isPK) pks.push(col);
    });

    // Colonnes FK injectées
    (fkByEntity.get(ent.id) ?? []).forEach(fk => {
      const nullStr = fk.nullable ? '' : ' NOT NULL';
      cols.push(`  ${fk.colName} ${fk.colType}${nullStr}`);
      fks.push(`  CONSTRAINT fk_${tbl}_${fk.refTable}\n    FOREIGN KEY (${fk.colName})\n    REFERENCES ${fk.refTable} (${fk.refCol})\n    ON DELETE ${fk.nullable ? 'SET NULL' : 'CASCADE'}`);
    });

    if (pks.length) cols.push(`  PRIMARY KEY (${pks.join(', ')})`);
    fks.forEach(f => cols.push(f));

    lines.push(`-- Entité : ${ent.name}`);
    lines.push(`CREATE TABLE IF NOT EXISTS ${tbl} (`);
    lines.push(cols.join(',\n'));
    lines.push(');');
    lines.push('');
  });

  // ── 2. Tables de jonction (N,N) ───────────────────────────
  state.associations.forEach(asc => {
    const analysis = analyzeAssoc(asc.id);
    if (analysis.type !== 'junction') return;

    const { conns } = analysis;
    const junctionName = toSqlName(asc.name);
    const cols = [];
    const pkCols = [];
    const fks  = [];

    conns.forEach(conn => {
      const ent = getEntity(conn.entityId);
      if (!ent) return;
      const pk      = getPK(ent);
      const colName = toSqlName(ent.name) + '_' + toSqlName(pk.name);
      const notNull = conn.cardinality === '1,N' ? ' NOT NULL' : '';
      cols.push(`  ${colName} ${pk.type}${notNull}`);
      pkCols.push(colName);
      fks.push(`  CONSTRAINT fk_${junctionName}_${toSqlName(ent.name)}\n    FOREIGN KEY (${colName})\n    REFERENCES ${toSqlName(ent.name)} (${toSqlName(pk.name)})\n    ON DELETE CASCADE`);
    });

    cols.push(`  PRIMARY KEY (${pkCols.join(', ')})`);
    fks.forEach(f => cols.push(f));

    lines.push(`-- Association N,N : ${asc.name}`);
    lines.push(`CREATE TABLE IF NOT EXISTS ${junctionName} (`);
    lines.push(cols.join(',\n'));
    lines.push(');');
    lines.push('');
  });

  return lines.join('\n');
}

// ── Modal : close on overlay click ───────────────────────────
document.querySelectorAll('.modal-overlay[data-close]').forEach(overlay => {
  overlay.addEventListener('click', () => {
    document.getElementById(overlay.dataset.close).classList.add('hidden');
    if (overlay.dataset.close === 'modal-entity') closeEntityModal();
    if (overlay.dataset.close === 'modal-assoc')   closeAssocModal();
    if (overlay.dataset.close === 'modal-cardinality') { state.pendingConn = null; render(); }
  });
});

// ── Export SVG ────────────────────────────────────────────────
document.getElementById('btn-export-svg').addEventListener('click', () => {
  const clone = svg.cloneNode(true);
  const r = svg.getBoundingClientRect();
  clone.setAttribute('width', r.width);
  clone.setAttribute('height', r.height);
  const str = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  downloadBlob('mcd.svg', str, 'image/svg+xml');
});

// ── Export PNG ────────────────────────────────────────────────
document.getElementById('btn-export-png').addEventListener('click', () => {
  const r = svg.getBoundingClientRect();
  const w = r.width, h = r.height;
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', w); clone.setAttribute('height', h);
  const svgStr  = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url     = URL.createObjectURL(svgBlob);
  const img     = new Image();
  img.onload = () => {
    const scale = 2;
    const c = document.createElement('canvas');
    c.width = w * scale; c.height = h * scale;
    const ctx = c.getContext('2d');
    ctx.scale(scale, scale);
    ctx.fillStyle = '#f0f2f8';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    c.toBlob(blob => downloadBlob('mcd.png', blob, 'image/png'));
  };
  img.onerror = () => { URL.revokeObjectURL(url); showToast('Erreur export PNG'); };
  img.src = url;
});

// ── Save / Load JSON ──────────────────────────────────────────
document.getElementById('btn-save-json').addEventListener('click', () => {
  const data = {
    entities:     state.entities,
    associations: state.associations,
    connections:  state.connections,
    nextId:       state.nextId,
  };
  downloadBlob('mcd.json', JSON.stringify(data, null, 2), 'application/json');
});

document.getElementById('btn-load-json').addEventListener('click', () => {
  document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data.entities) || !Array.isArray(data.associations)) {
        showToast('Fichier JSON invalide.'); return;
      }
      state.entities     = data.entities;
      state.associations = data.associations;
      state.connections  = data.connections ?? [];
      state.nextId       = data.nextId ?? 1;
      state.selected     = null;
      render();
      showToast('Projet chargé avec succès !');
    } catch { showToast('Erreur lors du chargement.'); }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ── Clear ─────────────────────────────────────────────────────
document.getElementById('btn-clear').addEventListener('click', () => {
  if (!confirm('Effacer tout le diagramme ? Cette action est irréversible.')) return;
  state.entities = []; state.associations = []; state.connections = [];
  state.selected = null; state.nextId = 1;
  render();
});

// ── Helpers ───────────────────────────────────────────────────
function downloadBlob(name, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

function getCanvasSize() {
  const rect = svg.getBoundingClientRect();
  return {
    width: Math.max(900, rect.width || 900),
    height: Math.max(600, rect.height || 600),
  };
}

function autoLayoutDiagram(entities, associations, connections) {
  if (!entities.length) return;

  const { width, height } = getCanvasSize();
  const marginX = 80;
  const marginY = 70;
  const columnGap = 210;
  const rowGap = 54;
  const assocGap = 110;

  const entityById = new Map(entities.map(entity => [entity.id, entity]));
  const assocById = new Map(associations.map(association => [association.id, association]));

  const adjacency = new Map(entities.map(entity => [entity.id, new Set()]));
  connections.forEach(connection => {
    const assocConnections = connections.filter(item => item.assocId === connection.assocId);
    assocConnections.forEach(item => {
      if (item.entityId !== connection.entityId) {
        adjacency.get(connection.entityId)?.add(item.entityId);
      }
    });
  });

  const degrees = entities
    .map(entity => ({ id: entity.id, degree: adjacency.get(entity.id)?.size ?? 0 }))
    .sort((left, right) => right.degree - left.degree || left.id - right.id);

  const levels = new Map();
  const visited = new Set();
  const queue = [];

  const pushRoot = rootId => {
    if (visited.has(rootId)) return;
    visited.add(rootId);
    levels.set(rootId, 0);
    queue.push(rootId);
    while (queue.length) {
      const currentId = queue.shift();
      const currentLevel = levels.get(currentId) ?? 0;
      const neighbors = [...(adjacency.get(currentId) ?? [])]
        .sort((left, right) => (adjacency.get(right)?.size ?? 0) - (adjacency.get(left)?.size ?? 0) || left - right);
      neighbors.forEach(neighborId => {
        if (visited.has(neighborId)) return;
        visited.add(neighborId);
        levels.set(neighborId, currentLevel + 1);
        queue.push(neighborId);
      });
    }
  };

  degrees.forEach(({ id }) => pushRoot(id));

  const columns = new Map();
  entities.forEach(entity => {
    const level = levels.get(entity.id) ?? 0;
    if (!columns.has(level)) columns.set(level, []);
    columns.get(level).push(entity);
  });

  const orderedLevels = [...columns.keys()].sort((left, right) => left - right);
  orderedLevels.forEach(level => {
    columns.get(level).sort((left, right) => {
      const leftScore = [...(adjacency.get(left.id) ?? [])].reduce((sum, id) => sum + (levels.get(id) ?? 0), 0);
      const rightScore = [...(adjacency.get(right.id) ?? [])].reduce((sum, id) => sum + (levels.get(id) ?? 0), 0);
      return leftScore - rightScore || left.id - right.id;
    });
  });

  const totalWidth = orderedLevels.length
    ? (orderedLevels.length - 1) * columnGap + ENT_W
    : ENT_W;
  const startX = Math.max(marginX, (width - totalWidth) / 2);

  orderedLevels.forEach((level, columnIndex) => {
    const columnEntities = columns.get(level);
    const totalHeight = columnEntities.reduce((sum, entity, index) => {
      return sum + entHeight(entity) + (index > 0 ? rowGap : 0);
    }, 0);
    let cursorY = Math.max(marginY, (height - totalHeight) / 2);
    const x = startX + columnIndex * columnGap;
    columnEntities.forEach(entity => {
      entity.x = Math.round(x);
      entity.y = Math.round(cursorY);
      cursorY += entHeight(entity) + rowGap;
    });
  });

  associations.forEach(association => {
    const linkedEntities = connections
      .filter(connection => connection.assocId === association.id)
      .map(connection => entityById.get(connection.entityId))
      .filter(Boolean);

    if (!linkedEntities.length) {
      association.x = Math.round(width / 2);
      association.y = Math.round(height / 2);
      return;
    }

    const avgX = linkedEntities.reduce((sum, entity) => sum + entCenter(entity).x, 0) / linkedEntities.length;
    const avgY = linkedEntities.reduce((sum, entity) => sum + entCenter(entity).y, 0) / linkedEntities.length;

    let targetX = avgX;
    let targetY = avgY;

    if (linkedEntities.length === 2) {
      const [leftEntity, rightEntity] = linkedEntities;
      const leftCenter = entCenter(leftEntity);
      const rightCenter = entCenter(rightEntity);
      targetX = (leftCenter.x + rightCenter.x) / 2;
      targetY = (leftCenter.y + rightCenter.y) / 2;
      if (Math.abs(leftCenter.x - rightCenter.x) < 80) {
        targetX += assocGap;
      }
    }

    association.x = Math.round(targetX);
    association.y = Math.round(targetY);
  });

  const occupancy = [];
  associations.forEach(association => {
    let placed = false;
    for (let attempt = 0; attempt < 18 && !placed; attempt++) {
      const collision = occupancy.find(item => Math.hypot(item.x - association.x, item.y - association.y) < ASC_R * 2.4);
      if (!collision) {
        occupancy.push({ x: association.x, y: association.y });
        placed = true;
        break;
      }
      const angle = (attempt / 18) * Math.PI * 2;
      association.x = Math.round(collision.x + Math.cos(angle) * assocGap);
      association.y = Math.round(collision.y + Math.sin(angle) * (assocGap * 0.7));
    }
    if (!placed) occupancy.push({ x: association.x, y: association.y });
  });

  const bounds = getDiagramBounds(entities, associations);
  const shiftX = bounds.minX < marginX ? marginX - bounds.minX : 0;
  const shiftY = bounds.minY < marginY ? marginY - bounds.minY : 0;

  if (shiftX || shiftY) {
    entities.forEach(entity => {
      entity.x += Math.round(shiftX);
      entity.y += Math.round(shiftY);
    });
    associations.forEach(association => {
      association.x += Math.round(shiftX);
      association.y += Math.round(shiftY);
    });
  }

  const associationIds = new Set(associations.map(association => association.id));
  connections.forEach(connection => {
    if (!associationIds.has(connection.assocId)) return;
    const association = assocById.get(connection.assocId);
    const entity = entityById.get(connection.entityId);
    if (!association || !entity) return;
    const center = entCenter(entity);
    if (Math.hypot(center.x - association.x, center.y - association.y) < 30) {
      association.x += assocGap;
      association.y += Math.round(assocGap * 0.4);
    }
  });
}

function getDiagramBounds(entities, associations) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  entities.forEach(entity => {
    minX = Math.min(minX, entity.x);
    minY = Math.min(minY, entity.y);
    maxX = Math.max(maxX, entity.x + ENT_W);
    maxY = Math.max(maxY, entity.y + entHeight(entity));
  });

  associations.forEach(association => {
    minX = Math.min(minX, association.x - ASC_R);
    minY = Math.min(minY, association.y - ASC_R);
    maxX = Math.max(maxX, association.x + ASC_R);
    maxY = Math.max(maxY, association.y + ASC_R);
  });

  if (!entities.length && !associations.length) {
    minX = minY = 0;
    maxX = maxY = 0;
  }

  return { minX, minY, maxX, maxY };
}

// ── Import SQL ────────────────────────────────────────────────

document.getElementById('btn-import-sql').addEventListener('click', () => {
  document.getElementById('sql-import-input').value = '';
  document.getElementById('sql-import-error').classList.add('hidden');
  document.getElementById('modal-import-sql').classList.remove('hidden');
  document.getElementById('sql-import-input').focus();
});

document.getElementById('btn-import-sql-cancel').addEventListener('click', () => {
  document.getElementById('modal-import-sql').classList.add('hidden');
});

document.getElementById('btn-import-sql-file').addEventListener('click', () => {
  document.getElementById('sql-file-input').click();
});

document.getElementById('sql-file-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('sql-import-input').value = ev.target.result;
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('btn-import-sql-go').addEventListener('click', () => {
  const sql = document.getElementById('sql-import-input').value;
  const errBox = document.getElementById('sql-import-error');
  errBox.classList.add('hidden');

  try {
    const result = parseSQLtoMCD(sql);
    if (result.entities.length === 0) {
      errBox.textContent = 'Aucun CREATE TABLE trouvé dans le script.';
      errBox.classList.remove('hidden');
      return;
    }
    // Confirmation si le canvas n'est pas vide
    if ((state.entities.length > 0 || state.associations.length > 0) &&
        !confirm('Le canvas actuel sera remplacé. Continuer ?')) return;

    state.entities     = result.entities;
    state.associations = result.associations;
    state.connections  = result.connections;
    state.nextId       = result.nextId;
    state.selected     = null;

    document.getElementById('modal-import-sql').classList.add('hidden');
    autoLayoutDiagram(state.entities, state.associations, state.connections);
    render();
    fitToContent();
    showToast(`MCD généré : ${result.entities.length} entité(s), ${result.associations.length} association(s).`);
  } catch (err) {
    errBox.textContent = 'Erreur de parsing : ' + err.message;
    errBox.classList.remove('hidden');
  }
});

/**
 * Parse un script SQL (CREATE TABLE …) et retourne un état MCD prêt à être
 * injecté dans `state`.
 *
 * Stratégie :
 *  1. Extrait chaque bloc CREATE TABLE.
 *  2. Pour chaque table → une Entité avec ses colonnes/types/PK.
 *  3. Chaque FOREIGN KEY (col) REFERENCES autreTable(col) → Association + 2 Connexions.
 *     • La table qui porte la FK a cardinalité 0,1 ou 1,1 (selon NOT NULL).
 *     • La table référencée a cardinalité 1,N.
 *  4. Une mise en page automatique est appliquée après l'import.
 */
function parseSQLtoMCD(sql) {
  // ── Normalisation ────────────────────────────────────────
  // Supprime les commentaires -- et /* */
  const clean = sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n]*/g, '')
    .replace(/\r\n/g, '\n');

  // ── Extraction des blocs CREATE TABLE ────────────────────
  // Cherche CREATE [TEMPORARY] TABLE [IF NOT EXISTS] nom ( … );
  const tableRx = /CREATE\s+(?:TEMPORARY\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"\[]?[\w]+[`"\]]?)\s*\(([^;]*)\)\s*;?/gi;

  const tables = []; // [{ rawName, body }]
  let m;
  while ((m = tableRx.exec(clean)) !== null) {
    tables.push({
      rawName: m[1].replace(/[`"[\]]/g, ''),
      body:    m[2],
    });
  }

  if (tables.length === 0) return { entities: [], associations: [], connections: [], nextId: 1 };

  // ── Détection des tables de jonction (N,N) ───────────────
  // Une table de jonction a ≥ 2 FK et aucune (ou peu de) colonnes propres non-FK.
  // On les identifie après le premier passage pour ne pas créer d'entité pour elles.
  const fkMap   = new Map(); // tableName → [{col, refTable, refCol, notNull}]
  const colsMap = new Map(); // tableName → [{name, type, isPK, notNull}]
  const pkMap   = new Map(); // tableName → [colName]  (PK déclarée en contrainte)

  tables.forEach(t => {
    const name = t.rawName.toLowerCase();
    const fks  = [];
    const cols = [];
    const pks  = new Set();

    // Sépare les clauses de la table (attention aux parenthèses imbriquées dans les types)
    const clauses = splitClauses(t.body);

    clauses.forEach(clause => {
      const c = clause.trim();
      if (!c) return;

      // PRIMARY KEY (col1, col2, …) — contrainte de table
      const pkMatch = /^(?:CONSTRAINT\s+\S+\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i.exec(c);
      if (pkMatch) {
        pkMatch[1].split(',').forEach(col => pks.add(normCol(col)));
        return;
      }

      // FOREIGN KEY (col) REFERENCES ref_table (ref_col) [ON DELETE …] [ON UPDATE …]
      const fkMatch = /^(?:CONSTRAINT\s+\S+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([`"\[]?[\w]+[`"\]]?)\s*\(([^)]+)\)/i.exec(c);
      if (fkMatch) {
        fks.push({
          col:      normCol(fkMatch[1]),
          refTable: fkMatch[2].replace(/[`"[\]]/g, '').toLowerCase(),
          refCol:   normCol(fkMatch[3]),
        });
        return;
      }

      // Colonne ordinaire : nom type [NOT NULL] [PRIMARY KEY] [AUTO_INCREMENT] …
      const colMatch = /^([`"\[]?[\w]+[`"\]]?)\s+([\w]+(?:\s*\([^)]*\))?)/i.exec(c);
      if (colMatch) {
        const colName = normCol(colMatch[1]);
        const colType = normalizeType(colMatch[2]);
        const notNull = /NOT\s+NULL/i.test(c);
        const inlinePK = /PRIMARY\s+KEY/i.test(c);
        if (inlinePK) pks.add(colName);
        cols.push({ name: colName, type: colType, isPK: inlinePK, notNull });
      }
    });

    // Applique les PK de contrainte aux colonnes
    cols.forEach(col => {
      if (pks.has(col.name)) col.isPK = true;
    });

    fkMap.set(name, fks);
    colsMap.set(name, cols);
    pkMap.set(name, [...pks]);
  });

  // ── Identifie les tables de jonction ─────────────────────
  const junctionTables = new Set();
  fkMap.forEach((fks, name) => {
    if (fks.length < 2) return;
    const ownCols = (colsMap.get(name) ?? []).filter(c => !fks.some(fk => fk.col === c.name));
    // Considérée comme jonction si ≤ 1 colonne propre non-FK
    if (ownCols.length <= 1) junctionTables.add(name);
  });

  const entityTables = tables.filter(t => !junctionTables.has(t.rawName.toLowerCase()));
  const n = entityTables.length;

  let nextId = 1;
  const entities     = [];
  const associations = [];
  const connections  = [];

  // Crée les entités
  const entByTable = new Map(); // tableName → entity
  entityTables.forEach((t, i) => {
    const cols = colsMap.get(t.rawName.toLowerCase()) ?? [];
    // Retire les colonnes FK (elles deviennent des associations)
    const fks  = fkMap.get(t.rawName.toLowerCase()) ?? [];
    const fkCols = new Set(fks.map(f => f.col));
    const attrs = cols
      .filter(c => !fkCols.has(c.name))
      .map(c => ({ name: c.name, type: c.type, isPK: c.isPK }));

    // S'il n'y a aucun attribut PK, on en crée un par défaut
    if (!attrs.some(a => a.isPK)) {
      attrs.unshift({ name: 'id', type: 'INT', isPK: true });
    }

    const ent = {
      id:   nextId++,
      name: t.rawName.toUpperCase(),
      x:    80 + (i % Math.max(1, Math.ceil(Math.sqrt(n || 1)))) * 220,
      y:    80 + Math.floor(i / Math.max(1, Math.ceil(Math.sqrt(n || 1)))) * 160,
      attributes: attrs,
    };
    entities.push(ent);
    entByTable.set(t.rawName.toLowerCase(), ent);
  });

  // ── FK simples (1,N) ─────────────────────────────────────
  // Chaque FK dans une table non-jonction → Association entre les deux entités
  const assocKey = new Set(); // évite les doublons
  fkMap.forEach((fks, tableName) => {
    if (junctionTables.has(tableName)) return;
    const srcEnt = entByTable.get(tableName);
    if (!srcEnt) return;

    fks.forEach(fk => {
      const refEnt = entByTable.get(fk.refTable);
      if (!refEnt) return;

      const key = [Math.min(srcEnt.id, refEnt.id), Math.max(srcEnt.id, refEnt.id)].join('-');
      if (assocKey.has(key)) return;
      assocKey.add(key);

      // Position de l'association : milieu entre les deux entités
      const ax = Math.round((srcEnt.x + refEnt.x) / 2);
      const ay = Math.round((srcEnt.y + refEnt.y) / 2);
      const assocName = buildAssocName(srcEnt.name, refEnt.name);

      const assoc = { id: nextId++, name: assocName, x: ax, y: ay };
      associations.push(assoc);

      // Côté FK (src) → cardinalité 0,1 ou 1,1 selon NOT NULL
      const fkColDef = (colsMap.get(tableName) ?? []).find(c => c.name === fk.col);
      const srcCard  = (fkColDef && !fkColDef.notNull) ? '0,1' : '1,1';

      connections.push({ id: nextId++, assocId: assoc.id, entityId: srcEnt.id,  cardinality: srcCard });
      connections.push({ id: nextId++, assocId: assoc.id, entityId: refEnt.id,  cardinality: '1,N'  });
    });
  });

  // ── Tables de jonction (N,N) ──────────────────────────────
  junctionTables.forEach(jName => {
    const fks = fkMap.get(jName) ?? [];
    const involvedEnts = fks.map(fk => entByTable.get(fk.refTable)).filter(Boolean);
    if (involvedEnts.length < 2) return;

    // Déduplique les paires pour ne créer qu'une association par couple
    for (let i = 0; i < involvedEnts.length; i++) {
      for (let j = i + 1; j < involvedEnts.length; j++) {
        const eA = involvedEnts[i];
        const eB = involvedEnts[j];
        const key = [Math.min(eA.id, eB.id), Math.max(eA.id, eB.id)].join('-');
        if (assocKey.has(key)) continue;
        assocKey.add(key);

        const ax    = Math.round((eA.x + eB.x) / 2);
        const ay    = Math.round((eA.y + eB.y) / 2);
        const assoc = { id: nextId++, name: jName.toUpperCase(), x: ax, y: ay };
        associations.push(assoc);

        connections.push({ id: nextId++, assocId: assoc.id, entityId: eA.id, cardinality: '1,N' });
        connections.push({ id: nextId++, assocId: assoc.id, entityId: eB.id, cardinality: '1,N' });
      }
    }
  });

  return { entities, associations, connections, nextId };
}

// ── Helpers du parser SQL ─────────────────────────────────────

/** Normalise un nom de colonne (retire backticks/guillemets et met en minuscules) */
function normCol(s) {
  return s.trim().replace(/[`"[\]]/g, '').toLowerCase();
}

/** Normalise un type SQL vers un des types connus de l'éditeur */
function normalizeType(raw) {
  const t = raw.trim().toUpperCase();
  if (/^BIGINT/.test(t))               return 'BIGINT';
  if (/^SMALLINT/.test(t))             return 'SMALLINT';
  if (/^INT|^INTEGER/.test(t))         return 'INT';
  if (/^VARCHAR\s*\(\s*5[0-9]\s*\)/.test(t))  return 'VARCHAR(50)';
  if (/^VARCHAR\s*\(\s*1[0-9]{2}\s*\)/.test(t)) return 'VARCHAR(100)';
  if (/^VARCHAR/.test(t))              return 'VARCHAR(255)';
  if (/^CHAR/.test(t))                 return 'CHAR(10)';
  if (/^TEXT|^LONGTEXT|^MEDIUMTEXT/.test(t)) return 'TEXT';
  if (/^DATETIME/.test(t))             return 'DATETIME';
  if (/^TIMESTAMP/.test(t))            return 'TIMESTAMP';
  if (/^DATE/.test(t))                 return 'DATE';
  if (/^BOOL/.test(t))                 return 'BOOLEAN';
  if (/^DOUBLE/.test(t))               return 'DOUBLE';
  if (/^FLOAT/.test(t))                return 'FLOAT';
  if (/^DECIMAL|^NUMERIC/.test(t))     return 'DECIMAL(10,2)';
  return raw.trim(); // conserve le type inconnu tel quel
}

/** Génère un nom d'association à partir de deux noms d'entités */
function buildAssocName(nameA, nameB) {
  const a = nameA.replace(/_/g, ' ').split(' ')[0];
  const b = nameB.replace(/_/g, ' ').split(' ')[0];
  return (a.substring(0, 4) + '_' + b.substring(0, 4)).toUpperCase();
}

/**
 * Découpe le corps d'un CREATE TABLE en clauses individuelles,
 * en respectant les parenthèses imbriquées (ex: DECIMAL(10,2)).
 */
function splitClauses(body) {
  const clauses = [];
  let depth = 0, current = '';
  for (const ch of body) {
    if (ch === '(') { depth++; current += ch; }
    else if (ch === ')') { depth--; current += ch; }
    else if (ch === ',' && depth === 0) {
      clauses.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) clauses.push(current.trim());
  return clauses;
}

// ── Init ──────────────────────────────────────────────────────
applyCamera();
updateHint();
render();
