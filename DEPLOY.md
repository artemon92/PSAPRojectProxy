# Despliegue del JIRA Proxy Server

Este servidor soluciona los problemas de CORS al conectar con JIRA Cloud API.

## Opción 1: Railway (Recomendado - Gratis)

1. Crea cuenta en https://railway.app (con GitHub)
2. Nuevo proyecto → Deploy from GitHub repo
3. Selecciona tu repo con este código
4. Railway detectará automáticamente Node.js
5. Espera a que termine el deploy (2-3 minutos)
6. Copia la URL pública (ej: `https://jira-proxy.up.railway.app`)

## Opción 2: Render (Gratis)

1. Crea cuenta en https://render.com
2. New → Web Service
3. Conecta tu GitHub repo
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Free tier → Create Web Service
7. Copia la URL pública

## Opción 3: Vercel (Serverless)

1. Crea cuenta en https://vercel.com
2. Importa tu proyecto
3. Framework Preset: Other
4. Build Command: `npm install`
5. Output Directory: `.`
6. Deploy

## Despliegue local (para pruebas)

```bash
cd proxy-server
npm install
npm start
```

El servidor estará en `http://localhost:3000`

## URL del proxy

Una vez desplegado, tu URL será:
```
https://TU-APP-NAME.railway.app
```

## Uso en la app

Configura la app para usar el proxy en lugar de llamar directamente a JIRA:

1. Abre la configuración JIRA en la app
2. Marca la casilla "Usar servidor proxy"
3. Ingresa la URL de tu proxy desplegado
4. Guarda y prueba la conexión

## Endpoints disponibles

- `GET /` - Health check
- `GET /api/jira/myself` - Test connection
- `POST /api/jira/search` - Search issues
- `GET /api/jira/*` - Any JIRA endpoint

## Headers requeridos

Todas las peticiones deben incluir:
- `x-jira-url`: URL base de JIRA (ej: https://bdpinternational.atlassian.net)
- `x-jira-email`: Email de JIRA
- `x-jira-token`: API Token de JIRA
