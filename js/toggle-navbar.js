// Script per alternare tra Dynamic Bar e Navbar Quadrata

function toggleNavbarStyle() {
    document.body.classList.toggle('square-nav');
    
    // Aggiorna lo stato nel localStorage per persistenza
    const isSquare = document.body.classList.contains('square-nav');
    localStorage.setItem('navbarStyle', isSquare ? 'square' : 'dynamic');
    
    // Dispatch event per aggiornare componenti se necessario
    window.dispatchEvent(new Event('crono-bar-update'));
}

// Inizializza lo stato al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    const savedStyle = localStorage.getItem('navbarStyle');
    if (savedStyle === 'square') {
        document.body.classList.add('square-nav');
    }
});