const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middlewares de seguridad y utilidades
app.use(helmet({
    contentSecurityPolicy: false, // Desactivado temporalmente para no bloquear scripts en línea/Supabase sin configuración específica
}));
app.use(cors());
app.use(express.json()); // Parsea body en JSON
app.use(express.urlencoded({ extended: true }));

// Limitar la cantidad de peticiones al endpoint de correos para evitar spam
const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Limita a 10 solicitudes por IP
    message: { error: 'Has enviado demasiadas solicitudes. Por favor, inténtalo más tarde.' }
});

// Servir los archivos estáticos desde la raíz
app.use(express.static(path.join(__dirname)));

// Configuración del transportador de Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.titan.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true para 465, false para otros puertos (587 usa STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Endpoint para recibir y enviar el correo
app.post('/api/send-email', emailLimiter, async (req, res) => {
    try {
        const { name, email, company, service, message, source, time, website_url } = req.body;

        // Validación básica de honeypot
        if (website_url) {
            console.warn("Honeypot detectado. Evitando envío.");
            return res.status(200).json({ success: true, message: 'Simulated success' });
        }

        // Validación de campos obligatorios
        if (!name || !email || !service || !message) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // Construir el correo a enviar
        const mailOptions = {
            from: `"Sitio Web Integra Cloud" <${process.env.SMTP_USER}>`,
            to: process.env.RECEIVER_EMAIL || process.env.SMTP_USER,
            replyTo: email,
            subject: `Nuevo Lead: ${name} - ${service}`,
            html: `
                <h2>Nuevo Contacto desde la Web</h2>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Correo:</strong> ${email}</p>
                <p><strong>Empresa:</strong> ${company || 'No especificada'}</p>
                <p><strong>Servicio de interés:</strong> ${service}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr />
                <p><small>Enviado desde: ${source || 'Página Web'}</small></p>
                <p><small>Fecha/Hora: ${time || new Date().toLocaleString()}</small></p>
            `,
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ success: true, message: 'Correo enviado correctamente' });
    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({ error: 'Hubo un error al enviar el correo. Inténtalo más tarde.' });
    }
});

// Arrancar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de Integra Cloud corriendo en http://localhost:${PORT}`);
});
