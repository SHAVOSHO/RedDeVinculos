// pdf.js — Simbología como tabla (símbolo + significado)
(function () {
  // --- util: autotable compatible con UMD o método de instancia ---
  function runAutoTable(doc, options) {
    try {
      if (typeof doc.autoTable === 'function') {
        doc.autoTable(options);
        return true;
      }
      const g = (window.jspdf && window.jspdf.autoTable) || window.autoTable;
      if (typeof g === 'function') {
        g(doc, options);
        return true;
      }
      console.warn('jsPDF AutoTable no disponible');
      return false;
    } catch (e) {
      console.error('Fallo al ejecutar AutoTable:', e);
      return false;
    }
  }

  // --- Espera fonts e imágenes del #grid antes de capturar ---
  async function waitForAssets() {
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (e) {}
    }
    const imgs = Array.from(document.querySelectorAll('#grid img')).filter(im => !im.complete);
    if (imgs.length) {
      await Promise.all(imgs.map(im => new Promise(res => {
        const done = () => res();
        im.onload = done; im.onerror = done;
      })));
    }
  }

  // --- captura del grid con control de escala/memoria + UI coherente ---
  async function renderGridToCanvas() {
    const grid = document.getElementById('grid');
    if (!grid) throw new Error('No se encontró #grid');

    document.body.classList.add('exporting');
    const prevOverflow = grid.style.overflow;
    grid.style.overflow = 'visible';

    // Ocultar overlays que podrían moverse/superponerse
    const toHideSelectors = ['#symbologyWindow', '#relationMenu', '#lineMenu', '#helpIcon'];
    const hiddenEls = [];
    toHideSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) { hiddenEls.push([el, el.style.display]); el.style.display = 'none'; }
    });
    // Ocultar handles por si el CSS no los quita con .exporting
    const handleEls = Array.from(document.querySelectorAll('.relation-handle, .relation-handle-hit'));
    const handlePrev = handleEls.map(el => [el, el.style.display]);
    handleEls.forEach(el => el.style.display = 'none');

    // Asegurar orden visual: group-box debajo de íconos
    const zTweaks = [];
    document.querySelectorAll('.group-box').forEach(el => { zTweaks.push([el, el.style.zIndex]); el.style.zIndex = '1'; });
    document.querySelectorAll('.grid-icon').forEach(el => { zTweaks.push([el, el.style.zIndex]); el.style.zIndex = '2'; });

    // Escala adaptativa
    const r = grid.getBoundingClientRect();
    const pxCount = r.width * r.height;
    const MAX_PX = 7_500_000;
    const hasImages = grid.querySelectorAll('img.icon-img').length > 0;
    const baseScale = hasImages ? 3 : 2;
    const scale = Math.max(1, Math.min(baseScale, Math.sqrt(MAX_PX / Math.max(1, pxCount))));

    try {
      await waitForAssets();
      const canvas = await html2canvas(grid, {
        backgroundColor: '#ffffff',
        scale,
        useCORS: true,
        logging: false,
        allowTaint: false,
        imageTimeout: 0
      });
      return canvas;
    } finally {
      // Restaurar estado UI
      zTweaks.forEach(([el, z]) => { el.style.zIndex = z; });
      handlePrev.forEach(([el, d]) => { el.style.display = d; });
      hiddenEls.forEach(([el, d]) => { el.style.display = d; });
      grid.style.overflow = prevOverflow;
      document.body.classList.remove('exporting');
    }
  }

  function fitImageInPage(pdf, imgWpx, imgHpx) {
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageW / imgWpx, pageH / imgHpx);
    return {
      w: imgWpx * ratio,
      h: imgHpx * ratio,
      x: (pageW - imgWpx * ratio) / 2,
      y: (pageH - imgHpx * ratio) / 2
    };
  }

  // --- datos de íconos para tablas (incluye imagen si existe) ---
  function collectIconsWithData() {
    const list = [];
    document.querySelectorAll('.grid-icon').forEach(el => {
      const img = el.querySelector('img.icon-img');
      const imageSrc = img ? img.src : '';
      const iTag = el.querySelector('i');
      const iconClass = !imageSrc && iTag ? iTag.className : '';
      const name = el.querySelector('.icon-name')?.textContent?.trim() || '';
      const data = (typeof window.getIconData === 'function') ? window.getIconData(el) : [];
      const rows = (data || []).map(d => ({ title: d.title || '', desc: d.desc || '' }))
                                .filter(r => r.title || r.desc);
      if (rows.length) list.push({ imageSrc, iconClass, name, rows });
    });
    return list;
  }

  // Renderizar un chip FA a imagen (fallback)
  async function renderIconChip(iconClass, sizePx = 28) {
    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-10000px';
    host.style.top = '0';
    host.style.width = sizePx + 'px';
    host.style.height = sizePx + 'px';
    host.style.display = 'flex';
    host.style.alignItems = 'center';
    host.style.justifyContent = 'center';
    host.style.background = '#ffffff';
    host.style.borderRadius = '6px';

    const i = document.createElement('i');
    i.className = iconClass ? iconClass + ' fa-lg' : 'fa-solid fa-square fa-lg';
    host.appendChild(i);
    document.body.appendChild(host);

    try {
      const canvas = await html2canvas(host, { backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false });
      return canvas.toDataURL('image/png');
    } finally {
      host.remove();
    }
  }

  function loadImageDims(src) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve({ w: im.naturalWidth || im.width || 0, h: im.naturalHeight || im.height || 0 });
      im.onerror = reject;
      im.src = src;
    });
  }

  async function addTablesForIcons(pdf) {
    const items = collectIconsWithData();
    if (!items.length) return;

    const cacheFA = Object.create(null);
    const imgForFA = async (cls) => {
      if (!cacheFA[cls]) cacheFA[cls] = await renderIconChip(cls);
      return cacheFA[cls];
    };

    for (let k = 0; k < items.length; k++) {
      const { imageSrc, iconClass, name, rows } = items[k];

      pdf.addPage();

      const y0 = 20;
      const marginX = 15;

      // chip imagen/FA
      let chipData = null, chipFmt = 'PNG', chipWmm = 12, chipHmm = 12, added = false;

      if (imageSrc) {
        chipData = imageSrc;
        try {
          const { w, h } = await loadImageDims(imageSrc);
          if (w && h) {
            const max = 12; // mm
            if (w >= h) { chipWmm = max; chipHmm = Math.max(6, max * (h / w)); }
            else        { chipHmm = max; chipWmm = Math.max(6, max * (w / h)); }
          }
          chipFmt = imageSrc.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
          pdf.addImage(chipData, chipFmt, marginX, y0 - chipHmm + 2, chipWmm, chipHmm);
          added = true;
        } catch (e) {
          console.warn('addImage falló para imagen del nodo; usando fallback FA', e);
        }
      }
      if (!added) {
        const faChip = await imgForFA(iconClass || 'fa-solid fa-square');
        try { pdf.addImage(faChip, 'PNG', marginX, y0 - 10, 10, 10); } catch (e) {}
      }

      // título
      pdf.setFontSize(14);
      pdf.text(name ? `Datos de: ${name}` : 'Datos del ícono', marginX + 16, y0);

      // tabla de datos del ícono
      const body = rows.map(r => [r.title || '', r.desc || '']);

      runAutoTable(pdf, {
        startY: y0 + 8,
        margin: { left: 15, right: 15 },
        tableWidth: 'auto',
        head: [['Título', 'Descripción']],
        body,
        styles: { fontSize: 10, cellPadding: 3, valign: 'top', overflow: 'linebreak' },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 'auto' } }
      });
    }
  }

  // === Utilidades de estilo/color de líneas ===
  function toHexColor(input) {
    if (!input) return '#333333';
    let c = String(input).trim();
    if (c.startsWith('#')) {
      if (c.length === 4) return '#' + c[1]+c[1] + c[2]+c[2] + c[3]+c[3];
      return c.slice(0,7);
    }
    let m = c.match(/rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    if (m) {
      const r = Math.round(parseFloat(m[1]));
      const g = Math.round(parseFloat(m[2]));
      const b = Math.round(parseFloat(m[3]));
      const to2 = n => n.toString(16).padStart(2,'0');
      return '#' + to2(r)+to2(g)+to2(b);
    }
    try {
      const tmp = document.createElement('div');
      tmp.style.color = c;
      document.body.appendChild(tmp);
      const comp = getComputedStyle(tmp).color;
      document.body.removeChild(tmp);
      m = comp.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (m) {
        const to2 = n => Number(n).toString(16).padStart(2,'0');
        return '#' + to2(m[1])+to2(m[2])+to2(m[3]);
      }
    } catch(e) {}
    return '#333333';
  }
  function getLineStyleFromElement(lineEl) {
    if (!lineEl || !lineEl.classList) return 'dashed';
    if (lineEl.classList.contains('solid'))  return 'solid';
    if (lineEl.classList.contains('dotted')) return 'dotted';
    if (lineEl.classList.contains('dashed')) return 'dashed';
    return 'dashed';
  }
  function getColorFromLineEl(lineEl) {
    const inline = lineEl.style && lineEl.style.stroke;
    const attr   = lineEl.getAttribute && lineEl.getAttribute('stroke');
    const comp   = getComputedStyle(lineEl).stroke;
    return toHexColor(inline || attr || comp || '#333333');
  }
  function dashArrayFor(style) {
    if (style === 'solid')  return [];
    if (style === 'dotted') return [2,4];
    return [8,4]; // dashed
  }
  async function renderLineSampleDataURL(style, color, width=60, height=18) {
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,width,height);
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineCap = 'round';
    const dash = dashArrayFor(style);
    if (dash.length) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(4, height/2); ctx.lineTo(width-4, height/2); ctx.stroke();
    return canvas.toDataURL('image/png');
  }

  // --- Tabla de Simbología (símbolo + significado) ---
  async function addRelationsLegendTable(pdf) {
    // Usamos lo que el usuario haya documentado en la ventana “Simbología”
    const rows = (typeof window.getSymbologyLegendRows === 'function')
      ? window.getSymbologyLegendRows()
      : [];
    if (!rows.length) return; // si no hay contexto, no generamos página

    // Pre-render de cada símbolo (muestra de línea)
    for (const r of rows) {
      r.img = await renderLineSampleDataURL(r.style, r.color);
    }

    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text('Simbología de relaciones', 15, 18);

    runAutoTable(pdf, {
      startY: 24,
      margin: { left: 15, right: 15 },
      head: [['Símbolo', 'Significado']],
      body: rows.map(r => {
        const text = r.title
          ? (r.desc ? `${r.title}: ${r.desc}` : r.title)
          : (r.desc || '');
        return ['', text];
      }),
      styles: {
        fontSize: 10,
        cellPadding: 3,
        valign: 'middle',
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 'auto' }
      },
      didDrawCell: data => {
        // Pintar la muestra (línea) dentro de la celda de "Símbolo"
        if (data.section === 'body' && data.column.index === 0) {
          const r = rows[data.row.index];
          if (r && r.img) {
            const padX = 2, padY = 2;
            const cellH = data.cell.height - padY*2;
            const targetH = Math.min(cellH, 10);     // altura de la línea en mm
            const targetW = targetH * (60/18);       // mantener proporción del canvas
            const x = data.cell.x + padX + Math.max(0, (30 - padX*2 - targetW)/2);
            const y = data.cell.y + padY + (cellH - targetH)/2;
            try { pdf.addImage(r.img, 'PNG', x, y, targetW, targetH); } catch(e){}
          }
        }
      }
    });
  }

  // --- Export principal ---
  window.exportGraphAsPDF = async function(fileName, { format = 'a4' } = {}) {
    try {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) { alert('jsPDF no está cargado'); return; }

      let canvas = null;
      try { canvas = await renderGridToCanvas(); }
      catch (e) { console.warn('Fallo capturando el grid, se continúa con tablas:', e); }

      const orientation = canvas && canvas.width > canvas.height ? 'l' : 'p';
      const pdf = new jsPDF({ orientation, unit: 'mm', format });

      if (canvas) {
        const imgData = canvas.toDataURL('image/png');
        const box = fitImageInPage(pdf, canvas.width, canvas.height);
        pdf.addImage(imgData, 'PNG', box.x, box.y, box.w, box.h, undefined, 'FAST');
      } else {
        pdf.setFontSize(16);
        pdf.text('Vista del gráfico no disponible', 20, 20);
      }

      await addTablesForIcons(pdf);
      await addRelationsLegendTable(pdf); // ← Simbología como tabla (símbolo + significado)

      // Ya no agregamos la ventana de simbología como imagen
      pdf.save(fileName || 'red-vinculos.pdf');
    } catch (err) {
      console.error(err);
      alert('No se pudo exportar a PDF.');
    }
  };
})();
