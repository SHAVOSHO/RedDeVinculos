// drag.js

let isDraggingIcon = false;
window.isDraggingIcon = false;

document.addEventListener('DOMContentLoaded', () => {
  let selectedIconClass = null;
  const iconContainer = document.getElementById('iconContainer');
  const iconModal     = document.getElementById('iconModal');
  const grid          = document.getElementById('grid');

  // 1) Selección de icono en el modal
  iconContainer.addEventListener('click', e => {
    const item = e.target.closest('.icon-item');
    if (!item) return;
    const iconEl = item.querySelector('i');
    selectedIconClass = iconEl.className;
    iconModal.classList.add('hidden');
  });

  // 2) Colocar icono en la cuadrícula
  grid.addEventListener('click', e => {
    if (!selectedIconClass) return;
    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const el = document.createElement('div');
    el.className = 'grid-icon';
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    el.innerHTML = `<i class="${selectedIconClass}"></i>`;
    grid.appendChild(el);

    makeDraggable(el);
    selectedIconClass = null;
  });

  // 3) Hacer arrastrable y actualizar relaciones al mover
  function makeDraggable(el) {
    let offsetX, offsetY;

    const onMouseDown = e => {
    e.preventDefault();

    // Guardar posiciones originales de TODOS los íconos...
    document.querySelectorAll('.grid-icon').forEach(ic => {
      ic.dataset.origX = parseFloat(ic.style.left) || 0;
      ic.dataset.origY = parseFloat(ic.style.top)  || 0;
    });
    // ...y de los GROUP BOX seleccionados
    document.querySelectorAll('.group-box.selected').forEach(box => {
      box.dataset.origX = parseFloat(box.style.left) || 0;
      box.dataset.origY = parseFloat(box.style.top)  || 0;
    });

    const r = el.getBoundingClientRect();
    offsetX = e.clientX - r.left;
    offsetY = e.clientY - r.top;
    offsetX = Math.max(0, Math.min(offsetX, r.width));
    offsetY = Math.max(0, Math.min(offsetY, r.height));

    window.isDraggingIcon = false;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup',   onMouseUp);
  };

    const onMouseMove = e => {
    e.preventDefault();

    const selectedIcons = document.querySelectorAll('.grid-icon.selected');
    const selectedBoxes = document.querySelectorAll('.group-box.selected');
    window.isDraggingIcon = true;

    const gridRect = grid.getBoundingClientRect();
    let newX = e.clientX - gridRect.left  - offsetX;
    let newY = e.clientY - gridRect.top   - offsetY;
    newX = Math.max(0, Math.min(newX, grid.clientWidth  - el.clientWidth));
    newY = Math.max(0, Math.min(newY, grid.clientHeight - el.clientHeight));

    // Mover el icono arrastrado
    el.style.left = `${newX}px`;
    el.style.top  = `${newY}px`;

    // Delta respecto al icono arrastrado
    const dx = newX - (parseFloat(el.dataset.origX) || 0);
    const dy = newY - (parseFloat(el.dataset.origY) || 0);

    // Mover también los demás íconos seleccionados
    selectedIcons.forEach(ic => {
      if (ic === el) return;
      const origX = parseFloat(ic.dataset.origX) || 0;
      const origY = parseFloat(ic.dataset.origY) || 0;
      ic.style.left = `${origX + dx}px`;
      ic.style.top  = `${origY + dy}px`;
    });

    // Mover los GROUP BOX seleccionados con el mismo dx/dy
    selectedBoxes.forEach(box => {
      const bw = box.clientWidth, bh = box.clientHeight;
      const origX = parseFloat(box.dataset.origX) || 0;
      const origY = parseFloat(box.dataset.origY) || 0;
      const bx = Math.max(0, Math.min(origX + dx, grid.clientWidth  - bw));
      const by = Math.max(0, Math.min(origY + dy, grid.clientHeight - bh));
      box.style.left = `${bx}px`;
      box.style.top  = `${by}px`;
    });

    // Recalcular todas las relaciones (íconos y grupos)
    window.updateRelationsForIcon();
  };


    const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup',   onMouseUp);
    // Limpiar selección tras el primer drag
    document.querySelectorAll('.grid-icon.selected')
      .forEach(ic => ic.classList.remove('selected'));
    document.querySelectorAll('.group-box.selected')
      .forEach(g => g.classList.remove('selected'));
    setTimeout(() => window.isDraggingIcon = false, 0);
  };

    el.addEventListener('mousedown', onMouseDown);
  }

  // 4) Recalcula todas las líneas conectadas a este icono
  function updateRelationsForIcon(iconEl) {
    const relations = window.relations || [];
    const gridRect  = grid.getBoundingClientRect();

    relations.forEach(rel => {
      if (rel.startIcon === iconEl || rel.endIcon === iconEl) {
        const r1 = rel.startIcon.getBoundingClientRect();
        const r2 = rel.endIcon  .getBoundingClientRect();
        const x1 = r1.left + r1.width/2  - gridRect.left;
        const y1 = r1.top  + r1.height/2 - gridRect.top;
        const x2 = r2.left + r2.width/2  - gridRect.left;
        const y2 = r2.top  + r2.height/2 - gridRect.top;

        // Mover también el handle para mantener la curvatura
        const handle = rel.handleElement;
        // Calculamos nuevo punto medio
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        handle.setAttribute('cx', mx);
        handle.setAttribute('cy', my);

        // Redibujar línea con nuevo handle
        rel.lineElement.setAttribute('points',
          `${x1},${y1} ${mx},${my} ${x2},${y2}`
        );
      }
    });
  }

  // Exponer para que group.js y selection.js puedan usarla
  window.updateRelationsForIcon = updateRelationsForIcon;
    // Exponer para que load.js pueda reutilizar el drag
  window.makeIconDraggable = makeDraggable;

});
