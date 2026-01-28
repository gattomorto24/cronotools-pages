/* ==========================================================================
   CRONOTOOLS UI MANAGER - V7.0 (CORE ENGINE + STATE/PREFS/TRANSITIONS/I18N)
   - Backward compatible with V6.0 API
   - Adds: State Manager, Prefs v2 w/ migration, Transition Orchestrator,
           Context Engine, Accessibility Rules, i18n scaffolding,
           Debug Overlay (dev), Micro-interactions utilities.
   - DOES NOT remove existing features/behavior; only hardens & extends.
   ========================================================================== */
/* Based on your V6.0 core engine structure. :contentReference[oaicite:0]{index=0} */

(() => {
  "use strict";

  /* =========================
     UTILITIES
     ========================= */

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const safeJSONParse = (raw, fallback = null) => {
    try { return JSON.parse(raw); } catch { return fallback; }
  };

  /* =========================
     PREFS ENGINE v2 (versioned)
     - Single source of truth for local preferences
     - Supports migration from old v6 keys
     ========================= */

  const Prefs = {
    key: "crono-ui-prefs",
    version: 2,

    defaults: {
      version: 2,
      theme: "light",
      minimalMode: false,
      barBottom: false,
      betaAnimations: false,
      // Dynamic Bar personalization (future-ready)
      density: "normal",          // compact | normal | extended
      navContentMode: "mixed",    // mixed | icons | text
      // Accessibility suite
      acc: {
        motion: false,
        contrast: false,
        bold: false,
        transparency: false,
        borders: false,
        saturated: false,
        monochrome: false
      },
      // i18n (scaffolding)
      lang: "it",
      // Debug
      debug: false
    },

    load() {
      const raw = localStorage.getItem(this.key);
      const parsed = raw ? safeJSONParse(raw, null) : null;

      if (!parsed || typeof parsed !== "object") {
        // Attempt migration from V6 single keys
        const migrated = this.migrateFromLegacy();
        this.save(migrated);
        return migrated;
      }

      // Version check
      const v = Number(parsed.version || 1);
      if (v !== this.version) {
        const upgraded = this.migrate(parsed, v);
        this.save(upgraded);
        return upgraded;
      }

      // Merge defaults (forward-safe)
      return this.mergeDeep(structuredClone(this.defaults), parsed);
    },

    save(prefs) {
      try {
        localStorage.setItem(this.key, JSON.stringify(prefs));
      } catch (e) {
        // Fallback: if storage is full/blocked, do not crash UI.
        console.warn("Prefs save failed:", e);
      }
    },

    set(path, value) {
      const prefs = UI.prefs;
      this.setDeep(prefs, path, value);
      this.save(prefs);
    },

    get(path, fallback = undefined) {
      const prefs = UI.prefs;
      const v = this.getDeep(prefs, path);
      return v === undefined ? fallback : v;
    },

    migrateFromLegacy() {
      const legacy = structuredClone(this.defaults);

      // V6 keys
      const t = localStorage.getItem("crono-theme");
      const minimal = localStorage.getItem("crono-minimal");
      const bottom = localStorage.getItem("crono-bar-bottom");
      const betaAnims = localStorage.getItem("crono-beta-anims");

      if (t) legacy.theme = t;
      if (minimal != null) legacy.minimalMode = (minimal === "true");
      if (bottom != null) legacy.barBottom = (bottom === "true");
      if (betaAnims != null) legacy.betaAnimations = (betaAnims === "true");

      // Accessibility legacy keys
      const keys = ["motion","contrast","bold","transparency","borders","saturated","monochrome"];
      keys.forEach(k => {
        const raw = localStorage.getItem(`crono-acc-${k}`);
        if (raw != null) legacy.acc[k] = (raw === "true");
      });

      // Optional: language if ever stored elsewhere
      const legacyLang = localStorage.getItem("crono-lang");
      if (legacyLang) legacy.lang = legacyLang;

      legacy.version = this.version;
      return legacy;
    },

    migrate(prefs, fromVersion) {
      // Expand this as needed for future versions.
      let next = structuredClone(this.defaults);
      next = this.mergeDeep(next, prefs);

      // Example: v1 -> v2 normalization
      if (fromVersion < 2) {
        next.version = 2;
        // Ensure new fields exist
        next.density = next.density || "normal";
        next.navContentMode = next.navContentMode || "mixed";
        next.lang = next.lang || "it";
        next.debug = !!next.debug;
      }

      return next;
    },

    mergeDeep(target, source) {
      for (const k in source) {
        if (!Object.prototype.hasOwnProperty.call(source, k)) continue;

        if (
          source[k] &&
          typeof source[k] === "object" &&
          !Array.isArray(source[k]) &&
          target[k] &&
          typeof target[k] === "object"
        ) {
          this.mergeDeep(target[k], source[k]);
        } else {
          target[k] = source[k];
        }
      }
      return target;
    },

    getDeep(obj, path) {
      const parts = path.split(".");
      let cur = obj;
      for (const p of parts) {
        if (cur == null) return undefined;
        cur = cur[p];
      }
      return cur;
    },

    setDeep(obj, path, value) {
      const parts = path.split(".");
      let cur = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (cur[p] == null || typeof cur[p] !== "object") cur[p] = {};
        cur = cur[p];
      }
      cur[parts[parts.length - 1]] = value;
    }
  };

  /* =========================
     STATE MANAGER (reactive-lite)
     - Central UI state with watchers
     ========================= */

  const State = {
    data: {
      menu: { open: false, side: null, mode: "dynamic" }, // dynamic | legacy
      layout: { minimal: false, bottomBar: false, density: "normal", navContentMode: "mixed" },
      theme: { current: "light" },
      animations: { beta: false },
      accessibility: { motion:false, contrast:false, bold:false, transparency:false, borders:false, saturated:false, monochrome:false },
      i18n: { lang: "it", ready: false }
    },
    watchers: new Map(),

    get(path, fallback = undefined) {
      const parts = path.split(".");
      let cur = this.data;
      for (const p of parts) {
        if (cur == null) return fallback;
        cur = cur[p];
      }
      return cur === undefined ? fallback : cur;
    },

    set(path, value) {
      const parts = path.split(".");
      let cur = this.data;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (cur[p] == null || typeof cur[p] !== "object") cur[p] = {};
        cur = cur[p];
      }
      const last = parts[parts.length - 1];
      const old = cur[last];
      cur[last] = value;

      if (old !== value) this.emit(path, value, old);
    },

    watch(path, fn) {
      if (!this.watchers.has(path)) this.watchers.set(path, new Set());
      this.watchers.get(path).add(fn);
      return () => this.watchers.get(path)?.delete(fn);
    },

    emit(path, value, old) {
      const set = this.watchers.get(path);
      if (!set) return;
      set.forEach(fn => {
        try { fn(value, old); } catch (e) { console.warn("State watcher error:", e); }
      });
    }
  };

  /* =========================
     TRANSITION ORCHESTRATOR
     - Avoids race conditions (open/close overlap, theme switch flicker)
     ========================= */

  const Transitions = {
    locked: false,
    queue: [],
    lockReason: null,

    lock(reason = "transition") {
      this.locked = true;
      this.lockReason = reason;
      document.body.classList.add("ui-locked");
    },

    unlock() {
      this.locked = false;
      this.lockReason = null;
      document.body.classList.remove("ui-locked");
      this.flush();
    },

    async run(fn, { lock = true, reason = "transition" } = {}) {
      if (this.locked) {
        return new Promise((resolve) => this.queue.push(async () => resolve(await this.run(fn, { lock, reason }))));
      }
      if (lock) this.lock(reason);

      try {
        return await fn();
      } finally {
        if (lock) this.unlock();
      }
    },

    flush() {
      if (this.locked) return;
      const next = this.queue.shift();
      if (next) next();
    }
  };

  /* =========================
     i18n SCAFFOLDING (ready for /js/LINGUE/*.js)
     - For now: supports a minimal dictionary + DOM binding by data-i18n.
     - Later: replace loadLanguage() to import external language files.
     ========================= */

  const I18N = {
    lang: "it",
    dict: {},
    fallbackLang: "en",

    // Minimal built-in baseline to avoid blank UI (you can expand freely)
    builtin: {
      it: {
        "app.name": "CronoTools",
        "menu.search.placeholder": "Scrivi qui per cercare…"
      },
      en: {
        "app.name": "CronoTools",
        "menu.search.placeholder": "Type here to search…"
      },
      es: {
        "app.name": "CronoTools",
        "menu.search.placeholder": "Escribe aquí para buscar…"
      }
    },

    t(key, fallback = "") {
      return this.dict[key] ?? this.builtin[this.lang]?.[key] ?? this.builtin[this.fallbackLang]?.[key] ?? fallback ?? key;
    },

    async setLang(lang) {
      this.lang = lang;
      State.set("i18n.lang", lang);

      // Se ENG e CronoLangEN è caricato, usa quello, altrimenti mantieni il dizionario attuale
      if(lang === 'en' && window.CronoLangEN) {
        this.dict = window.CronoLangEN;
      } else {
        this.dict = { ...(this.builtin[lang] || {}) };
      }

      document.documentElement.setAttribute("data-lang", lang);
      State.set("i18n.ready", true);

      this.applyToDOM();
      Prefs.set("lang", lang);
    },

    applyToDOM(root = document) {
      // data-i18n="key"
      root.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const value = this.t(key, "");
        if (value) el.textContent = value;
      });

      // data-i18n-placeholder="key"
      root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        const value = this.t(key, "");
        if (value) el.setAttribute("placeholder", value);
      });

      // Optional: title
      root.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        const value = this.t(key, "");
        if (value) el.setAttribute("title", value);
      });
    }
  };

  /* =========================
     CONTEXT ENGINE
     - Captures page/tool context for smarter UI behavior
     ========================= */

  const Context = {
    compute() {
      const path = location.pathname || "/";
      const page = path.split("/").filter(Boolean).pop() || "index.html";

      // Heuristic tool detection
      const tool = path.includes("/tools/") ? (path.split("/tools/")[1]?.split("/")[0] || null) : null;

      return {
        path,
        page,
        tool
      };
    },

    apply() {
      const ctx = this.compute();
      State.set("context.path", ctx.path);
      State.set("context.page", ctx.page);
      State.set("context.tool", ctx.tool);

      // Example: if we are in a tool page, keep density normal, else allow compact.
      // (Does not change user preference; only a soft hint via data-attr)
      document.documentElement.setAttribute("data-page", ctx.page);
      if (ctx.tool) document.documentElement.setAttribute("data-tool", ctx.tool);
      else document.documentElement.removeAttribute("data-tool");
    }
  };

  /* =========================
     DEBUG OVERLAY (dev-only)
     - Toggle by: Prefs.debug or localStorage "crono-debug" = true
     ========================= */

  const Debug = {
    el: null,

    ensure() {
      if (this.el) return this.el;
      const el = document.createElement("div");
      el.id = "crono-debug-overlay";
      el.style.cssText = `
        position: fixed; z-index: 999999;
        right: 12px; bottom: 12px;
        max-width: min(420px, calc(100vw - 24px));
        background: rgba(0,0,0,.65);
        color: #fff;
        font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        padding: 10px 12px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        pointer-events: none;
        white-space: pre-wrap;
      `;
      document.body.appendChild(el);
      this.el = el;
      return el;
    },

    update() {
      if (!this.isEnabled()) return;
      const el = this.ensure();

      const snapshot = {
        theme: State.get("theme.current"),
        minimal: State.get("layout.minimal"),
        bottomBar: State.get("layout.bottomBar"),
        density: State.get("layout.density"),
        navContentMode: State.get("layout.navContentMode"),
        menu: State.get("menu"),
        betaAnims: State.get("animations.beta"),
        lang: State.get("i18n.lang"),
        acc: State.get("accessibility"),
        path: State.get("context.path"),
        page: State.get("context.page"),
        tool: State.get("context.tool"),
        lock: Transitions.locked ? `YES (${Transitions.lockReason})` : "NO"
      };

      el.textContent = JSON.stringify(snapshot, null, 2);
    },

    isEnabled() {
      return !!Prefs.get("debug", false) || (localStorage.getItem("crono-debug") === "true");
    },

    toggle(force) {
      const next = (force !== undefined) ? !!force : !this.isEnabled();
      Prefs.set("debug", next);
      if (!next && this.el) this.el.remove();
      this.el = null;
      if (next) this.update();
    }
  };

  /* =========================
     MICRO-INTERACTIONS (optional helpers)
     - Adds tactile feedback class, without forcing styles
     ========================= */

  const Micro = {
    bind() {
      // Add a unified "pressed" class for elements opting in via data-pressable
      document.addEventListener("pointerdown", (e) => {
        const target = e.target.closest("[data-pressable]");
        if (!target) return;
        target.classList.add("is-pressed");
      }, { passive: true });

      document.addEventListener("pointerup", (e) => {
        const target = e.target.closest("[data-pressable]");
        if (!target) return;
        target.classList.remove("is-pressed");
      }, { passive: true });

      document.addEventListener("pointercancel", (e) => {
        const target = e.target.closest("[data-pressable]");
        if (!target) return;
        target.classList.remove("is-pressed");
      }, { passive: true });
    }
  };

  /* =========================
     UI ENGINE (V7.0)
     - Backward compatible API from V6.0
     ========================= */

  const UI = {
    // Public reference to prefs
    prefs: null,

    init() {
      console.log("CronoTools UI Engine v7.0 Starting...");

      // Load prefs first
      this.prefs = Prefs.load();

      this.cacheDOM();
      this.bindEvents();

      // Apply context early
      Context.apply();

      // Init systems (order matters)
      this.initLayout();
      this.initTheme();
      this.initAnimations();
      this.initAccessibility();
      this.initI18n();

      // Scroll logic
      this.lastScrollY = window.scrollY;
      this.ticking = false;
      this.handleScroll();

      // Optional helpers
      Micro.bind();

      // Debug
      if (Debug.isEnabled()) Debug.update();

      // React to state changes (minimal set)
      this.installStateWatchers();
    },

    cacheDOM() {
      this.body = document.body;
      this.navbar = document.getElementById("global-navbar");
      this.backDrop = document.getElementById("backdrop");
    },

    bindEvents() {
      // Optimized Scroll Handler
      window.addEventListener("scroll", () => this.requestTick(), { passive: true });

      // Close menus on Backdrop click
      if (this.backDrop) {
        this.backDrop.addEventListener("click", () => {
          this.closeSidebars();
          this.closeDynamicMenu();
        });
      }

      // Close on Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeSidebars();
          this.closeDynamicMenu();
        }
        // Dev convenience: Ctrl+Shift+D toggles debug overlay
        if (e.ctrlKey && e.shiftKey && e.code === "KeyD") {
          Debug.toggle();
          Debug.update();
        }
      });

      // Custom Events for Cross-Component Sync
      window.addEventListener("crono-pref-sync", (e) => this.applyPrefs(e.detail));
      window.addEventListener("crono-auth-change", () => this.updateUIState());

      // Track navigation changes (SPA-like cases)
      window.addEventListener("popstate", () => {
        Context.apply();
        Debug.update();
      });

      // Resize can affect layout/menu; ensure no stuck states
      window.addEventListener("resize", () => {
        this.ensureSafeUIOnResize();
      }, { passive: true });
    },

    installStateWatchers() {
      // Update debug overlay on meaningful state changes
      const paths = [
        "theme.current",
        "layout.minimal",
        "layout.bottomBar",
        "layout.density",
        "layout.navContentMode",
        "menu.open",
        "animations.beta",
        "i18n.lang"
      ];
      paths.forEach(p => State.watch(p, () => Debug.update()));

      // Accessibility changes should enforce rules
      Object.keys(State.get("accessibility")).forEach(k => {
        State.watch(`accessibility.${k}`, () => this.applyAccessibilityRules());
      });
    },

    ensureSafeUIOnResize() {
      // If menu is open, ensure backdrop still exists (and does not trap UI)
      if (!this.backDrop) this.backDrop = document.getElementById("backdrop");

      // If navbar expanded but container missing, close safely
      if (this.navbar && this.navbar.classList.contains("expanded")) {
        const container = document.getElementById("dyn-menu-container");
        if (!container) this.closeDynamicMenu();
      }
    },

    /* =========================================
       NAVIGATION LOGIC (DYNAMIC VS LEGACY)
       ========================================= */

    toggleMenu(side) {
      const isMinimal = this.body.classList.contains("old-design-mode");
      State.set("menu.mode", isMinimal ? "legacy" : "dynamic");

      if (isMinimal) {
        this.openSidebar(side);
      } else {
        this.expandNavbar(side);
      }
    },

    /* --- Dynamic Navbar Expansion --- */
    expandNavbar(side) {
      if (!this.navbar) return;

      // Prevent overlap transitions
      return Transitions.run(async () => {
        const container = document.getElementById("dyn-menu-container");
        const template = document.getElementById(`tpl-menu-${side}`);

        if (container && template) {
          // Inject content from template
          container.innerHTML = template.innerHTML;

          // i18n apply for injected nodes
          I18N.applyToDOM(container);

          this.navbar.classList.add("expanded");
          if (this.backDrop) this.backDrop.classList.add("active");
          this.body.classList.add("no-scroll");

          State.set("menu.open", true);
          State.set("menu.side", side);
        }
      }, { lock: true, reason: "open-menu" });
    },

    closeDynamicMenu() {
      if (!this.navbar) return;

      return Transitions.run(async () => {
        this.navbar.classList.remove("expanded");

        // Clean content after animation delay for smooth exit
        window.setTimeout(() => {
          const container = document.getElementById("dyn-menu-container");
          if (container && this.navbar && !this.navbar.classList.contains("expanded")) {
            container.innerHTML = "";
          }
        }, 400);

        if (this.backDrop) this.backDrop.classList.remove("active");
        this.body.classList.remove("no-scroll");

        State.set("menu.open", false);
        State.set("menu.side", null);
      }, { lock: true, reason: "close-menu" });
    },

    /* --- Legacy Sidebars --- */
    openSidebar(side) {
      return Transitions.run(async () => {
        this.closeSidebars(); // Close others first
        const el = document.getElementById(side === "left" ? "sidebar-left" : "sidebar-right");

        if (el) {
          el.classList.add("open");
          if (this.backDrop) this.backDrop.classList.add("active");
          this.body.classList.add("no-scroll");

          State.set("menu.open", true);
          State.set("menu.side", side);
        }
      }, { lock: true, reason: "open-sidebar" });
    },

    closeSidebars() {
      document.querySelectorAll(".sidebar").forEach(s => s.classList.remove("open"));
      if (this.backDrop) this.backDrop.classList.remove("active");
      this.body.classList.remove("no-scroll");

      State.set("menu.open", false);
      State.set("menu.side", null);
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
  if (this.navbar.classList.contains("expanded")) return;

  const currentScrollY = window.scrollY;
  const diff = currentScrollY - this.lastScrollY;

  const SHRINK_THRESHOLD = 20; // quando iniziare a rimpicciolire
  const TOP_THRESHOLD = 10;    // zona "sicura" in alto

  // 1️⃣ Vicino alla cima: barra sempre normale
  if (currentScrollY <= TOP_THRESHOLD) {
    this.navbar.classList.remove("scrolled");
    this.lastScrollY = currentScrollY;
    return;
  }

  // 2️⃣ Minimo scroll verso l'alto → torna subito normale
  if (diff < 0) {
    this.navbar.classList.remove("scrolled");
    this.lastScrollY = currentScrollY;
    return;
  }

  // 3️⃣ Scroll verso il basso → rimpicciolisci
  if (diff > 0 && currentScrollY > SHRINK_THRESHOLD) {
    this.navbar.classList.add("scrolled");
  }

  this.lastScrollY = Math.max(0, currentScrollY);
},


    /* =========================================
       LAYOUT & THEME MANAGEMENT
       ========================================= */

    initLayout() {
      const p = this.prefs;

      this.setMinimalMode(!!p.minimalMode, false);
      this.setBarPosition(!!p.barBottom, false);

      // Dynamic Bar personalization (optional, CSS-driven)
      this.setDensity(p.density || "normal", false);
      this.setNavContentMode(p.navContentMode || "mixed", false);
    },

    setMinimalMode(active, save = true) {
      this.body.classList.toggle("old-design-mode", active);

      if (save) Prefs.set("minimalMode", !!active);

      // Force close menus to reset state
      this.closeDynamicMenu();
      this.closeSidebars();
      this.handleScroll();

      State.set("layout.minimal", !!active);
    },

    setBarPosition(bottom, save = true) {
      this.body.classList.toggle("bar-bottom", !!bottom);
      if (save) Prefs.set("barBottom", !!bottom);
      this.handleScroll();
      State.set("layout.bottomBar", !!bottom);
    },

    // New: density classes (CSS should define behavior)
    setDensity(density, save = true) {
      const allowed = ["compact", "normal", "extended"];
      const d = allowed.includes(density) ? density : "normal";

      this.body.classList.remove("density-compact", "density-normal", "density-extended");
      this.body.classList.add(`density-${d}`);

      if (save) Prefs.set("density", d);
      State.set("layout.density", d);
    },

    // New: nav content mode classes (icons/text)
    setNavContentMode(mode, save = true) {
      const allowed = ["mixed", "icons", "text"];
      const m = allowed.includes(mode) ? mode : "mixed";

      this.body.classList.remove("nav-mixed", "nav-icons", "nav-text");
      this.body.classList.add(`nav-${m}`);

      if (save) Prefs.set("navContentMode", m);
      State.set("layout.navContentMode", m);
    },

    toggleMinimal() {
      this.setMinimalMode(!this.body.classList.contains("old-design-mode"), true);
    },

    toggleBarPosition() {
      this.setBarPosition(!this.body.classList.contains("bar-bottom"), true);
    },

    initTheme() {
      const t = this.prefs.theme || "light";
      this.setTheme(t, false);
    },

    setTheme(t, save = true) {
      document.documentElement.setAttribute("data-theme", t);

      if (save) Prefs.set("theme", t);

      State.set("theme.current", t);

      // Keep CronoID sync compatible
      if (window.CronoID && typeof window.CronoID.updatePref === "function") {
        window.CronoID.updatePref("theme", t);
      }

      // Re-apply accessibility rules because themes can affect contrast/transparency
      this.applyAccessibilityRules();
    },

    /* =========================================
       BETA ANIMATION ENGINE
       ========================================= */

    initAnimations() {
      const isBeta = !!this.prefs.betaAnimations;
      this.toggleBetaAnimations(isBeta, false);
    },

    toggleBetaAnimations(active, save = true) {
      this.body.classList.toggle("beta-animations", !!active);

      if (save) Prefs.set("betaAnimations", !!active);

      State.set("animations.beta", !!active);

      // Trigger a re-flow to restart animations if needed
      if (active) {
        const wrapper = document.querySelector(".content-wrapper");
        if (wrapper) {
          wrapper.style.animation = "none";
          // trigger reflow
          void wrapper.offsetHeight;
          wrapper.style.animation = null;
        }
      }
    },

    /* =========================================
       ACCESSIBILITY SUITE (7 MODES)
       + Rules engine (new)
       ========================================= */

    initAccessibility() {
      const acc = this.prefs.acc || {};
      const keys = ["motion","contrast","bold","transparency","borders","saturated","monochrome"];

      keys.forEach(k => {
        const active = !!acc[k];
        this.toggleAccessClass(k, active);
        State.set(`accessibility.${k}`, active);
      });

      // Apply rules after base classes are set
      this.applyAccessibilityRules();
    },

    toggleAccessibility(type) {
      const acc = this.prefs.acc || structuredClone(Prefs.defaults.acc);
      const current = !!acc[type];
      const next = !current;

      acc[type] = next;
      Prefs.set("acc", acc);

      this.toggleAccessClass(type, next);
      State.set(`accessibility.${type}`, next);

      this.applyAccessibilityRules();
    },

    toggleAccessClass(type, active) {
      switch (type) {
        case "motion": this.body.classList.toggle("reduce-motion", active); break;
        case "contrast": this.body.classList.toggle("high-contrast", active); break;
        case "bold": this.body.classList.toggle("bold-text", active); break;
        case "transparency": this.body.classList.toggle("no-transparency", active); break;
        case "borders": this.body.classList.toggle("show-borders", active); break;
        case "saturated": this.body.classList.toggle("saturated-colors", active); break;
        case "monochrome": this.body.classList.toggle("monochrome", active); break;
      }
    },

    // NEW: Accessibility rules that coordinate multiple toggles coherently
    applyAccessibilityRules() {
      const a = State.get("accessibility");

      // Rule 1: Reduce motion should disable beta animations (optional but consistent)
      if (a.motion && State.get("animations.beta")) {
        // Disable without toggling storage multiple times
        this.toggleBetaAnimations(false, true);
      }

      // Rule 2: High contrast often pairs poorly with heavy gradients/glass:
      // Provide a class hook to let CSS simplify gradients if desired.
      this.body.classList.toggle("acc-force-solid", !!a.contrast);

      // Rule 3: No transparency should also ensure backdrop is effective.
      // (CSS can use .no-transparency to adjust overlay opacity)
      // No direct JS action needed beyond class.

      // Rule 4: Bold text can require larger hit targets (CSS hook).
      this.body.classList.toggle("acc-large-hit", !!a.bold);

      // Rule 5: Monochrome + saturated conflict; if both enabled, prioritize monochrome
      if (a.monochrome && a.saturated) {
        const acc = this.prefs.acc || {};
        acc.saturated = false;
        Prefs.set("acc", acc);
        this.toggleAccessClass("saturated", false);
        State.set("accessibility.saturated", false);
      }
    },

    /* =========================================
       i18n INIT (scaffolding)
       ========================================= */

    initI18n() {
      // Determine preferred language:
      // 1) Prefs
      // 2) Browser
      const prefLang = this.prefs.lang;
      const browserLang = (navigator.language || "it").slice(0, 2).toLowerCase();
      const lang = prefLang || browserLang || "it";

      I18N.setLang(lang).catch(() => {
        // fallback
        I18N.setLang("it");
      });
    },

    /* =========================================
       SYNC & STATE HELPERS
       ========================================= */

    applyPrefs(prefs) {
      // Backward compatible with CronoID sync payloads
      if (prefs.theme) this.setTheme(prefs.theme, true);
      if (prefs.minimalMode !== undefined) this.setMinimalMode(!!prefs.minimalMode, true);
      if (prefs.barBottom !== undefined) this.setBarPosition(!!prefs.barBottom, true);

      // Optional extended prefs (if provided by CronoID in future)
      if (prefs.density) this.setDensity(prefs.density, true);
      if (prefs.navContentMode) this.setNavContentMode(prefs.navContentMode, true);
      if (prefs.lang) I18N.setLang(prefs.lang);
    },

    updateUIState() {
      // Reserved for future widget updates (e.g., user avatar, notifications)
    }
  };

  // Expose UI globally (backward compatible)
  window.UI = UI;

  // Start the engine when DOM is ready
  document.addEventListener("DOMContentLoaded", () => UI.init());

})();
                                // Language switcher event (dynamic and minimal)
                                setTimeout(() => {
                                    const langSel = document.getElementById('lang-switcher');
                                    if(langSel) {
                                        langSel.value = (window.UI?.prefs?.lang || 'it').slice(0,2);
                                        langSel.onchange = (e) => {
                                            const lang = e.target.value;
                                            if(lang === 'en') {
                                              if(!window.CronoLangEN) {
                                                const s = document.createElement('script');
                                                s.src = '/language/english.js';
                                                s.onload = () => {
                                                  window.I18N.dict = window.CronoLangEN;
                                                  window.I18N.setLang('en').then(() => window.I18N.applyToDOM());
                                                };
                                                document.body.appendChild(s);
                                              } else {
                                                window.I18N.dict = window.CronoLangEN;
                                                window.I18N.setLang('en').then(() => window.I18N.applyToDOM());
                                              }
                                            } else {
                                              window.I18N.setLang('it').then(() => window.I18N.applyToDOM());
                                            }
                                          };
                                    }
                                }, 100);
