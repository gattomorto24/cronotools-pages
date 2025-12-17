/* =========================================================
   Universal Navbar Component — CronoTools 3.3 FINAL
   - Auth (CronoID)
   - Dynamic Menu
   - Accessibility
   - Minimal Mode
   - Full Fallback
   ========================================================= */

class GlobalNavbar extends HTMLElement {

    connectedCallback() {
        this.render();
        this.applyUserPreferences();

        window.addEventListener('crono-bar-update', () => this.applyUserPreferences());
        window.addEventListener('crono-profile-sync', () => this.render());
    }

    /* ---------------- RENDER ---------------- */

    render() {
        const user = window.CronoID?.currentUser || null;

        const authBlock = user
            ? `
            <div class="menu-item" onclick="CronoID.logout()" style="color:var(--danger); cursor:pointer;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:12px">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Esci (${user.username})
            </div>`
            : `
            <a href="/login/index.html" class="menu-item" style="color:var(--accent);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:12px">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Accedi / Registrati
            </a>`;

        this.innerHTML = `
        <nav id="global-navbar">
            <div class="nav-pill" id="dynamic-pill">

                <button class="nav-btn" aria-label="Menu" onclick="UI.toggleSidebar('left')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>

                <div class="nav-center">
                    <div class="nav-center-links desktop-only">
                        ${this.getMenuLinks('nav-link')}
                    </div>
                    <div class="nav-mini-logo">
                        <img class="logo-light" src="/css/IMG_0623.png" alt="CronoTools" height="24">
                        <img class="logo-dark" src="/css/IMG_0624.png" alt="CronoTools" height="24">
                        <span>CronoTools</span>
                    </div>
                </div>

                <button class="nav-btn" aria-label="Settings" onclick="UI.toggleSidebar('right')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06
                                 a2 2 0 0 1 0 2.83
                                 a2 2 0 0 1-2.83 0l-.06-.06
                                 a1.65 1.65 0 0 0-1.82-.33
                                 a1.65 1.65 0 0 0-1 1.51V21
                                 a2 2 0 0 1-2 2
                                 a2 2 0 0 1-2-2v-.09
                                 a1.65 1.65 0 0 0-1-1.51
                                 a1.65 1.65 0 0 0-1.82.33l-.06.06
                                 a2 2 0 0 1-2.83 0
                                 a2 2 0 0 1 0-2.83l.06-.06
                                 a1.65 1.65 0 0 0 .33-1.82
                                 a1.65 1.65 0 0 0-1.51-1H3
                                 a2 2 0 0 1-2-2
                                 a2 2 0 0 1 2-2h.09
                                 a1.65 1.65 0 0 0 1.51-1
                                 a1.65 1.65 0 0 0-.33-1.82l-.06-.06
                                 a2 2 0 0 1 0-2.83
                                 a2 2 0 0 1 2.83 0l.06.06
                                 a1.65 1.65 0 0 0 1.82.33H9
                                 a1.65 1.65 0 0 0 1-1.51V3
                                 a2 2 0 0 1 2-2
                                 a2 2 0 0 1 2 2v.09
                                 a1.65 1.65 0 0 0 1 1.51
                                 a1.65 1.65 0 0 0 1.82-.33l.06-.06
                                 a2 2 0 0 1 2.83 0
                                 a2 2 0 0 1 0 2.83l-.06.06
                                 a1.65 1.65 0 0 0-.33 1.82V9
                                 a1.65 1.65 0 0 0 1.51 1H21
                                 a2 2 0 0 1 2 2
                                 a2 2 0 0 1-2 2h-.09
                                 a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>

            </div>
        </nav>

        <aside class="sidebar" id="sidebar-left">
            <div class="sidebar-header">
                <span class="sidebar-title">Menu</span>
                <button class="nav-btn" onclick="UI.closeAllSidebars()">✕</button>
            </div>
            <div class="sidebar-content">
                <div class="menu-list">
                    ${authBlock}
                    <div class="separator"></div>
                    ${this.getMenuLinks('menu-item')}
                </div>
            </div>
        </aside>

        <aside class="sidebar right" id="sidebar-right">
            <div class="sidebar-header">
                <span class="sidebar-title">Impostazioni</span>
                <button class="nav-btn" onclick="UI.closeAllSidebars()">✕</button>
            </div>
            <div class="sidebar-content">
                ${this.getSettings()}
            </div>
        </aside>

        <div class="backdrop" id="backdrop"></div>
        `;
    }

