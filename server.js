import express from 'express';
import cors from 'cors';
import youtubedl from 'youtube-dl-exec';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/download-wav', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('Falta la URL');

    console.log(`📥 Analizando video: ${videoUrl}`);

    try {
        // PASO 1: Obtener info del video antes de descargar (para sacar el título)
        const info = await youtubedl(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });

        // PASO 2: Limpiar el título (quitar emojis y caracteres prohibidos en Windows)
        // Solo deja letras, números, guiones y espacios.
        const safeTitle = info.title.replace(/[^a-zA-Z0-9 \-_]/g, '').trim();
        const filename = `${safeTitle}.wav`;

        console.log(`✅ Título encontrado: "${filename}"`);

        // PASO 3: Configurar headers
        // IMPORTANTE: 'Access-Control-Expose-Headers' permite al frontend leer el nombre
        res.header('Access-Control-Expose-Headers', 'Content-Disposition');
        res.header('Content-Disposition', `attachment; filename="${filename}"`);
        res.header('Content-Type', 'audio/wav');

        // PASO 4: Iniciar la descarga
        const subprocess = youtubedl.exec(videoUrl, {
            extractAudio: true,
            audioFormat: 'wav',
            output: '-',
            noCheckCertificates: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });

        subprocess.stdout.pipe(res);

        subprocess.stderr.on('data', (data) => {
            // Logs opcionales
        });

    } catch (error) {
        console.error('❌ Error:', error);
        if (!res.headersSent) {
            res.status(500).send('Error al procesar el video');
        }
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend mejorado listo en http://localhost:${PORT}`);
});