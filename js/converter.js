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

  function showPreviews(files) {
    const preview = document.getElementById('preview-area') || document.createElement('div');
    preview.id = 'preview-area';
    preview.style.display = 'flex';
    preview.style.flexWrap = 'wrap';
    preview.style.gap = '12px';
    preview.style.margin = '18px 0 0 0';
    preview.innerHTML = '';
    files.forEach(f => {
      let el;
      if(f.type.startsWith('image/')) {
        el = document.createElement('img');
        el.src = URL.createObjectURL(f);
        el.style.maxWidth = '90px';
        el.style.maxHeight = '90px';
        el.style.borderRadius = '12px';
        el.style.boxShadow = '0 2px 8px #0004';
      } else {
        el = document.createElement('div');
        el.textContent = f.name;
        el.style.background = '#222';
        el.style.color = '#fff';
        el.style.padding = '10px 14px';
        el.style.borderRadius = '10px';
      }
      preview.appendChild(el);
    });
    dropZone.parentNode.insertBefore(preview, formatsList);
  }

  convertBtn.addEventListener('click', async () => {
    if (!selectedFiles.length) return;
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
  });
})();
