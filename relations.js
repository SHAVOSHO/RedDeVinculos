// relations.js
document.addEventListener('DOMContentLoaded', () => {
  const grid         = document.getElementById('grid');
  const svgLayer     = document.getElementById('relationLayer');
  const relationMenu = document.getElementById('relationMenu');
  const startBtn     = document.getElementById('startRelationBtn');
  const lineMenu     = document.getElementById('lineMenu');
  const deleteBtn    = document.getElementById('deleteRelationBtn');
  const solidBtn     = document.getElementById('solidRelationBtn');
  const dottedBtn    = document.getElementById('dottedRelationBtn');
  const dashedBtn    = document.getElementById('dashedRelationBtn');
  const colorBtn     = document.getElementById('colorRelationBtn');
  const deleteIconBtn= document.getElementById('deleteIconBtn');
  document.querySelectorAll('.relation-edit-btn').forEach(b => b.remove());

  let startIcon     = null;
  let isRelating    = false;
  let selectedRel   = null;
  let selectedGroup = null;
  window.relations  = [];

  // ===== Helpers =====
  function getAnchor(el, otherRect) {
    const gr = grid.getBoundingClientRect();
    const r  = el.getBoundingClientRect();
    const cx = r.left + r.width/2;
    const cy = r.top  + r.height/2;
    const ox = otherRect.left + otherRect.width/2;
    const oy = otherRect.top  + otherRect.height/2;

    if (el.classList.contains('group-box')) {
      const dx = ox - cx, dy = oy - cy;
      const scaleX = Math.abs(dx) < 1e-6 ? Infinity : (r.width/2)/Math.abs(dx);
      const scaleY = Math.abs(dy) < 1e-6 ? Infinity : (r.height/2)/Math.abs(dy);
      const t = Math.min(scaleX, scaleY);
      return { x: cx + dx*t - gr.left, y: cy + dy*t - gr.top };
    }
    return { x: cx - gr.left, y: cy - gr.top };
  }

  function setLineStyle(lineEl, style) {
    if (!lineEl) return;
    lineEl.classList.remove('solid', 'dotted', 'dashed');
    if (style === 'solid' || style === 'dotted' || style === 'dashed') {
      lineEl.classList.add(style);
    }
  }

  function getLineStyleFromElement(lineEl) {
    if (!lineEl || !lineEl.classList) return 'dashed';
    if (lineEl.classList.contains('solid'))  return 'solid';
    if (lineEl.classList.contains('dotted')) return 'dotted';
    if (lineEl.classList.contains('dashed')) return 'dashed';
    return 'dashed';
  }

  // NUEVO: todas las relaciones que tocan a un group-box (y opcionalmente solo con ciertos íconos)
  function relationsTouchingGroup(groupEl, onlyWithIconsSet = null) {
    const rels = window.relations || [];
    return rels.filter(r => {
      const touches = (r.startIcon === groupEl || r.endIcon === groupEl);
      if (!touches) return false;
      if (onlyWithIconsSet && onlyWithIconsSet.size) {
        const other = (r.startIcon === groupEl) ? r.endIcon : r.startIcon;
        return onlyWithIconsSet.has(other);
      }
      return true;
    });
  }

  // ===== Estilos (menú) =====
  function applyStyle(style) {
    // Caso 1: una línea seleccionada → solo esa
    if (selectedRel) {
      setLineStyle(selectedRel.lineElement, style);
      if (window.refreshSymbology) window.refreshSymbology();
      hideMenus();
      selectedRel = null;
      return;
    }

    // Caso 2: un grupo seleccionado → propagar a sus relaciones
    if (selectedGroup) {
      const iconsSel = new Set(document.querySelectorAll('.grid-icon.selected'));
      const toChange = relationsTouchingGroup(selectedGroup, iconsSel.size ? iconsSel : null);

      // Aplica estilo a todas las relaciones del grupo (o filtradas)
      toChange.forEach(r => setLineStyle(r.lineElement, style));

      // (Opcional) mantener el borde del grupo en el mismo estilo
      selectedGroup.classList.remove('solid','dotted','dashed');
      if (style === 'solid')  selectedGroup.classList.add('solid');
      if (style === 'dotted') selectedGroup.classList.add('dotted');
      if (style === 'dashed') selectedGroup.classList.add('dashed');

      if (window.refreshSymbology) window.refreshSymbology();
      hideMenus();
      selectedGroup = null;
      return;
    }

    // Sin contexto
    hideMenus();
  }

  // ===== Clicks en la grilla =====
  grid.addEventListener('click', e => {
    if (e.target.closest('.grid-icon') && window.isDraggingIcon) return;

    const icon = e.target.closest('.grid-icon');
    const line = e.target.closest('polyline.relation-line, polyline.relation-hit');
    const grp  = e.target.closest('.group-box');

    // Prioridad: icono
    if (icon && !isRelating && !line) {
      hideMenus();
      showRelationMenu(icon);
      return;
    }

    // Click interior de grupo: click-through a icono si toca
    if (grp && !isRelating && !icon && !line) {
      const r = grp.getBoundingClientRect();
      const margin = 6;
      const x = e.clientX, y = e.clientY;
      const inside = x > r.left + margin && x < r.right - margin &&
                     y > r.top  + margin && y < r.bottom - margin;
      if (inside) {
        grp.style.pointerEvents = 'none';
        const under = document.elementFromPoint(x, y);
        grp.style.pointerEvents = '';
        const underIcon = under && under.closest('.grid-icon');
        if (underIcon) {
          hideMenus();
          showRelationMenu(underIcon);
          return;
        }
      }
      // menú para grupo
      hideMenus();
      selectedGroup = grp;
      const gridRect = grid.getBoundingClientRect();
      lineMenu.style.left = `${e.clientX - gridRect.left + 5}px`;
      lineMenu.style.top  = `${e.clientY - gridRect.top  + 5}px`;
      lineMenu.classList.remove('hidden');
      return;
    }

    // Modo relacionar: conectar a icono o grupo
    if (isRelating) {
      if (icon && icon !== startIcon) {
        createRelation(startIcon, icon);
      } else if (grp && grp !== startIcon) {
        createRelation(startIcon, grp);
      }
      exitRelationMode();
      return;
    }

    // Clic en línea existente
    if (line) {
      e.stopPropagation();
      hideMenus();
      selectedRel = window.relations.find(r => r.lineElement === line || r.hitElement === line);
      if (selectedRel && window.symbologyAPI) {
        const style = getLineStyleFromElement(selectedRel.lineElement);
        const color = getCurrentLineHex(selectedRel);
        window.symbologyAPI.set({ style, color });
      }
      const gridRect = grid.getBoundingClientRect();
      lineMenu.style.left = `${e.clientX - gridRect.left + 5}px`;
      lineMenu.style.top  = `${e.clientY - gridRect.top  + 5}px`;
      lineMenu.classList.remove('hidden');
      return;
    }

    hideMenus();
  });

  startBtn.addEventListener('click', () => {
    if (!startIcon) return;
    window.dispatchEvent(new CustomEvent('modes:activate', {
      detail: { keep: 'connect' }
    }));
    isRelating = true;
    document.body.style.cursor = 'crosshair';
    relationMenu.classList.add('hidden');
  });

  window.addEventListener('modes:activate', (e) => {
    const keep = e.detail && e.detail.keep;
    if (keep !== 'connect' && isRelating) {
      exitRelationMode();
      hideMenus();
    }
  });

  deleteBtn.addEventListener('click', () => {
    if (selectedRel) {
      selectedRel.lineElement.remove();
      selectedRel.hitElement.remove();
      selectedRel.handleElement.remove();
      selectedRel.handleHitElement.remove();
      window.relations = window.relations.filter(r => r !== selectedRel);
      selectedRel = null;
    } else if (selectedGroup) {
      selectedGroup.remove();
      selectedGroup = null;
    }
    if (window.refreshSymbology) window.refreshSymbology();
    hideMenus();
  });

  // === Estilo de línea
  solidBtn .addEventListener('click', () => applyStyle('solid'));
  dottedBtn.addEventListener('click', () => applyStyle('dotted'));
  dashedBtn.addEventListener('click', () => applyStyle('dashed'));

  function showRelationMenu(elem) {
    startIcon = elem;

    window.dispatchEvent(new CustomEvent('relationMenu:show', {
      detail: { target: elem }
    }));

    document.getElementById('addDataBtn').style.display =
      elem.classList.contains('grid-icon') ? 'inline-block' : 'none';
    const gr = grid.getBoundingClientRect();
    const er = elem.getBoundingClientRect();
    relationMenu.style.left = `${er.right - gr.left + 5}px`;
    relationMenu.style.top  = `${er.top   - gr.top  - er.height/2}px`;
    relationMenu.classList.remove('hidden');

    document.getElementById('addDataBtn').style.display =
      elem.classList.contains('grid-icon') ? 'inline-block' : 'none';

    const delBtn = document.getElementById('deleteIconBtn');
    if (delBtn) {
      delBtn.style.display = elem.classList.contains('grid-icon') ? 'inline-block' : 'none';
    }
  }

  function exitRelationMode() {
    isRelating = false;
    startIcon  = null;
    document.body.style.cursor = 'default';
  }

  function hideMenus() {
    relationMenu.classList.add('hidden');
    lineMenu.classList.add('hidden');
  }

  function createRelation(el1, el2) {
    const gr = grid.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    const a1 = getAnchor(el1, r2);
    const a2 = getAnchor(el2, el1.getBoundingClientRect());
    const x1 = a1.x, y1 = a1.y;
    const x2 = a2.x, y2 = a2.y;
    const mx = (x1 + x2)/2;
    const my = (y1 + y2)/2;

    const ns   = 'http://www.w3.org/2000/svg';
    const line = document.createElementNS(ns, 'polyline');
    line.setAttribute('points', `${x1},${y1} ${mx},${my} ${x2},${y2}`);
    line.classList.add('relation-line');
    svgLayer.appendChild(line);

    const hit = document.createElementNS(ns, 'polyline');
    hit.setAttribute('points',  `${x1},${y1} ${mx},${my} ${x2},${y2}`);
    hit.setAttribute('fill', 'none');
    hit.setAttribute('stroke', 'transparent');
    hit.setAttribute('stroke-width', 14);
    hit.classList.add('relation-hit');
    svgLayer.appendChild(hit);

    const handle = document.createElementNS(ns, 'circle');
    handle.setAttribute('cx', mx);
    handle.setAttribute('cy', my);
    handle.setAttribute('r', 5);
    handle.classList.add('relation-handle');
    svgLayer.appendChild(handle);

    const handleHit = document.createElementNS(ns, 'circle');
    handleHit.setAttribute('cx', mx);
    handleHit.setAttribute('cy', my);
    handleHit.setAttribute('r', 12);
    handleHit.classList.add('relation-handle-hit');
    handleHit.setAttribute('fill', 'transparent');
    svgLayer.appendChild(handleHit);

    const rel = {
      startIcon: el1,
      endIcon:   el2,
      lineElement:        line,
      hitElement:         hit,
      handleElement:      handle,
      handleHitElement:   handleHit
    };
    window.relations.push(rel);

    handleHit.addEventListener('mousedown', e => {
      e.stopPropagation();
      let dragging = true;
      const pts = recalcEndpoints(rel);
      const onMove = evt => {
        if (!dragging) return;
        const gx = evt.clientX - gr.left;
        const gy = evt.clientY - gr.top;
        handle.setAttribute('cx', gx);
        handle.setAttribute('cy', gy);
        handleHit.setAttribute('cx', gx);
        handleHit.setAttribute('cy', gy);
        line.setAttribute('points', `${pts.x1},${pts.y1} ${gx},${gy} ${pts.x2},${pts.y2}`);
        hit.setAttribute('points',  `${pts.x1},${pts.y1} ${gx},${gy} ${pts.x2},${pts.y2}`);
      };
      const onUp = () => {
        dragging = false;
        document.removeEventListener('mousemove', onMove);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp, { once: true });
    });

    if (window.refreshSymbology) window.refreshSymbology();
  }

  function openRelationMetaModal(rel) {
    const old = document.getElementById('relMetaModal');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'relMetaModal';
    modal.className = 'modal';
    const t = (rel.meta && rel.meta.title) || '';
    const d = (rel.meta && rel.meta.desc)  || '';

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Editar relación</h3>
          <button id="relMetaClose" class="btn-close">&times;</button>
        </div>
        <div class="modal-body" style="display:block;">
          <label style="display:block; margin-bottom:10px;">
            <span>Título (opcional)</span>
            <input id="relMetaTitle" type="text" value="${t.replace(/"/g,'&quot;')}" style="width:100%; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:6px;">
          </label>
          <label style="display:block;">
            <span>Descripción</span>
            <textarea id="relMetaDesc" style="width:100%; min-height:90px; padding:8px; margin-top:4px; border:1px solid #ccc; border-radius:6px;">${d.replace(/</g,'&lt;')}</textarea>
          </label>
        </div>
        <div class="modal-footer">
          <button id="relMetaCancel" class="btn">Cancelar</button>
          <button id="relMetaOk" class="btn">Guardar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();

    modal.querySelector('#relMetaClose').addEventListener('click', close);
    modal.querySelector('#relMetaCancel').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', function onEsc(e){
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); }
    }, { once:true });

    modal.querySelector('#relMetaOk').addEventListener('click', () => {
      const title = modal.querySelector('#relMetaTitle').value.trim();
      const desc  = modal.querySelector('#relMetaDesc').value.trim();
      rel.meta = { title, desc };
      close();
    });
  }

  function recalcEndpoints(rel) {
    const p1 = getAnchor(rel.startIcon, rel.endIcon.getBoundingClientRect());
    const p2 = getAnchor(rel.endIcon, rel.startIcon.getBoundingClientRect());
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
  }

  // ===== Color helpers =====
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

  const COLOR_PALETTE = [
    '#333333','#000000','#e91e63','#9c27b0','#673ab7','#3f51b5',
    '#2196f3','#03a9f4','#00bcd4','#009688','#4caf50','#8bc34a',
    '#ffeb3b','#ffc107','#ff9800','#ff5722','#795548','#607d8b'
  ];

  function getCurrentLineHex(rel) {
    const el = rel.lineElement;
    const inline = el.style && el.style.stroke;
    const attr   = el.getAttribute('stroke');
    const comp   = getComputedStyle(el).stroke;
    return toHexColor(inline || attr || comp || '#333333');
  }

  function getCurrentGroupHex(grp) {
    const comp = getComputedStyle(grp).borderTopColor;
    return toHexColor(comp || '#333333');
  }

  // NUEVO: aplicar color a una relación
  function setLineColor(rel, hex) {
    if (!rel || !rel.lineElement) return;
    rel.lineElement.style.stroke = hex;
    if (rel.handleElement) rel.handleElement.style.stroke = hex;
    rel.color = hex;
  }

  function openColorModal(ctx) {
    // ctx: { type: 'line'|'group', target: selectedRel|HTMLElement }
    const isLine = ctx.type === 'line';
    const currentHex = isLine ? getCurrentLineHex(ctx.target)
                              : getCurrentGroupHex(ctx.target);

    hideMenus();

    const old = document.getElementById('colorModal');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'colorModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Color de ${isLine ? 'relación' : 'grupo'}</h3>
          <button id="colorClose" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="picker-row">
            <label>Seleccionar:</label>
            <input type="color" id="colorPicker" value="${currentHex}">
            <span id="colorHex">${currentHex.toUpperCase()}</span>
          </div>
          <div class="swatches">
            ${COLOR_PALETTE.map(hex => `<div class="swatch" data-hex="${hex}" style="background:${hex}"></div>`).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button id="colorCancel" class="btn">Cancelar</button>
          <button id="colorOK" class="btn">Aceptar</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const picker = modal.querySelector('#colorPicker');
    const hexLbl = modal.querySelector('#colorHex');

    const swatches = modal.querySelectorAll('.swatch');
    function selectSwatch(hex) {
      swatches.forEach(s => s.classList.toggle('selected', s.dataset.hex.toLowerCase() === hex.toLowerCase()));
    }
    selectSwatch(currentHex);

    picker.addEventListener('input', () => {
      hexLbl.textContent = picker.value.toUpperCase();
      selectSwatch(picker.value);
    });

    swatches.forEach(s => {
      s.addEventListener('click', () => {
        picker.value = s.dataset.hex;
        hexLbl.textContent = picker.value.toUpperCase();
        selectSwatch(picker.value);
      });
    });

    function applyAndClose() {
      const chosen = picker.value;

      if (isLine) {
        setLineColor(ctx.target, chosen);
        if (window.refreshSymbology) window.refreshSymbology();
      } else {
        // === NUEVO: color para todas (o filtradas) las relaciones del grupo ===
        ctx.target.style.borderColor = chosen; // borde del grupo

        const iconsSel = new Set(document.querySelectorAll('.grid-icon.selected'));
        const toChange = relationsTouchingGroup(ctx.target, iconsSel.size ? iconsSel : null);
        toChange.forEach(r => setLineColor(r, chosen));

        if (window.refreshSymbology) window.refreshSymbology();
      }

      modal.remove();
    }

    function cancelAndClose() { modal.remove(); }

    modal.querySelector('#colorOK').addEventListener('click', applyAndClose);
    modal.querySelector('#colorCancel').addEventListener('click', cancelAndClose);
    modal.querySelector('#colorClose').addEventListener('click', cancelAndClose);
    modal.addEventListener('click', e => { if (e.target === modal) cancelAndClose(); });
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') { cancelAndClose(); document.removeEventListener('keydown', onEsc); }
    }, { once: true });
  }

  if (colorBtn) {
    colorBtn.addEventListener('click', () => {
      if (selectedRel) {
        openColorModal({ type: 'line',  target: selectedRel });
      } else if (selectedGroup) {
        openColorModal({ type: 'group', target: selectedGroup });
      }
    });
  }

  // ====== Eliminar ícono (y sus aristas) ======
  function deleteIconAndEdges(iconEl) {
    if (!iconEl) return;

    const rels = window.relations || [];
    const touching = rels.filter(r => r.startIcon === iconEl || r.endIcon === iconEl);
    touching.forEach(r => {
      r.lineElement      && r.lineElement.remove();
      r.hitElement       && r.hitElement.remove();
      r.handleElement    && r.handleElement.remove();
      r.handleHitElement && r.handleHitElement.remove();
    });
    window.relations = rels.filter(r => r.startIcon !== iconEl && r.endIcon !== iconEl);

    iconEl.classList.remove('selected');
    iconEl.remove();

    startIcon = null;
    selectedRel = null;
    selectedGroup = null;

    if (window.refreshSymbology) window.refreshSymbology();
    hideMenus();
  }

  if (deleteIconBtn) {
    deleteIconBtn.addEventListener('click', () => {
      if (!startIcon || !startIcon.classList.contains('grid-icon')) return;
      if (confirm('¿Eliminar este ícono y todas sus relaciones?')) {
        deleteIconAndEdges(startIcon);
      }
    });
  }

  // ===== Reroute dinámico al mover
  window.updateRelationsForIcon = function() {
    window.relations.forEach(rel => {
      const pts = recalcEndpoints(rel);
      const mx = (pts.x1 + pts.x2)/2;
      const my = (pts.y1 + pts.y2)/2;
      rel.handleElement.setAttribute('cx', mx);
      rel.handleElement.setAttribute('cy', my);
      rel.handleHitElement.setAttribute('cx', mx);
      rel.handleHitElement.setAttribute('cy', my);
      rel.lineElement.setAttribute('points', `${pts.x1},${pts.y1} ${mx},${my} ${pts.x2},${pts.y2}`);
      rel.hitElement.setAttribute('points', `${pts.x1},${pts.y1} ${mx},${my} ${pts.x2},${pts.y2}`);
    });
  };

  window.createRelation = createRelation;
});
