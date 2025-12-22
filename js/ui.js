/* ==========================================================================
   CRONOTOOLS UI MANAGER - V6.0 (CORE ENGINE)
   - Handles Themes (12+ Types)
   - Handles Accessibility Suite (7+ Modes)
   - Handles Beta Animation Engine
   - Handles Layout & Navigation Logic
   ========================================================================== */

const UI = {
    // --- INITIALIZATION ---
    init() {
        console.log("CronoTools UI Engine v6.0 Starting...");
        this.cacheDOM();
        this.bindEvents();
        
        // Init Core Systems
        this.initTheme();
        this.initLayout();
        this.initAnimations(); // New Beta Engine Init
        
        // Init Scroll Logic
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
        // Optimized Scroll Handler
        window.addEventListener('scroll', () => this.requestTick(), { passive: true });
        
        // Close menus on Backdrop click
        if (this.backDrop) this.backDrop.addEventListener('click', () => {
            this.closeSidebars();
            this.closeDynamicMenu();
        });
        
        // Accessibility: Close on Escape key
        document.addEventListener('keydown', (e) => { 
            if (e.key === 'Escape') {
                this.closeSidebars();
                this.closeDynamicMenu();
            }
        });
        
        // Custom Events for Cross-Component Sync
        window.addEventListener('crono-pref-sync', (e) => this.applyPrefs(e.detail));
        window.addEventListener('crono-auth-change', () => this.updateUIState());
    },

    /* =========================================
       NAVIGATION LOGIC (DYNAMIC VS LEGACY)
       ========================================= */
    
    toggleMenu(side) {
        // Check if user prefers the "Old Design" (Sidebar) or new (Dynamic Bar)
        const isMinimal = this.body.classList.contains('old-design-mode');
        if (isMinimal) {
            this.openSidebar(side);
        } else {
            this.expandNavbar(side);
        }
    },

    /* --- Dynamic Navbar Expansion --- */
    expandNavbar(side) {
        if (!this.navbar) return;
        const container = document.getElementById('dyn-menu-container');
        const template = document.getElementById(`tpl-menu-${side}`);
        
        if (container && template) {
            // Inject content from template
            container.innerHTML = template.innerHTML;
            this.navbar.classList.add('expanded');
            this.backDrop.classList.add('active');
            this.body.classList.add('no-scroll');
        }
    },

    closeDynamicMenu() {
        if (this.navbar) {
            this.navbar.classList.remove('expanded');
            // Clean content after animation delay for smooth exit
            setTimeout(() => {
                const container = document.getElementById('dyn-menu-container');
                if(container && !this.navbar.classList.contains('expanded')) container.innerHTML = '';
            }, 400);
        }
        if (this.backDrop) this.backDrop.classList.remove('active');
        this.body.classList.remove('no-scroll');
    },

    /* --- Legacy Sidebars --- */
    openSidebar(side) {
        this.closeSidebars(); // Close others first
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

    /* =========================================
       SCROLL & STICKY LOGIC
       ========================================= */
    
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
        // Don't change state if menu is expanded
        if (this.navbar.classList.contains('expanded')) return;

        const currentScrollY = window.scrollY;
        const threshold = 15; 
        const scrollDelta = 5;

        if (currentScrollY <= threshold) {
            this.navbar.classList.remove('scrolled');
        } else {
            const diff = currentScrollY - this.lastScrollY;
            // Add scrolled class if we move enough, simple logic
            if (diff > scrollDelta || currentScrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else if (currentScrollY < 50) {
                this.navbar.classList.remove('scrolled');
            }
        }
        this.lastScrollY = Math.max(0, currentScrollY);
    },

    /* =========================================
       LAYOUT & THEME MANAGEMENT
       ========================================= */

    initLayout() {
        const isMinimal = localStorage.getItem('crono-minimal') === 'true';
        const isBottom = localStorage.getItem('crono-bar-bottom') === 'true';
        this.setMinimalMode(isMinimal);
        this.setBarPosition(isBottom);
    },

    setMinimalMode(active) {
        this.body.classList.toggle('old-design-mode', active);
        localStorage.setItem('crono-minimal', active);
        // Force close menus to reset state
        this.closeDynamicMenu();
        this.closeSidebars();
        this.handleScroll();
    },

    setBarPosition(bottom) {
        this.body.classList.toggle('bar-bottom', bottom);
        localStorage.setItem('crono-bar-bottom', bottom);
        this.handleScroll();
    },
    
    toggleMinimal() { this.setMinimalMode(!this.body.classList.contains('old-design-mode')); },
    toggleBarPosition() { this.setBarPosition(!this.body.classList.contains('bar-bottom')); },

    initTheme() {
        const t = localStorage.getItem('crono-theme') || 'light';
        this.setTheme(t);
        this.initAccessibility(); // Re-apply accessibility on theme init
    },

    setTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('crono-theme', t);
        if(window.CronoID) CronoID.updatePref('theme', t);
    },

    /* =========================================
       BETA ANIMATION ENGINE
       ========================================= */
    
    initAnimations() {
        const isBeta = localStorage.getItem('crono-beta-anims') === 'true';
        this.toggleBetaAnimations(isBeta, false); // false = do not overwrite storage on init
    },

    toggleBetaAnimations(active, save = true) {
        this.body.classList.toggle('beta-animations', active);
        if (save) localStorage.setItem('crono-beta-anims', active);
        // Trigger a re-flow to restart animations if needed
        if(active) {
            const wrapper = document.querySelector('.content-wrapper');
            if(wrapper) {
                wrapper.style.animation = 'none';
                wrapper.offsetHeight; /* trigger reflow */
                wrapper.style.animation = null; 
            }
        }
    },

    /* =========================================
       ACCESSIBILITY SUITE (7 MODES)
       ========================================= */

    initAccessibility() {
        const keys = [
            'motion',       // Reduce Motion
            'contrast',     // High Contrast Mode
            'bold',         // Bold Text
            'transparency', // Remove Transparency
            'borders',      // Show Borders
            'saturated',    // Saturated Colors
            'monochrome'    // Grayscale Focus
        ];

        keys.forEach(k => {
            const active = localStorage.getItem(`crono-acc-${k}`) === 'true';
            this.toggleAccessClass(k, active);
        });
    },

    toggleAccessibility(type) {
        const key = `crono-acc-${type}`;
        const isActive = localStorage.getItem(key) === 'true';
        const newState = !isActive;
        
        localStorage.setItem(key, newState);
        this.toggleAccessClass(type, newState);
    },

    toggleAccessClass(type, active) {
        // Map types to Specific Body Classes defined in CSS
        switch(type) {
            case 'motion': this.body.classList.toggle('reduce-motion', active); break;
            case 'contrast': this.body.classList.toggle('high-contrast', active); break;
            case 'bold': this.body.classList.toggle('bold-text', active); break;
            case 'transparency': this.body.classList.toggle('no-transparency', active); break;
            case 'borders': this.body.classList.toggle('show-borders', active); break;
            case 'saturated': this.body.classList.toggle('saturated-colors', active); break;
            case 'monochrome': this.body.classList.toggle('monochrome', active); break;
        }
    },

    /* =========================================
       SYNC & STATE HELPERS
       ========================================= */

    applyPrefs(prefs) {
        if(prefs.theme) this.setTheme(prefs.theme);
        if(prefs.minimalMode !== undefined) this.setMinimalMode(prefs.minimalMode);
        if(prefs.barBottom !== undefined) this.setBarPosition(prefs.barBottom);
    },

    updateUIState() {
        // Reserved for future widget updates
    }
};

// Start the engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => UI.init());
