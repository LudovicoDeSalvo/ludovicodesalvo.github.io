// Wait for the entire page to load before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- Language Switcher Logic ---

    // Find the button and all elements that have language data
    const langSwitcher = document.getElementById('lang-switcher');
    const translatableElements = document.querySelectorAll('[data-lang-en]');

    // Set the initial language
    let currentLang = 'en';

    // Function to update the text on the page
    const translatePage = () => {
        translatableElements.forEach(element => {
            // Get the correct text from the data attribute based on the current language
            const newText = element.getAttribute(`data-lang-${currentLang}`);
            if (newText) {
                element.textContent = newText;
            }
        });
    };

    // Add a click event listener to the button
    langSwitcher.addEventListener('click', () => {
        // Toggle the language
        if (currentLang === 'en') {
            currentLang = 'it';
        } else {
            currentLang = 'en';
        }
        
        // Call the function to update the page content
        translatePage();
    });

    // Initialize the page with the default language
    translatePage();


    // *** Scroll Logic ***

    const sidebar = document.querySelector('.sidebar');
    const body = document.body;
    const scrollThreshold = 210;

    // Listen for the 'scroll' event on the window
    window.addEventListener('scroll', () => {
        // FIX: Only run this logic on mobile screens (less than 768px wide)
        if (window.innerWidth < 768) {
            if (window.scrollY > scrollThreshold) {
                sidebar.classList.add('scrolled');
                body.classList.add('scrolled');
            } else {
                sidebar.classList.remove('scrolled');
                body.classList.remove('scrolled');
            }
        }
    });
});