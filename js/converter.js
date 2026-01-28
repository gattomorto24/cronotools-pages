// Converter.js - logica avanzata per la pagina converti
// Non elimina nessuna riga del codice esistente in index.html

(function(){
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const convertBtn = document.getElementById('convert-btn');
  const resultArea = document.getElementById('result-area');
  const formatsList = document.getElementById('formats-list');
  let selectedFiles = [];
  let selectedFormat = formatsList.querySelector('input[type="radio"]:checked')?.value || 'JPG';

  formatsList.addEventListener('change', e => {
    if (e.target.name === 'format') selectedFormat = e.target.value;
  });

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', e => {
    dropZone.classList.remove('dragover');
  });
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => handleFiles(e.target.files));

  function handleFiles(files) {
    selectedFiles = Array.from(files).filter(f => f.size <= 5 * 1024 * 1024 * 1024);
    convertBtn.disabled = selectedFiles.length === 0;
    showPreviews(selectedFiles);
  }

  function getThemeVars() {
    const root = document.documentElement;
    return {
      bg: getComputedStyle(root).getPropertyValue('--bg-card') || '#fff',
      accent: getComputedStyle(root).getPropertyValue('--accent') || '#007aff',
      accentDim: getComputedStyle(root).getPropertyValue('--accent-dim') || '#eaf3ff',
      shadow: getComputedStyle(root).getPropertyValue('--shadow') || '0 4px 24px #007aff11',
      text: getComputedStyle(root).getPropertyValue('--text-main') || '#222',
      border: getComputedStyle(root).getPropertyValue('--separator') || '#e0e0e0',
    };
  }

  function styleDropZone() {
    const t = getThemeVars();
    dropZone.style.background = `linear-gradient(135deg,${t.bg.trim()} 60%,${t.accentDim.trim()} 100%)`;
    dropZone.style.border = `2.5px dashed ${t.accent.trim()}`;
    dropZone.style.borderRadius = '28px';
    dropZone.style.boxShadow = t.shadow;
    dropZone.style.transition = 'box-shadow 0.18s cubic-bezier(.4,0,.2,1), border-color 0.18s cubic-bezier(.4,0,.2,1)';
    dropZone.onmouseenter = () => { dropZone.style.boxShadow = '0 8px 32px ' + t.accent + '22'; };
    dropZone.onmouseleave = () => { dropZone.style.boxShadow = t.shadow; };
    dropZone.addEventListener('dragover', () => { dropZone.style.borderColor = '#32d74b'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = t.accent; });
    dropZone.addEventListener('drop', () => { dropZone.style.borderColor = t.accent; });
  }

  // Overlay preview
  function createImageOverlay(src) {
    // Rimuovi overlay esistente se presente
    const old = document.getElementById('img-overlay');
    if(old) old.remove();
    const overlay = document.createElement('div');
    overlay.id = 'img-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.72)';
    overlay.style.backdropFilter = 'blur(6px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 99999;
    overlay.style.transition = 'background 0.2s';
    overlay.onclick = function(e) {
      if(e.target === overlay) overlay.remove();
    };
    const imgBox = document.createElement('div');
    imgBox.style.position = 'relative';
    imgBox.style.background = 'var(--dz-bg, #fff)';
    imgBox.style.borderRadius = '32px';
    imgBox.style.boxShadow = '0 8px 32px #0008';
    imgBox.style.padding = '24px';
    imgBox.style.maxWidth = '90vw';
    imgBox.style.maxHeight = '90vh';
    imgBox.style.display = 'flex';
    imgBox.style.alignItems = 'center';
    imgBox.style.justifyContent = 'center';
    imgBox.onclick = e => e.stopPropagation();
    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '80vw';
    img.style.maxHeight = '80vh';
    img.style.borderRadius = '24px';
    img.style.boxShadow = '0 4px 24px #007aff22, 0 1.5px 8px #0002';
    img.style.background = 'var(--dz-bg, #fff)';
    imgBox.appendChild(img);
    // Bottone chiudi
    const close = document.createElement('button');
    close.textContent = '✕';
    close.style.position = 'absolute';
    close.style.top = '12px';
    close.style.right = '18px';
    close.style.background = 'rgba(0,0,0,0.18)';
    close.style.color = '#fff';
    close.style.fontSize = '2rem';
    close.style.border = 'none';
    close.style.borderRadius = '50%';
    close.style.width = '44px';
    close.style.height = '44px';
    close.style.cursor = 'pointer';
    close.style.backdropFilter = 'blur(2px)';
    close.style.display = 'flex';
    close.style.alignItems = 'center';
    close.style.justifyContent = 'center';
    close.style.transition = 'background 0.18s';
    close.onmouseenter = () => { close.style.background = 'rgba(0,0,0,0.32)'; };
    close.onmouseleave = () => { close.style.background = 'rgba(0,0,0,0.18)'; };
    close.onclick = () => overlay.remove();
    imgBox.appendChild(close);
    overlay.appendChild(imgBox);
    document.body.appendChild(overlay);
  }

  function showPreviews(files) {
    const t = getThemeVars ? getThemeVars() : {};
    const preview = document.getElementById('preview-area') || document.createElement('div');
    preview.id = 'preview-area';
    preview.style.display = 'flex';
    preview.style.flexWrap = 'wrap';
    preview.style.gap = '24px';
    preview.style.margin = '24px 0 0 0';
    preview.style.justifyContent = 'center';
    preview.innerHTML = '';
    files.forEach(f => {
      let el;
      if(f.type.startsWith('image/')) {
        el = document.createElement('img');
        el.src = URL.createObjectURL(f);
        el.style.maxWidth = '210px';
        el.style.maxHeight = '210px';
        el.style.borderRadius = '28px';
        el.style.boxShadow = 'var(--ios-shadow, 0 8px 32px #007aff18, 0 1.5px 8px #0001)';
        el.style.background = 'var(--dz-bg, #fff)';
        el.style.padding = '14px';
        el.style.margin = '0 8px';
        el.style.transition = 'transform 0.18s, box-shadow 0.18s';
        el.onclick = () => createImageOverlay(el.src);
        el.onmouseenter = () => {
          el.style.transform = 'scale(1.08)';
          el.style.boxShadow = '0 12px 36px #007aff33, 0 2px 12px #0003';
        };
        el.onmouseleave = () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = 'var(--ios-shadow, 0 8px 32px #007aff18, 0 1.5px 8px #0001)';
        };
      } else {
        el = document.createElement('div');
        el.textContent = f.name;
        el.style.background = `linear-gradient(90deg,${t.bg?.trim()||'#fff'} 60%,${t.accentDim?.trim()||'#eaf3ff'} 100%)`;
        el.style.color = t.accent||'#007aff';
        el.style.padding = '18px 24px';
        el.style.borderRadius = '16px';
        el.style.fontWeight = '600';
        el.style.fontSize = '1.1em';
        el.style.boxShadow = t.shadow||'0 2px 8px #007aff11';
      }
      preview.appendChild(el);
    });
    dropZone.parentNode.insertBefore(preview, formatsList);
  }

  function updateDropZoneThemeVars() {
    const html = document.documentElement;
    let bg, border, shadow, color;
    const theme = html.getAttribute('data-theme') || 'light';
    if(theme === 'dark') {
      bg = '#232326'; border = '#333'; shadow = '0 2px 8px #0004'; color = '#f2f2f7';
    } else if(theme === 'gold') {
      bg = '#fffbe6'; border = '#ffe066'; shadow = '0 2px 8px #ffd70033'; color = '#bfa100';
    } else if(theme === 'cyber') {
      bg = '#0a0a1a'; border = '#00f3ff'; shadow = '0 2px 8px #00f3ff22'; color = '#00f3ff';
    } else {
      bg = '#f6f7f9'; border = '#e0e0e0'; shadow = '0 2px 8px #007aff11'; color = '#222';
    }
    html.style.setProperty('--dz-bg', bg);
    html.style.setProperty('--dz-border', border);
    html.style.setProperty('--dz-shadow', shadow);
    html.style.setProperty('--dz-color', color);
  }
  updateDropZoneThemeVars();
  if(window.UI && window.UI.setTheme) {
    document.addEventListener('crono-pref-sync', updateDropZoneThemeVars);
  }

  // Migliora grafica pre-caricamento
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-indicator';
  loadingDiv.style.display = 'none';
  loadingDiv.style.justifyContent = 'center';
  loadingDiv.style.alignItems = 'center';
  loadingDiv.style.margin = '32px 0';
  loadingDiv.innerHTML = `<div style="width:48px;height:48px;border-radius:50%;border:4px solid #eaf3ff;border-top:4px solid #007aff;animation:spin 1s linear infinite;"></div>`;
  document.body.appendChild(loadingDiv);
  const style = document.createElement('style');
  style.textContent = `@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`;
  document.head.appendChild(style);
  // Mostra/hide loading
  function showLoading(show) {
    loadingDiv.style.display = show ? 'flex' : 'none';
  }

  convertBtn.addEventListener('click', async () => {
    if (!selectedFiles.length) return;
    showLoading(true);
    resultArea.innerHTML = 'Conversione in corso...';
    const outFormat = selectedFormat.toLowerCase();
    let results = [];
    for (const file of selectedFiles) {
      if (file.type.startsWith('image/')) {
        try {
          let convertedBlob;
          // Raster image conversion
          if (["jpg","jpeg","png","webp","bmp"].includes(outFormat)) {
            convertedBlob = await imageConversion.compressAccurately(file, {type: `image/${outFormat === 'jpg' ? 'jpeg' : outFormat}`});
            const url = URL.createObjectURL(convertedBlob);
            results.push(`<div><b>${file.name}</b> → <span style='color:var(--accent)'>${selectedFormat}</span><br><a class='result-link' href='${url}' download='${file.name.split('.')[0]}.${outFormat}'>Scarica</a></div>`);
          } else if (outFormat === 'base64') {
            const base64 = await imageConversion.filetoDataURL(file);
            const base64Id = `base64out-${Math.random().toString(36).slice(2,10)}`;
            results.push(`
              <div><b>${file.name}</b> → <span style='color:var(--accent)'>BASE64</span><br>
                <textarea id='${base64Id}' style='width:100%;min-height:60px'>${base64}</textarea>
                <button class='copy-base64-btn' data-target='${base64Id}' style='margin-top:6px'>Copia</button>
              </div>
            `);
          } else if (outFormat === 'gif') {
            // GIF: solo statico, converte il primo frame
            const img = await imageConversion.filetoDataURL(file);
            results.push(`<div><b>${file.name}</b> → <span style='color:var(--accent)'>GIF (statico)</span><br><img src='${img}' style='max-width:120px;'><br><span style='color:#f90'>Solo preview, conversione GIF animata non supportata lato browser.</span></div>`);
          } else if (outFormat === 'svg') {
            // SVG: raster to SVG non supportato lato browser, mostra avviso
            results.push(`<div><b>${file.name}</b>: conversione verso SVG non supportata lato browser.</div>`);
          } else if (outFormat === 'pdf') {
            // PDF: raster to PDF (usa jsPDF)
            try {
              const imgData = await imageConversion.filetoDataURL(file);
              const pdf = new window.jspdf.jsPDF();
              pdf.addImage(imgData, 'JPEG', 10, 10, 180, 160);
              const pdfBlob = pdf.output('blob');
              const url = URL.createObjectURL(pdfBlob);
              results.push(`<div><b>${file.name}</b> → <span style='color:var(--accent)'>PDF</span><br><a class='result-link' href='${url}' download='${file.name.split('.')[0]}.pdf'>Scarica PDF</a></div>`);
            } catch (e) {
              results.push(`<div>${file.name}: errore conversione PDF</div>`);
            }
          } else if (outFormat === 'tiff' || outFormat === 'heic' || outFormat === 'ico') {
            results.push(`<div><b>${file.name}</b>: conversione verso ${outFormat.toUpperCase()} non supportata lato browser.</div>`);
          } else {
            results.push(`<div>${file.name}: formato non supportato per la conversione diretta.</div>`);
          }
        } catch (e) {
          results.push(`<div>${file.name}: errore conversione</div>`);
        }
      } else {
        results.push(`<div>${file.name}: solo immagini supportate per ora.</div>`);
      }
    }
    resultArea.innerHTML = results.join('');
    // Aggiungi event listener ai bottoni copia base64
    resultArea.querySelectorAll('.copy-base64-btn').forEach(btn => {
      // Applica stile iOS
      btn.style.background = 'rgba(255,255,255,0.7)';
      btn.style.backdropFilter = 'blur(12px)';
      btn.style.webkitBackdropFilter = 'blur(12px)';
      btn.style.border = '1.5px solid #e0e0e0';
      btn.style.borderRadius = '14px';
      btn.style.padding = '7px 18px';
      btn.style.fontWeight = '700';
      btn.style.fontSize = '15px';
      btn.style.color = '#007aff';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'all 0.18s cubic-bezier(.4,0,.2,1)';
      btn.style.boxShadow = '0 2px 8px 0 rgba(0,0,0,0.07)';
      btn.onmouseenter = () => {
        btn.style.background = 'rgba(245,245,255,0.95)';
        btn.style.color = '#0051a8';
        btn.style.transform = 'scale(1.045)';
      };
      btn.onmouseleave = () => {
        btn.style.background = 'rgba(255,255,255,0.7)';
        btn.style.color = '#007aff';
        btn.style.transform = 'scale(1)';
      };
      btn.onclick = function(e) {
        const tid = btn.getAttribute('data-target');
        const ta = document.getElementById(tid);
        if(ta) {
          ta.select();
          document.execCommand('copy');
          btn.textContent = 'Copiato!';
          // Blur animato
          btn.style.filter = 'blur(2px)';
          setTimeout(()=>{btn.style.filter='blur(0px)';},350);
          // Particelle
          for(let i=0;i<12;i++){
            const p=document.createElement('span');
            p.className='copy-particle';
            const angle = (Math.PI*2*i)/12;
            const dist = 32+Math.random()*12;
            p.style.position='absolute';
            p.style.left = (btn.offsetLeft+btn.offsetWidth/2+Math.cos(angle)*dist)+'px';
            p.style.top = (btn.offsetTop+btn.offsetHeight/2+Math.sin(angle)*dist)+'px';
            p.style.width = p.style.height = (6+Math.random()*4)+'px';
            p.style.borderRadius = '50%';
            p.style.background = 'rgba(0,122,255,0.7)';
            p.style.pointerEvents = 'none';
            p.style.zIndex = 9999;
            p.style.opacity = 1;
            p.style.transition = 'all 0.7s cubic-bezier(.4,0,.2,1)';
            document.body.appendChild(p);
            setTimeout(()=>{
              p.style.transform = `translate(${Math.cos(angle)*dist*2}px,${Math.sin(angle)*dist*2}px) scale(0.2)`;
              p.style.opacity = 0;
            },10);
            setTimeout(()=>{p.remove();},800);
          }
          setTimeout(()=>{btn.textContent='Copia';},1200);
        }
      };
    });
    // Applica stile iOS ai toggle formato
    function styleFormatToggles() {
      formatsList.querySelectorAll('label').forEach(label => {
        label.style.background = 'rgba(255,255,255,0.7)';
        label.style.backdropFilter = 'blur(10px)';
        label.style.webkitBackdropFilter = 'blur(10px)';
        label.style.border = '1.5px solid #e0e0e0';
        label.style.borderRadius = '14px';
        label.style.padding = '7px 18px';
        label.style.fontWeight = '600';
        label.style.fontSize = '15px';
        label.style.color = '#007aff';
        label.style.cursor = 'pointer';
        label.style.transition = 'all 0.18s cubic-bezier(.4,0,.2,1)';
        label.style.boxShadow = '0 2px 8px 0 rgba(0,0,0,0.07)';
        label.style.position = 'relative';
        label.onmouseenter = () => {
          label.style.background = 'rgba(245,245,255,0.95)';
          label.style.color = '#0051a8';
          label.style.transform = 'scale(1.045)';
        };
        label.onmouseleave = () => {
          label.style.background = 'rgba(255,255,255,0.7)';
          label.style.color = '#007aff';
          label.style.transform = 'scale(1)';
        };
        // Animazione selezione
        const input = label.querySelector('input[type="radio"]');
        if(input) {
          input.onchange = () => {
            label.animate([
              { boxShadow: '0 0 0 0 #007aff44' },
              { boxShadow: '0 0 0 8px #007aff22' },
              { boxShadow: '0 0 0 0 #007aff00' }
            ], { duration: 420, easing: 'cubic-bezier(.4,0,.2,1)' });
          };
        }
      });
    }
    // Dopo aver generato i label dei formati (dopo la creazione dinamica)
    setTimeout(styleFormatToggles, 0);
  });
})();
