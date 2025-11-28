import { GoogleGenAI  } from '@google/genai';

// Configuración de la IA (tu código original)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey: API_KEY});

// Nuevas referencias a los elementos del DOM
const contentWrapper = document.getElementById('content-wrapper');
const initialContent = document.getElementById('initial-content');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const promptCards = document.querySelectorAll('.prompt-card');
const mainContainer = document.querySelector('main');

let chatStarted = false;

/**
 * Agrega un mensaje al DOM, creando una burbuja de chat con el estilo adecuado.
 * @param {string} text - El texto del mensaje.
 * @param {'user' | 'ai'} sender - Quién envía el mensaje ('user' o 'ai').
 */
function addChatMessage(text, sender) {
    // Si es el primer mensaje, oculta el contenido inicial y prepara el contenedor.
    if (!chatStarted) {
        initialContent.style.display = 'none';
        contentWrapper.classList.add('chat-mode');
        chatStarted = true;
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender === 'user' ? 'user-message' : 'ai-message');
    messageDiv.textContent = text;
    contentWrapper.appendChild(messageDiv);

    // Hace scroll automático al último mensaje
    mainContainer.scrollTop = mainContainer.scrollHeight;
}

/**
 * Envía el mensaje del usuario a la IA y muestra la respuesta.
 */
async function sendMessage() {
    const prompt = userInput.value.trim();
    if (!prompt) return;

    addChatMessage(prompt, 'user');
    userInput.value = '';

    // Deshabilita el botón y muestra el indicador de carga
    sendButton.disabled = true;
    sendButton.innerHTML = '<div class="loader"></div>';

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        const text = response.text;
        addChatMessage(text, 'ai');
    } catch (error) {
        console.error('Error al contactar la IA:', error);
        addChatMessage('Lo siento, algo salió mal. Por favor, intenta de nuevo.', 'ai');
    } finally {
        // Habilita el botón y restaura el ícono
        sendButton.disabled = false;
        sendButton.innerHTML = '<i data-lucide="arrow-right" class="w-5 h-5"></i>';
        lucide.createIcons(); // Vuelve a renderizar el ícono de Lucide
    }
}

// --- EVENT LISTENERS ---

// Evento para el botón de enviar
sendButton.addEventListener('click', sendMessage);

// Evento para enviar con la tecla "Enter" (y Shift+Enter para nueva línea)
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Evita el salto de línea
        sendMessage();
    }
});

// Evento para las tarjetas de sugerencia
promptCards.forEach(card => {
    card.addEventListener('click', () => {
        const promptText = card.querySelector('span').textContent;
        userInput.value = promptText;
        userInput.focus(); // Pone el cursor en el input
    });
});