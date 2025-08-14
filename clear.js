// clear.js
(function () {
  function clearWorkspace() {
    try {
      // 1) Ocultar menús / modales y selección visual
      const hideIds = ['relationMenu','lineMenu','iconModal','helpModal','dataModal','colorModal'];

      hideIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        // dataModal es dinámico: mejor removerlo del DOM
        if (id === 'dataModal') { el.remove(); return; }
        el.classList.add('hidden');
      });

      const selBox = document.getElementById('selectionBox');
      if (selBox) selBox.style.display = 'none';

      document.querySelectorAll('.grid-icon.selected, .group-box.selected')
        .forEach(n => n.classList.remove('selected'));

      // 2) Borrar relaciones (SVG)
      const svg = document.getElementById('relationLayer');
      if (svg) svg.innerHTML = '';

      // 3) Borrar íconos y grupos
      document.querySelectorAll('.grid-icon, .group-box').forEach(n => n.remove());

      // 4) Reset global
      window.relations = [];
      if (window.refreshSymbology) window.refreshSymbology();


      // 5) Apagar modos/cursor y estados de botones
      window.dispatchEvent(new CustomEvent('modes:activate', { detail: { keep: null } }));
      ['groupRelationBtn','groupMoveBtn','groupBoxBtn'].forEach(id => {
        const b = document.getElementById(id);
        if (b) b.classList.remove('active');
      });
      document.body.style.cursor = 'default';
      window.isDraggingIcon = false;

      // 6) (Opcional) reset del select "Guardar como…"
      const saveSelects = document.querySelectorAll('#saveSelect');
      saveSelects.forEach(s => s.value = '');

    } catch (e) {
      console.error('Error al limpiar:', e);
      alert('No se pudo limpiar la página.');
    }
  }

  // Exponer por si lo quieres llamar desde consola u otros módulos
  window.clearWorkspace = clearWorkspace;

  // Conectar a TODOS los botones con id="clearBtn" (hay dos en el DOM)
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#clearBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('¿Limpiar toda la página? Se borrarán iconos, grupos y relaciones.')) {
          clearWorkspace();
        }
      });
    });
  });
})();
