/* --- CronoTools UI Manager v3.4.0 (Dynamic Bar Logic) --- */

const UI = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initTheme();
        this.initLayout();
        
        this.lastScrollY = window.scrollY;
        this.ticking = false; 
        this.handleScroll();
    },

    cacheDOM() {
        this.body = document.body;
        this.navbar = document.getElementById('global-navbar');
        this.backDrop = document.getElementById('backdrop');
    },

    bindEvents() {
        window.addEventListener('scroll', () => this.requestTick(), { passive: true });
        
        if (this.backDrop) this.backDrop.addEventListener('click', () => {
            this.closeSidebars();
            this.closeDynamicMenu();
        });
        
        document.addEventListener('keydown', (e) => { 
            if (e.key === 'Escape') {
                this.closeSidebars();
                this.closeDynamicMenu();
            }
        });
        
        window.addEventListener('crono-pref-sync', (e) => this.applyPrefs(e.detail));
        window.addEventListener('crono-auth-change', () => this.updateUIState());
    },

    /* --- INTELLIGENT MENU TOGGLE --- */
    toggleMenu(side) {
        const isMinimal = this.body.classList.contains('old-design-mode');

        if (isMinimal) {
            // Legacy Mode: Open Sidebar
            this.openSidebar(side);
        } else {
            // Dynamic Mode: Expand Navbar
            this.expandNavbar(side);
        }
    },

    /* --- DYNAMIC NAVBAR EXPANSION --- */
    expandNavbar(side) {
        if (!this.navbar) return;
        
        const container = document.getElementById('dyn-menu-container');
        const template = document.getElementById(`tpl-menu-${side}`);
        
        if (container && template) {
            container.innerHTML = template.innerHTML;
            this.navbar.classList.add('expanded');
            this.backDrop.classList.add('active');
            this.body.classList.add('no-scroll');
        }
    },

    closeDynamicMenu() {
        if (this.navbar) {
            this.navbar.classList.remove('expanded');
            // Ritardo pulizia HTML per permettere animazione chiusura
            setTimeout(() => {
                const container = document.getElementById('dyn-menu-container');
                if(container && !this.navbar.classList.contains('expanded')) container.innerHTML = '';
            }, 300);
        }
        if (this.backDrop) this.backDrop.classList.remove('active');
        this.body.classList.remove('no-scroll');
    },

    /* --- LEGACY SIDEBARS --- */
    openSidebar(side) {
        this.closeSidebars(); 
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

    /* --- SCROLL LOGIC --- */
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
        
        // Se la navbar è espansa (menu aperto), ignora lo scroll
        if (this.navbar.classList.contains('expanded')) return;

        const currentScrollY = window.scrollY;
        const threshold = 10; 
        const scrollDelta = 5;

        if (currentScrollY <= threshold) {
            this.navbar.classList.remove('scrolled');
        } else {
            const diff = currentScrollY - this.lastScrollY;
            if (diff > scrollDelta) {
                this.navbar.classList.add('scrolled');
            } else if (diff < -scrollDelta) {
                this.navbar.classList.remove('scrolled');
            }
        }
        this.lastScrollY = Math.max(0, currentScrollY);
    },

    /* --- LAYOUT & THEME --- */
    initLayout() {
        const isMinimal = localStorage.getItem('crono-minimal') === 'true';
        const isBottom = localStorage.getItem('crono-bar-bottom') === 'true';
        this.setMinimalMode(isMinimal);
        this.setBarPosition(isBottom);
    },

    setMinimalMode(active) {
        this.body.classList.toggle('old-design-mode', active);
        localStorage.setItem('crono-minimal', active);
        if(window.CronoID) CronoID.updatePref('minimalMode', active);
        
        // Se cambiamo modalità mentre qualcosa è aperto, chiudiamo tutto per sicurezza
        this.closeDynamicMenu();
        this.closeSidebars();
        this.handleScroll();
    },

    setBarPosition(bottom) {
        this.body.classList.toggle('bar-bottom', bottom);
        localStorage.setItem('crono-bar-bottom', bottom);
        if(window.CronoID) CronoID.updatePref('barBottom', bottom);
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
