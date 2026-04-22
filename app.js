// ============================================================
//  MCD Creator — app.js
// ============================================================

// ── Constants ────────────────────────────────────────────────
const ENT_W      = 160;   // entity box width
const ENT_HDR_H  = 32;   // entity header height
const ENT_ROW_H  = 24;   // height per attribute row
const ASC_R      = 42;   // association circle radius
const ASC_ATTR_W = 180;  // association attribute panel width
const ASC_ATTR_ROW_H = 22;
const ASC_ATTR_GAP = 10;

const NOTE_W   = 160;
const NOTE_H   = 80;
const NOTE_PAD = 10;
const NOTE_FOLD = 16;
const NOTE_MAX_W = 440;
const NOTE_MAX_H = 420;
const NOTE_LINE_H = 16;
const NOTE_WRAP_CHARS = 38;
const GROUP_MIN_W = 180;
const GROUP_MIN_H = 100;
const GROUP_HDR_H = 22;
const CONSTRAINT_W = 230;
const CONSTRAINT_H = 58;
const LABEL_W = 120;
const LABEL_H = 30;
const LABEL_MAX_W = 340;
const LABEL_MAX_H = 120;
const LABEL_LINE_H = 14;
const LABEL_WRAP_CHARS = 26;

const GROUP_COLORS = [
  { stroke: '#4962d0', fill: 'rgba(73,98,208,0.06)',  name: 'bleu'   },
  { stroke: '#27ae60', fill: 'rgba(39,174,96,0.07)',   name: 'vert'   },
  { stroke: '#e67e22', fill: 'rgba(230,126,34,0.07)',  name: 'orange' },
  { stroke: '#8e44ad', fill: 'rgba(142,68,173,0.07)',  name: 'violet' },
  { stroke: '#c0392b', fill: 'rgba(192,57,43,0.07)',   name: 'rouge'  },
  { stroke: '#7f8c8d', fill: 'rgba(127,140,141,0.07)', name: 'gris'   },
];

const ATTR_TYPES = [
  'INT', 'BIGINT', 'SMALLINT',
  'VARCHAR(50)', 'VARCHAR(100)', 'VARCHAR(255)',
  'TEXT', 'CHAR(10)',
  'DATE', 'DATETIME', 'TIMESTAMP',
  'BOOLEAN',
  'FLOAT', 'DOUBLE', 'DECIMAL(10,2)',
];

const I18N = {
  fr: {
    lang_toggle_title: 'Passer en anglais',
    mobile_tools_open: '☰ Outils',
    mobile_tools_open_aria: 'Ouvrir les outils',
    mobile_tools_close_aria: 'Fermer les outils',
    section_elements: 'Elements',
    section_tools: 'Outils',
    section_productivity: 'Productivite',
    section_export: 'Export',
    section_project: 'Projet',
    btn_add_entity: '+ Entite',
    btn_add_association: '◇ Association',
    btn_add_note: '📝 Note',
    btn_add_group: '▭ Groupe / Cadre',
    btn_add_inheritance: '△ Héritage IS-A',
    btn_add_constraint: '⚠︎ Contrainte',
    btn_add_label: '🏷 Repère',
    tool_select: '↖ Selection',
    tool_connect: '⇒ Connecter',
    tool_delete: '✕ Supprimer',
    btn_duplicate_selected: '⎘ Dupliquer la selection',
    btn_center_selected: '◎ Centrer sur la selection',
    btn_export_svg: '⬇ Exporter SVG',
    btn_export_png: '⬇ Exporter PNG',
    btn_export_sql: '⬇ Exporter SQL',
    btn_import_sql: '⬆ Importer SQL',
    btn_save_json: '💾 Sauvegarder',
    btn_load_json: '📂 Charger',
    btn_clear: '🗑 Effacer tout',
    context_edit: '✏️ Modifier',
    context_duplicate: '⎘ Dupliquer',
    context_delete: '🗑 Supprimer',
    context_move: '✋ Mode déplacement',
    snap_prefix: '▦ Grille magnetique :',
    mode_on: 'ON',
    mode_off: 'OFF',
    touch_mode_hold_on: 'Déplacement par maintien : ON',
    touch_mode_direct_on: 'Déplacement direct : ON',
    hint_select: 'Cliquez pour sélectionner. Glissez pour déplacer. Double-clic pour éditer.',
    hint_delete: 'Cliquez sur un élément pour le supprimer.',
    hint_connect_step1: 'Étape 1 : cliquez sur une entité ou une association.',
    hint_connect_step2: 'Étape 2 : connecter "{name}" — cliquez sur la cible.',
    hint_double_click_edit: 'Double-clic pour éditer',
    toast_select_first: 'Selectionnez un element d\'abord.',
    toast_none_to_duplicate: 'Aucune selection a dupliquer.',
    toast_entity_duplicated: 'Entite dupliquee.',
    toast_note_duplicated: 'Note dupliquée.',
    toast_group_duplicated: 'Groupe dupliqué.',
    toast_constraint_duplicated: 'Contrainte dupliquée.',
    toast_label_duplicated: 'Repère dupliqué.',
    toast_assoc_duplicated: 'Association dupliquee.',
    toast_need_entity_assoc: 'Connectez une entité à une association.',
    toast_connection_exists: 'Cette connexion existe déjà.',
    toast_need_two_entities: 'Il faut au moins 2 entités pour créer un héritage.',
    toast_sql_copied: 'SQL copié dans le presse-papiers !',
    toast_inheritance_diff: 'Parent et enfant doivent être différents.',
    toast_inheritance_exists: 'Cette relation d\'héritage existe déjà.',
    toast_png_error: 'Erreur export PNG',
    toast_json_invalid: 'Fichier JSON invalide.',
    toast_json_loaded: 'Projet chargé avec succès !',
    toast_json_load_error: 'Erreur lors du chargement.',
    toast_touch_mode: 'Mode déplacement tactile : {state}',
    toast_mcd_generated: 'MCD généré : {entities} entité(s), {associations} association(s).',
  },
  en: {
    lang_toggle_title: 'Switch to French',
    mobile_tools_open: '☰ Tools',
    mobile_tools_open_aria: 'Open tools',
    mobile_tools_close_aria: 'Close tools',
    section_elements: 'Elements',
    section_tools: 'Tools',
    section_productivity: 'Productivity',
    section_export: 'Export',
    section_project: 'Project',
    btn_add_entity: '+ Entity',
    btn_add_association: '◇ Association',
    btn_add_note: '📝 Note',
    btn_add_group: '▭ Group / Frame',
    btn_add_inheritance: '△ IS-A Inheritance',
    btn_add_constraint: '⚠︎ Constraint',
    btn_add_label: '🏷 Label',
    tool_select: '↖ Select',
    tool_connect: '⇒ Connect',
    tool_delete: '✕ Delete',
    btn_duplicate_selected: '⎘ Duplicate selection',
    btn_center_selected: '◎ Center on selection',
    btn_export_svg: '⬇ Export SVG',
    btn_export_png: '⬇ Export PNG',
    btn_export_sql: '⬇ Export SQL',
    btn_import_sql: '⬆ Import SQL',
    btn_save_json: '💾 Save',
    btn_load_json: '📂 Load',
    btn_clear: '🗑 Clear all',
    context_edit: '✏️ Edit',
    context_duplicate: '⎘ Duplicate',
    context_delete: '🗑 Delete',
    context_move: '✋ Move mode',
    snap_prefix: '▦ Snap grid :',
    mode_on: 'ON',
    mode_off: 'OFF',
    touch_mode_hold_on: 'Hold-to-move mode: ON',
    touch_mode_direct_on: 'Direct move mode: ON',
    hint_select: 'Click to select. Drag to move. Double-click to edit.',
    hint_delete: 'Click an element to delete it.',
    hint_connect_step1: 'Step 1: click an entity or an association.',
    hint_connect_step2: 'Step 2: connect "{name}" — click the target.',
    hint_double_click_edit: 'Double-click to edit',
    toast_select_first: 'Select an element first.',
    toast_none_to_duplicate: 'No selection to duplicate.',
    toast_entity_duplicated: 'Entity duplicated.',
    toast_note_duplicated: 'Note duplicated.',
    toast_group_duplicated: 'Group duplicated.',
    toast_constraint_duplicated: 'Constraint duplicated.',
    toast_label_duplicated: 'Label duplicated.',
    toast_assoc_duplicated: 'Association duplicated.',
    toast_need_entity_assoc: 'Connect an entity to an association.',
    toast_connection_exists: 'This connection already exists.',
    toast_need_two_entities: 'At least 2 entities are required to create an inheritance.',
    toast_sql_copied: 'SQL copied to clipboard!',
    toast_inheritance_diff: 'Parent and child must be different.',
    toast_inheritance_exists: 'This inheritance relation already exists.',
    toast_png_error: 'PNG export error',
    toast_json_invalid: 'Invalid JSON file.',
    toast_json_loaded: 'Project loaded successfully!',
    toast_json_load_error: 'Load error.',
    toast_touch_mode: 'Touch move mode: {state}',
    toast_mcd_generated: 'ER model generated: {entities} entit(y/ies), {associations} association(s).',
  },
};

