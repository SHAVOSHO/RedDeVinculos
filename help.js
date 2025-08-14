// help.js
// Proporciona un ícono flotante de ayuda con explicaciones de cada función
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    // 1) Crear y añadir el ícono de ayuda al DOM
    const helpIcon = document.createElement('div');
    helpIcon.id = 'helpIcon';
    helpIcon.innerHTML = '<i class="fa-solid fa-circle-question fa-lg"></i>';
    document.body.appendChild(helpIcon);

    // 2) Construir el modal de ayuda
    const modal = document.createElement('div');
    modal.id = 'helpModal';
    modal.className = 'modal hidden';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Ayuda Rápida</h3>
          <button id="helpClose" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <ul class="help-list">
            <li><strong>Relacionar:</strong> Haz clic en un ícono, luego en "Relacionar" y, a continuación, en otro ícono para conectar ambos mediante una línea.</li>
            <li><strong>Agregar datos:</strong> Haz clic en un ícono y selecciona "Agregar datos" para introducir un nombre obligatorio y cualquier número de pares título/descripcion.</li>
            <li><strong>Arrastrar íconos:</strong> Haz clic y mantén presionado un ícono para arrastrarlo por la cuadrícula; suelta para dejarlo en la nueva posición.</li>
            <li><strong>Mover la línea:</strong> Arrastra el punto medio (círculo) de una línea para ajustar su curvatura.</li>
            <li><strong>Eliminar la línea:</strong> Haz clic en una línea para abrir el menú y selecciona "Eliminar relación".</li>
            <li><strong>Modificar estilo de línea:</strong> Haz clic en una línea, elige "Línea sólida", "punteada" o "segmentada" para cambiar su trazo.</li>
          </ul>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // 3) Mostrar modal al hacer clic en el ícono de ayuda
    helpIcon.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });

    // 4) Cerrar modal
    modal.querySelector('#helpClose')
         .addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    // 5) Cerrar al hacer clic fuera del diálogo
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
})();
