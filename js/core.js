/* --- CronoTools Core Engine v1.2 (Auto-Render Fix) --- */

class CronoEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 20;
        this.originalImage = null;
        this.currentImage = null; 
        this.scale = 1;
        
        this.listeners = {};

        // --- FIX ANTEPRIME ---
        // Osserva il contenitore: se diventa visibile o cambia dimensione, ricalcola il render.
        this.resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.contentRect.width > 0 && this.currentImage) {
                    // Debounce leggero per evitare flicker
                    requestAnimationFrame(() => this.render());
                }
            }
        });
        
        if (this.canvas.parentElement) {
            this.resizeObserver.observe(this.canvas.parentElement);
        }
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    loadImage(file) {
        if (!file || !file.type.startsWith('image/')) {
            if(window.UI) UI.showAlert('Errore', 'File non valido.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.reset();
                this.pushHistory();
                this.emit('imageLoaded', { width: img.width, height: img.height });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    reset() {
        this.currentImage = this.originalImage;
        this.render();
        this.history = [];
        this.historyIndex = -1;
    }

    render() {
        if (!this.currentImage) return;

        const container = this.canvas.parentElement;
        // Se il container è nascosto (width=0), non fare nulla per evitare errori o canvas vuoti
        if (container.clientWidth === 0) return;

        const maxWidth = container.clientWidth;
        const maxHeight = window.innerHeight * 0.7; 

        let width = this.currentImage.width;
        let height = this.currentImage.height;

        // Calcola scale per adattare al contenitore (solo visivo)
        this.scale = Math.min(maxWidth / width, maxHeight / height, 1);
        
        // Imposta dimensioni interne del canvas
        this.canvas.width = width * this.scale;
        this.canvas.height = height * this.scale;

        // Disegna
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);
        
        this.emit('render', { width: this.currentImage.width, height: this.currentImage.height });
    }

    pushHistory() {
        const snapshot = document.createElement('canvas');
        snapshot.width = this.currentImage.width;
        snapshot.height = this.currentImage.height;
        snapshot.getContext('2d').drawImage(this.currentImage, 0, 0);

        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(snapshot);
        if (this.history.length > this.maxHistory) this.history.shift();
        else this.historyIndex++;

        this.updateHistoryButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentImage = this.history[this.historyIndex];
            this.render();
            this.updateHistoryButtons();
        }
    }

    updateHistoryButtons() {
        const canUndo = this.historyIndex > 0;
        this.emit('historyChange', { canUndo });
    }

    // --- Operazioni ---

    rotate(degrees) {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        const img = this.currentImage;

        if (degrees === 90 || degrees === -90) {
            offCanvas.width = img.height;
            offCanvas.height = img.width;
        } else {
            offCanvas.width = img.width;
            offCanvas.height = img.height;
        }

        offCtx.translate(offCanvas.width / 2, offCanvas.height / 2);
        offCtx.rotate(degrees * Math.PI / 180);
        offCtx.drawImage(img, -img.width / 2, -img.height / 2);

        this.currentImage = offCanvas;
        this.render();
        this.pushHistory();
    }

    flip(direction) {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        const img = this.currentImage;

        offCanvas.width = img.width;
        offCanvas.height = img.height;

        offCtx.translate(direction === 'h' ? img.width : 0, direction === 'v' ? img.height : 0);
        offCtx.scale(direction === 'h' ? -1 : 1, direction === 'v' ? -1 : 1);
        offCtx.drawImage(img, 0, 0);

        this.currentImage = offCanvas;
        this.render();
        this.pushHistory();
    }

    resize(newWidth, newHeight) {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        offCanvas.width = newWidth;
        offCanvas.height = newHeight;
        offCtx.drawImage(this.currentImage, 0, 0, newWidth, newHeight);
        this.currentImage = offCanvas;
        this.render();
        this.pushHistory();
    }

    // Filtri Avanzati (Luminosità, Contrasto, ecc.)
    applyFilters(filters = {}) {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        const img = this.currentImage; // Applica sempre sull'immagine attuale (o originale se gestito diversamente)
        
        offCanvas.width = img.width;
        offCanvas.height = img.height;

        // Costruisci stringa filtri CSS
        let filterString = '';
        if (filters.brightness) filterString += `brightness(${filters.brightness}%) `;
        if (filters.contrast) filterString += `contrast(${filters.contrast}%) `;
        if (filters.saturate) filterString += `saturate(${filters.saturate}%) `;
        if (filters.grayscale) filterString += `grayscale(${filters.grayscale}%) `;
        if (filters.sepia) filterString += `sepia(${filters.sepia}%) `;
        if (filters.blur) filterString += `blur(${filters.blur}px) `;
        if (filters.hue) filterString += `hue-rotate(${filters.hue}deg) `;

        offCtx.filter = filterString.trim() || 'none';
        offCtx.drawImage(img, 0, 0);
        offCtx.filter = 'none';

        // Non salviamo in history ad ogni slide, ma solo al rilascio (gestito dalla UI)
        // Per ora ritorniamo il canvas modificato per preview live
        return offCanvas; 
    }

    // Commit dei filtri (salva in history)
    commitFilter(canvasWithFilter) {
        this.currentImage = canvasWithFilter;
        this.render();
        this.pushHistory();
    }

    async export(format = 'png', quality = 0.9) {
        if (!this.currentImage) return;
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.currentImage.width;
        exportCanvas.height = this.currentImage.height;
        exportCanvas.getContext('2d').drawImage(this.currentImage, 0, 0);

        return new Promise(resolve => {
            exportCanvas.toBlob(blob => {
                resolve(blob);
            }, `image/${format}`, quality);
        });
    }

    download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}