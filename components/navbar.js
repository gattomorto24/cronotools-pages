/* =========================================================
   Universal Navbar Component — CronoTools 3.3.1 FINAL
   - Crono ID
   - Dynamic Bar Config (always visible)
   - Accessibility
   - Minimal / Dynamic Mode
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
                Esci (${user.username})
            </div>`
            : `
            <a href="/login/index.html" class="menu-item" style="color:var(--accent);">
                Accedi / Registrati
            </a>`;

        this.innerHTML = `
        <nav id="global-navbar">
            <div class="nav-pill" id="dynamic-pill">

                <button class="nav-btn" onclick="UI.toggleSidebar('left')" aria-label="Menu">
                    ☰
                </button>

                <div class="nav-center">
                    <div class="nav-center-links desktop-only">
                        ${this.getMenuLinks('nav-link')}
                    </div>
                    <div class="nav-mini-logo">
                        <img class="logo-light" src="/css/IMG_0623.png" height="24" alt="">
                        <img class="logo-dark" src="/css/IMG_0624.png" height="24" alt="">
                        <span>CronoTools</span>
                    </div>
                </div>

                <button class="nav-btn" onclick="UI.toggleSidebar('right')" aria-label="Settings">
                    ⚙
                </button>

            </div>
        </nav>

        <!-- LEFT MENU -->
        <aside class="sidebar" id="sidebar-left">
            <div class="sidebar-header">
                <span class="sidebar-title">Menu</span>
                <button class="nav-btn" onclick="UI.closeAllSidebars()">✕</button>
            </div>

            <div class="sidebar-content">

                <!-- CRONO ID -->
                <h4 class="settings-group-title">Crono ID</h4>
                <div class="menu-list">
                    ${authBlock}
                </div>

                <!-- DYNAMIC BAR -->
                <h4 class="settings-group-title">Dynamic Bar</h4>
                <div class="menu-list">
                    <a href="/dynamic-bar/index.html" class="menu-item highlight">
                        Personalizza Dynamic Bar
                    </a>
                </div>

                <!-- TOOLS -->
                <h4 class="settings-group-title">Strumenti</h4>
                <div class="menu-list">
                    ${this.getMenuLinks('menu-item')}
                </div>

                <!-- INFO -->
                <h4 class="settings-group-title">Altro</h4>
                <div class="menu-list">
                    <a href="/info/index.html" class="menu-item">Info & Release Notes</a>
                </div>

            </div>
        </aside>

        <!-- RIGHT MENU -->
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
            { href: '/qr/index.html', text: 'QR Code' }
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
                <input type="checkbox" class="ios-toggle"
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
            `<button class="menu-item" data-set-theme="${t}">${t}</button>`
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
