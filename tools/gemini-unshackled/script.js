// --- 1. DOM Element Selection ---
const chatWindow = document.getElementById('chat-window');
const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');
const ownerPasswordInput = document.getElementById('owner-password');
const apiKeyContainer = document.getElementById('api-key-container');
const safetyCheckboxes = document.querySelectorAll('#safety-settings input[type="checkbox"]');

// --- 2. State Management ---
// NOTE: For a personal project, hardcoding a password in JS is okay.
// For a public website, this would be very insecure.
const SECRET_PASSWORD = "1234"; // <-- IMPORTANT: Change this to your own secret password
let isOwner = false;

// --- 3. Owner Identification Logic ---
ownerPasswordInput.addEventListener('input', () => {
    if (ownerPasswordInput.value === SECRET_PASSWORD) {
        isOwner = true;
        apiKeyContainer.style.display = 'none'; // Hide the API key input
    } else {
        isOwner = false;
        apiKeyContainer.style.display = 'block'; // Show the API key input
    }
});

// --- 4. Main Form Submission Handler ---
promptForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission (page reload)

    const prompt = promptInput.value.trim();
    if (!prompt) return; // Don't send empty prompts

    addMessage('user', prompt);
    promptInput.value = ''; // Clear the input field

    const loadingMessage = addMessage('model', 'Thinking...', 'loading-message');

    try {
        // A. Gather all settings from the UI
        const model = document.querySelector('input[name="model"]:checked').value;
        const safetySettings = getSafetySettings();
        const apiKey = document.getElementById('api-key').value;

        // B. Construct the request body to send to the backend
        const requestBody = {
            prompt,
            model,
            safetySettings,
            isOwner,
            apiKey: isOwner ? null : apiKey, // Only send apiKey if not the owner
        };
        
        // C. Send the request to our backend server
        console.log('Sending to backend:', requestBody);

        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        // D. Handle the response
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'An unknown error occurred.');
        }

        const data = await response.json();
        loadingMessage.remove(); // Remove the "Thinking..." message
        addMessage('model', data.text);

    } catch (error) {
        loadingMessage.remove();
        addMessage('model', `Error: ${error.message}`);
        console.error('There was an error!', error);
    }
});

// --- 5. Helper Functions ---

/**
 * Gathers the state of the safety checkboxes and formats them for the API.
 * @returns {Array} An array of safety settings objects.
 */
function getSafetySettings() {
    const settings = [];
    safetyCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            settings.push({
                category: checkbox.value,
                threshold: 'BLOCK_NONE',
            });
        }
    });
    return settings;
}

/**
 * Creates and appends a new message to the chat window.
 * It uses 'marked' to parse Markdown for model messages.
 * @param {string} sender - 'user' or 'model'.
 * @param {string} text - The message content.
 * @param {string|null} id - An optional ID for the message element.
 * @returns {HTMLElement} The created message element.
 */
function addMessage(sender, text, id = null) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    if (id) {
        messageElement.id = id;
    }

    if (sender === 'model') {
        // For the model's response, parse the Markdown text to HTML
        messageElement.innerHTML = marked.parse(text);
    } else {
        // For the user's input, use textContent to prevent HTML injection
        messageElement.textContent = text;
    }

    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the bottom
    return messageElement;
}