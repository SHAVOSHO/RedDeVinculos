// save.js
(function () {
  function genId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }
  function px(n) {
    const v = parseFloat(n || 0);
    return Number.isFinite(v) ? v : 0;
  }
  function ensureIconId(el) {
    if (!el.dataset.id) el.dataset.id = genId('icon');
    return el.dataset.id;
  }
  function ensureGroupId(el) {
    if (!el.dataset.gid) el.dataset.gid = genId('group');
    return el.dataset.gid;
  }
  function getLineStyle(lineEl) {
    if (!lineEl || !lineEl.classList) return 'default';
    if (lineEl.classList.contains('solid'))  return 'solid';
    if (lineEl.classList.contains('dotted')) return 'dotted';
    if (lineEl.classList.contains('dashed')) return 'dashed';
    return 'default'; // coincide con el trazo por defecto del CSS
  }

  function getLineColor(lineEl) {
  if (!lineEl) return '#333333';
  const inline = lineEl.style && lineEl.style.stroke;
  const attr = lineEl.getAttribute && lineEl.getAttribute('stroke');
  const comp = getComputedStyle(lineEl).stroke;
  // Reusa conversión rápida
  const toHex = (c) => {
    if (!c) return '#333333';
    c = c.trim();
    if (c.startsWith('#')) {
      if (c.length === 4) return '#' + c[1]+c[1] + c[2]+c[2] + c[3]+c[3];
      return c.slice(0,7);
    }
    const m = c.match(/rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    if (m) {
      const r = Math.round(parseFloat(m[1]));
      const g = Math.round(parseFloat(m[2]));
      const b = Math.round(parseFloat(m[3]));
      const to2 = n => n.toString(16).padStart(2,'0');
      return '#' + to2(r)+to2(g)+to2(b);
    }
    return '#333333';
  };
  return toHex(inline || attr || comp || '#333333');
}


  function collectIcons() {
  const arr = [];
  document.querySelectorAll('.grid-icon').forEach(el => {
    const id = ensureIconId(el);
    const name = el.querySelector('.icon-name')?.textContent || '';

    // NUEVO: detectar imagen o <i>
    const imgTag = el.querySelector('img.icon-img');
    const imageSrc = imgTag ? imgTag.src : '';

    const iTag = imgTag ? null : el.querySelector('i');
    const iconClass = iTag ? iTag.className : '';

    const info = (typeof window.getIconData === 'function') ? window.getIconData(el) : [];
    arr.push({
      id,
      type: 'icon',
      name,
      iconClass,       // queda vacío si usamos imagen
      imageSrc,        // NUEVO: data URL (si hay imagen)
      x: px(el.style.left),
      y: px(el.style.top),
      data: info.map(d => ({ title: d.title || '', desc: d.desc || '' }))
    });
  });
  return arr;
}


  function collectGroups() {
    const arr = [];
    document.querySelectorAll('.group-box').forEach(el => {
      const id = ensureGroupId(el);
      let style = 'dashed';
      if (el.classList.contains('solid'))  style = 'solid';
      if (el.classList.contains('dotted')) style = 'dotted';
      if (el.classList.contains('dashed')) style = 'dashed';
      arr.push({
        id,
        type: 'group',
        x: px(el.style.left),
        y: px(el.style.top),
        width: px(el.style.width),
        height: px(el.style.height),
        style
      });
    });
    return arr;
  }

  function isIcon(el)  { return el && el.classList && el.classList.contains('grid-icon'); }
  function isGroup(el) { return el && el.classList && el.classList.contains('group-box'); }

  function collectRelations() {
  const list = window.relations || [];
  return list.map(r => {
    const from = isIcon(r.startIcon)
      ? { type: 'icon',  id: ensureIconId(r.startIcon) }
      : { type: 'group', id: ensureGroupId(r.startIcon) };
    const to = isIcon(r.endIcon)
      ? { type: 'icon',  id: ensureIconId(r.endIcon) }
      : { type: 'group', id: ensureGroupId(r.endIcon) };
    return {
      from,
      to,
      style: getLineStyle(r.lineElement),
      // NUEVO:
      color: getLineColor(r.lineElement)
    };
  });
}


  function buildJSON() {
    const icons  = collectIcons();
    const groups = collectGroups();
    const relations = collectRelations();
    return {
      metadata: {
        version: 1,
        exportedAt: new Date().toISOString()
      },
      icons,
      groups,
      relations
    };
  }

  function download(filename, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  // API pública
  window.exportGraphAsJSON = function(fileName) {
    const json = JSON.stringify(buildJSON(), null, 2);
    download(fileName || 'red-vinculos.json', json);
  };
})();