    /* ---------------- MENU ---------------- */

    getMenuLinks(className) {
        const fallbackMenu = [
            { href: '/index.html', text: 'Home' },
            { href: '/filtri/index.html', text: 'Filtri' },
            { href: '/crop-immagini/index.html', text: 'Ritaglia' },
            { href: '/ridimensiona/index.html', text: 'Ridimensiona' },
            { href: '/colora/index.html', text: 'Colora' },
            { href: '/taglia-video/index.html', text: 'Taglia Video' },
            { href: '/qr/index.html', text: 'QR Code' },
            { href: '/info/index.html', text: 'Info' }
        ];

        const menu = window.CronoID?.getMenu
            ? CronoID.getMenu().filter(i => i.visible)
            : fallbackMenu;

        return menu.map(link => {
            const active = location.pathname.startsWith(link.href.replace('/index.html', '')) ? 'active' : '';
            return `<a href="${link.href}" class="${className} ${active}">${link.text}</a>`;
        }).join('');
    }

    /* ---------------- SETTINGS ---------------- */

    getSettings() {
        return `
        <h4 class="settings-group-title">Layout</h4>
        <div class="ios-toggle-wrapper" onclick="toggleOldDesign()">
            <div class="ios-toggle-label">Barra Minimale</div>
            <input type="checkbox" class="ios-toggle" id="oldDesignCheckbox"
                   onclick="event.stopPropagation(); toggleOldDesign();">
        </div>

        <h4 class="settings-group-title">Accessibilità</h4>
        ${['motion','transparency','contrast','bold'].map(t => `
            <div class="ios-toggle-wrapper" onclick="UI.toggleAccessibility('${t}')">
                <div class="ios-toggle-label">${this.labelFor(t)}</div>
                <input type="checkbox" class="ios-toggle" id="check-${t}"
                       onclick="event.stopPropagation(); UI.toggleAccessibility('${t}');">
            </div>
        `).join('')}

        <h4 class="settings-group-title">Tema</h4>
        <div class="menu-list theme-list">
            ${this.getThemeButtons()}
        </div>`;
    }

    labelFor(t) {
        return {
            motion: 'Riduci Movimento',
            transparency: 'Riduci Trasparenza',
            contrast: 'Contrasto Elevato',
            bold: 'Testo in Grassetto'
        }[t];
    }

    getThemeButtons() {
        const themes = ['light','dark','midnight','slate','latte','sunset','forest','lavanda','cyberpunk','high-contrast'];
        return themes.map(t =>
            `<button class="menu-item" data-set-theme="${t}">
                <span class="theme-dot"></span> ${t}
            </button>`
        ).join('');
    }

    /* ---------------- PREFS ---------------- */

    applyUserPreferences() {
        const body = document.body;
        const isOld = localStorage.getItem('old-design-active') === 'true'
            || (localStorage.getItem('old-design-active') === null && innerWidth <= 768);

        body.classList.toggle('old-design-mode', isOld);

        const cb = this.querySelector('#oldDesignCheckbox');
        if (cb) cb.checked = isOld;
    }
}

/* ---------------- GLOBAL ---------------- */

window.toggleOldDesign = function () {
    const active = document.body.classList.contains('old-design-mode');
    localStorage.setItem('old-design-active', !active);
    window.CronoID?.setPreference?.('minimalMode', !active);
    dispatchEvent(new Event('crono-bar-update'));
};

customElements.define('crono-navbar', GlobalNavbar);
