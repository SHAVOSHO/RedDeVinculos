/* selection.js */
(function(){
  let mode = null;            // 'relate' o 'move'
  let startX=0, startY=0;
  const grid    = document.getElementById('grid');
  const box     = document.getElementById('selectionBox');
  const btnRel  = document.getElementById('groupRelationBtn');
  const btnMov  = document.getElementById('groupMoveBtn');

  // Cambiar modo al hacer clic
  btnRel.addEventListener('click', ()=> toggleMode('relate') );
  btnMov.addEventListener('click', ()=> toggleMode('move') );

  function toggleMode(m) {
    const next = (mode===m ? null : m);
    // Anuncia qué modo queda activo (o ninguno)
    window.dispatchEvent(new CustomEvent('modes:activate', {
      detail: { keep: next } // 'relate' | 'move' | null
    }));
    mode = next;
    // UI
    btnRel.classList.toggle('active', mode==='relate');
    btnMov.classList.toggle('active', mode==='move');
    document.body.style.cursor = mode ? 'crosshair' : 'default';
    if (!mode) box.style.display = 'none';
  }

  // Si otro modo toma control, este módulo se apaga solo
  window.addEventListener('modes:activate', (e) => {
    const keep = e.detail && e.detail.keep;
    if (!keep || (keep !== mode)) {
      mode = null;
      btnRel.classList.remove('active');
      btnMov.classList.remove('active');
      document.body.style.cursor = 'default';
      box.style.display = 'none';
    }
  });

  // Dibujo del rectángulo
  grid.addEventListener('mousedown', e=>{
    if (!mode || e.target !== grid) return;
    e.preventDefault();
    const rect = grid.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    Object.assign(box.style, {
      left:   startX+'px',
      top:    startY+'px',
      width:  '0px',
      height: '0px',
      display:'block'
    });

    const onMove = ev => {
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const w = Math.abs(x - startX);
      const h = Math.abs(y - startY);
      box.style.left   = Math.min(x, startX) + 'px';
      box.style.top    = Math.min(y, startY) + 'px';
      box.style.width  = w + 'px';
      box.style.height = h + 'px';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      finishSelection();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });

  function finishSelection(){
  const selR = box.getBoundingClientRect();

  // Íconos totalmente dentro del rectángulo de selección
  const icons = Array.from(document.querySelectorAll('.grid-icon'))
    .filter(ic => {
      const r = ic.getBoundingClientRect();
      return r.left >= selR.left &&
             r.top  >= selR.top  &&
             r.right  <= selR.right &&
             r.bottom <= selR.bottom;
    });

  // Grupos totalmente dentro de la selección
  const allGroups = Array.from(document.querySelectorAll('.group-box'));
  const groupsInSel = allGroups.filter(g => {
    const r = g.getBoundingClientRect();
    return r.left >= selR.left &&
           r.top  >= selR.top  &&
           r.right  <= selR.right &&
           r.bottom <= selR.bottom;
  });

  // Además: si seleccionaste iconos que están dentro de un group-box,
  // auto-seleccionamos ese group-box para que se mueva con ellos
  const groupsContainingIcons = allGroups.filter(g => {
    const gr = g.getBoundingClientRect();
    return icons.some(ic => {
      const ir = ic.getBoundingClientRect();
      return ir.left >= gr.left && ir.top >= gr.top &&
             ir.right <= gr.right && ir.bottom <= gr.bottom;
    });
  });

  const groups = Array.from(new Set([...groupsInSel, ...groupsContainingIcons]));

  // Marcar selección (se limpia después del primer drag)
  icons.forEach(ic => ic.classList.add('selected'));
  groups.forEach(g => g.classList.add('selected'));

  if (mode === 'relate') {
    // En cadena: A→B, B→C, …
    icons
      .sort((a,b)=>{
        const ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
        return ra.left - rb.left || ra.top - rb.top;
      })
      .forEach((ic,i,arr)=> {
        if (i < arr.length-1) window.createRelation(ic, arr[i+1]);
      });
    cleanup(); // salir del modo

  } else if (mode === 'move') {
    // Salimos del modo inmediatamente para no dejar el cursor "cargado".
    // Las clases .selected quedan puestas para permitir el drag múltiple.
    cleanup(false);
  }

  function cleanup(removeSelection = true){
    mode = null;
    document.body.style.cursor = 'default';
    btnRel.classList.remove('active');
    btnMov.classList.remove('active');
    box.style.display = 'none';
    if (removeSelection) {
      // (Para 'relate' limpiamos enseguida; para 'move' dejamos marcados)
      setTimeout(()=>{
        icons.forEach(ic=>ic.classList.remove('selected'));
        groups.forEach(g=>g.classList.remove('selected'));
      },0);
    }
  }
}


})();
