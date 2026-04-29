const nodemailer = require('nodemailer');

// Configuración del transportador SMTP (se crea una vez por instancia)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.titan.email',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

module.exports = async function handler(req, res) {
    // Solo aceptar método POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    // Cabeceras CORS para permitir peticiones desde el frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const { name, email, company, service, message, source, time, website_url } = req.body;

        // Protección honeypot (anti-bot)
        if (website_url) {
            console.warn('Honeypot detectado. Evitando envío.');
            return res.status(200).json({ success: true });
        }

        // Validación de campos obligatorios
        if (!name || !email || !service || !message) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Correo electrónico inválido' });
        }

        // Construir el correo
        const mailOptions = {
            from: `"Sitio Web Integra Cloud" <${process.env.SMTP_USER}>`,
            to: process.env.RECEIVER_EMAIL || process.env.SMTP_USER,
            replyTo: email,
            subject: `Nuevo Lead: ${name} - ${service}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #007cf0; border-bottom: 2px solid #007cf0; padding-bottom: 10px;">🚀 Nuevo Contacto desde la Web</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #555; width: 140px;">Nombre:</td>
                            <td style="padding: 8px 0;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #555;">Correo:</td>
                            <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #555;">Empresa:</td>
                            <td style="padding: 8px 0;">${company || 'No especificada'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #555;">Servicio:</td>
                            <td style="padding: 8px 0;">${service}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 16px; padding: 16px; background: #f9f9f9; border-radius: 6px;">
                        <p style="font-weight: bold; color: #555; margin: 0 0 8px;">Mensaje:</p>
                        <p style="margin: 0; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px; margin: 0;">Enviado desde: ${source || 'Página Web'}</p>
                    <p style="color: #999; font-size: 12px; margin: 4px 0 0;">Fecha/Hora: ${time || new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'Correo enviado correctamente' });

    } catch (error) {
        console.error('Error al enviar correo:', error.message);
        return res.status(500).json({ error: 'Hubo un error al enviar el correo. Inténtalo más tarde.' });
    }
};
