/* =========================================================
   Universal Navbar Component — CronoTools 6.0
   - FULL ACCESSIBILITY SUITE INTEGRATION
   - BETA ANIMATION TOGGLE
   - COMPLETE THEME GRID (GOLD & CYBER INCLUDED)
   - DYNAMIC & LEGACY SUPPORT
   ========================================================= */

class GlobalNavbar extends HTMLElement {

    connectedCallback() {
        this.render();
        // Re-render on auth or preference changes to update checkboxes
        window.addEventListener('crono-auth-change', () => this.render());
        window.addEventListener('crono-pref-sync', () => this.render());
        // Listen for local toggles to update UI instantly without full reload if possible
        // but render() is safest for ensuring checkbox state
    }

    render() {
        // --- GATHER STATE ---
        const isLoggedIn = window.CronoID?.state?.isLoggedIn || false;
        const currentUser = window.CronoID?.state?.currentUser || {};

        const isMinimal = document.body.classList.contains('old-design-mode');
        const isBottom = document.body.classList.contains('bar-bottom');
        const isBetaAnim = document.body.classList.contains('beta-animations');
        
        // Accessibility States
        const acc = {
            motion: document.body.classList.contains('reduce-motion'),
            contrast: document.body.classList.contains('high-contrast'),
            transparency: document.body.classList.contains('no-transparency'),
            borders: document.body.classList.contains('show-borders'),
            bold: document.body.classList.contains('bold-text'),
            saturated: document.body.classList.contains('saturated-colors'),
            monochrome: document.body.classList.contains('monochrome')
        };

        // --- AUTH & WIDGET HTML GENERATION ---
        const authHtml = isLoggedIn ? `
            <a href="/account/index.html" class="auth-avatar" style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:var(--accent);color:#fff;font-weight:bold;text-decoration:none;box-shadow:0 2px 5px rgba(0,0,0,0.2);">
                ${currentUser.username ? currentUser.username.substring(0,2).toUpperCase() : 'U'}
            </a>
        ` : `
            <a href="/login/index.html" style="font-size:14px;font-weight:700;color:var(--accent);text-decoration:none;margin-right:10px;">Accedi</a>
        `;

        const widgetHtml = isLoggedIn ? `
            <div class="cronoid-widget logged-in" onclick="location.href='/account/index.html'" style="padding:16px; background:var(--bg-input); border-radius:16px; margin-bottom:20px; display:flex; gap:12px; align-items:center; cursor:pointer;">
                <div class="widget-avatar" style="width:44px;height:44px;background:var(--accent);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:18px;">${currentUser.username.substring(0,2).toUpperCase()}</div>
                <div class="widget-info" style="display:flex;flex-direction:column;">
                    <span class="widget-name" style="font-weight:bold;font-size:16px;">${currentUser.username}</span>
                    <span class="widget-cta" style="font-size:13px;color:var(--text-secondary);font-weight:500;">Gestisci account →</span>
                </div>
            </div>
        ` : `
            <div class="cronoid-widget guest" onclick="location.href='/login/index.html'" style="padding:16px; background:var(--bg-input); border-radius:16px; margin-bottom:20px; display:flex; gap:12px; align-items:center; cursor:pointer;">
                <div class="widget-avatar" style="width:44px;height:44px;background:var(--text-tertiary);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;">?</div>
                <div class="widget-info" style="display:flex;flex-direction:column;">
                    <span class="widget-name" style="font-weight:bold;font-size:16px;">Ospite</span>
                    <span class="widget-cta" style="font-size:13px;color:var(--text-secondary);font-weight:500;">Accedi a CronoID →</span>
                </div>
            </div>
        `;

        // --- MENU CONTENT DEFINITIONS ---
        
        // 1. LEFT MENU (NAVIGATION)
        const menuLeftContent = `
            <a href="/index.html" class="dyn-link">🏠 Home</a>
            <a href="/converti/index.html" class="dyn-link">🔄 Converti</a>
            <a href="/filtri/index.html" class="dyn-link">🎨 Filtri</a>
            <a href="/crop-immagini/index.html" class="dyn-link">✂️ Ritaglia</a>
            <a href="/ridimensiona/index.html" class="dyn-link">📐 Ridimensiona</a>
            <a href="/taglia-video/index.html" class="dyn-link">🎬 Taglia Video</a>
            <a href="/base64/index.html" class="dyn-link">💾 Base64</a>
            <a href="/Ai/index.html" class="dyn-link">✨ AI Remover</a>
            <a href="/Terms/index.html" class="dyn-link">📄 Termini</a>
            <a href="/FAQ/index.html" class="dyn-link">❓ FAQ</a>
            <a href="/about.html" class="dyn-link">ℹ️ About</a>
            <div style="margin-top:20px;border-top:1px solid var(--border-light);padding-top:10px">
                ${isLoggedIn ? `<a href="/account/index.html" class="dyn-link" style="color:var(--accent)">👤 Profilo</a>` : ''}
                <a href="/info/index.html" class="dyn-link">ℹ️ Info</a>
            </div>
        `;

        // 2. RIGHT MENU (SETTINGS & ACCESSIBILITY)
        const menuRightContent = `
            ${widgetHtml}

            <!-- LANGUAGE SELECTOR -->
            <div style="margin:18px 0 10px 0;display:flex;align-items:center;gap:12px;">
              <span style="font-size:13px;font-weight:700;">Lingua</span>
              <select id="lang-switcher" style="padding:4px 10px;border-radius:8px;font-size:13px;">
                <option value="it">ITA</option>
                <option value="en">ENG</option>
              </select>
            </div>

            <!-- BETA FEATURE: ANIMATIONS -->
            <div class="ios-toggle-wrapper" onclick="UI.toggleBetaAnimations(!document.body.classList.contains('beta-animations'))" style="border-color:var(--accent); background:var(--accent-dim);">
                <div style="display:flex; flex-direction:column;">
                    <span class="ios-toggle-label" style="display:flex;align-items:center;gap:6px;">Nuove Animazioni <span style="background:var(--accent);color:#fff;font-size:10px;padding:2px 6px;border-radius:6px;font-weight:800;">BETA</span></span>
                    <span style="font-size:11px;opacity:0.7;">Engine più fluido e moderno</span>
                </div>
                <input type="checkbox" class="ios-toggle" ${isBetaAnim ? 'checked' : ''}>
            </div>

            <!-- LAYOUT SECTION -->
            <h4 style="margin:20px 0 8px;font-size:12px;text-transform:uppercase;color:var(--text-secondary);letter-spacing:1px;font-weight:700;">Layout</h4>
            <div class="ios-toggle-wrapper" onclick="UI.toggleMinimal()">
                <span class="ios-toggle-label">Modalità minimale</span>
                <input type="checkbox" class="ios-toggle" ${isMinimal ? 'checked' : ''}>
            </div>
            <div class="ios-toggle-wrapper" onclick="UI.toggleBarPosition()">
                <span class="ios-toggle-label">Barra in basso</span>
                <input type="checkbox" class="ios-toggle" ${isBottom ? 'checked' : ''}>
            </div>

            <!-- ACCESSIBILITY SECTION (FULL SUITE) -->
            <h4 style="margin:24px 0 8px;font-size:12px;text-transform:uppercase;color:var(--text-secondary);letter-spacing:1px;font-weight:700;">Accessibilità</h4>
            
            <div class="ios-toggle-wrapper" onclick="UI.toggleAccessibility('transparency')">
                <span class="ios-toggle-label">Rimuovi Trasparenza</span>
                <input type="checkbox" class="ios-toggle" ${acc.transparency ? 'checked' : ''}>
            </div>
            
            <div class="ios-toggle-wrapper" onclick="UI.toggleAccessibility('borders')">
                <span class="ios-toggle-label">Mostra Bordi</span>
                <input type="checkbox" class="ios-toggle" ${acc.borders ? 'checked' : ''}>
            </div>
            
            <div class="ios-toggle-wrapper" onclick="UI.toggleAccessibility('bold')">
                <span class="ios-toggle-label">Testo in Grassetto</span>
                <input type="checkbox" class="ios-toggle" ${acc.bold ? 'checked' : ''}>
            </div>

            <div class="ios-toggle-wrapper" onclick="UI.toggleAccessibility('saturated')">
                <span class="ios-toggle-label">Colori Saturi</span>
                <input type="checkbox" class="ios-toggle" ${acc.saturated ? 'checked' : ''}>
            </div>

            <div class="ios-toggle-wrapper" onclick="UI.toggleAccessibility('monochrome')">
                <span class="ios-toggle-label">Scala di Grigi (Focus)</span>
                <input type="checkbox" class="ios-toggle" ${acc.monochrome ? 'checked' : ''}>
            </div>
            
            <div class="ios-toggle-wrapper" onclick="UI.toggleAccessibility('motion')">
                <span class="ios-toggle-label">Riduci Movimento</span>
                <input type="checkbox" class="ios-toggle" ${acc.motion ? 'checked' : ''}>
            </div>
            
            <div class="ios-toggle-wrapper" onclick="UI.toggleAccessibility('contrast')">
                <span class="ios-toggle-label">Contrasto Elevato</span>
                <input type="checkbox" class="ios-toggle" ${acc.contrast ? 'checked' : ''}>
            </div>

            <!-- THEME GRID -->
            <h4 style="margin:24px 0 8px;font-size:12px;text-transform:uppercase;color:var(--text-secondary);letter-spacing:1px;font-weight:700;">Temi</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px; padding-bottom: 20px;">
                <button class="menu-item" onclick="UI.setTheme('light')" style="text-align:center;">Light</button>
                <button class="menu-item" onclick="UI.setTheme('dark')" style="text-align:center;">Dark</button>
                <button class="menu-item" onclick="UI.setTheme('gold')" style="text-align:center;border-color:#ffd700;color:#ffd700;background:#080808;">Gold</button>
                <button class="menu-item" onclick="UI.setTheme('cyber')" style="text-align:center;border-color:#ff0099;color:#00f3ff;background:#050005;">Cyber</button>
                <button class="menu-item" onclick="UI.setTheme('midnight')" style="text-align:center;">Midnight</button>
                <button class="menu-item" onclick="UI.setTheme('slate')" style="text-align:center;">Slate</button>
                <button class="menu-item" onclick="UI.setTheme('forest')" style="text-align:center;">Forest</button>
                <button class="menu-item" onclick="UI.setTheme('sunset')" style="text-align:center;">Sunset</button>
                <button class="menu-item" onclick="UI.setTheme('ocean')" style="text-align:center;">Ocean</button>
                <button class="menu-item" onclick="UI.setTheme('latte')" style="text-align:center;">Latte</button>
                <button class="menu-item" onclick="UI.setTheme('graphite')" style="text-align:center;">Graphite</button>
                <button class="menu-item" onclick="UI.setTheme('desert')" style="text-align:center;">Desert</button>
                <button class="menu-item" onclick="UI.setTheme('rose')" style="text-align:center;">Rose</button>
                <button class="menu-item" onclick="UI.setTheme('aurora')" style="text-align:center;">Aurora</button>
                <button class="menu-item" onclick="UI.setTheme('solar')" style="text-align:center;">Solar</button>
                <button class="menu-item" onclick="UI.setTheme('cherry')" style="text-align:center;">Cherry</button>
                <button class="menu-item" onclick="UI.setTheme('high-contrast')" style="grid-column:span 2; border:2px solid var(--text-primary); font-weight:bold;text-align:center;">High Contrast</button>
            </div>
        `;

        // CSS Inject for component-specific isolation (Shadow DOM simulation)
        const styles = `
            <style>
                #global-navbar .nav-center { display: flex !important; justify-content: center !important; flex-grow: 1 !important; width: auto !important; }
                #global-navbar .nav-brand-fixed { display: flex !important; align-items: center !important; gap: 10px !important; text-decoration: none !important; color: inherit !important; opacity: 1 !important; visibility: visible !important; }
                #global-navbar .logo-img { height: 28px; width: auto; object-fit: contain; }
            </style>
        `;

        // --- FINAL HTML ASSEMBLY ---
        this.innerHTML = `
        ${styles}
        <nav id="global-navbar">
            <div class="nav-pill" id="main-nav-pill">
                
                <!-- STANDARD CONTENT (Collapsed) -->
                <div class="nav-content-normal">
                    <button class="nav-btn" onclick="UI.toggleMenu('left')" aria-label="Menu">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>

                    <div class="nav-center">
                        <a href="/index.html" class="nav-brand-fixed">
                            <img src="/css/IMG_0623.png" class="logo-img logo-light" alt="Logo">
                            <img src="/css/IMG_0624.png" class="logo-img logo-dark" alt="Logo">
                            <span class="brand-text" style="font-weight:800;font-size:19px;letter-spacing:-0.5px;">CronoTools</span>
                        </a>
                    </div>

                    <div style="display:flex;align-items:center;gap:6px;">
                        ${authHtml}
                        <button class="nav-btn" onclick="UI.toggleMenu('right')" aria-label="Impostazioni">
                             <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </button>
                    </div>
                </div>

                <!-- DYNAMIC EXPANDED CONTENT PLACEHOLDER -->
                <div class="dynamic-menu-content" id="dyn-menu-container"></div>
            </div>
        </nav>

        <!-- LEGACY SIDEBARS (Used if Minimal Mode is ON) -->
        <aside class="sidebar" id="sidebar-left">
            <div class="sidebar-header">
                <span class="sidebar-title">Menu</span>
                <button class="nav-btn" onclick="UI.closeSidebars()">✕</button>
            </div>
            <div style="padding:24px 20px;">
                ${menuLeftContent.replace(/dyn-link/g, 'menu-item')} 
            </div>
        </aside>

        <aside class="sidebar right" id="sidebar-right">
            <div class="sidebar-header">
                <span class="sidebar-title">Personalizza</span>
                <button class="nav-btn" onclick="UI.closeSidebars()">✕</button>
            </div>
            <div style="padding:24px 20px;">
                ${menuRightContent}
            </div>
        </aside>

        <div class="backdrop" id="backdrop"></div>

        <!-- TEMPLATES FOR DYNAMIC INJECTION -->
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
