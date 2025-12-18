/* --- CronoTools UI Manager v3.3.5 (Scroll Logic Patch) --- */

const UI = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initTheme();
        this.initLayout();
        
        // Inizializza variabile per tracking scroll
        this.lastScrollY = window.scrollY;
        this.ticking = false; // Per ottimizzazione requestAnimationFrame
        
        // Esegue un check iniziale
        this.handleScroll();
    },

    cacheDOM() {
        this.body = document.body;
        this.navbar = document.getElementById('global-navbar');
        this.backDrop = document.getElementById('backdrop');
    },

    bindEvents() {
        // Usa passive: true per performance scroll
        window.addEventListener('scroll', () => this.requestTick(), { passive: true });
        
        if (this.backDrop) this.backDrop.addEventListener('click', () => this.closeSidebars());
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeSidebars(); });
        
        // Eventi di sincronizzazione preferenze
        window.addEventListener('crono-pref-sync', (e) => this.applyPrefs(e.detail));
        window.addEventListener('crono-auth-change', () => this.updateUIState());
    },

    /* --- SCROLL LOGIC ENGINE --- */
    requestTick() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.handleScroll();
                this.ticking = false;
            });
            this.ticking = true;
        }
    },

    handleScroll() {
        if (!this.navbar) return;
        
        const currentScrollY = window.scrollY;
        // Soglia di "sicurezza" in alto per evitare flickering a 0px
        const threshold = 10; 
        // Delta minimo per considerare lo scroll intenzionale (evita micro-movimenti touch)
        const scrollDelta = 5;

        // 1. TOP PAGINA ASSOLUTO (Stato Reset)
        // Se siamo in cima, la barra DEVE essere sempre completa
        if (currentScrollY <= threshold) {
            this.navbar.classList.remove('scrolled');
        }
        // 2. LOGICA DINAMICA (Se non siamo al top)
        else {
            const diff = currentScrollY - this.lastScrollY;

            // SCROLL VERSO IL BASSO (Diff positiva)
            // Se scendiamo e non siamo già "scrolled", compattiamo
            if (diff > scrollDelta) {
                this.navbar.classList.add('scrolled');
            }
            // SCROLL VERSO L'ALTO (Diff negativa)
            // Se saliamo (anche di poco) e siamo "scrolled", espandiamo SUBITO
            else if (diff < -scrollDelta) {
                this.navbar.classList.remove('scrolled');
            }
        }

        // Aggiorna ultimo punto noto (gestione rimbalzo iOS con Math.max)
        this.lastScrollY = Math.max(0, currentScrollY);
    },

    /* --- LAYOUT & THEME --- */
    initLayout() {
        // Lettura sicura da localStorage con fallback
        const isMinimal = localStorage.getItem('crono-minimal') === 'true';
        const isBottom = localStorage.getItem('crono-bar-bottom') === 'true';
        this.setMinimalMode(isMinimal);
        this.setBarPosition(isBottom);
    },

    setMinimalMode(active) {
        this.body.classList.toggle('old-design-mode', active);
        localStorage.setItem('crono-minimal', active);
        if(window.CronoID) CronoID.updatePref('minimalMode', active);
        // Forza ricalcolo immediato dello stato navbar
        this.handleScroll();
    },

    setBarPosition(bottom) {
        this.body.classList.toggle('bar-bottom', bottom);
        localStorage.setItem('crono-bar-bottom', bottom);
        if(window.CronoID) CronoID.updatePref('barBottom', bottom);
        // Ricalcolo per posizionamento
        this.handleScroll();
    },
    
    toggleMinimal() { this.setMinimalMode(!this.body.classList.contains('old-design-mode')); },
    toggleBarPosition() { this.setBarPosition(!this.body.classList.contains('bar-bottom')); },

    initTheme() {
        const t = localStorage.getItem('crono-theme') || 'light';
        this.setTheme(t);
        this.initAccessibility();
    },

    setTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('crono-theme', t);
        if(window.CronoID) CronoID.updatePref('theme', t);
    },

    /* --- SIDEBARS --- */
    openSidebar(side) {
        this.closeSidebars(); // Chiude altre eventuali aperte
        const el = document.getElementById(side === 'left' ? 'sidebar-left' : 'sidebar-right');
        if (el) {
            el.classList.add('open');
            if (this.backDrop) this.backDrop.classList.add('active');
            this.body.classList.add('no-scroll');
        }
    },

    closeSidebars() {
        document.querySelectorAll('.sidebar').forEach(s => s.classList.remove('open'));
        if (this.backDrop) this.backDrop.classList.remove('active');
        this.body.classList.remove('no-scroll');
    },

    /* --- ACCESSIBILITY --- */
    initAccessibility() {
        ['motion', 'contrast', 'bold'].forEach(k => {
            const active = localStorage.getItem(`crono-acc-${k}`) === 'true';
            this.toggleAccessClass(k, active);
        });
    },

    toggleAccessibility(type) {
        const key = `crono-acc-${type}`;
        const newState = !(localStorage.getItem(key) === 'true');
        localStorage.setItem(key, newState);
        this.toggleAccessClass(type, newState);
    },

    toggleAccessClass(type, active) {
        if(type === 'motion') this.body.classList.toggle('reduce-motion', active);
        if(type === 'contrast') this.body.classList.toggle('high-contrast', active);
        if(type === 'bold') this.body.classList.toggle('bold-text', active);
    },

    /* --- SYNC HELPERS --- */
    applyPrefs(prefs) {
        if(prefs.theme) this.setTheme(prefs.theme);
        if(prefs.minimalMode !== undefined) this.setMinimalMode(prefs.minimalMode);
        if(prefs.barBottom !== undefined) this.setBarPosition(prefs.barBottom);
    },

    updateUIState() {
        const minCheck = document.getElementById('check-minimal');
        if(minCheck) minCheck.checked = this.body.classList.contains('old-design-mode');
    }
};

// Avvio al caricamento DOM
document.addEventListener('DOMContentLoaded', () => UI.init());