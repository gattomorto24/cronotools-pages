/* --- CronoTools Core Engine --- */

class CronoEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 20;
        this.originalImage = null;
        this.currentImage = null; // Image object or Canvas
        this.scale = 1;
        
        // Event bus for UI updates
        this.listeners = {};
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
            UI.showAlert('Errore', 'Per favore carica un file immagine valido.');
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

        // Resize canvas to fit container but keep aspect ratio
        const container = this.canvas.parentElement;
        const maxWidth = container.clientWidth;
        // Limit max height for very tall images
        const maxHeight = window.innerHeight * 0.7; 

        let width = this.currentImage.width;
        let height = this.currentImage.height;

        // Calculate scale to fit
        this.scale = Math.min(maxWidth / width, maxHeight / height, 1);
        
        this.canvas.width = width * this.scale;
        this.canvas.height = height * this.scale;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);
    }

    pushHistory() {
        // Create a copy of the current state
        const snapshot = document.createElement('canvas');
        snapshot.width = this.currentImage.width;
        snapshot.height = this.currentImage.height;
        snapshot.getContext('2d').drawImage(this.currentImage, 0, 0);

        // Remove redo states if we branch out
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

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.currentImage = this.history[this.historyIndex];
            this.render();
            this.updateHistoryButtons();
        }
    }

    updateHistoryButtons() {
        const canUndo = this.historyIndex > 0;
        const canRedo = this.historyIndex < this.history.length - 1;
        this.emit('historyChange', { canUndo, canRedo });
    }

    // --- Image Operations ---

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

    async export(format = 'png', quality = 0.9) {
        if (!this.currentImage) return;

        // Ensure we export the full resolution image, not the scaled canvas
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