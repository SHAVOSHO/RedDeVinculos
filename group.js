// group.js
document.addEventListener('DOMContentLoaded', () => {
  const grid      = document.getElementById('grid');
  const selBox    = document.getElementById('selectionBox');
  const btn       = document.getElementById('groupBoxBtn');
  let grouping    = false;
  let startX = 0, startY = 0;

  // 1) Alternar modo “Agrupar”
  btn.addEventListener('click', () => {
    grouping = !grouping;
    btn.classList.toggle('active', grouping);
    document.body.style.cursor = grouping ? 'crosshair' : 'default';
    if (!grouping) selBox.style.display = 'none';

    window.dispatchEvent(new CustomEvent('modes:activate', {
      detail: { keep: grouping ? 'group' : null }
    }));
  });

  // Si otro modo se activa, apagar agrupado
  window.addEventListener('modes:activate', (e) => {
    const keep = e.detail && e.detail.keep;
    if (keep !== 'group' && grouping) {
      grouping = false;
      btn.classList.remove('active');
      document.body.style.cursor = 'default';
      selBox.style.display = 'none';
    }
  });

  // 2) Dibujo del rectángulo de selección
  grid.addEventListener('mousedown', e => {
    if (!grouping || e.target !== grid) return;
    e.preventDefault();
    const rect = grid.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    Object.assign(selBox.style, {
      display: 'block',
      left:   `${startX}px`,
      top:    `${startY}px`,
      width:  `0px`,
      height: `0px`
    });

    const onMove = ev => {
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      selBox.style.left   = `${Math.min(x, startX)}px`;
      selBox.style.top    = `${Math.min(y, startY)}px`;
      selBox.style.width  = `${Math.abs(x - startX)}px`;
      selBox.style.height = `${Math.abs(y - startY)}px`;
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      finishGroup();
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });

  // 3) Al soltar: crear el “group-box”
  function finishGroup() {
    const selR = selBox.getBoundingClientRect();
    const gridR = grid.getBoundingClientRect();

    // Coordenadas relativas al grid
    const x = selR.left   - gridR.left;
    const y = selR.top    - gridR.top;
    const w = selR.width;
    const h = selR.height;

    // Crear el contenedor de grupo
    const box = document.createElement('div');
    box.className = 'group-box dashed';
    Object.assign(box.style, {
      left:   `${x}px`,
      top:    `${y}px`,
      width:  `${w}px`,
      height: `${h}px`
    });
    grid.appendChild(box);
    if (window.refreshSymbology) window.refreshSymbology();

    // Hacerlo draggable junto con sus íconos interiores
    makeGroupDraggable(box);

    // Limpiar modo agrupar
    grouping = false;
    btn.classList.remove('active');
    document.body.style.cursor = 'default';
    selBox.style.display = 'none';
  }

  // 4) Lógica para arrastrar un grupo
  function makeGroupDraggable(box) {
  let origBoxX, origBoxY, offsetX, offsetY;

  box.addEventListener('mousedown', e => {
    e.stopPropagation();
    e.preventDefault();

    const gridR = grid.getBoundingClientRect();
    const boxR  = box.getBoundingClientRect();
    origBoxX = boxR.left - gridR.left;
    origBoxY = boxR.top  - gridR.top;
    offsetX  = e.clientX - boxR.left;
    offsetY  = e.clientY - boxR.top;

    const boxW = boxR.width;
    const boxH = boxR.height;

    // 1) Cachear posiciones originales de TODOS los íconos y TODOS los group-box
    document.querySelectorAll('.grid-icon').forEach(ic => {
      ic.dataset.origX = parseFloat(ic.style.left) || 0;
      ic.dataset.origY = parseFloat(ic.style.top)  || 0;
    });
    document.querySelectorAll('.group-box').forEach(g => {
      g.dataset.origX = parseFloat(g.style.left) || 0;
      g.dataset.origY = parseFloat(g.style.top)  || 0;
    });

    // 2) Íconos contenidos en el box al empezar el drag
    const containedIcons = Array.from(document.querySelectorAll('.grid-icon'))
      .filter(ic => {
        const r = ic.getBoundingClientRect();
        return r.left >= boxR.left && r.top >= boxR.top &&
               r.right <= boxR.right && r.bottom <= boxR.bottom;
      });

    // 3) Unir con íconos seleccionados fuera del box
    const selectedIcons = Array.from(document.querySelectorAll('.grid-icon.selected'));
    const iconsToMove = Array.from(new Set([...containedIcons, ...selectedIcons]))
      .map(el => ({
        el,
        origX: parseFloat(el.dataset.origX) || 0,
        origY: parseFloat(el.dataset.origY) || 0
      }));

    // 4) Mover también otros group-box seleccionados (incluye este box)
    const selectedBoxes = Array.from(document.querySelectorAll('.group-box.selected'));
    const boxesToMove = Array.from(new Set([box, ...selectedBoxes]))
      .map(el => ({
        el,
        origX: parseFloat(el.dataset.origX) || 0,
        origY: parseFloat(el.dataset.origY) || 0,
        w: el.clientWidth,
        h: el.clientHeight
      }));

    const onMove = ev => {
      const gridRect = grid.getBoundingClientRect();
      let newX = ev.clientX - gridRect.left - offsetX;
      let newY = ev.clientY - gridRect.top  - offsetY;

      // Limitar el box principal dentro del grid
      newX = Math.max(0, Math.min(newX, grid.clientWidth  - boxW));
      newY = Math.max(0, Math.min(newY, grid.clientHeight - boxH));

      box.style.left = `${newX}px`;
      box.style.top  = `${newY}px`;

      const dx = newX - origBoxX;
      const dy = newY - origBoxY;

      // Mover íconos (contenidos + seleccionados externos)
      iconsToMove.forEach(({el, origX, origY}) => {
        el.style.left = `${origX + dx}px`;
        el.style.top  = `${origY + dy}px`;
        if (typeof window.updateRelationsForIcon === 'function') {
          window.updateRelationsForIcon(el); // funciona tanto con iconos como con group-box
        }
      });

      // Mover otros group-box seleccionados (además del principal)
      boxesToMove.forEach(({el, origX, origY, w, h}) => {
        if (el === box) return; // el principal ya lo movimos arriba
        let bx = origX + dx, by = origY + dy;
        bx = Math.max(0, Math.min(bx, grid.clientWidth  - w));
        by = Math.max(0, Math.min(by, grid.clientHeight - h));
        el.style.left = `${bx}px`;
        el.style.top  = `${by}px`;
        if (typeof window.updateRelationsForIcon === 'function') {
          window.updateRelationsForIcon(el);
        }
      });

      // Asegurar actualización de relaciones del box principal
      if (typeof window.updateRelationsForIcon === 'function') {
        window.updateRelationsForIcon(box);
      }
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      // limpiar selección tras el drag (coincide con drag.js)
      document.querySelectorAll('.grid-icon.selected')
        .forEach(ic => ic.classList.remove('selected'));
      document.querySelectorAll('.group-box.selected')
        .forEach(g => g.classList.remove('selected'));
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });
}


    // Exponer para uso desde load.js
  window.makeGroupDraggable = makeGroupDraggable;

});
