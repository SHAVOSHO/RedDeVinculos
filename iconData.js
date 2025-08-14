// iconData.js
// Gestión de datos asociados a cada ícono, con persistencia en WeakMap y edición de datos previos
(function() {
  // WeakMap para almacenar datos por elemento
  const iconDataMap = new WeakMap();

  // Exponer un getter seguro para exportaciones
  window.getIconData = function(el) {
    return iconDataMap.get(el) || [];
  };
  window.setIconData = function(el, arr) {
    iconDataMap.set(el, Array.isArray(arr) ? arr : []);
  };

  // Auto-resize para textareas
  function attachAutoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.addEventListener('input', e => {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    });
  }

  // --- Util: intenta extraer tamaño de un SVG desde su dataURL (width/height o viewBox) ---
  function parseSvgSizeFromDataUrl(dataUrl) {
    try {
      const comma = dataUrl.indexOf(',');
      const header = dataUrl.slice(0, comma);
      const body = dataUrl.slice(comma + 1);
      const svgText = header.includes(';base64') ? atob(body) : decodeURIComponent(body);

      const wAttr = svgText.match(/\bwidth\s*=\s*["']?\s*([\d.]+)\s*(?:px)?\s*["']?/i);
      const hAttr = svgText.match(/\bheight\s*=\s*["']?\s*([\d.]+)\s*(?:px)?\s*["']?/i);
      let w = wAttr ? parseFloat(wAttr[1]) : null;
      let h = hAttr ? parseFloat(hAttr[1]) : null;

      if (!(w && h)) {
        const vb = svgText.match(/\bviewBox\s*=\s*["']?\s*([0-9.\-]+)\s+([0-9.\-]+)\s+([0-9.\-]+)\s+([0-9.\-]+)\s*["']?/i);
        if (vb) {
          w = parseFloat(vb[3]);
          h = parseFloat(vb[4]);
        }
      }
      if (w && h && isFinite(w) && isFinite(h) && w > 0 && h > 0) return { w, h };
    } catch(e) {}
    return null;
  }

  // Convierte cualquier imagen (incluyendo SVG) a un PNG cuadrado (contain) para evitar fallos en html2canvas/pdf
  async function rasterizeToSquarePNG(src, size = 192, bg = '#ffffff') {
    // ↑ tamaño algo mayor para que franjas finas (banderas) no se pierdan en la exportación
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (bg) {
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, size, size);
        } else {
          ctx.clearRect(0, 0, size, size);
        }

        // dimensiones fuente (con fix para SVG sin tamaño intrínseco)
        let w = im.naturalWidth || im.width || 0;
        let h = im.naturalHeight || im.height || 0;
        if ((!w || !h) && typeof src === 'string' && src.startsWith('data:image/svg')) {
          const dims = parseSvgSizeFromDataUrl(src);
          if (dims) { w = dims.w; h = dims.h; }
        }
        if (!w || !h) { w = size; h = size; } // último recurso

        // encaje contain
        const scale = Math.min(size / w, size / h);
        const dw = Math.max(1, Math.round(w * scale));
        const dh = Math.max(1, Math.round(h * scale));
        const dx = Math.floor((size - dw) / 2);
        const dy = Math.floor((size - dh) / 2);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(im, dx, dy, dw, dh);

        resolve(canvas.toDataURL('image/png'));
      };
      im.onerror = reject;
      im.src = src;
    });
  }

  // --- helper: reemplaza la representación visual del icono por una imagen (PNG ya normalizada) ---
  function swapIconToImage(iconEl, src) {
    // quita <i> o material symbols si existen
    const iEl = iconEl.querySelector('i');
    if (iEl) iEl.remove();
    const msEl = iconEl.querySelector('.material-symbols-outlined');
    if (msEl) msEl.remove();

    // elimina imagen previa si la hubiera
    const oldImg = iconEl.querySelector('img.icon-img');
    if (oldImg) oldImg.remove();

    // crea la imagen
    const img = document.createElement('img');
    img.className = 'icon-img';
    img.src = src;
    img.alt = 'icon-image';
    img.draggable = false;
    img.style.pointerEvents = 'none';

    // insértala antes de la etiqueta de nombre (si existe) para mantener layout
    const nameLabel = iconEl.querySelector('.icon-name');
    if (nameLabel) {
      iconEl.insertBefore(img, nameLabel);
    } else {
      iconEl.appendChild(img);
    }

    iconEl.dataset.hasImage = '1';

    // recalcula relaciones por si cambió el bounding box
    if (typeof window.updateRelationsForIcon === 'function') {
      window.updateRelationsForIcon();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const grid       = document.getElementById('grid');
    const relMenu    = document.getElementById('relationMenu');
    const addDataBtn = document.getElementById('addDataBtn');
    let   activeIcon = null;

    window.addEventListener('relationMenu:show', (ev) => {
      const t = ev.detail && ev.detail.target;
      activeIcon = (t && t.classList && t.classList.contains('grid-icon')) ? t : null;
    });

    // Al hacer clic en un icono, marcamos como activo
    grid.addEventListener('click', e => {
      const icon = e.target.closest('.grid-icon');
      if (icon && !window.isDraggingIcon) {
        activeIcon = icon;
      }
    });

    // Al pulsar "Agregar datos" abrimos modal prellenado
    addDataBtn.addEventListener('click', () => {
      if (!activeIcon) return;
      relMenu.classList.add('hidden');
      openDataModal(activeIcon);
      activeIcon = null;
    });

    function openDataModal(icon) {
      // Removemos modal previo si existiese
      const old = document.getElementById('dataModal');
      if (old) old.remove();

      // Recuperamos datos previos
      const existing    = iconDataMap.get(icon) || [];
      const currentName = icon.querySelector('.icon-name')?.textContent || '';

      // Construcción del HTML del modal
      const modal = document.createElement('div');
      modal.id = 'dataModal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Datos del ícono</h3>
            <button id="dataModalClose" class="btn-close">&times;</button>
          </div>
          <div class="modal-body" id="dataModalBody">
            <div class="data-item name-field">
              <label>Nombre (obligatorio)
                <input type="text" id="iconName" required value="${currentName}">
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button id="addMoreData" class="btn">Añadir más</button>
            <button id="addImage" class="btn" title="Añadir imagen">
              <i class="fa-regular fa-image"></i> Añadir imagen
            </button>
            <button id="saveData" class="btn">Guardar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const body = modal.querySelector('#dataModalBody');

      // Listener del botón "Añadir imagen"
      const addImageBtn = modal.querySelector('#addImage');
      if (addImageBtn) {
        addImageBtn.addEventListener('click', () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = () => {
            const file = input.files && input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async () => {
              try {
                // Normaliza todo (ej. SVG) a PNG 192×192 para que html2canvas lo capture perfecto
                const normalized = await rasterizeToSquarePNG(reader.result, 192, '#ffffff');
                swapIconToImage(icon, normalized);
              } catch (e) {
                console.error(e);
                alert('No se pudo cargar la imagen.');
              }
            };
            reader.readAsDataURL(file);
          };
          input.click();
        });
      }

      // Función para crear un par título/desc
      function createDataItem(title = '', desc = '') {
        const div = document.createElement('div');
        div.className = 'data-item';
        div.innerHTML = `
          <label>
            Título:
            <input type="text" class="data-title" value="${title}">
          </label>
          <label>
            Descripción:
            <textarea class="data-desc">${desc}</textarea>
          </label>
        `;
        const ta = div.querySelector('.data-desc');
        attachAutoResize(ta);
        body.appendChild(div);
      }

      // Prellenamos con datos existentes o creamos un par vacío
      if (existing.length > 0) {
        existing.forEach(d => createDataItem(d.title, d.desc));
      } else {
        createDataItem('', '');
      }

      // Cerrar modal
      modal.querySelector('#dataModalClose')
           .addEventListener('click', () => modal.remove());

      // Añadir más campos
      modal.querySelector('#addMoreData')
           .addEventListener('click', () => createDataItem('', ''));

      // Guardar datos al icono
      modal.querySelector('#saveData')
           .addEventListener('click', () => {
        const name = modal.querySelector('#iconName').value.trim();
        if (!name) {
          alert('El nombre es obligatorio');
          return;
        }
        // Actualizar label bajo icono
        let label = icon.querySelector('.icon-name');
        if (!label) {
          label = document.createElement('div');
          label.className = 'icon-name';
          icon.appendChild(label);
        }
        label.textContent = name;

        // Recolectar pares
        const titles = Array.from(modal.querySelectorAll('.data-title')).map(i => i.value.trim());
        const descs  = Array.from(modal.querySelectorAll('.data-desc')).map(i => i.value.trim());
        const arr = titles.map((t,i) => ({ title: t, desc: descs[i] }));
        iconDataMap.set(icon, arr);

        modal.remove();
      });
    }

    // Tooltip en hover (funciona también con íconos bajo group-box)
    let tooltip = null;
    let hoveredIcon = null;

    function getIconUnderPointer(x, y) {
      let el = document.elementFromPoint(x, y);
      if (!el) return null;

      let icon = el.closest && el.closest('.grid-icon');
      if (icon) return icon;

      // Si hay group-box encima, hacemos click-through
      const grp = el.closest && el.closest('.group-box');
      if (grp) {
        const prev = grp.style.pointerEvents;
        grp.style.pointerEvents = 'none';
        el = document.elementFromPoint(x, y);
        grp.style.pointerEvents = prev;
        icon = el && el.closest && el.closest('.grid-icon');
        if (icon) return icon;
      }
      return null;
    }

    function showTooltipFor(icon) {
      const data = iconDataMap.get(icon);
      if (!data || data.length === 0) return;

      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'dataTooltip';
        tooltip.className = 'relation-menu';
        document.body.appendChild(tooltip);
      }
      tooltip.innerHTML = data
        .filter(d => d.title)
        .map(d => `<strong>${d.title}:</strong> ${d.desc}`)
        .join('<br>');

      const r = icon.getBoundingClientRect();
      tooltip.style.left = `${r.right + 5}px`;
      tooltip.style.top  = `${r.top}px`;
    }

    function hideTooltip() {
      if (tooltip) { tooltip.remove(); tooltip = null; }
    }

    grid.addEventListener('mousemove', (e) => {
      const icon = getIconUnderPointer(e.clientX, e.clientY);
      if (icon !== hoveredIcon) {
        hideTooltip();
        hoveredIcon = icon;
        if (hoveredIcon) showTooltipFor(hoveredIcon);
      }
    });

    grid.addEventListener('mouseleave', () => {
      hoveredIcon = null;
      hideTooltip();
    });
  });
})();