// ── State ─────────────────────────────────────────────────────
const state = {
  entities:     [],   // { id, name, x, y, attributes:[{name,type,isPK}] }
  associations: [],   // { id, name, x, y }
  connections:  [],   // { id, assocId, entityId, cardinality }
  notes:        [],   // { id, text, x, y, w, h }
  groups:       [],   // { id, name, x, y, w, h, colorIndex }
  inheritances: [],   // { id, parentId, childId, coverType }
  constraints:  [],   // { id, code, text, x, y, w, h }
  labels:       [],   // { id, text, x, y, w, h }
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
  editNoteId:   null,
  editGroupId:  null,
  editConstraintId: null,
  editLabelId: null,

  contextTarget: null,

  snapToGrid: false,
  touchMoveMode: true,
  lang: localStorage.getItem('mcd_lang') === 'en' ? 'en' : 'fr',
};

// ── DOM shortcuts ─────────────────────────────────────────────
const svg        = document.getElementById('canvas');
const layerConn  = document.getElementById('connections-layer');
const layerElems = document.getElementById('elements-layer');
const layerNotes = document.getElementById('notes-layer');
const layerGroups = document.getElementById('groups-layer');
const layerInherit = document.getElementById('inheritances-layer');
const layerConstraints = document.getElementById('constraints-layer');
const layerLabels = document.getElementById('labels-layer');
const viewport   = document.getElementById('viewport');
const appRoot    = document.getElementById('app');
const contextMenu = document.getElementById('context-menu');
const touchMoveBtn = document.getElementById('btn-touch-move');
const langToggleBtn = document.getElementById('btn-lang-toggle');
const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
const sidebarBackdrop     = document.getElementById('sidebar-backdrop');
const sidebarCloseBtn     = document.getElementById('sidebar-close');

const mobileBreakpoint = window.matchMedia('(max-width: 980px)');

function isMobileViewport() {
  return mobileBreakpoint.matches;
}

function t(key, vars = {}) {
  const dict = I18N[state.lang] ?? I18N.fr;
  const base = dict[key] ?? I18N.fr[key] ?? key;
  return Object.entries(vars).reduce(
    (value, [name, replacement]) => value.replaceAll(`{${name}}`, String(replacement)),
    base
  );
}

function setTextBySelector(selector, key) {
  const el = document.querySelector(selector);
  if (el) el.textContent = t(key);
}

function applyLanguageToEditor() {
  document.documentElement.lang = state.lang;
  document.title = state.lang === 'en' ? 'MCD Creator - Editor' : 'MCD Creator - Editeur';

  if (mobileSidebarToggle) {
    mobileSidebarToggle.textContent = t('mobile_tools_open');
    mobileSidebarToggle.setAttribute('aria-label', t('mobile_tools_open_aria'));
  }
  sidebarCloseBtn?.setAttribute('aria-label', t('mobile_tools_close_aria'));

  setTextBySelector('#section-elements', 'section_elements');
  setTextBySelector('#section-tools', 'section_tools');
  setTextBySelector('#section-productivity', 'section_productivity');
  setTextBySelector('#section-export', 'section_export');
  setTextBySelector('#section-project', 'section_project');

  setTextBySelector('#btn-add-entity', 'btn_add_entity');
  setTextBySelector('#btn-add-association', 'btn_add_association');
  setTextBySelector('#btn-add-note', 'btn_add_note');
  setTextBySelector('#btn-add-group', 'btn_add_group');
  setTextBySelector('#btn-add-inheritance', 'btn_add_inheritance');
  setTextBySelector('#btn-add-constraint', 'btn_add_constraint');
  setTextBySelector('#btn-add-label', 'btn_add_label');

  setTextBySelector('.tool-btn[data-tool="select"]', 'tool_select');
  setTextBySelector('.tool-btn[data-tool="connect"]', 'tool_connect');
  setTextBySelector('.tool-btn[data-tool="delete"]', 'tool_delete');

  setTextBySelector('#btn-duplicate-selected', 'btn_duplicate_selected');
  setTextBySelector('#btn-center-selected', 'btn_center_selected');

  setTextBySelector('#btn-export-svg', 'btn_export_svg');
  setTextBySelector('#btn-export-png', 'btn_export_png');
  setTextBySelector('#btn-export-sql', 'btn_export_sql');
  setTextBySelector('#btn-import-sql', 'btn_import_sql');

  setTextBySelector('#btn-save-json', 'btn_save_json');
  setTextBySelector('#btn-load-json', 'btn_load_json');
  setTextBySelector('#btn-clear', 'btn_clear');

  setTextBySelector('.context-menu-item[data-action="edit"]', 'context_edit');
  setTextBySelector('.context-menu-item[data-action="duplicate"]', 'context_duplicate');
  setTextBySelector('.context-menu-item[data-action="delete"]', 'context_delete');
  setTextBySelector('#btn-touch-move', 'context_move');

  updateLangToggleButton();
  updateSnapButton();
  updateTouchMoveButton();
  updateHint();
}

