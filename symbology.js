// symbology.js
(function () {
  // ===== util color
  function toHexColor(input) {
    if (!input) return '#333333';
    let c = String(input).trim();
    if (c.startsWith('#')) {
      if (c.length === 4) return '#' + c[1]+c[1] + c[2]+c[2] + c[3]+c[3];
      return c.slice(0,7);
    }
    let m = c.match(/rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    if (m) {
      const r = Math.round(parseFloat(m[1]));
      const g = Math.round(parseFloat(m[2]));
      const b = Math.round(parseFloat(m[3]));
      const to2 = n => n.toString(16).padStart(2,'0');
      return '#' + to2(r)+to2(g)+to2(b);
    }
    try {
      const tmp = document.createElement('div');
      tmp.style.color = c;
      document.body.appendChild(tmp);
      const comp = getComputedStyle(tmp).color;
      document.body.removeChild(tmp);
      m = comp.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (m) {
        const to2 = n => Number(n).toString(16).padStart(2,'0');
        return '#' + to2(m[1])+to2(m[2])+to2(m[3]);
      }
    } catch(e) {}
    return '#333333';
  }
  function labelForStyle(style) {
    if (style === 'solid')  return 'Sólida';
    if (style === 'dotted') return 'Punteada';
    if (style === 'dashed') return 'Segmentada';
    return '—';
  }
  function dashFor(style) {
    if (style === 'solid')  return 'none';
    if (style === 'dotted') return '2 4';
    return '8 4'; // dashed por defecto
  }
  // local helpers (no dependemos de relations.js)
  function getStyleFromLineEl(lineEl) {
    if (!lineEl || !lineEl.classList) return 'dashed';
    if (lineEl.classList.contains('solid'))  return 'solid';
    if (lineEl.classList.contains('dotted')) return 'dotted';
    if (lineEl.classList.contains('dashed')) return 'dashed';
    return 'dashed';
  }
  function getColorFromLineEl(lineEl) {
    const inline = lineEl.style && lineEl.style.stroke;
    const attr   = lineEl.getAttribute && lineEl.getAttribute('stroke');
    const comp   = getComputedStyle(lineEl).stroke;
    return toHexColor(inline || attr || comp || '#333333');
  }

  // === almacenamiento de contexto por combinación (en memoria + localStorage)
  const META_KEY = 'symbologyMetaV1';
  const persisted = (() => {
    try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); } catch(e) { return {}; }
  })();
  const META = (window.symbologyMeta = persisted);

  function saveMeta() {
    try { localStorage.setItem(META_KEY, JSON.stringify(META)); } catch(e) {}
  }

  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    if (!grid) return;

    // ===== Ventana
    const win = document.createElement('div');
    win.id = 'symbologyWindow';
    win.className = 'symbology open';
    win.style.left = '16px';
    win.style.top  = '16px';
    win.style.width = '260px';

    win.innerHTML = `
      <div class="sym-header" title="Arrastra para mover">
        <div class="sym-title">
          <i class="fa-solid fa-palette"></i>
          <span>Simbología</span>
        </div>
        <div class="sym-actions">
          <button class="sym-btn sym-min" title="Minimizar">
            <i class="fa-solid fa-minus"></i>
          </button>
        </div>
      </div>
      <div class="sym-body">
        <div id="symList" class="sym-list"></div>
        <div id="symEmpty" class="sym-empty">Aún no hay relaciones.</div>
      </div>
    `;
    grid.appendChild(win);

    // ===== mover (drag) por header
    (function makeDraggable() {
      const header = win.querySelector('.sym-header');
      let dragging = false, offX = 0, offY = 0;
      header.addEventListener('mousedown', (e) => {
        if (e.target && e.target.closest('.sym-actions')) return;
        dragging = true;
        const r = win.getBoundingClientRect();
        offX = e.clientX - r.left;
        offY = e.clientY - r.top;
        function onMove(ev) {
          if (!dragging) return;
          const gr = grid.getBoundingClientRect();
          let nx = ev.clientX - gr.left - offX;
          let ny = ev.clientY - gr.top  - offY;
          nx = Math.max(0, Math.min(nx, grid.clientWidth  - win.offsetWidth));
          ny = Math.max(0, Math.min(ny, grid.clientHeight - win.offsetHeight));
          win.style.left = `${nx}px`;
          win.style.top  = `${ny}px`;
        }
        function onUp() {
          dragging = false;
          document.removeEventListener('mousemove', onMove);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp, { once: true });
      });
    })();

    // ===== minimizar/restaurar
    const btnMin = win.querySelector('.sym-min');
    btnMin.addEventListener('click', () => {
      const goingToMin = !win.classList.contains('minimized');
      const icon = btnMin.querySelector('i');
      if (goingToMin) {
        const rect = win.getBoundingClientRect();
        win.dataset.prevW = `${rect.width}px`;
        win.dataset.prevH = `${rect.height}px`;
        win.classList.add('minimized');
        win.classList.remove('open');
        win.style.height = 'auto';
        win.style.width  = '180px';
        win.style.overflow = 'hidden';
        if (icon) icon.className = 'fa-solid fa-up-right-and-down-left-from-center';
        btnMin.title = 'Restaurar';
      } else {
        win.classList.remove('minimized');
        win.classList.add('open');
        win.style.overflow = 'auto';
        win.style.width  = win.dataset.prevW || '260px';
        win.style.height = win.dataset.prevH || 'auto';
        if (icon) icon.className = 'fa-solid fa-minus';
        btnMin.title = 'Minimizar';
      }
    });

    // ===== render lista (únicos estilo+color) + botón Editar
    const listEl  = win.querySelector('#symList');
    const emptyEl = win.querySelector('#symEmpty');

    function render(entries, highlightKey = null) {
      listEl.innerHTML = '';
      if (!entries.length) {
        emptyEl.style.display = 'block';
        return;
      }
      emptyEl.style.display = 'none';

      entries.forEach(({ style, color }) => {
        const key = `${style}|${color}`;
        const meta = META[key] || { title:'', desc:'' };
        const hasMeta = !!(meta.title || meta.desc);

        const item = document.createElement('div');
        item.className = 'sym-item' + (highlightKey === key ? ' highlight' : '');
        item.innerHTML = `
          <div class="sym-line-demo">
            <svg viewBox="0 0 240 36" preserveAspectRatio="none" aria-hidden="true">
              <line x1="8" y1="18" x2="232" y2="18"
                    stroke="${color}" stroke-width="3"
                    ${dashFor(style) === 'none' ? '' : `stroke-dasharray="${dashFor(style)}"`}/>
            </svg>
          </div>
          <div class="sym-meta">
            <span class="sym-style">${labelForStyle(style)}</span>
            <span class="sym-color"><span class="sym-chip" style="background:${color}"></span><code>${color.toUpperCase()}</code></span>
          </div>
          <div class="sym-ctx" style="display:flex;align-items:flex-start;gap:8px;margin-top:6px;">
            <button class="sym-btn sym-edit" title="Editar contexto"><i class="fa-solid fa-pen"></i></button>
            <div class="sym-ctx-preview" style="flex:1; font-size:.88rem; color:#444;">
              ${hasMeta
                ? `<strong>${meta.title ? meta.title+': ' : ''}</strong>${meta.desc || ''}`
                : `<span style="color:#888;">Sin contexto…</span>`}
            </div>
          </div>
        `;
        listEl.appendChild(item);

        const btnEdit = item.querySelector('.sym-edit');
        btnEdit.addEventListener('click', () => openContextModal(key, {style, color}, meta));
      });
    }

    function scanRelations() {
      const rels = (window.relations || []);
      const seen = new Map(); // key -> {style,color}
      rels.forEach(r => {
        const style = getStyleFromLineEl(r.lineElement);
        const color = getColorFromLineEl(r.lineElement);
        const key = `${style}|${color}`;
        if (!seen.has(key)) seen.set(key, { style, color });
      });
      // orden consistente
      const order = { solid: 0, dashed: 1, dotted: 2 };
      return [...seen.values()].sort((a,b) =>
        (order[a.style]-order[b.style]) || a.color.localeCompare(b.color));
    }

    function openContextModal(key, cfg, current) {
      const old = document.getElementById('symCtxModal');
      if (old) old.remove();
      const modal = document.createElement('div');
      modal.id = 'symCtxModal';
      modal.className = 'modal';
      const t = (current && current.title) || '';
      const d = (current && current.desc ) || '';

      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Contexto de la relación</h3>
            <button id="symCtxClose" class="btn-close">&times;</button>
          </div>
          <div class="modal-body" style="display:block;">
            <div style="margin-bottom:8px; font-size:.9rem; color:#666;">
              <em>${labelForStyle(cfg.style)} · ${cfg.color.toUpperCase()}</em>
            </div>
            <label style="display:block; margin-bottom:10px;">
              <span>Título (opcional)</span>
              <input id="symCtxTitle" type="text" value="${t.replace(/"/g,'&quot;')}"
                style="width:100%; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:6px;">
            </label>
            <label style="display:block;">
              <span>Descripción</span>
              <textarea id="symCtxDesc"
                style="width:100%; min-height:90px; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:6px;">${d.replace(/</g,'&lt;')}</textarea>
            </label>
          </div>
          <div class="modal-footer">
            <button id="symCtxClear" class="btn" style="background:#6c757d;">Limpiar</button>
            <button id="symCtxCancel" class="btn">Cancelar</button>
            <button id="symCtxOk" class="btn">Guardar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const close = () => modal.remove();
      modal.querySelector('#symCtxClose').addEventListener('click', close);
      modal.querySelector('#symCtxCancel').addEventListener('click', close);
      modal.addEventListener('click', e => { if (e.target === modal) close(); });
      document.addEventListener('keydown', function onEsc(e){
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
      }, { once:true });

      modal.querySelector('#symCtxOk').addEventListener('click', () => {
        const title = modal.querySelector('#symCtxTitle').value.trim();
        const desc  = modal.querySelector('#symCtxDesc').value.trim();
        META[key] = { title, desc };
        saveMeta();
        render(scanRelations(), key);
        close();
      });
      modal.querySelector('#symCtxClear').addEventListener('click', () => {
        delete META[key];
        saveMeta();
        render(scanRelations(), key);
        close();
      });
    }

    // API global
    window.symbologyAPI = {
      set({ style, color } = {}) {
        const entries = scanRelations();
        const c = toHexColor(color || '#333333');
        const key = `${style||'dashed'}|${c}`;
        if (!entries.some(e => `${e.style}|${e.color}` === key)) {
          entries.push({ style: style||'dashed', color: c });
        }
        render(entries, key);
      },
      refreshFromRelations() {
        render(scanRelations(), null);
      },
      isMinimized() { return win.classList.contains('minimized'); },
      createExportClone() {
        const clone = win.cloneNode(true);
        clone.id = 'symbologyExportClone';
        clone.classList.remove('minimized');
        clone.classList.add('open');
        clone.style.position = 'fixed';
        clone.style.left = '-10000px';
        clone.style.top  = '0';
        document.body.appendChild(clone);
        return clone;
      }
    };

    // Para pdf.js: filas con meta (solo lo editado)
    window.getSymbologyLegendRows = function() {
      const entries = scanRelations();
      const rows = [];
      entries.forEach(e => {
        const key = `${e.style}|${e.color}`;
        const m = META[key];
        if (m && (m.title || m.desc)) {
          rows.push({ style: e.style, color: e.color, title: m.title||'', desc: m.desc||'' });
        }
      });
      return rows;
    };

    // init
    window.symbologyAPI.refreshFromRelations();
    window.refreshSymbology = () => window.symbologyAPI.refreshFromRelations();
  });
})();
