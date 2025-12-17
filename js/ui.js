/* --- CronoTools UI Manager v3.3 --- */

const UI = {
    lastScrollTop: 0,
    scrollThreshold: 50,

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initTheme();
        this.initAccessibility(); 
        
        // Init Scroll state
        this.lastScrollTop = window.scrollY;
        this.handleScroll();
    },

    onNavbarRendered() {
        this.cacheDOM();
        this.initTheme();
        this.syncAccessibilityCheckboxes();
    },

    cacheDOM() {
        this.body = document.body;
        this.navbar = document.getElementById('global-navbar');
        this.sidebarLeft = document.getElementById('sidebar-left');
        this.sidebarRight = document.getElementById('sidebar-right');
        this.backdrop = document.getElementById('backdrop');
        this.menuBtn = document.getElementById('menu-btn');
        this.settingsBtn = document.getElementById('settings-btn');
    },

    bindEvents() {
        if (this.menuBtn) this.menuBtn.addEventListener('click', () => this.toggleSidebar('left'));
        if (this.settingsBtn) this.settingsBtn.addEventListener('click', () => this.toggleSidebar('right'));
        if (this.backdrop) this.backdrop.addEventListener('click', () => this.closeAllSidebars());
        
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        
        // Ascolta evento sync dal profilo utente (Auth.js)
        window.addEventListener('crono-profile-sync', () => {
            this.syncAccessibilityCheckboxes();
        });

        window.addEventListener('crono-bar-update', () => { this.cacheDOM(); this.handleScroll(); });
        
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeAllSidebars(); });
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-set-theme]');
            if (btn && btn.dataset) this.setTheme(btn.dataset.setTheme);
        });
        window.addEventListener('crono-navbar-rendered', () => this.onNavbarRendered());
    },

    /* --- ACCESSIBILITY V3.3 UPDATE --- */
    initAccessibility() {
        const motion = localStorage.getItem('crono-acc-motion') === 'true';
        const transparency = localStorage.getItem('crono-acc-transparency') === 'true';
        const contrast = localStorage.getItem('crono-acc-contrast') === 'true';
        const bold = localStorage.getItem('crono-acc-bold') === 'true'; // NEW

        this.body.classList.toggle('reduce-motion', motion);
        this.body.classList.toggle('solid-ui', transparency);
        this.body.classList.toggle('high-contrast', contrast);
        this.body.classList.toggle('bold-text', bold); // NEW
    },

    toggleAccessibility(type) {
        let key = `crono-acc-${type}`;
        let isActive = localStorage.getItem(key) === 'true';
        let newState = !isActive;
        
        // Salva localmente (fallback guest)
        localStorage.setItem(key, newState);
        
        // Applica classe
        if(type === 'motion') this.body.classList.toggle('reduce-motion', newState);
        if(type === 'transparency') this.body.classList.toggle('solid-ui', newState);
        if(type === 'contrast') this.body.classList.toggle('high-contrast', newState);
        if(type === 'bold') this.body.classList.toggle('bold-text', newState); // NEW

        // Se loggato, salva su profilo CronoID
        if (type === 'motion') CronoID.setPreference('reduceMotion', newState);
        if (type === 'transparency') CronoID.setPreference('reduceTransparency', newState);
        if (type === 'contrast') CronoID.setPreference('highContrast', newState);
        if (type === 'bold') CronoID.setPreference('boldText', newState);

        this.syncAccessibilityCheckboxes();
    },

    syncAccessibilityCheckboxes() {
        const ids = {
            'motion': 'check-motion',
            'transparency': 'check-transparency',
            'contrast': 'check-contrast',
            'bold': 'check-bold' // NEW
        };
        
        for (const [type, id] of Object.entries(ids)) {
            const el = document.getElementById(id);
            if (el) el.checked = localStorage.getItem(`crono-acc-${type}`) === 'true';
        }
    },

    /* --- SCROLL & THEME --- */
    handleScroll() {
        if (!this.navbar) return;
        if (document.body.classList.contains('beta-glass-mode')) { this.navbar.classList.remove('scrolled'); return; }
        const currentScroll = window.scrollY;
        if (currentScroll <= 0) { this.navbar.classList.remove('scrolled'); this.lastScrollTop = 0; return; }

        if (currentScroll > this.lastScrollTop && currentScroll > this.scrollThreshold) {
            if (!this.navbar.classList.contains('scrolled')) this.navbar.classList.add('scrolled');
        } else if (currentScroll < this.lastScrollTop) {
            if (this.navbar.classList.contains('scrolled')) this.navbar.classList.remove('scrolled');
        }
        this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    },

    toggleSidebar(side) {
        this.closeAllSidebars();
        const sidebar = side === 'left' ? this.sidebarLeft : this.sidebarRight;
        if (sidebar) {
            sidebar.classList.add('open');
            this.backdrop.classList.add('active');
            this.body.classList.add('no-scroll');
        }
    },

    closeAllSidebars() {
        document.querySelectorAll('.sidebar.open').forEach(el => el.classList.remove('open'));
        if (this.backdrop) this.backdrop.classList.remove('active');
        this.body.classList.remove('no-scroll');
    },

    initTheme() {
        const savedTheme = localStorage.getItem('crono-theme');
        let theme = savedTheme || ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelectorAll('[data-set-theme]').forEach(btn => {
            if (btn.dataset.setTheme === theme) btn.classList.add('active');
        });
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('crono-theme', theme);
        
        // CronoID Sync
        CronoID.setPreference('theme', theme);

        document.querySelectorAll('[data-set-theme]').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-set-theme="${theme}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    },

    showAlert(title, message) {
        // Implementazione base alert
        alert(`${title}\n\n${message}`);
    }
};

document.addEventListener('DOMContentLoaded', () => UI.init());