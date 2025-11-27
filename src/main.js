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

const btnDescargar = document.getElementById('btn-descargar');
const inputUrl = document.getElementById('url-input');
const estado = document.getElementById('estado-descarga');

btnDescargar.addEventListener('click', async () => {
    const url = inputUrl.value.trim();
    if (!url) {
        estado.textContent = "⚠️ Por favor escribe una URL.";
        return;
    }

    // 1. Cambiar interfaz para avisar que estamos trabajando
    estado.textContent = "⏳ Procesando... (esto toma unos segundos)";
    estado.style.color = 'yellow';
    btnDescargar.disabled = true;
    btnDescargar.textContent = "Bajando...";

    try {
        const response = await fetch(`http://localhost:3000/download-wav?url=${encodeURIComponent(url)}`);

        if (!response.ok) throw new Error("Fallo en el servidor");

        // --- NUEVO: Leer el nombre real del archivo desde el servidor ---
        const header = response.headers.get('Content-Disposition');
        let nombreArchivo = "audio_descargado.wav"; // Nombre por defecto porsiaca

        if (header) {
            // Un poco de magia regex para sacar el texto entre comillas
            const match = header.match(/filename="(.+)"/);
            if (match && match[1]) {
                nombreArchivo = match[1];
            }
        }
        // ----------------------------------------------------------------

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = nombreArchivo; // <--- Aquí usamos el nombre real
        document.body.appendChild(a);
        a.click();
        a.remove();

        estado.textContent = `✅ ¡Listo! Se descargó: "${nombreArchivo}"`;
        estado.style.color = "lightgreen";
        inputUrl.value = ""; 

    } catch (error) {
        console.error(error);
        estado.textContent = "❌ Error: Verifica el link o intenta de nuevo.";
        estado.style.color = "red";
    } finally {
        // 5. Restaurar el botón
        btnDescargar.disabled = false;
        btnDescargar.textContent = "Descargar";
    }
});

//Evento de click

EnviarBTN.addEventListener('click', enviarMSJ);

EntradaUS.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMSJ();
});
