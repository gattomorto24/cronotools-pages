/* =========================================================
   Universal Navbar Component — CronoTools 3.3.9
   - FIX: Force Logo Visibility
   - Renamed classes to bypass legacy CSS hiding rules
   - Injected styles to guarantee centering and display
   ========================================================= */

class GlobalNavbar extends HTMLElement {

    connectedCallback() {
        this.render();
        window.addEventListener('crono-auth-change', () => this.render());
        window.addEventListener('crono-pref-sync', () => this.render());
    }

    render() {
        const isLoggedIn = window.CronoID?.state?.isLoggedIn || false;
        const currentUser = window.CronoID?.state?.currentUser || {};

        const isMinimal = document.body.classList.contains('old-design-mode');
        const isBottom = document.body.classList.contains('bar-bottom');

        // Logica Avatar/Auth
        const authHtml = isLoggedIn ? `
            <a href="/account/index.html" class="auth-avatar" title="Profilo" style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:var(--accent-faded, rgba(0,0,0,0.1));color:var(--accent, #000);font-weight:bold;text-decoration:none;">
                ${currentUser.username ? currentUser.username.substring(0,2).toUpperCase() : 'U'}
            </a>
        ` : `
            <a href="/login/index.html"
               class="auth-link"
               style="font-size:14px;font-weight:600;color:var(--accent);text-decoration:none;margin-right:8px;">
            </a>
        `;

        const widgetHtml = isLoggedIn ? `
            <div class="cronoid-widget logged-in" onclick="location.href='/account/index.html'">
                <div class="widget-avatar">
                    ${currentUser.username ? currentUser.username.substring(0,2).toUpperCase() : 'U'}
                </div>
                <div class="widget-info">
                    <span class="widget-name">${currentUser.username}</span>
                    <span class="widget-email">${currentUser.email || 'Nessuna email'}</span>
                    <span class="widget-cta">Gestisci account →</span>
                </div>
            </div>
        ` : `
            <div class="cronoid-widget guest" onclick="location.href='/login/index.html'">
                <div class="widget-avatar">?</div>
                <div class="widget-info">
                    <span class="widget-name">Non connesso</span>
                    <span class="widget-cta">Accedi a CronoID</span>
                </div>
            </div>
        `;

        // CSS INIETTATO PER FORZARE LA VISIBILITA'
        // Questo blocco assicura che il logo si veda indipendentemente dal tuo style.css vecchio
        const forcedStyles = `
            <style>
                /* Forza il contenitore centrale ad essere flessibile e centrato */
                #global-navbar .nav-center {
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    flex-grow: 1 !important;
                    width: auto !important;
                }
                
                /* Nuova classe per il logo che ignora i vecchi 'display:none' */
                #global-navbar .nav-brand-fixed {
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                    text-decoration: none !important;
                    color: inherit !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }

                /* Assicura che le immagini abbiano una dimensione se non caricata dal CSS */
                #global-navbar .logo-img {
                    height: 24px;
                    width: auto;
                    object-fit: contain;
                }

                /* Assicura che il testo sia visibile */
                #global-navbar .brand-text {
                    font-weight: 700;
                    letter-spacing: -0.5px;
                    font-size: 16px;
                    display: inline-block !important;
                }
            </style>
        `;

        this.innerHTML = `
        ${forcedStyles}
        <nav id="global-navbar">
            <div class="nav-pill">

                <button class="nav-btn" onclick="UI.openSidebar('left')" aria-label="Menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>

                <div class="nav-center">
                    <!-- 
                        Uso una nuova classe 'nav-brand-fixed' per evitare che il CSS 
                        esistente nasconda la vecchia classe 'nav-mini-logo' su desktop.
                    -->
                    <a href="/index.html" class="nav-brand-fixed">
                        <img src="/css/IMG_0623.png" class="logo-img logo-light" alt="Logo">
                        <img src="/css/IMG_0624.png" class="logo-img logo-dark" alt="Logo">
                        <span class="brand-text">CronoTools</span>
                    </a>
                </div>

                <div style="display:flex;align-items:center;gap:6px;">
                    ${authHtml}
                    <button class="nav-btn" onclick="UI.openSidebar('right')" aria-label="Impostazioni">
                        ⚙️
                    </button>
                </div>
            </div>
        </nav>

        <aside class="sidebar" id="sidebar-left">
            <div class="sidebar-header">
                <span class="sidebar-title">Menu</span>
                <button class="nav-btn" onclick="UI.closeSidebars()">✕</button>
            </div>
            <div style="padding:20px">
                <a href="/index.html" class="menu-item">Home</a>
                <a href="/filtri/index.html" class="menu-item">Filtri</a>
                <a href="/crop-immagini/index.html" class="menu-item">Ritaglia</a>
                <a href="/ridimensiona/index.html" class="menu-item">Ridimensiona</a>
                <a href="/taglia-video/index.html" class="menu-item">Taglia Video</a>
                <a href="/base64/index.html" class="menu-item">Convertitore</a>
                <a href="/Ai/index.html" class="menu-item">AI Remover</a>

                <div style="margin-top:20px;border-top:1px solid var(--border-light);padding-top:20px">
                    ${isLoggedIn ? `<a href="/account/index.html" class="menu-item" style="color:var(--accent)">Profilo</a>` : ''}
                    <a href="/info/index.html" class="menu-item">Info & Aggiornamenti</a>
                </div>
            </div>
        </aside>

        <aside class="sidebar right" id="sidebar-right">
            <div class="sidebar-header">
                <span class="sidebar-title">Personalizza</span>
                <button class="nav-btn" onclick="UI.closeSidebars()">✕</button>
            </div>

            <div style="padding:20px">
                ${widgetHtml}

                <h4 class="settings-title">Layout</h4>
                <div class="ios-toggle-wrapper" onclick="UI.toggleMinimal()">
                    <span class="ios-toggle-label">Modalità minimale</span>
                    <input type="checkbox" class="ios-toggle" ${isMinimal ? 'checked' : ''}>
                </div>

                <div class="ios-toggle-wrapper" onclick="UI.toggleBarPosition()">
                    <span class="ios-toggle-label">Barra in basso</span>
                    <input type="checkbox" class="ios-toggle" ${isBottom ? 'checked' : ''}>
                </div>

                <h4 class="settings-title">Temi</h4>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                    <!-- Temi esistenti -->
                    <button class="menu-item" onclick="UI.setTheme('light')">Light</button>
                    <button class="menu-item" onclick="UI.setTheme('dark')">Dark</button>
                    <button class="menu-item" onclick="UI.setTheme('midnight')">Midnight</button>
                    <button class="menu-item" onclick="UI.setTheme('slate')">Slate</button>
                    <button class="menu-item" onclick="UI.setTheme('latte')">Latte</button>
                    <button class="menu-item" onclick="UI.setTheme('cyberpunk')">Cyberpunk</button>

                    <!-- NUOVI TEMI 3.3.8 -->
                    <button class="menu-item" onclick="UI.setTheme('aurora')">Aurora</button>
                    <button class="menu-item" onclick="UI.setTheme('forest')">Forest</button>
                    <button class="menu-item" onclick="UI.setTheme('sunset')">Sunset</button>
                    <button class="menu-item" onclick="UI.setTheme('ocean')">Ocean</button>
                    <button class="menu-item" onclick="UI.setTheme('graphite')">Graphite</button>
                </div>
            </div>
        </aside>

        <div class="backdrop" id="backdrop"></div>
        `;
    }
}

customElements.define('crono-navbar', GlobalNavbar);
