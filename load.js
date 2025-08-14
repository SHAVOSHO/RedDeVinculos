// load.js
(function () {
  function clearGraph() {
    // borrar relaciones (SVG)
    const svg = document.getElementById('relationLayer');
    if (svg) svg.innerHTML = '';
    // borrar íconos y grupos
    document.querySelectorAll('.grid-icon, .group-box').forEach(n => n.remove());
    // reset lista global
    window.relations = [];
  }

    function createIcon(node, idMap) {
    const grid = document.getElementById('grid');
    const el = document.createElement('div');
    el.className = 'grid-icon';
    el.style.left = (node.x || 0) + 'px';
    el.style.top  = (node.y || 0) + 'px';
    el.dataset.id = node.id;

    if (node.imageSrc) {
      // NUEVO: preferir imagen si viene en el JSON
      const img = document.createElement('img');
      img.className = 'icon-img';
      img.src = node.imageSrc;
      img.alt = node.name || '';
      img.draggable = false;
      img.style.pointerEvents = 'none';
      el.appendChild(img);
    } else {
      const i = document.createElement('i');
      i.className = node.iconClass || 'fa-solid fa-square';
      el.appendChild(i);
    }

    if (node.name) {
      const label = document.createElement('div');
      label.className = 'icon-name';
      label.textContent = node.name;
      el.appendChild(label);
    }

    grid.appendChild(el);
    if (typeof window.makeIconDraggable === 'function') {
      window.makeIconDraggable(el);
    }
    if (Array.isArray(node.data) && typeof window.setIconData === 'function') {
      window.setIconData(el, node.data.map(d => ({
        title: d.title || '',
        desc: d.desc || ''
      })));
    }
    idMap[node.id] = el;
    return el;
  }


  function createGroup(node, idMap) {
    const grid = document.getElementById('grid');
    const box = document.createElement('div');
    box.className = 'group-box dashed';
    box.style.left   = (node.x || 0) + 'px';
    box.style.top    = (node.y || 0) + 'px';
    box.style.width  = (node.width  || 0) + 'px';
    box.style.height = (node.height || 0) + 'px';
    box.dataset.gid = node.id;

    // estilo
    box.classList.remove('solid', 'dotted', 'dashed');
    if (node.style === 'solid')  box.classList.add('solid');
    else if (node.style === 'dotted') box.classList.add('dotted');
    else box.classList.add('dashed');

    grid.appendChild(box);
    if (typeof window.makeGroupDraggable === 'function') {
      window.makeGroupDraggable(box);
    }
    idMap[node.id] = box;
    return box;
  }

  function applyRelation(rel, idMap) {
  const fromEl = idMap[rel.from.id];
  const toEl   = idMap[rel.to.id];
  if (!fromEl || !toEl || typeof window.createRelation !== 'function') return;

  window.createRelation(fromEl, toEl);
  const last = window.relations[window.relations.length - 1];
  if (last && last.lineElement) {
    last.lineElement.classList.remove('solid', 'dotted', 'dashed');
    if (rel.style === 'solid')  last.lineElement.classList.add('solid');
    else if (rel.style === 'dotted') last.lineElement.classList.add('dotted');
    else if (rel.style === 'dashed') last.lineElement.classList.add('dashed');
    // === NUEVO: color ===
    if (rel.color) {
      last.lineElement.style.stroke = rel.color;
      if (last.handleElement) last.handleElement.style.stroke = rel.color;
      last.color = rel.color; // por consistencia
    }
  }
}


  function loadFromObject(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('JSON inválido');

    clearGraph();
    const idMap = Object.create(null);

    // 1) grupos primero (para que queden detrás si lo prefieres, puedes invertir el orden)
    (obj.groups || []).forEach(g => createGroup(g, idMap));
    // 2) íconos
    (obj.icons || []).forEach(n => createIcon(n, idMap));
    // 3) relaciones
    (obj.relations || []).forEach(r => applyRelation(r, idMap));
  }

  async function pickFileAndReadJSON() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (!file) return reject(new Error('No se seleccionó archivo'));
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const obj = JSON.parse(reader.result);
            resolve(obj);
          } catch (e) {
            reject(new Error('JSON inválido'));
          }
        };
        reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
        reader.readAsText(file);
      };
      input.click();
    });
  }

  // API pública
  window.loadGraphFromJSONFile = async function () {
    try {
      const obj = await pickFileAndReadJSON();
      // Confirmar limpieza
      if (!confirm('Esto reemplazará el contenido actual. ¿Continuar?')) return;
      loadFromObject(obj);
    } catch (e) {
      alert(e.message || 'Error al cargar JSON');
      console.error(e);
    }
  };

  window.loadGraphFromObject = loadFromObject;
})();