function updateLangToggleButton() {
  if (!langToggleBtn) return;
  langToggleBtn.textContent = state.lang === 'fr' ? 'EN' : 'FR';
  langToggleBtn.setAttribute('aria-label', t('lang_toggle_title'));
  langToggleBtn.title = t('lang_toggle_title');
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

langToggleBtn?.addEventListener('click', () => {
  state.lang = state.lang === 'fr' ? 'en' : 'fr';
  localStorage.setItem('mcd_lang', state.lang);
  applyLanguageToEditor();
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

function getEntity(id)      { return state.entities.find(e => e.id === id); }
function getAssoc(id)       { return state.associations.find(a => a.id === id); }
function getNote(id)        { return state.notes.find(n => n.id === id); }
function getGroup(id)       { return state.groups.find(g => g.id === id); }
function getInheritance(id) { return state.inheritances.find(i => i.id === id); }
function getConstraint(id)  { return state.constraints.find(c => c.id === id); }
function getLabel(id)       { return state.labels.find(l => l.id === id); }

function assocAttrs(asc) {
  if (!asc) return [];
  if (!Array.isArray(asc.attributes)) asc.attributes = [];
  return asc.attributes;
}

function entHeight(ent) {
  return ENT_HDR_H + Math.max(1, ent.attributes.length) * ENT_ROW_H;
}

function assocAttrHeight(asc) {
  const attrs = assocAttrs(asc);
  return attrs.length ? attrs.length * ASC_ATTR_ROW_H + 14 : 0;
}

function assocBounds(asc) {
  const panelH = assocAttrHeight(asc);
  return {
    minX: asc.x - Math.max(ASC_R, ASC_ATTR_W / 2),
    minY: asc.y - ASC_R,
    maxX: asc.x + Math.max(ASC_R, ASC_ATTR_W / 2),
    maxY: asc.y + ASC_R + (panelH ? ASC_ATTR_GAP + panelH : 0),
  };
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

function wrapNoteLine(line, maxChars = NOTE_WRAP_CHARS) {
  const text = String(line ?? '').trim();
  if (!text) return [''];

  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  words.forEach(word => {
    if (word.length > maxChars) {
      if (current) {
        lines.push(current);
        current = '';
      }
      for (let index = 0; index < word.length; index += maxChars) {
        lines.push(word.slice(index, index + maxChars));
      }
      return;
    }

    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  });

  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function computeNoteLayout(text) {
  const normalized = String(text ?? '').replace(/\r\n/g, '\n');
  const rawLines = normalized.split('\n');

  const lines = [];
  rawLines.forEach(rawLine => {
    if (!rawLine.trim()) {
      lines.push('');
      return;
    }
    lines.push(...wrapNoteLine(rawLine));
  });

  if (!lines.length) lines.push('');

  const longest = lines.reduce((maxLen, line) => Math.max(maxLen, line.length), 0);
  const width = Math.max(
    NOTE_W,
    Math.min(NOTE_MAX_W, Math.round(NOTE_PAD * 2 + NOTE_FOLD + 20 + longest * 6.6))
  );
  const height = Math.max(
    NOTE_H,
    Math.min(NOTE_MAX_H, Math.round(NOTE_PAD * 2 + lines.length * NOTE_LINE_H + 8))
  );

  return { lines, w: width, h: height };
}

function syncNoteSize(note) {
  const layout = computeNoteLayout(note?.text ?? '');
  note.w = layout.w;
  note.h = layout.h;
  return layout;
}

function computeLabelLayout(text) {
  const normalized = String(text ?? '').replace(/\r\n/g, '\n').trim();
  const lines = normalized
    ? wrapNoteLine(normalized, LABEL_WRAP_CHARS)
    : ['Repère'];

  const longest = lines.reduce((maxLen, line) => Math.max(maxLen, line.length), 0);
  const width = Math.max(
    LABEL_W,
    Math.min(LABEL_MAX_W, Math.round(22 + longest * 7.1))
  );
  const height = Math.max(
    LABEL_H,
    Math.min(LABEL_MAX_H, Math.round(14 + lines.length * LABEL_LINE_H))
  );

  return { lines, w: width, h: height };
}

function syncLabelSize(label) {
  const layout = computeLabelLayout(label?.text ?? '');
  label.w = layout.w;
  label.h = layout.h;
  return layout;
}

function resolveDiagramTarget(node) {
  let current = node;
  while (current && current !== svg) {
    const type = current.dataset?.type;
    if (type === 'entity' || type === 'assoc' || type === 'note' || type === 'group' ||
        type === 'constraint' || type === 'label') return current;
    current = current.parentNode;
  }
  return null;
}

function resolveContextTarget(node) {
  let current = node;
  while (current && current !== svg) {
    const type = current.dataset?.type;
    if (type === 'entity' || type === 'assoc' || type === 'connection' ||
        type === 'note'   || type === 'group' || type === 'inheritance' ||
        type === 'constraint' || type === 'label') return current;
    current = current.parentNode;
  }
  return null;
}

function resolveTypedTarget(node) {
  let current = node;
  while (current && current !== svg) {
    if (current.dataset?.type) return current;
    current = current.parentNode;
  }
  return null;
}

function snapValue(value, step = 20) {
  if (!state.snapToGrid) return value;
  return Math.round(value / step) * step;
}

function updateSnapButton() {
  const button = document.getElementById('btn-toggle-snap');
  if (!button) return;
  button.textContent = `${t('snap_prefix')} ${state.snapToGrid ? t('mode_on') : t('mode_off')}`;
  button.classList.toggle('active', state.snapToGrid);
}

function updateTouchMoveButton() {
  if (!touchMoveBtn) return;
  touchMoveBtn.classList.toggle('active', state.touchMoveMode);
  touchMoveBtn.setAttribute('aria-checked', String(state.touchMoveMode));
  touchMoveBtn.title = state.touchMoveMode
    ? t('touch_mode_hold_on')
    : t('touch_mode_direct_on');
}

function hideContextMenu() {
  if (!contextMenu) return;
  contextMenu.classList.add('hidden');
  contextMenu.setAttribute('aria-hidden', 'true');
}

function showContextMenu(clientX, clientY, target) {
  if (!contextMenu) return;

  state.contextTarget = target;
  state.selected = { ...target };
  render();

  const isConnection   = target.type === 'connection';
  const isInheritance  = target.type === 'inheritance';
  contextMenu.querySelectorAll('.context-menu-item').forEach(button => {
    const action = button.dataset.action;
    const disabled = (isConnection || isInheritance) && (action === 'edit' || action === 'duplicate');
    button.disabled = disabled;
    button.classList.toggle('disabled', disabled);
  });

  contextMenu.classList.remove('hidden');
  contextMenu.setAttribute('aria-hidden', 'false');

  const pad = 10;
  const menuRect = contextMenu.getBoundingClientRect();
  const maxLeft = window.innerWidth - menuRect.width - pad;
  const maxTop = window.innerHeight - menuRect.height - pad;
  const left = Math.max(pad, Math.min(clientX, maxLeft));
  const top = Math.max(pad, Math.min(clientY, maxTop));

  contextMenu.style.left = `${left}px`;
  contextMenu.style.top = `${top}px`;
}

function centerOnSelected() {
  if (!state.selected) {
    showToast(t('toast_select_first'));
    return;
  }

  let targetX = 0;
  let targetY = 0;

  if (state.selected.type === 'entity') {
    const entity = getEntity(state.selected.id);
    if (!entity) return;
    targetX = entity.x + ENT_W / 2;
    targetY = entity.y + entHeight(entity) / 2;
  } else if (state.selected.type === 'assoc') {
    const assoc = getAssoc(state.selected.id);
    if (!assoc) return;
    targetX = assoc.x;
    targetY = assoc.y;
  } else if (state.selected.type === 'note') {
    const note = getNote(state.selected.id);
    if (!note) return;
    targetX = note.x + (note.w ?? NOTE_W) / 2;
    targetY = note.y + (note.h ?? NOTE_H) / 2;
  } else if (state.selected.type === 'group') {
    const group = getGroup(state.selected.id);
    if (!group) return;
    targetX = group.x + (group.w ?? GROUP_MIN_W) / 2;
    targetY = group.y + (group.h ?? GROUP_MIN_H) / 2;
  } else if (state.selected.type === 'constraint') {
    const constraint = getConstraint(state.selected.id);
    if (!constraint) return;
    targetX = constraint.x + (constraint.w ?? CONSTRAINT_W) / 2;
    targetY = constraint.y + (constraint.h ?? CONSTRAINT_H) / 2;
  } else if (state.selected.type === 'label') {
    const label = getLabel(state.selected.id);
    if (!label) return;
    targetX = label.x + (label.w ?? LABEL_W) / 2;
    targetY = label.y + (label.h ?? LABEL_H) / 2;
  } else {
    return;
  }

  const rect = svg.getBoundingClientRect();
  camera.panX = rect.width / 2 - targetX * camera.zoom;
  camera.panY = rect.height / 2 - targetY * camera.zoom;
  applyCamera();
}

function duplicateSelected() {
  if (!state.selected) {
    showToast(t('toast_none_to_duplicate'));
    return;
  }

  if (state.selected.type === 'entity') {
    const source = getEntity(state.selected.id);
    if (!source) return;
    const id = uid();
    const duplicated = {
      id,
      name: `${source.name}_COPIE`,
      x: Math.max(10, snapValue(source.x + 40)),
      y: Math.max(10, snapValue(source.y + 40)),
      attributes: source.attributes.map(attr => ({ ...attr })),
    };
    state.entities.push(duplicated);
    state.selected = { type: 'entity', id };
    render();
    showToast(t('toast_entity_duplicated'));
    return;
  }

  if (state.selected.type === 'note') {
    const source = getNote(state.selected.id);
    if (!source) return;
    const id = uid();
    state.notes.push({ ...source, id, x: source.x + 24, y: source.y + 24 });
    state.selected = { type: 'note', id };
    render();
    showToast(t('toast_note_duplicated'));
    return;
  }

  if (state.selected.type === 'group') {
    const source = getGroup(state.selected.id);
    if (!source) return;
    const id = uid();
    state.groups.push({ ...source, id, name: `${source.name}_COPIE`, x: source.x + 24, y: source.y + 24 });
    state.selected = { type: 'group', id };
    render();
    showToast(t('toast_group_duplicated'));
    return;
  }

  if (state.selected.type === 'constraint') {
    const source = getConstraint(state.selected.id);
    if (!source) return;
    const id = uid();
    state.constraints.push({ ...source, id, code: `${source.code}_COPIE`, x: source.x + 24, y: source.y + 24 });
    state.selected = { type: 'constraint', id };
    render();
    showToast(t('toast_constraint_duplicated'));
    return;
  }

  if (state.selected.type === 'label') {
    const source = getLabel(state.selected.id);
    if (!source) return;
    const id = uid();
    state.labels.push({ ...source, id, text: `${source.text} (copie)`, x: source.x + 24, y: source.y + 24 });
    state.selected = { type: 'label', id };
    render();
    showToast(t('toast_label_duplicated'));
    return;
  }

  const source = getAssoc(state.selected.id);
  if (!source) return;
  const id = uid();
  const duplicated = {
    id,
    name: `${source.name}_COPIE`,
    x: Math.max(ASC_R + 10, snapValue(source.x + 40)),
    y: Math.max(ASC_R + 10, snapValue(source.y + 40)),
    attributes: assocAttrs(source).map(attr => ({ ...attr })),
  };
  state.associations.push(duplicated);

  state.connections
    .filter(conn => conn.assocId === source.id)
    .forEach(conn => {
      state.connections.push({
        id: uid(),
        assocId: id,
        entityId: conn.entityId,
        cardinality: conn.cardinality,
      });
    });

  state.selected = { type: 'assoc', id };
  render();
  showToast(t('toast_assoc_duplicated'));
}

// ── Rendering ────────────────────────────────────────────────
function render() {
  renderGroups();
  renderConstraints();
  renderConnections();
  renderInheritances();
  renderElements();
  renderNotes();
  renderLabels();
}

function renderConstraints() {
  layerConstraints.innerHTML = '';
  state.constraints.forEach(drawConstraint);
}

function drawConstraint(constraint) {
  const sel = state.selected?.type === 'constraint' && state.selected?.id === constraint.id;
  const w = constraint.w ?? CONSTRAINT_W;
  const h = constraint.h ?? CONSTRAINT_H;

  const g = svgEl('g');
  g.setAttribute('class', `constraint-group${sel ? ' selected' : ''}`);
  g.setAttribute('transform', `translate(${constraint.x},${constraint.y})`);
  g.dataset.type = 'constraint';
  g.dataset.id = constraint.id;

  const shadow = svgEl('rect');
  shadow.setAttribute('x', '2'); shadow.setAttribute('y', '3');
  shadow.setAttribute('width', w); shadow.setAttribute('height', h);
  shadow.setAttribute('rx', '8'); shadow.setAttribute('fill', 'rgba(0,0,0,0.09)');
  g.appendChild(shadow);

  const body = svgEl('rect');
  body.setAttribute('class', 'constraint-body');
  body.setAttribute('width', w); body.setAttribute('height', h);
  body.setAttribute('rx', '8'); body.setAttribute('ry', '8');
  g.appendChild(body);

  const icon = svgEl('text');
  icon.setAttribute('x', '10'); icon.setAttribute('y', '16');
  icon.setAttribute('fill', '#e67e22');
  icon.setAttribute('font-size', '12');
  icon.setAttribute('font-weight', '700');
  icon.textContent = '⚠';
  g.appendChild(icon);

  const code = svgEl('text');
  code.setAttribute('class', 'constraint-code');
  code.setAttribute('x', '28'); code.setAttribute('y', '16');
  code.textContent = constraint.code || 'C?';
  g.appendChild(code);

  const txt = svgEl('text');
  txt.setAttribute('class', 'constraint-text');
  txt.setAttribute('x', '10'); txt.setAttribute('y', '38');
  txt.textContent = (constraint.text || '').length > 33
    ? `${constraint.text.substring(0, 32)}…`
    : (constraint.text || t('hint_double_click_edit'));
  g.appendChild(txt);

  layerConstraints.appendChild(g);
}

function renderLabels() {
  layerLabels.innerHTML = '';
  state.labels.forEach(drawLabel);
}

function drawLabel(label) {
  const sel = state.selected?.type === 'label' && state.selected?.id === label.id;
  const { lines, w, h } = syncLabelSize(label);

  const g = svgEl('g');
  g.setAttribute('class', `label-group${sel ? ' selected' : ''}`);
  g.setAttribute('transform', `translate(${label.x},${label.y})`);
  g.dataset.type = 'label';
  g.dataset.id = label.id;

  const pill = svgEl('rect');
  pill.setAttribute('class', 'label-pill');
  pill.setAttribute('width', w);
  pill.setAttribute('height', h);
  pill.setAttribute('rx', Math.min(15, Math.floor(h / 2)));
  pill.setAttribute('ry', Math.min(15, Math.floor(h / 2)));
  g.appendChild(pill);

  const t = svgEl('text');
  t.setAttribute('class', 'label-text');
  t.setAttribute('x', w / 2);
  t.setAttribute('y', h / 2);
  t.setAttribute('dominant-baseline', 'middle');

  const blockHeight = lines.length * LABEL_LINE_H;
  const startY = h / 2 - blockHeight / 2 + LABEL_LINE_H / 2;
  lines.forEach((line, index) => {
    const span = svgEl('tspan');
    span.setAttribute('x', w / 2);
    span.setAttribute('y', startY + index * LABEL_LINE_H);
    span.textContent = line || ' ';
    t.appendChild(span);
  });

  g.appendChild(t);

  layerLabels.appendChild(g);
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
    ph.setAttribute('fill', '#bbb'); ph.textContent = t('hint_double_click_edit');
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
  const attrs = assocAttrs(asc);

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

  if (attrs.length) {
    const panelY = ASC_R + ASC_ATTR_GAP;
    const panelH = assocAttrHeight(asc);

    const shadow = svgEl('rect');
    shadow.setAttribute('x', String(-ASC_ATTR_W / 2 + 2));
    shadow.setAttribute('y', String(panelY + 3));
    shadow.setAttribute('width', String(ASC_ATTR_W));
    shadow.setAttribute('height', String(panelH));
    shadow.setAttribute('rx', '10');
    shadow.setAttribute('fill', 'rgba(0,0,0,0.10)');
    g.appendChild(shadow);

    const panel = svgEl('rect');
    panel.setAttribute('x', String(-ASC_ATTR_W / 2));
    panel.setAttribute('y', String(panelY));
    panel.setAttribute('width', String(ASC_ATTR_W));
    panel.setAttribute('height', String(panelH));
    panel.setAttribute('rx', '10');
    panel.setAttribute('fill', '#fffdf8');
    panel.setAttribute('stroke', sel ? '#e67e22' : '#d7d0c3');
    panel.setAttribute('stroke-width', sel ? '2' : '1');
    g.appendChild(panel);

    attrs.forEach((attr, index) => {
      const rowTop = panelY + index * ASC_ATTR_ROW_H;

      if (index > 0) {
        const divider = svgEl('line');
        divider.setAttribute('x1', String(-ASC_ATTR_W / 2));
        divider.setAttribute('y1', String(rowTop));
        divider.setAttribute('x2', String(ASC_ATTR_W / 2));
        divider.setAttribute('y2', String(rowTop));
        divider.setAttribute('stroke', '#e9e2d6');
        divider.setAttribute('stroke-width', '1');
        g.appendChild(divider);
      }

      const text = svgEl('text');
      text.setAttribute('x', String(-ASC_ATTR_W / 2 + 10));
      text.setAttribute('y', String(rowTop + ASC_ATTR_ROW_H / 2 + 1));
      text.setAttribute('fill', '#5d5a55');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-family', 'IBM Plex Mono, monospace');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('pointer-events', 'none');
      text.textContent = `- ${attr.name} : ${attr.type}`;
      g.appendChild(text);
    });
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

// ── Notes ────────────────────────────────────────────────────
function renderNotes() {
  layerNotes.innerHTML = '';
  state.notes.forEach(drawNote);
}

function drawNote(note) {
  const sel = state.selected?.type === 'note' && state.selected?.id === note.id;
  const { lines, w, h } = syncNoteSize(note);

  const g = svgEl('g');
  g.setAttribute('class', `note-group${sel ? ' selected' : ''}`);
  g.setAttribute('transform', `translate(${note.x},${note.y})`);
  g.dataset.type = 'note';
  g.dataset.id   = note.id;

  // Shadow
  const shadow = svgEl('rect');
  shadow.setAttribute('width', w); shadow.setAttribute('height', h);
  shadow.setAttribute('rx', '4'); shadow.setAttribute('ry', '4');
  shadow.setAttribute('fill', 'rgba(0,0,0,0.10)');
  shadow.setAttribute('transform', 'translate(3,3)');
  g.appendChild(shadow);

  // Body
  const body = svgEl('rect');
  body.setAttribute('class', 'note-body');
  body.setAttribute('width', w); body.setAttribute('height', h);
  body.setAttribute('rx', '4'); body.setAttribute('ry', '4');
  g.appendChild(body);

  // Fold corner (top-right)
  const fold = svgEl('polygon');
  fold.setAttribute('class', 'note-fold');
  fold.setAttribute('points', `${w - NOTE_FOLD},0 ${w},0 ${w},${NOTE_FOLD}`);
  g.appendChild(fold);

  // Cut corner (white triangle to mask)
  const cut = svgEl('polygon');
  cut.setAttribute('points', `${w - NOTE_FOLD},0 ${w},${NOTE_FOLD} ${w - NOTE_FOLD},${NOTE_FOLD}`);
  cut.setAttribute('fill', '#fffde7');
  g.appendChild(cut);

  // Text
  const maxVisibleLines = Math.max(1, Math.floor((h - NOTE_PAD * 2 - 8) / NOTE_LINE_H));
  const visibleLines = lines.slice(0, maxVisibleLines);
  const isTruncated = lines.length > maxVisibleLines;

  visibleLines.forEach((line, i) => {
    const t = svgEl('text');
    t.setAttribute('class', 'note-text');
    t.setAttribute('x', NOTE_PAD);
    t.setAttribute('y', NOTE_PAD + i * NOTE_LINE_H);
    if (isTruncated && i === visibleLines.length - 1) {
      const clipped = line.length > 0 ? line : '...';
      t.textContent = clipped.endsWith('…') ? clipped : `${clipped}…`;
    } else {
      t.textContent = line || ' ';
    }
    g.appendChild(t);
  });

  // Placeholder if empty
  if (!note.text.trim()) {
    const ph = svgEl('text');
    ph.setAttribute('class', 'note-text');
    ph.setAttribute('x', NOTE_PAD); ph.setAttribute('y', NOTE_PAD);
    ph.setAttribute('fill', '#bbb'); ph.textContent = t('hint_double_click_edit');
    g.appendChild(ph);
  }

  layerNotes.appendChild(g);
}

// ── Groups ───────────────────────────────────────────────────
function renderGroups() {
  layerGroups.innerHTML = '';
  state.groups.forEach(drawGroup);
}

function drawGroup(grp) {
  const sel = state.selected?.type === 'group' && state.selected?.id === grp.id;
  const w = grp.w ?? GROUP_MIN_W;
  const h = grp.h ?? GROUP_MIN_H;
  const ci = grp.colorIndex ?? 0;
  const color = GROUP_COLORS[ci] ?? GROUP_COLORS[0];

  const g = svgEl('g');
  g.setAttribute('class', `group-elem${sel ? ' selected' : ''}`);
  g.setAttribute('transform', `translate(${grp.x},${grp.y})`);
  g.dataset.type = 'group';
  g.dataset.id   = grp.id;

  const body = svgEl('rect');
  body.setAttribute('class', 'group-frame');
  body.setAttribute('width', w); body.setAttribute('height', h);
  body.setAttribute('rx', '8'); body.setAttribute('ry', '8');
  body.setAttribute('fill', color.fill);
  body.setAttribute('stroke', sel ? '#f39c12' : color.stroke);
  body.setAttribute('stroke-width', sel ? '2.5' : '1.5');
  body.setAttribute('stroke-dasharray', '6 3');
  g.appendChild(body);

  const label = svgEl('text');
  label.setAttribute('class', 'group-label');
  label.setAttribute('x', '10');
  label.setAttribute('y', '7');
  label.setAttribute('fill', sel ? '#f39c12' : color.stroke);
  label.textContent = grp.name || 'Groupe';
  g.appendChild(label);

  layerGroups.appendChild(g);
}

// ── Inheritances ─────────────────────────────────────────────
function renderInheritances() {
  layerInherit.innerHTML = '';
  state.inheritances.forEach(drawInheritance);
}

function drawInheritance(inh) {
  const parent = getEntity(inh.parentId);
  const child  = getEntity(inh.childId);
  if (!parent || !child) return;

  const sel = state.selected?.type === 'inheritance' && state.selected?.id === inh.id;

  const pc = entCenter(parent);
  const cc = entCenter(child);
  const ep = entBorder(parent, cc.x, cc.y);
  const ec = entBorder(child,  pc.x, pc.y);

  const g = svgEl('g');
  g.dataset.type = 'inheritance';
  g.dataset.id   = inh.id;

  // Line
  const line = svgEl('line');
  line.setAttribute('x1', ec.x); line.setAttribute('y1', ec.y);
  line.setAttribute('x2', ep.x); line.setAttribute('y2', ep.y);
  line.setAttribute('stroke', sel ? '#f39c12' : '#8e44ad');
  line.setAttribute('stroke-width', sel ? '2.5' : '2');
  line.setAttribute('marker-end', 'url(#arrow-inherit)');
  g.appendChild(line);

  // IS-A label at midpoint
  const mx = (ec.x + ep.x) / 2;
  const my = (ec.y + ep.y) / 2;
  const bgLbl = svgEl('rect');
  bgLbl.setAttribute('x', mx - 18); bgLbl.setAttribute('y', my - 9);
  bgLbl.setAttribute('width', '36'); bgLbl.setAttribute('height', '14');
  bgLbl.setAttribute('rx', '4'); bgLbl.setAttribute('fill', '#fffdf8');
  bgLbl.setAttribute('stroke', sel ? '#f39c12' : '#8e44ad');
  bgLbl.setAttribute('stroke-width', '1');
  g.appendChild(bgLbl);

  const lbl = svgEl('text');
  lbl.setAttribute('class', 'inherit-label');
  lbl.setAttribute('x', mx); lbl.setAttribute('y', my - 1);
  lbl.textContent = inh.coverType === 'total' ? 'IS-A ●' : 'IS-A ○';
  lbl.setAttribute('pointer-events', 'none');
  g.appendChild(lbl);

  layerInherit.appendChild(g);
}

// ── Drag & Drop + Pan ────────────────────────────────────────
let drag    = null; // { type, id, ox, oy, sx, sy }  — element drag
let panning = null; // { startX, startY, startPanX, startPanY } — canvas pan
const TOUCH_HOLD_MS = 320;
const TOUCH_HOLD_MOVE_TOLERANCE = 18;
const TOUCH_DRAG_START_PX = 6;
let touchState = {
  startX: 0,
  startY: 0,
  startSvgX: 0,
  startSvgY: 0,
  moved: false,
  target: null,
  longPressTimer: null,
  holdReady: false,
  dragStarted: false,
  suppressClickUntil: 0,
};

function getMovableObject(type, id) {
  if (type === 'entity') return getEntity(id);
  if (type === 'assoc') return getAssoc(id);
  if (type === 'note') return getNote(id);
  if (type === 'group') return getGroup(id);
  if (type === 'constraint') return getConstraint(id);
  if (type === 'label') return getLabel(id);
  return null;
}

function resetTouchLongPress() {
  if (touchState.longPressTimer) clearTimeout(touchState.longPressTimer);
  touchState.longPressTimer = null;
  touchState.holdReady = false;
}

function clearTouchState() {
  resetTouchLongPress();
  touchState.startX = 0;
  touchState.startY = 0;
  touchState.startSvgX = 0;
  touchState.startSvgY = 0;
  touchState.moved = false;
  touchState.target = null;
  touchState.dragStarted = false;
}

function scheduleTouchLongPress(touch, target) {
  resetTouchLongPress();
  if (!target || state.tool !== 'select') return;

  touchState.longPressTimer = setTimeout(() => {
    touchState.holdReady = true;
  }, TOUCH_HOLD_MS);
}

function handleTouchTap(target) {
  if (!target) {
    if (state.tool === 'connect' && state.connectStep === 1) cancelConnect();
    else {
      state.selected = null;
      render();
    }
    return;
  }

  const type = target.type;
  const id = target.id;

  if (state.tool === 'delete') {
    doDelete(type, id);
    return;
  }

  if (state.tool === 'connect') {
    handleConnect(type, id);
    return;
  }

  state.selected = { type, id };
  render();
}

svg.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  hideContextMenu();

  const tgt = resolveDiagramTarget(e.target);

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
  const obj = getMovableObject(type, id);
  if (!obj) { render(); return; }
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
  const obj = getMovableObject(drag.type, drag.id);
  if (!obj) return;
  obj.x = Math.max(0, snapValue(drag.ox + dx));
  obj.y = Math.max(0, snapValue(drag.oy + dy));
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
  hideContextMenu();

  if (e.touches.length === 2) {
    clearTouchState();
    drag = null;
    panning = null;
    lastPinchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    return;
  }

  if (e.touches.length !== 1) return;

  const touch = e.touches[0];
  const rawTarget = document.elementFromPoint(touch.clientX, touch.clientY);
  const diagramTarget = resolveDiagramTarget(rawTarget);

  touchState.startX = touch.clientX;
  touchState.startY = touch.clientY;
  const startPt = svgPt(touch);
  touchState.startSvgX = startPt.x;
  touchState.startSvgY = startPt.y;
  touchState.moved = false;
  touchState.dragStarted = false;
  touchState.target = diagramTarget
    ? { type: diagramTarget.dataset.type, id: parseInt(diagramTarget.dataset.id) }
    : null;

  if (!diagramTarget) {
    if (state.tool === 'select') {
      panning = {
        startX: touch.clientX,
        startY: touch.clientY,
        startPanX: camera.panX,
        startPanY: camera.panY,
      };
    }
    return;
  }

  if (state.tool === 'select') {
    state.selected = { ...touchState.target };
    if (!state.touchMoveMode) {
      const obj = getMovableObject(touchState.target.type, touchState.target.id);
      if (obj) {
        drag = {
          type: touchState.target.type,
          id: touchState.target.id,
          sx: touchState.startSvgX,
          sy: touchState.startSvgY,
          ox: obj.x,
          oy: obj.y,
        };
      }
    }
    render();
  }

  scheduleTouchLongPress(touch, touchState.target);
}, { passive: true });
svg.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    resetTouchLongPress();
    drag = null;
    panning = null;
    if (lastPinchDist === null) return;
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const r   = svg.getBoundingClientRect();
    const mx  = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
    const my  = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
    zoomAround(camera.zoom * (dist / lastPinchDist), mx, my);
    lastPinchDist = dist;
    return;
  }

  if (e.touches.length !== 1) return;
  const touch = e.touches[0];
  const moveX = touch.clientX - touchState.startX;
  const moveY = touch.clientY - touchState.startY;
  const distance = Math.hypot(moveX, moveY);

  if (!touchState.holdReady && distance > TOUCH_HOLD_MOVE_TOLERANCE) {
    touchState.moved = true;
    resetTouchLongPress();
  }

  if (distance > TOUCH_DRAG_START_PX) {
    touchState.moved = true;
  }

  if (panning) {
    e.preventDefault();
    camera.panX = panning.startPanX + (touch.clientX - panning.startX);
    camera.panY = panning.startPanY + (touch.clientY - panning.startY);
    applyCamera();
    return;
  }

  if (state.tool !== 'select' || !touchState.target) return;
  const canDrag = state.touchMoveMode
    ? (touchState.holdReady && touchState.moved)
    : touchState.moved;
  if (!canDrag) return;

  if (!drag) {
    const obj = getMovableObject(touchState.target.type, touchState.target.id);
    if (!obj) return;
    drag = {
      type: touchState.target.type,
      id: touchState.target.id,
      sx: touchState.startSvgX,
      sy: touchState.startSvgY,
      ox: obj.x,
      oy: obj.y,
    };
    touchState.dragStarted = true;
  }

  e.preventDefault();
  const pt = svgPt(touch);
  const dx = pt.x - drag.sx;
  const dy = pt.y - drag.sy;
  const obj = getMovableObject(drag.type, drag.id);
  if (!obj) return;
  obj.x = Math.max(0, snapValue(drag.ox + dx));
  obj.y = Math.max(0, snapValue(drag.oy + dy));
  render();
}, { passive: false });

let lastTap = { time: 0, type: null, id: null };
let lastEditOpen = { time: 0, type: null, id: null };

function openEditFor(type, id) {
  if (state.tool !== 'select') return;

  const now = Date.now();
  if (lastEditOpen.type === type && lastEditOpen.id === id && now - lastEditOpen.time < 220) return;
  lastEditOpen = { time: now, type, id };

  state.selected = { type, id };
  render();
  if (type === 'entity') openEntityModal(id);
  else if (type === 'assoc') openAssocModal(id);
  else if (type === 'note')  openNoteModal(id);
  else if (type === 'group') openGroupModal(id);
  else if (type === 'constraint') openConstraintModal(id);
  else if (type === 'label') openLabelModal(id);
}

svg.addEventListener('touchend', e => {
  // reset pinch state if needed
  if (e.touches.length < 2) lastPinchDist = null;

  const holdReady = touchState.holdReady;
  const hadMovement = touchState.moved;
  const dragStarted = touchState.dragStarted;
  const tapTarget = touchState.target;

  if (e.touches.length === 0) {
    drag = null;
    panning = null;
  }

  resetTouchLongPress();

  if (holdReady && !hadMovement && tapTarget && state.tool === 'select' && e.changedTouches.length === 1) {
    const touch = e.changedTouches[0];
    showContextMenu(touch.clientX, touch.clientY, tapTarget);
    touchState.suppressClickUntil = Date.now() + 500;
    clearTouchState();
    return;
  }

  // single-finger double tap = edit (mobile equivalent of double-click)
  if (e.changedTouches.length !== 1 || e.touches.length !== 0) return;

  touchState.suppressClickUntil = Date.now() + 350;

  if (hadMovement || dragStarted) {
    clearTouchState();
    return;
  }

  handleTouchTap(tapTarget);

  const touch = e.changedTouches[0];
  const hit = resolveDiagramTarget(document.elementFromPoint(touch.clientX, touch.clientY));
  if (!hit) {
    lastTap.time = 0;
    clearTouchState();
    return;
  }

  const type = hit.dataset.type;
  const id = parseInt(hit.dataset.id);
  const now = Date.now();
  const isDoubleTap =
    lastTap.type === type &&
    lastTap.id === id &&
    now - lastTap.time < 320;

  lastTap = { time: now, type, id };
  if (isDoubleTap) openEditFor(type, id);
  clearTouchState();
}, { passive: true });

svg.addEventListener('touchcancel', () => {
  lastPinchDist = null;
  drag = null;
  panning = null;
  clearTouchState();
}, { passive: true });

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
touchMoveBtn?.addEventListener('click', () => {
  state.touchMoveMode = !state.touchMoveMode;
  updateTouchMoveButton();
  hideContextMenu();
  showToast(t('toast_touch_mode', { state: state.touchMoveMode ? t('mode_on') : t('mode_off') }));
});

/**
 * Centre et adapte le zoom pour que tous les éléments soient visibles.
 * Si le canvas est vide, réinitialise la caméra.
 */
function fitToContent() {
  const all = [...state.entities, ...state.associations, ...state.notes, ...state.groups, ...state.constraints, ...state.labels];
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
    const bounds = assocBounds(asc);
    minX = Math.min(minX, bounds.minX);
    minY = Math.min(minY, bounds.minY);
    maxX = Math.max(maxX, bounds.maxX);
    maxY = Math.max(maxY, bounds.maxY);
  });
  state.notes.forEach(n => {
    minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + (n.w ?? NOTE_W));
    maxY = Math.max(maxY, n.y + (n.h ?? NOTE_H));
  });
  state.groups.forEach(g => {
    minX = Math.min(minX, g.x); minY = Math.min(minY, g.y);
    maxX = Math.max(maxX, g.x + (g.w ?? GROUP_MIN_W));
    maxY = Math.max(maxY, g.y + (g.h ?? GROUP_MIN_H));
  });
  state.constraints.forEach(c => {
    minX = Math.min(minX, c.x); minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x + (c.w ?? CONSTRAINT_W));
    maxY = Math.max(maxY, c.y + (c.h ?? CONSTRAINT_H));
  });
  state.labels.forEach(l => {
    const lw = l.w ?? LABEL_W;
    const lh = l.h ?? LABEL_H;
    minX = Math.min(minX, l.x); minY = Math.min(minY, l.y);
    maxX = Math.max(maxX, l.x + lw);
    maxY = Math.max(maxY, l.y + lh);
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
  if (state.tool !== 'select') return;

  const tgt = resolveDiagramTarget(e.target);
  if (!tgt) return;
  const type = tgt.dataset.type;
  const id   = parseInt(tgt.dataset.id);
  openEditFor(type, id);
});

