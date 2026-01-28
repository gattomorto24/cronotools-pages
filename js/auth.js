/* --- CronoTools Universal Auth v3.3.1 --- */

const CronoID = {
    state: {
        currentUser: null,
        isLoggedIn: false
    },

    init() {
        // Recupera la sessione persistente
        const activeUser = localStorage.getItem('crono_active_session');
        
        if (activeUser) {
            const userData = JSON.parse(localStorage.getItem(`crono_db_${activeUser}`));
            if (userData) {
                this.state.currentUser = userData;
                this.state.isLoggedIn = true;
                this.syncPreferences();
                console.log(`[CronoID] Session restored: ${userData.username}`);
            } else {
                // Database corrotto o utente cancellato
                this.logout();
            }
        }
        
        this.emitAuthChange();
    },

    register(username, password) {
        if (!username || !password) return { success: false, message: "Dati mancanti." };
        
        if (localStorage.getItem(`crono_db_${username}`)) {
            return { success: false, message: "Username già in uso." };
        }

        const newUser = {
            username: username,
            password: password, // In real world this must be hashed
            joined: new Date().toLocaleDateString(),
            prefs: {
                theme: 'light',
                minimalMode: false,
                barBottom: false,
                reduceMotion: false
            }
        };

        localStorage.setItem(`crono_db_${username}`, JSON.stringify(newUser));
        return { success: true, message: "Account creato. Accedi ora." };
    },

    login(username, password) {
        const userJson = localStorage.getItem(`crono_db_${username}`);
        
        if (!userJson) return { success: false, message: "Utente non trovato." };
        
        const user = JSON.parse(userJson);
        if (user.password !== password) return { success: false, message: "Password errata." };

        // Success Login
        this.state.currentUser = user;
        this.state.isLoggedIn = true;
        localStorage.setItem('crono_active_session', username); // Persistent Session
        
        this.syncPreferences();
        this.emitAuthChange();
        
        return { success: true };
    },

    logout() {
        this.state.currentUser = null;
        this.state.isLoggedIn = false;
        localStorage.removeItem('crono_active_session');
        
        // Reset to system defaults potentially, or keep last used
        this.emitAuthChange();
        window.location.href = '/index.html';
    },

    updatePref(key, value) {
        if (!this.state.isLoggedIn) {
            // Guest mode: save to temp localstorage logic handled by UI.js
            return;
        }

        this.state.currentUser.prefs[key] = value;
        this.saveDB();
    },

    syncPreferences() {
        if (!this.state.isLoggedIn) return;
        
        const p = this.state.currentUser.prefs;
        
        // Dispatch events for UI to pick up
        window.dispatchEvent(new CustomEvent('crono-pref-sync', { detail: p }));
    },

    saveDB() {
        if (this.state.isLoggedIn && this.state.currentUser) {
            localStorage.setItem(`crono_db_${this.state.currentUser.username}`, JSON.stringify(this.state.currentUser));
        }
    },

    emitAuthChange() {
        window.dispatchEvent(new Event('crono-auth-change'));
    }
};

// Initialize immediately
CronoID.init();