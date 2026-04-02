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

// ── Drag & Drop ──────────────────────────────────────────────
let drag = null; // { type, id, ox, oy, sx, sy }

svg.addEventListener('mousedown', e => {
  const tgt = e.target.closest('[data-type="entity"],[data-type="assoc"]');
  if (!tgt) return;

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

  // select + drag
  e.preventDefault();
  state.selected = { type, id };
  const pt  = svgPt(e);
  const obj = type === 'entity' ? getEntity(id) : getAssoc(id);
  drag = { type, id, sx: pt.x, sy: pt.y, ox: obj.x, oy: obj.y };
  render();
});

svg.addEventListener('mousemove', e => {
  if (!drag) return;
  const pt = svgPt(e);
  const dx = pt.x - drag.sx, dy = pt.y - drag.sy;
  const obj = drag.type === 'entity' ? getEntity(drag.id) : getAssoc(drag.id);
  if (!obj) return;
  obj.x = Math.max(0, drag.ox + dx);
  obj.y = Math.max(0, drag.oy + dy);
  render();
});

svg.addEventListener('mouseup',    () => { drag = null; });
svg.addEventListener('mouseleave', () => { drag = null; });

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

  if (e.key === 'Escape') {
    cancelConnect();
    state.selected = null;
    render();
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (state.selected) {
      doDelete(state.selected.type, state.selected.id);
      state.selected = null;
    }
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

function generateSQL() {
  let sql = '-- SQL généré par MCD Creator\n-- ' + new Date().toLocaleString('fr-FR') + '\n\n';

  state.entities.forEach(ent => {
    const tbl = ent.name.toLowerCase().replace(/\s+/g, '_');
    const cols = [];
    const pks  = [];

    ent.attributes.forEach(attr => {
      const col = attr.name.toLowerCase().replace(/\s+/g, '_');
      cols.push(`  ${col} ${attr.type}${attr.isPK ? ' NOT NULL' : ''}`);
      if (attr.isPK) pks.push(col);
    });

    // FK columns for 1,1 / 0,1 cardinalities on this entity's side
    state.connections
      .filter(c => c.entityId === ent.id && (c.cardinality === '1,1' || c.cardinality === '0,1'))
      .forEach(conn => {
        const otherConns = state.connections.filter(
          c => c.assocId === conn.assocId && c.entityId !== ent.id
        );
        otherConns.forEach(oc => {
          const other   = getEntity(oc.entityId);
          if (!other) return;
          const fkName  = other.name.toLowerCase() + '_id';
          const otherPK = other.attributes.find(a => a.isPK);
          cols.push(`  ${fkName} ${otherPK ? otherPK.type : 'INT'}`);
        });
      });

    if (pks.length) cols.push(`  PRIMARY KEY (${pks.join(', ')})`);

    sql += `CREATE TABLE ${tbl} (\n${cols.join(',\n')}\n);\n\n`;
  });

  return sql;
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

// ── Init ──────────────────────────────────────────────────────
updateHint();
render();