svg.addEventListener('contextmenu', e => {
  const tgt = resolveContextTarget(e.target);
  if (!tgt) {
    hideContextMenu();
    return;
  }

  e.preventDefault();
  const type = tgt.dataset.type;
  const id = parseInt(tgt.dataset.id);
  showContextMenu(e.clientX, e.clientY, { type, id });
});

svg.addEventListener('click', e => {
  if (Date.now() < touchState.suppressClickUntil) return;
  if (state.tool !== 'select') return;
  if (e.detail !== 2) return;
  const tgt = resolveDiagramTarget(e.target);
  if (!tgt) return;
  const type = tgt.dataset.type;
  const id = parseInt(tgt.dataset.id);
  openEditFor(type, id);
});

document.addEventListener('click', e => {
  if (Date.now() < touchState.suppressClickUntil) return;
  if (!contextMenu || contextMenu.classList.contains('hidden')) return;
  if (contextMenu.contains(e.target)) return;
  hideContextMenu();
});

window.addEventListener('resize', hideContextMenu);

contextMenu?.querySelectorAll('.context-menu-item').forEach(button => {
  button.addEventListener('click', () => {
    if (button.disabled) return;

    const target = state.contextTarget;
    hideContextMenu();

    if (!target) return;
    const { type, id } = target;
    const action = button.dataset.action;

    if (action === 'edit') {
      state.selected = { type, id };
      render();
      if (type === 'entity') openEntityModal(id);
      else if (type === 'assoc') openAssocModal(id);
      else if (type === 'note')  openNoteModal(id);
      else if (type === 'group') openGroupModal(id);
      else if (type === 'inheritance') openInheritanceModal(id);
      else if (type === 'constraint') openConstraintModal(id);
      else if (type === 'label') openLabelModal(id);
      return;
    }

    if (action === 'duplicate') {
      state.selected = { type, id };
      duplicateSelected();
      return;
    }

    if (action === 'delete') {
      doDelete(type, id);
      state.selected = null;
      state.contextTarget = null;
    }
  });
});

