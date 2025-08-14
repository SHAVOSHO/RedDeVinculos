// zoom.js
(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('grid');
    if (!viewport) return;

    // 1) Contenedor interno que será la "cámara"
    let content = document.getElementById('gridContent');
    if (!content) {
      content = document.createElement('div');
      content.id = 'gridContent';
      content.className = 'zoom-content';
      content.style.position = 'absolute';
      content.style.inset = '0';
      content.style.transformOrigin = '0 0';
      viewport.appendChild(content);
    }

    // 2) Mover dentro del contenedor lo que debe escalar (SVG, iconos, grupos)
    const relLayer = document.getElementById('relationLayer');
    if (relLayer && relLayer.parentElement !== content) content.appendChild(relLayer);

    Array.from(viewport.querySelectorAll('.grid-icon, .group-box')).forEach(n => {
      if (n.parentElement !== content) content.appendChild(n);
    });

    // Re-parent automático para nuevos nodos
    const mo = new MutationObserver((muts) => {
      muts.forEach(m => {
        m.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          if (
            node.id === 'relationLayer' ||
            node.classList?.contains('grid-icon') ||
            node.classList?.contains('group-box')
          ) {
            if (node.parentElement === viewport) content.appendChild(node);
          }
        });
      });
    });
    mo.observe(viewport, { childList: true });

    // 3) Estado de cámara (zoom + pan)
    const state = { scale: 1, tx: 0, ty: 0, min: 0.25, max: 4 };

    function apply() {
      content.style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.scale})`;
      // cuadrícula: más cuadritos al alejar, menos al acercar
      const base = 40; // px
      viewport.style.backgroundSize = `${base * state.scale}px ${base * state.scale}px`;
      window.dispatchEvent(new CustomEvent('zoom:change', { detail: { ...state } }));
    }

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function clientToWorld(clientX, clientY) {
      const r = viewport.getBoundingClientRect();
      return {
        x: (clientX - r.left - state.tx) / state.scale,
        y: (clientY - r.top  - state.ty) / state.scale
      };
    }
    function worldToClient(x, y) {
      const r = viewport.getBoundingClientRect();
      return {
        x: r.left + state.tx + x * state.scale,
        y: r.top  + state.ty + y * state.scale
      };
    }

    function zoomAt(factor, clientX, clientY) {
      const s0 = state.scale;
      const s1 = clamp(s0 * factor, state.min, state.max);
      if (s1 === s0) return;

      const r = viewport.getBoundingClientRect();
      const cx = (clientX != null ? clientX : r.left + r.width / 2);
      const cy = (clientY != null ? clientY : r.top  + r.height / 2);

      // mantener fijo el punto de foco (cx,cy)
      const w = clientToWorld(cx, cy);
      state.tx = cx - r.left - w.x * s1;
      state.ty = cy - r.top  - w.y * s1;
      state.scale = s1;
      apply();
    }

    function reset() {
      state.scale = 1;
      state.tx = 0;
      state.ty = 0;
      apply();
    }

    // 4) Controles inferiores
    const btnIn  = document.getElementById('zoomInBtn');
    const btnOut = document.getElementById('zoomOutBtn');
    const btnCtr = document.getElementById('centerBtn');
    btnIn  && btnIn .addEventListener('click', () => zoomAt(1.2));
    btnOut && btnOut.addEventListener('click', () => zoomAt(1/1.2));
    btnCtr && btnCtr.addEventListener('click', reset);

    // 5) Zoom con rueda + Ctrl/Cmd (natural en apps de diagramas)
    viewport.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoomAt(e.deltaY < 0 ? 1.1 : 0.9, e.clientX, e.clientY);
      }
    }, { passive: false });

    // 6) API pública
    window.zoomAPI = {
      getState: () => ({ ...state }),
      clientToWorld,
      worldToClient,
      zoomInAt:  (x,y) => zoomAt(1.2,   x, y),
      zoomOutAt: (x,y) => zoomAt(1/1.2, x, y),
      reset
    };
    window.getGridContent = () => content;

    apply();
  });
})();
