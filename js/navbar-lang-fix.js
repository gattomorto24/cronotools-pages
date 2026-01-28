// Patch: Language selector event handler for navbar
// This script ensures the language selector in the navbar updates the UI language immediately.
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    var langSel = document.getElementById('lang-switcher');
    if(langSel) {
      langSel.value = (window.UI?.prefs?.lang || 'it').slice(0,2);
      langSel.onchange = function(e) {
        var lang = e.target.value;
        if(lang === 'en') {
          if(!window.CronoLangEN) {
            var s = document.createElement('script');
            s.src = '/language/english.js';
            s.onload = function() {
              window.I18N.dict = window.CronoLangEN;
              window.I18N.setLang('en').then(function() { window.I18N.applyToDOM(); });
            };
            document.body.appendChild(s);
          } else {
            window.I18N.dict = window.CronoLangEN;
            window.I18N.setLang('en').then(function() { window.I18N.applyToDOM(); });
          }
        } else {
          window.I18N.setLang('it').then(function() { window.I18N.applyToDOM(); });
        }
      };
    }
  }, 100);
});