// Deselect on background click
svg.addEventListener('click', e => {
  if (Date.now() < touchState.suppressClickUntil) return;
  const tgt = resolveTypedTarget(e.target);
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
    hideContextMenu();
    cancelConnect();
    state.selected = null;
    render();
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (state.selected) {
      doDelete(state.selected.type, state.selected.id);
      state.selected = null;
    }
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
    e.preventDefault();
    duplicateSelected();
  } else if (e.key === 'c' || e.key === 'C') {
    centerOnSelected();
  } else if (e.key === 'g' || e.key === 'G') {
    state.snapToGrid = !state.snapToGrid;
    updateSnapButton();
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
      showToast(t('toast_need_entity_assoc'));
      updateHint();
      render();
      return;
    }

    if (state.connections.find(c => c.assocId === assocId && c.entityId === entityId)) {
      showToast(t('toast_connection_exists'));
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
    state.inheritances = state.inheritances.filter(i => i.parentId !== id && i.childId !== id);
  } else if (type === 'assoc') {
    state.associations = state.associations.filter(a => a.id !== id);
    state.connections  = state.connections.filter(c => c.assocId !== id);
  } else if (type === 'connection') {
    state.connections = state.connections.filter(c => c.id !== id);
  } else if (type === 'note') {
    state.notes = state.notes.filter(n => n.id !== id);
  } else if (type === 'group') {
    state.groups = state.groups.filter(g => g.id !== id);
  } else if (type === 'inheritance') {
    state.inheritances = state.inheritances.filter(i => i.id !== id);
  } else if (type === 'constraint') {
    state.constraints = state.constraints.filter(c => c.id !== id);
  } else if (type === 'label') {
    state.labels = state.labels.filter(l => l.id !== id);
  }
  render();
}

