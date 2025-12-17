/* --- Script Specifico per AI Background Remover --- */

document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('upload-stage');
    const fileInput = document.getElementById('file-input');
    const processingStage = document.getElementById('processing-stage');
    const resultStage = document.getElementById('result-stage');
    
    const imgOriginal = document.getElementById('img-original');
    const imgProcessed = document.getElementById('img-processed');
    const compareContainer = document.getElementById('compare-viewer');
    const overlayDiv = document.getElementById('overlay-div');
    const btnDownload = document.getElementById('btn-download');

    let processedBlob = null;

    // 1. Gestione Upload
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImage(e.target.files[0]);
        }
    });

    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleImage(e.dataTransfer.files[0]);
        }
    });

    async function handleImage(file) {
        if (!file.type.startsWith('image/')) {
            alert('Per favore carica un file immagine valido (JPG, PNG, WEBP).');
            return;
        }

        // Mostra UI di caricamento
        uploadArea.style.display = 'none';
        processingStage.style.display = 'block';

        // Carica Anteprima Originale
        const reader = new FileReader();
        reader.onload = (e) => {
            imgOriginal.src = e.target.result;
            // Importante: quando l'immagine è caricata, settiamo le dimensioni del container
            imgOriginal.onload = () => {
                const aspectRatio = imgOriginal.naturalWidth / imgOriginal.naturalHeight;
                compareContainer.style.aspectRatio = `${aspectRatio}`;
                
                // Assicuriamoci che l'immagine dentro l'overlay abbia la stessa larghezza del container
                // Questo è il trucco per far funzionare lo slider
                requestAnimationFrame(() => {
                    const w = compareContainer.clientWidth;
                    const h = compareContainer.clientHeight;
                    imgOriginal.style.width = `${w}px`;
                    imgOriginal.style.height = `${h}px`;
                });
            };
        };
        reader.readAsDataURL(file);

        // --- AI MAGIC START ---
        try {
            // Chiamata alla libreria @imgly/background-removal
            // Configurazione opzionale: progress callback
            const config = {
                progress: (key, current, total) => {
                    // Qui potresti aggiornare una barra di progresso
                    // console.log(`Downloading ${key}: ${current} of ${total}`);
                },
                debug: false
            };

            // Rimuovi sfondo
            const blob = await imglyRemoveBackground(file, config);
            processedBlob = blob;
            
            // Crea URL per il risultato
            const processedUrl = URL.createObjectURL(blob);
            imgProcessed.src = processedUrl;

            // Mostra Risultato
            processingStage.style.display = 'none';
            resultStage.style.display = 'block';
            
            // Re-inizializza dimensioni immagine overlay dopo display block
            setTimeout(() => {
                const w = compareContainer.clientWidth;
                const h = compareContainer.clientHeight;
                imgOriginal.style.width = `${w}px`;
                imgOriginal.style.height = `${h}px`;
            }, 100);

        } catch (error) {
            console.error("AI Error:", error);
            alert("Errore durante la rimozione dello sfondo. Riprova con un'altra immagine.");
            location.reload();
        }
    }

    // 2. Logica Slider "Before / After"
    compareContainer.addEventListener('mousemove', (e) => {
        const rect = compareContainer.getBoundingClientRect();
        let x = e.clientX - rect.left;
        
        // Clamp values
        if (x < 0) x = 0;
        if (x > rect.width) x = rect.width;
        
        overlayDiv.style.width = `${x}px`;
    });

    // Touch support per slider
    compareContainer.addEventListener('touchmove', (e) => {
        const rect = compareContainer.getBoundingClientRect();
        let x = e.touches[0].clientX - rect.left;
        if (x < 0) x = 0;
        if (x > rect.width) x = rect.width;
        overlayDiv.style.width = `${x}px`;
    }, { passive: true });

    // Handle Resize (Responsive Slider)
    window.addEventListener('resize', () => {
        if (resultStage.style.display !== 'none') {
            const w = compareContainer.clientWidth;
            const h = compareContainer.clientHeight;
            imgOriginal.style.width = `${w}px`;
            imgOriginal.style.height = `${h}px`;
        }
    });

    // 3. Download
    btnDownload.addEventListener('click', () => {
        if (processedBlob) {
            const url = URL.createObjectURL(processedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'crono-ai-nophoto.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });
});