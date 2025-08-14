// app.js
document.addEventListener('DOMContentLoaded', () => {
  const icons = [
  // Nodos - Font Awesome (los originales)
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-user', label: 'Persona' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-user-secret', label: 'Sospechoso' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-users', label: 'Grupo' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-shield-halved', label: 'Autoridad' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-scale-balanced', label: 'Justicia' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-sack-dollar', label: 'Dinero' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-gun', label: 'Armas' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-bomb', label: 'Explosivos' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-cannabis', label: 'Drogas (cannabis)' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-pills', label: 'Drogas (píldoras)' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-syringe', label: 'Drogas (jeringa)' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-fingerprint', label: 'Forense' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-file-lines', label: 'Documento' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-phone', label: 'Teléfono' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-mobile-screen-button', label: 'Móvil' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-envelope', label: 'Correo' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-car', label: 'Vehículo' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-truck', label: 'Camión' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-plane', label: 'Avión' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-ship', label: 'Barco' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-location-dot', label: 'Ubicación' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-building', label: 'Edificio' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-warehouse', label: 'Almacén' },

  // === NODOS – Personas / entidades ===
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-user-tie', label: 'Funcionario' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-user-shield', label: 'Protegido' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-id-card', label: 'Identificación' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-address-card', label: 'Perfil' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-building-columns', label: 'Gobierno/Banco' }, // :contentReference[oaicite:1]{index=1}
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-landmark', label: 'Institución' },            // :contentReference[oaicite:2]{index=2}

  // === NODOS – Ubicación / infraestructura física ===
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-house', label: 'Domicilio' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-school', label: 'Escuela' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-hospital', label: 'Hospital' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-industry', label: 'Fábrica' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-map', label: 'Mapa' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-map-pin', label: 'Punto' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-location-crosshairs', label: 'Coordenadas' },

  // === NODOS – TI / comunicaciones ===
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-server', label: 'Servidor' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-database', label: 'Base de datos' },          // :contentReference[oaicite:3]{index=3}
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-network-wired', label: 'Red cableada' },      // :contentReference[oaicite:4]{index=4}
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-cloud', label: 'Nube' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-wifi', label: 'Wi-Fi' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-satellite-dish', label: 'Antena/Satélite' },  // :contentReference[oaicite:5]{index=5}
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-sim-card', label: 'SIM' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-globe', label: 'Internet' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-key', label: 'Credencial/Clave' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-lock', label: 'Bloqueo' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-bug', label: 'Malware' },

  // === NODOS – Medios / evidencia ===
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-camera', label: 'Foto' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-video', label: 'Video' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-image', label: 'Imagen' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-microphone', label: 'Audio' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-folder', label: 'Carpeta' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-folder-open', label: 'Carpeta abierta' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-file-pdf', label: 'PDF' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-file-image', label: 'Imagen (archivo)' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-file-audio', label: 'Audio (archivo)' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-file-zipper', label: 'ZIP' },

  // === NODOS – Tiempo / agenda ===
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-calendar-days', label: 'Calendario' },        // :contentReference[oaicite:6]{index=6}
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-clock', label: 'Hora' },

  // === NODOS – Transporte / logística ===
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-bus', label: 'Autobús' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-train', label: 'Tren' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-motorcycle', label: 'Motocicleta' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-box', label: 'Paquete' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-boxes-stacked', label: 'Carga' },

  // === NODOS – Finanzas ===
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-money-bill', label: 'Billete' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-credit-card', label: 'Tarjeta' },
  { category: 'nodo', type: 'fa', cls: 'fa-solid fa-bitcoin-sign', label: 'Cripto (BTC)' },

  // === NODOS – Marcas / plataformas (Brands) ===
  { category: 'nodo', type: 'fa-brands', cls: 'fa-brands fa-whatsapp', label: 'WhatsApp' },       // :contentReference[oaicite:7]{index=7}
  { category: 'nodo', type: 'fa-brands', cls: 'fa-brands fa-telegram', label: 'Telegram' },
  { category: 'nodo', type: 'fa-brands', cls: 'fa-brands fa-x-twitter', label: 'X/Twitter' },     // :contentReference[oaicite:8]{index=8}
  { category: 'nodo', type: 'fa-brands', cls: 'fa-brands fa-facebook', label: 'Facebook' },
  { category: 'nodo', type: 'fa-brands', cls: 'fa-brands fa-instagram', label: 'Instagram' },
  { category: 'nodo', type: 'fa-brands', cls: 'fa-brands fa-youtube', label: 'YouTube' },
  { category: 'nodo', type: 'fa-brands', cls: 'fa-brands fa-reddit', label: 'Reddit' },
  { category: 'nodo', type: 'fa-brands', cls: 'fa-brands fa-linkedin', label: 'LinkedIn' },
  { category: 'nodo', type: 'fa-brands', cls: 'fa-brands fa-tiktok', label: 'TikTok' },           // :contentReference[oaicite:9]{index=9}

  // === ARISTAS – Tipos de relación / flujo ===
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-share-nodes', label: 'Difusión/Red' },      // :contentReference[oaicite:10]{index=10}
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-sitemap', label: 'Estructura' },            // :contentReference[oaicite:11]{index=11}
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-right-left', label: 'Intercambio' },        // :contentReference[oaicite:12]{index=12}
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-route', label: 'Ruta/Envío' },              // :contentReference[oaicite:13]{index=13}
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-arrow-up-right-from-square', label: 'Enlace externo' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-magnifying-glass', label: 'Relacionado con (evidencia)' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-handshake', label: 'Acuerdo/Vínculo' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-money-bill', label: 'Transacción' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-truck', label: 'Suministro' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-location-arrow', label: 'Ubicación de' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-ban', label: 'Bloqueado' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-check', label: 'Permitido' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-triangle-exclamation', label: 'Alerta/Riesgo' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-download', label: 'Descarga' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-upload', label: 'Subida' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-comment', label: 'Comunicación (mensaje)' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-at', label: 'Comunicación (@/email)' },

  // Aristas - Font Awesome (los originales)
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-link', label: 'Relación' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-link-slash', label: 'Roto' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-arrow-right', label: 'Flujo →' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-arrow-left', label: 'Flujo ←' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-arrows-left-right', label: 'Doble vía' },
  { category: 'arista', type: 'fa', cls: 'fa-solid fa-diagram-project', label: 'Jerarquía' },

];



  const container = document.getElementById('iconContainer');
  const searchInput = document.getElementById('iconSearch');
  const filterSelect = document.getElementById('iconFilter');

  function renderIcons() {
    const q = searchInput.value.toLowerCase();
    const cat = filterSelect.value;
    container.innerHTML = '';
    icons
      .filter(ic => (cat === '' || ic.category === cat) &&
           ic.label.toLowerCase().includes(q))
      .forEach(ic => {
        const div = document.createElement('div');
        div.className = 'icon-item';
        div.dataset.category = ic.category;
       
        div.innerHTML = `<i class="${ic.cls} fa-2x"></i><span>${ic.label}</span>`;
      

        container.appendChild(div);
      });
  }

  // Inicializa la lista
  renderIcons();

  // Filtros
  searchInput.addEventListener('input', renderIcons);
  filterSelect.addEventListener('change', renderIcons);

  // Mostrar / ocultar modal
  document.getElementById('addBtn')
    .addEventListener('click', () => document.getElementById('iconModal').classList.remove('hidden'));
  document.getElementById('iconClose')
    .addEventListener('click', () => document.getElementById('iconModal').classList.add('hidden'));
  document.getElementById('iconModal')
    .addEventListener('click', e => { if (e.target.id === 'iconModal') e.target.classList.add('hidden'); });

  // Lógica de Guardar como… (confirm)
  document.getElementById('saveSelect')
  .addEventListener('change', async e => {
    const fmt = e.target.value;
    e.target.value = '';
    if (!fmt) return;

    if (fmt === 'json') {
      const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
      const name = `red-vinculos-${ts}.json`;
      if (confirm(`¿Deseas descargar ${name}?`)) {
        if (typeof window.exportGraphAsJSON === 'function') {
          window.exportGraphAsJSON(name);
        } else {
          alert('La exportación JSON no está disponible.');
        }
      }
    } else if (fmt === 'pdf') {
      const ts = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
      const name = `red-vinculos-${ts}.pdf`;
      if (confirm(`¿Deseas descargar ${name}?`)) {
        if (typeof window.exportGraphAsPDF === 'function') {
          await window.exportGraphAsPDF(name, { format: 'a4' });
        } else {
          alert('La exportación PDF no está disponible.');
        }
      }
    }
  });

  document.getElementById('loadBtn')
  .addEventListener('click', async () => {
    if (typeof window.loadGraphFromJSONFile === 'function') {
      await window.loadGraphFromJSONFile();
    } else {
      alert('La carga desde JSON no está disponible.');
    }
  });


});