// ── Toolbar Buttons ───────────────────────────────────────────
document.getElementById('btn-add-entity').addEventListener('click', () => {
  const id  = uid();
  const r   = svg.getBoundingClientRect();
  const x   = snapValue(Math.round(r.width  / 2 - ENT_W / 2 + randOff()));
  const y   = snapValue(Math.round(r.height / 2 - 60 + randOff()));
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
  const x  = snapValue(Math.round(r.width  / 2 + randOff()));
  const y  = snapValue(Math.round(r.height / 2 + randOff()));
  state.associations.push({
    id, name: 'ASSOC_' + id,
    x: Math.max(ASC_R + 10, x), y: Math.max(ASC_R + 10, y),
    attributes: [],
  });
  render();
  openAssocModal(id);
});

document.getElementById('btn-add-note')?.addEventListener('click', () => {
  const id = uid();
  const r  = svg.getBoundingClientRect();
  const x  = snapValue(Math.round((r.width  / 2 - NOTE_W / 2 + randOff() - camera.panX) / camera.zoom));
  const y  = snapValue(Math.round((r.height / 2 - NOTE_H / 2 + randOff() - camera.panY) / camera.zoom));
  state.notes.push({ id, text: '', x: Math.max(10, x), y: Math.max(10, y), w: NOTE_W, h: NOTE_H });
  state.selected = { type: 'note', id };
  render();
  openNoteModal(id);
});

