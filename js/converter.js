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
            results.push(`<div><b>${file.name}</b> → <span style='color:var(--accent)'>BASE64</span><br><textarea style='width:100%;min-height:60px'>${base64}</textarea></div>`);
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
  });
})();
