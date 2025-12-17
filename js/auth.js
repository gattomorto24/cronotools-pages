/* --- CronoTools ID Manager v3.3 --- */

const CronoID = {
    currentUser: null,
    
    // Configurazione Menu Default
    defaultMenu: [
        { id: 'home', href: '/index.html', text: 'Home', visible: true },
        { id: 'filtri', href: '/filtri/index.html', text: 'Filtri', visible: true },
        { id: 'crop', href: '/crop-immagini/index.html', text: 'Ritaglia', visible: true },
        { id: 'resize', href: '/ridimensiona/index.html', text: 'Ridimensiona', visible: true },
        { id: 'colora', href: '/colora/index.html', text: 'Colora', visible: true },
        { id: 'video', href: '/taglia-video/index.html', text: 'Taglia Video', visible: true },
        { id: 'convert', href: '/base64/index.html', text: 'Convertitore', visible: true },
        { id: 'qr', href: '/qr/index.html', text: 'QR Code', visible: true },
        { id: 'info', href: '/info/index.html', text: 'Info', visible: true }
    ],

    init() {
        const session = localStorage.getItem('crono_session');
        if (session) {
            this.currentUser = JSON.parse(localStorage.getItem(`crono_user_${session}`));
            // Se l'utente esiste, applica le sue preferenze
            if (this.currentUser) {
                console.log(`CronoID: Benvenuto ${this.currentUser.username}`);
                this.syncSystemWithProfile();
            } else {
                this.logout(); // Sessione non valida
            }
        }
    },

    register(username, password) {
        if (localStorage.getItem(`crono_user_${username}`)) {
            return { success: false, message: "Utente già esistente." };
        }

        const newUser = {
            username: username,
            password: password, // In un'app reale, questo andrebbe hashato
            preferences: {
                theme: 'light',
                minimalMode: false,
                boldText: false,
                reduceMotion: false,
                reduceTransparency: false,
                highContrast: false,
                menuOrder: JSON.parse(JSON.stringify(this.defaultMenu)) // Clone profondo
            },
            createdAt: new Date().toISOString()
        };

        localStorage.setItem(`crono_user_${username}`, JSON.stringify(newUser));
        return { success: true, message: "Account creato! Ora puoi accedere." };
    },

    login(username, password) {
        const userJson = localStorage.getItem(`crono_user_${username}`);
        if (!userJson) return { success: false, message: "Utente non trovato." };

        const user = JSON.parse(userJson);
        if (user.password !== password) return { success: false, message: "Password errata." };

        this.currentUser = user;
        localStorage.setItem('crono_session', username);
        this.syncSystemWithProfile();
        return { success: true };
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('crono_session');
        window.location.href = '/index.html';
    },

    // Salva una preferenza specifica nel profilo utente
    setPreference(key, value) {
        if (!this.currentUser) return; // Se ospite, non salva su profilo (usa solo localStorage standard gestito da UI)
        
        this.currentUser.preferences[key] = value;
        this.saveProfile();
    },

    saveProfile() {
        if (this.currentUser) {
            localStorage.setItem(`crono_user_${this.currentUser.username}`, JSON.stringify(this.currentUser));
        }
    },

    // Applica le preferenze salvate all'interfaccia
    syncSystemWithProfile() {
        if (!this.currentUser) return;
        const p = this.currentUser.preferences;

        // Dispatch eventi o setta localStorage temporaneo per UI.js
        if(p.theme) UI.setTheme(p.theme);
        
        // Accessibilità
        this.applyClass('reduce-motion', p.reduceMotion);
        this.applyClass('solid-ui', p.reduceTransparency);
        this.applyClass('high-contrast', p.highContrast);
        this.applyClass('bold-text', p.boldText);
        this.applyClass('old-design-mode', p.minimalMode);

        // Sync Checkbox visivi (inviando evento custom)
        window.dispatchEvent(new Event('crono-profile-sync'));
    },

    applyClass(cls, active) {
        if (active) document.body.classList.add(cls);
        else document.body.classList.remove(cls);
        
        // Sync local storage keys for UI.js compatibility
        /* Nota: UI.js legge da localStorage per compatibilità ospite. 
           Quando siamo loggati, sovrascriviamo quelle chiavi per mantenerle sincronizzate */
        let storageKey = '';
        if(cls === 'reduce-motion') storageKey = 'crono-acc-motion';
        if(cls === 'solid-ui') storageKey = 'crono-acc-transparency';
        if(cls === 'high-contrast') storageKey = 'crono-acc-contrast';
        if(cls === 'bold-text') storageKey = 'crono-acc-bold';
        if(cls === 'old-design-mode') storageKey = 'old-design-active';

        if(storageKey) localStorage.setItem(storageKey, active);
    },

    getMenu() {
        if (this.currentUser && this.currentUser.preferences.menuOrder) {
            return this.currentUser.preferences.menuOrder;
        }
        return this.defaultMenu;
    },

    toggleMenuItem(toolId) {
        if (!this.currentUser) return false;
        const menu = this.currentUser.preferences.menuOrder;
        const item = menu.find(i => i.id === toolId);
        if (item) {
            item.visible = !item.visible;
            this.saveProfile();
            return true;
        }
        return false;
    }
};

// Auto-init
CronoID.init();