document.getElementById('btn-add-group')?.addEventListener('click', () => {
  const id = uid();
  const r  = svg.getBoundingClientRect();
  const x  = snapValue(Math.round((r.width  / 2 - 120 + randOff() - camera.panX) / camera.zoom));
  const y  = snapValue(Math.round((r.height / 2 - 80  + randOff() - camera.panY) / camera.zoom));
  state.groups.push({ id, name: 'Groupe', x: Math.max(10, x), y: Math.max(10, y), w: 240, h: 180, colorIndex: 0 });
  state.selected = { type: 'group', id };
  render();
  openGroupModal(id);
});

document.getElementById('btn-add-inheritance')?.addEventListener('click', () => {
  if (state.entities.length < 2) {
    showToast(t('toast_need_two_entities'));
    return;
  }
  openInheritanceModal();
});

document.getElementById('btn-add-constraint')?.addEventListener('click', () => {
  const id = uid();
  const r = svg.getBoundingClientRect();
  const x = snapValue(Math.round((r.width / 2 - CONSTRAINT_W / 2 + randOff() - camera.panX) / camera.zoom));
  const y = snapValue(Math.round((r.height / 2 - CONSTRAINT_H / 2 + randOff() - camera.panY) / camera.zoom));
  state.constraints.push({
    id,
    code: `C${id}`,
    text: 'Règle métier',
    x: Math.max(10, x),
    y: Math.max(10, y),
    w: CONSTRAINT_W,
    h: CONSTRAINT_H,
  });
  state.selected = { type: 'constraint', id };
  render();
  openConstraintModal(id);
});

