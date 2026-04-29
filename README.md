# Integra Cloud — Backend de Correos

Este proyecto es la landing page de **Integra Cloud**, que incluye un backend Node.js propio para el envío de correos mediante SMTP de Titan Mail (HostGator Professional Email).

## Puesta en marcha

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear el archivo de variables de entorno
Copia el archivo de ejemplo y rellena tus credenciales reales:
```bash
cp .env.example .env
```

Edita `.env` con los valores correspondientes:
```
PORT=3000
SMTP_HOST=smtp.titan.email
SMTP_PORT=465
SMTP_USER=tu-correo@tudominio.com
SMTP_PASS=tu-contraseña
RECEIVER_EMAIL=tu-correo@tudominio.com
```

> **Importante:** Asegúrate de habilitar "Titan on other apps" en el panel de HostGator antes de ejecutar el servidor.

### 3. Iniciar el servidor
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`.

## Stack tecnológico

- **Frontend:** HTML5, CSS3, JavaScript vanilla
- **Backend:** Node.js + Express
- **Correos:** Nodemailer + SMTP Titan Mail
- **Base de datos de leads:** Supabase
- **Seguridad:** Helmet, CORS, express-rate-limit, Honeypot anti-spam

## Despliegue en producción

Al desplegar en servicios como Render, Railway o Heroku, configura las variables de entorno del archivo `.env` en el panel de control del proveedor (nunca subas el `.env` real al repositorio).
