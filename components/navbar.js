/* =========================================================
   Universal Navbar Component — CronoTools 3.4.0
   - DYNAMIC EXPANSION MENU LOGIC
   - CENTRALIZED MENU DEFINITIONS
   - LEGACY SIDEBAR FALLBACK
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

        // --- AUTH CONTENT ---
        const authHtml = isLoggedIn ? `
            <a href="/account/index.html" class="auth-avatar" title="Profilo" style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:var(--accent-faded, rgba(0,0,0,0.1));color:var(--accent, #000);font-weight:bold;text-decoration:none;">
                ${currentUser.username ? currentUser.username.substring(0,2).toUpperCase() : 'U'}
            </a>
        ` : `
            <a href="/login/index.html" class="auth-link" style="font-size:14px;font-weight:600;color:var(--accent);text-decoration:none;margin-right:8px;"></a>
        `;

        const widgetHtml = isLoggedIn ? `
            <div class="cronoid-widget logged-in" onclick="location.href='/account/index.html'" style="padding:16px; background:var(--bg-input); border-radius:12px; margin-bottom:20px; display:flex; gap:12px; align-items:center; cursor:pointer;">
                <div class="widget-avatar" style="width:40px;height:40px;background:var(--accent);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;">${currentUser.username.substring(0,2).toUpperCase()}</div>
                <div class="widget-info" style="display:flex;flex-direction:column;">
                    <span class="widget-name" style="font-weight:bold;">${currentUser.username}</span>
                    <span class="widget-cta" style="font-size:12px;color:var(--text-secondary);">Gestisci account →</span>
                </div>
            </div>
        ` : `
            <div class="cronoid-widget guest" onclick="location.href='/login/index.html'" style="padding:16px; background:var(--bg-input); border-radius:12px; margin-bottom:20px; display:flex; gap:12px; align-items:center; cursor:pointer;">
                <div class="widget-avatar" style="width:40px;height:40px;background:var(--text-tertiary);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;">?</div>
                <div class="widget-info" style="display:flex;flex-direction:column;">
                    <span class="widget-name" style="font-weight:bold;">Non connesso</span>
                    <span class="widget-cta" style="font-size:12px;color:var(--text-secondary);">Accedi a CronoID →</span>
                </div>
            </div>
        `;

        // --- MENU DEFINITIONS (Used in both Sidebar and Dynamic Menu) ---
        
        const menuLeftContent = `
            <a href="/index.html" class="dyn-link">🏠 Home</a>
            <a href="/dynamic-bar/index.html" class="dyn-link">💊 Dynamic Bar</a>
            <a href="/filtri/index.html" class="dyn-link">🎨 Filtri</a>
            <a href="/crop-immagini/index.html" class="dyn-link">✂️ Ritaglia</a>
            <a href="/ridimensiona/index.html" class="dyn-link">📐 Ridimensiona</a>
            <a href="/taglia-video/index.html" class="dyn-link">🎬 Taglia Video</a>
            <a href="/base64/index.html" class="dyn-link">💾 Convertitore</a>
            <a href="/Ai/index.html" class="dyn-link">✨ AI Remover</a>
            <div style="margin-top:20px;border-top:1px solid var(--border-light);padding-top:10px">
                ${isLoggedIn ? `<a href="/account/index.html" class="dyn-link" style="color:var(--accent)">👤 Profilo</a>` : ''}
                <a href="/info/index.html" class="dyn-link">ℹ️ Info</a>
            </div>
        `;

        const menuRightContent = `
            ${widgetHtml}
            
            <h4 style="margin:16px 0 8px;font-size:13px;text-transform:uppercase;color:var(--text-secondary);">Layout</h4>
            <div class="ios-toggle-wrapper" onclick="UI.toggleMinimal()">
                <span class="ios-toggle-label">Modalità minimale</span>
                <input type="checkbox" class="ios-toggle" ${isMinimal ? 'checked' : ''}>
            </div>
            <div class="ios-toggle-wrapper" onclick="UI.toggleBarPosition()">
                <span class="ios-toggle-label">Barra in basso</span>
                <input type="checkbox" class="ios-toggle" ${isBottom ? 'checked' : ''}>
            </div>

            <h4 style="margin:24px 0 8px;font-size:13px;text-transform:uppercase;color:var(--text-secondary);">Temi</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <button class="menu-item" onclick="UI.setTheme('light')">Light</button>
                <button class="menu-item" onclick="UI.setTheme('dark')">Dark</button>
                <button class="menu-item" onclick="UI.setTheme('midnight')">Midnight</button>
                <button class="menu-item" onclick="UI.setTheme('slate')">Slate</button>
                <button class="menu-item" onclick="UI.setTheme('aurora')">Aurora</button>
                <button class="menu-item" onclick="UI.setTheme('forest')">Forest</button>
                <button class="menu-item" onclick="UI.setTheme('sunset')">Sunset</button>
                <button class="menu-item" onclick="UI.setTheme('ocean')">Ocean</button>
            </div>
        `;

        // CSS Inject to ensure visibility
        const styles = `
            <style>
                #global-navbar .nav-center { display: flex !important; justify-content: center !important; flex-grow: 1 !important; width: auto !important; }
                #global-navbar .nav-brand-fixed { display: flex !important; align-items: center !important; gap: 10px !important; text-decoration: none !important; color: inherit !important; opacity: 1 !important; visibility: visible !important; }
                #global-navbar .logo-img { height: 24px; width: auto; object-fit: contain; }
            </style>
        `;

        this.innerHTML = `
        ${styles}
        <nav id="global-navbar">
            <div class="nav-pill" id="main-nav-pill">
                
                <!-- STANDARD CONTENT (Collapsed) -->
                <div class="nav-content-normal">
                    <button class="nav-btn" onclick="UI.toggleMenu('left')" aria-label="Menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>

                    <div class="nav-center">
                        <a href="/index.html" class="nav-brand-fixed">
                            <img src="/css/IMG_0623.png" class="logo-img logo-light" alt="Logo">
                            <img src="/css/IMG_0624.png" class="logo-img logo-dark" alt="Logo">
                            <span class="brand-text">CronoTools</span>
                        </a>
                    </div>

                    <div style="display:flex;align-items:center;gap:6px;">
                        ${authHtml}
                        <button class="nav-btn" onclick="UI.toggleMenu('right')" aria-label="Impostazioni">⚙️</button>
                    </div>
                </div>

                <!-- DYNAMIC EXPANDED CONTENT (Hidden by default) -->
                <div class="dynamic-menu-content" id="dyn-menu-container">
                    <!-- Injected via JS based on which button clicked -->
                </div>

            </div>
        </nav>

        <!-- LEGACY SIDEBARS (Used only if Minimal Mode is active) -->
        <aside class="sidebar" id="sidebar-left">
            <div class="sidebar-header">
                <span class="sidebar-title">Menu</span>
                <button class="nav-btn" onclick="UI.closeSidebars()">✕</button>
            </div>
            <div style="padding:20px">
                ${menuLeftContent.replace(/dyn-link/g, 'menu-item')} <!-- Reuse content, swap class -->
            </div>
        </aside>

        <aside class="sidebar right" id="sidebar-right">
            <div class="sidebar-header">
                <span class="sidebar-title">Personalizza</span>
                <button class="nav-btn" onclick="UI.closeSidebars()">✕</button>
            </div>
            <div style="padding:20px">
                ${menuRightContent}
            </div>
        </aside>

        <div class="backdrop" id="backdrop"></div>

        <!-- Hidden Templates for Dynamic Menu injection -->
        <template id="tpl-menu-left">
            <div class="dyn-menu-header">
                <span class="dyn-menu-title">Navigazione</span>
                <button class="dyn-close-btn" onclick="UI.closeDynamicMenu()">✕</button>
            </div>
            ${menuLeftContent}
        </template>

        <template id="tpl-menu-right">
            <div class="dyn-menu-header">
                <span class="dyn-menu-title">Impostazioni</span>
                <button class="dyn-close-btn" onclick="UI.closeDynamicMenu()">✕</button>
            </div>
            ${menuRightContent}
        </template>
        `;
    }
}

customElements.define('crono-navbar', GlobalNavbar);