document.getElementById('btn-add-label')?.addEventListener('click', () => {
  const id = uid();
  const r = svg.getBoundingClientRect();
  const x = snapValue(Math.round((r.width / 2 - LABEL_W / 2 + randOff() - camera.panX) / camera.zoom));
  const y = snapValue(Math.round((r.height / 2 - LABEL_H / 2 + randOff() - camera.panY) / camera.zoom));
  state.labels.push({
    id,
    text: `Repère ${id}`,
    x: Math.max(10, x),
    y: Math.max(10, y),
    w: LABEL_W,
    h: LABEL_H,
  });
  state.selected = { type: 'label', id };
  render();
  openLabelModal(id);
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

document.getElementById('btn-duplicate-selected')?.addEventListener('click', duplicateSelected);
document.getElementById('btn-center-selected')?.addEventListener('click', centerOnSelected);
document.getElementById('btn-toggle-snap')?.addEventListener('click', () => {
  state.snapToGrid = !state.snapToGrid;
  updateSnapButton();
});

function updateHint() {
  const el = document.getElementById('tool-hint');
  if (state.tool === 'select') {
    el.textContent = t('hint_select');
  } else if (state.tool === 'delete') {
    el.textContent = t('hint_delete');
  } else if (state.tool === 'connect') {
    if (state.connectStep === 0) {
      el.textContent = t('hint_connect_step1');
    } else {
      const src = state.connectSource;
      const name = src.type === 'entity'
        ? getEntity(src.id)?.name
        : getAssoc(src.id)?.name;
      el.textContent = t('hint_connect_step2', { name });
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
  renderAssocAttrList(assocAttrs(asc));
  renderConnList(id);
  document.getElementById('modal-assoc').classList.remove('hidden');
  document.getElementById('assoc-name-input').focus();
}

function renderAssocAttrList(attrs) {
  const list = document.getElementById('assoc-attributes-list');
  list.innerHTML = '';

  if (!attrs.length) {
    const note = document.createElement('p');
    note.className = 'empty-assoc-note';
    note.textContent = 'Aucun champ — ajoutez des attributs métiers à cette association.';
    list.appendChild(note);
    return;
  }

  attrs.forEach((attr, index) => {
    const row = document.createElement('div');
    row.className = 'attr-row assoc-attr-row';
    row.innerHTML = `
      <input class="attr-name" type="text" value="${escHtml(attr.name)}" placeholder="Nom du champ">
      <select class="attr-type">
        ${ATTR_TYPES.map(type => `<option${type === attr.type ? ' selected' : ''}>${escHtml(type)}</option>`).join('')}
      </select>
      <button class="btn-rm" data-i="${index}" title="Supprimer">&times;</button>
    `;
    list.appendChild(row);
  });

  list.querySelectorAll('.btn-rm').forEach(button => {
    button.addEventListener('click', () => {
      const asc = getAssoc(state.editAssocId);
      if (!asc) return;
      assocAttrs(asc).splice(parseInt(button.dataset.i), 1);
      renderAssocAttrList(assocAttrs(asc));
    });
  });
}

document.getElementById('btn-add-assoc-attr').addEventListener('click', () => {
  const asc = getAssoc(state.editAssocId);
  if (!asc) return;
  const attrs = assocAttrs(asc);
  attrs.push({ name: 'champ' + (attrs.length + 1), type: 'VARCHAR(50)' });
  renderAssocAttrList(attrs);
});

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
  asc.attributes = Array.from(document.querySelectorAll('#assoc-attributes-list .assoc-attr-row')).map(row => ({
    name: row.querySelector('.attr-name').value.trim() || 'champ',
    type: row.querySelector('.attr-type').value,
  }));
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
    .then(() => showToast(t('toast_sql_copied')));
});

document.getElementById('btn-sql-download').addEventListener('click', () => {
  downloadBlob('schema.sql', document.getElementById('sql-output').value, 'text/plain');
});

document.getElementById('btn-sql-close').addEventListener('click', () => {
  document.getElementById('modal-sql').classList.add('hidden');
});

// ── Modal : Note ─────────────────────────────────────────────
function autosizeNoteTextarea() {
  const input = document.getElementById('note-text-input');
  if (!input) return;
  input.style.height = 'auto';
  const maxHeight = Math.round(window.innerHeight * 0.52);
  const nextHeight = Math.min(input.scrollHeight, maxHeight);
  input.style.height = `${Math.max(120, nextHeight)}px`;
  input.style.overflowY = input.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

function openNoteModal(id) {
  state.editNoteId = id;
  const note = getNote(id);
  if (!note) return;
  document.getElementById('note-text-input').value = note.text ?? '';
  autosizeNoteTextarea();
  document.getElementById('modal-note').classList.remove('hidden');
  document.getElementById('note-text-input').focus();
}

function closeNoteModal() {
  document.getElementById('modal-note').classList.add('hidden');
  state.editNoteId = null;
}

document.getElementById('btn-note-save')?.addEventListener('click', () => {
  const note = getNote(state.editNoteId);
  if (!note) return;
  note.text = document.getElementById('note-text-input').value;
  syncNoteSize(note);
  closeNoteModal();
  render();
});
document.getElementById('btn-note-cancel')?.addEventListener('click', closeNoteModal);
document.getElementById('note-text-input')?.addEventListener('input', event => {
  if (state.editNoteId == null) return;
  const note = getNote(state.editNoteId);
  if (!note) return;
  autosizeNoteTextarea();
  note.text = event.target.value;
  syncNoteSize(note);
  render();
});

// ── Modal : Groupe ───────────────────────────────────────────
function openGroupModal(id) {
  state.editGroupId = id;
  const grp = getGroup(id);
  if (!grp) return;
  document.getElementById('group-name-input').value = grp.name ?? 'Groupe';
  renderGroupColorPicker(grp.colorIndex ?? 0);
  document.getElementById('modal-group').classList.remove('hidden');
  document.getElementById('group-name-input').focus();
}

function renderGroupColorPicker(selectedIndex) {
  const picker = document.getElementById('group-color-picker');
  if (!picker) return;
  picker.innerHTML = '';
  GROUP_COLORS.forEach((color, index) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'color-swatch' + (index === selectedIndex ? ' active' : '');
    swatch.style.background = color.stroke;
    swatch.title = color.name;
    swatch.dataset.index = index;
    swatch.addEventListener('click', () => {
      picker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    });
    picker.appendChild(swatch);
  });
}

function closeGroupModal() {
  document.getElementById('modal-group').classList.add('hidden');
  state.editGroupId = null;
}

document.getElementById('btn-group-save')?.addEventListener('click', () => {
  const grp = getGroup(state.editGroupId);
  if (!grp) return;
  grp.name = document.getElementById('group-name-input').value.trim() || 'Groupe';
  const activeSwatch = document.querySelector('#group-color-picker .color-swatch.active');
  if (activeSwatch) grp.colorIndex = parseInt(activeSwatch.dataset.index);
  closeGroupModal();
  render();
});
document.getElementById('btn-group-cancel')?.addEventListener('click', closeGroupModal);

// ── Modal : Contrainte ──────────────────────────────────────
function openConstraintModal(id) {
  state.editConstraintId = id;
  const constraint = getConstraint(id);
  if (!constraint) return;
  document.getElementById('constraint-code-input').value = constraint.code ?? `C${id}`;
  document.getElementById('constraint-text-input').value = constraint.text ?? '';
  document.getElementById('modal-constraint').classList.remove('hidden');
  document.getElementById('constraint-code-input').focus();
}

function closeConstraintModal() {
  document.getElementById('modal-constraint').classList.add('hidden');
  state.editConstraintId = null;
}

document.getElementById('btn-constraint-save')?.addEventListener('click', () => {
  const constraint = getConstraint(state.editConstraintId);
  if (!constraint) return;
  constraint.code = (document.getElementById('constraint-code-input').value.trim() || 'C?').toUpperCase();
  constraint.text = document.getElementById('constraint-text-input').value.trim() || 'Règle métier';
  closeConstraintModal();
  render();
});
document.getElementById('btn-constraint-cancel')?.addEventListener('click', closeConstraintModal);

// ── Modal : Repère ──────────────────────────────────────────
function openLabelModal(id) {
  state.editLabelId = id;
  const label = getLabel(id);
  if (!label) return;
  document.getElementById('label-text-input').value = label.text ?? 'Repère';
  document.getElementById('modal-label').classList.remove('hidden');
  document.getElementById('label-text-input').focus();
}

function closeLabelModal() {
  document.getElementById('modal-label').classList.add('hidden');
  state.editLabelId = null;
}

document.getElementById('btn-label-save')?.addEventListener('click', () => {
  const label = getLabel(state.editLabelId);
  if (!label) return;
  label.text = document.getElementById('label-text-input').value.trim() || 'Repère';
  syncLabelSize(label);
  closeLabelModal();
  render();
});
document.getElementById('btn-label-cancel')?.addEventListener('click', closeLabelModal);
document.getElementById('label-text-input')?.addEventListener('input', event => {
  if (state.editLabelId == null) return;
  const label = getLabel(state.editLabelId);
  if (!label) return;
  label.text = event.target.value;
  syncLabelSize(label);
  render();
});

// ── Modal : Héritage IS-A ─────────────────────────────────────
function openInheritanceModal(existingId) {
  const parentSel = document.getElementById('inherit-parent-select');
  const childSel  = document.getElementById('inherit-child-select');
  parentSel.innerHTML = '';
  childSel.innerHTML  = '';
  state.entities.forEach(ent => {
    parentSel.add(new Option(ent.name, ent.id));
    childSel.add(new Option(ent.name, ent.id));
  });
  if (childSel.options.length > 1) childSel.selectedIndex = 1;

  if (existingId) {
    const inh = getInheritance(existingId);
    if (inh) {
      parentSel.value = inh.parentId;
      childSel.value  = inh.childId;
      document.getElementById('inherit-type-select').value = inh.coverType ?? 'total';
    }
  }
  document.getElementById('modal-inheritance').classList.remove('hidden');
}

document.getElementById('btn-inheritance-save')?.addEventListener('click', () => {
  const parentId   = parseInt(document.getElementById('inherit-parent-select').value);
  const childId    = parseInt(document.getElementById('inherit-child-select').value);
  const coverType  = document.getElementById('inherit-type-select').value;

  if (parentId === childId) {
    showToast(t('toast_inheritance_diff'));
    return;
  }
  if (state.inheritances.find(i => i.parentId === parentId && i.childId === childId)) {
    showToast(t('toast_inheritance_exists'));
    document.getElementById('modal-inheritance').classList.add('hidden');
    return;
  }
  state.inheritances.push({ id: uid(), parentId, childId, coverType });
  document.getElementById('modal-inheritance').classList.add('hidden');
  render();
});
document.getElementById('btn-inheritance-cancel')?.addEventListener('click', () => {
  document.getElementById('modal-inheritance').classList.add('hidden');
});

// ── Modal overlay close ───────────────────────────────────────
// (patched below with existing modal-overlay listeners)
// extra overlay handlers for new modals
['modal-note', 'modal-group', 'modal-inheritance', 'modal-constraint', 'modal-label'].forEach(modalId => {
  const overlay = document.querySelector(`#${modalId} .modal-overlay`);
  if (!overlay) return;
  overlay.addEventListener('click', () => {
    document.getElementById(modalId).classList.add('hidden');
    if (modalId === 'modal-note')  state.editNoteId = null;
    if (modalId === 'modal-group') state.editGroupId = null;
    if (modalId === 'modal-constraint') state.editConstraintId = null;
    if (modalId === 'modal-label') state.editLabelId = null;
  });
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
  const assocAttrsByEntity = new Map();
  state.entities.forEach(e => fkByEntity.set(e.id, []));
  state.entities.forEach(e => assocAttrsByEntity.set(e.id, []));

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

      if (fkConns[0]?.entityId === fc.entityId) {
        assocAttrsByEntity.get(fkEnt.id)?.push(
          ...assocAttrs(asc).map(attr => ({
            colName: toSqlName(attr.name),
            colType: attr.type,
          }))
        );
      }

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

    (assocAttrsByEntity.get(ent.id) ?? []).forEach(attr => {
      const exists = cols.some(line => line.startsWith(`  ${attr.colName} `));
      if (!exists) cols.push(`  ${attr.colName} ${attr.colType}`);
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

    assocAttrs(asc).forEach(attr => {
      cols.push(`  ${toSqlName(attr.name)} ${attr.type}`);
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
  img.onerror = () => { URL.revokeObjectURL(url); showToast(t('toast_png_error')); };
  img.src = url;
});

// ── Save / Load JSON ──────────────────────────────────────────
document.getElementById('btn-save-json').addEventListener('click', () => {
  const data = {
    entities:     state.entities,
    associations: state.associations,
    connections:  state.connections,
    notes:        state.notes,
    groups:       state.groups,
    inheritances: state.inheritances,
    constraints:  state.constraints,
    labels:       state.labels,
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
        showToast(t('toast_json_invalid')); return;
      }
      state.entities     = data.entities;
      state.associations = (data.associations ?? []).map(association => ({
        ...association,
        attributes: Array.isArray(association.attributes) ? association.attributes : [],
      }));
      state.connections  = data.connections  ?? [];
      state.notes        = data.notes        ?? [];
      state.groups       = data.groups       ?? [];
      state.inheritances = data.inheritances ?? [];
      state.constraints  = data.constraints  ?? [];
      state.labels       = data.labels       ?? [];
      state.nextId       = data.nextId ?? 1;
      state.selected     = null;
      render();
      showToast(t('toast_json_loaded'));
    } catch { showToast(t('toast_json_load_error')); }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ── Clear ─────────────────────────────────────────────────────
document.getElementById('btn-clear').addEventListener('click', () => {
  if (!confirm('Effacer tout le diagramme ? Cette action est irréversible.')) return;
  state.entities = []; state.associations = []; state.connections = [];
  state.notes = []; state.groups = []; state.inheritances = [];
  state.constraints = []; state.labels = [];
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
    const bounds = assocBounds(association);
    minX = Math.min(minX, bounds.minX);
    minY = Math.min(minY, bounds.minY);
    maxX = Math.max(maxX, bounds.maxX);
    maxY = Math.max(maxY, bounds.maxY);
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
    showToast(t('toast_mcd_generated', {
      entities: result.entities.length,
      associations: result.associations.length,
    }));
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

      const assoc = { id: nextId++, name: assocName, x: ax, y: ay, attributes: [] };
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
        const ownCols = (colsMap.get(jName) ?? []).filter(col => !fks.some(fk => fk.col === col.name));
        const assoc = {
          id: nextId++,
          name: jName.toUpperCase(),
          x: ax,
          y: ay,
          attributes: ownCols.map(col => ({ name: col.name, type: col.type })),
        };
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
applyLanguageToEditor();
render();
