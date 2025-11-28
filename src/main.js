//Herramientas de GOOGLE
import './style.css';
import { GoogleGenAI } from '@google/genai';

//Configuracioin de la IA
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey: API_KEY});

//Parte que se muestran en la pagina
const cajaChat = document.getElementById('cajita');
const EntradaUS = document.getElementById('user-input');
const EnviarBTN = document.getElementById('botoncito');

function agregarMSJ(texto, envia) {
    const div = document.createElement('div');
    div.classList.add('mensaje', envia === 'usuario' ? 'MSJusuario' : 'MSJia');
    div.textContent = texto;
    cajaChat.appendChild(div);
    cajaChat.scrollTop = cajaChat.scrollHeight;
};

// Funciones que no tienen tiempo en concreto
async function enviarMSJ () { // enviar mensajes a la caja vacia
    const entrada = EntradaUS.value.trim();
    if (!entrada) return;

    agregarMSJ(entrada, 'usuario'); 
    //Optimizacones para no permitir errores
    EntradaUS.value = '';
    EnviarBTN.disabled = true;
    EnviarBTN.textContent = 'Enviando prompt';

    try {
        const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: entrada,
        });
        const texto =response.text;

        agregarMSJ(texto, 'Inteligenca');
    } catch (error){
        console.error('Hubo un error: ',error);
        agregarMSJ('Hubo un error', 'inteligencia')
    } finally {
        EnviarBTN.disabled = false;
        EnviarBTN.textContent = 'Enviar'
    }
}

//Evento de click

EnviarBTN.addEventListener('click', enviarMSJ);

EntradaUS.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMSJ();
});
