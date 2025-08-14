// sidebar.js - Funcionalidad para la barra lateral

document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const toggleIcon = sidebarToggle.querySelector('i');
  
  // Función para toggle de la sidebar
  function toggleSidebar() {
    sidebar.classList.toggle('open');
    document.body.classList.toggle('sidebar-open');
    
    // Cambiar el ícono de la flecha
    if (sidebar.classList.contains('open')) {
      toggleIcon.className = 'fas fa-chevron-left';
    } else {
      toggleIcon.className = 'fas fa-chevron-right';
    }
  }
  
  // Event listener para el botón toggle
  sidebarToggle.addEventListener('click', toggleSidebar);
  
  // Opcional: Cerrar sidebar con tecla Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      toggleSidebar();
    }
  });
  
  // Opcional: Abrir/cerrar sidebar con Ctrl+B
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
  });
});