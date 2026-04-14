/**
 * JIRA Proxy Server
 * Soluciona problemas de CORS al hacer peticiones a JIRA Cloud API
 * 
 * Despliegue gratuito en Railway, Render, o Vercel
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las peticiones
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-jira-url', 'x-jira-email', 'x-jira-token'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'JIRA Proxy Server is running',
    endpoints: {
      jira: '/api/jira/* - Proxy any JIRA API endpoint'
    }
  });
});

// Proxy endpoint para JIRA
app.all('/api/jira/*', async (req, res) => {
  try {
    // Obtener URL de JIRA de los headers o query params
    const jiraBaseUrl = req.headers['x-jira-url'] || req.query.jiraUrl;
    const email = req.headers['x-jira-email'] || req.query.email;
    const token = req.headers['x-jira-token'] || req.query.token;
    
    if (!jiraBaseUrl || !email || !token) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Required: x-jira-url, x-jira-email, x-jira-token headers'
      });
    }
    
    // Construir URL de JIRA
    const jiraPath = req.params[0];
    const jiraUrl = `${jiraBaseUrl}/rest/api/3/${jiraPath}`;
    
    // Preparar headers de autenticación
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    
    const fetchOptions = {
      method: req.method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    // Agregar body si es POST/PUT
    if (req.method === 'POST' || req.method === 'PUT') {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    console.log(`Proxying ${req.method} ${jiraUrl}`);
    
    // Hacer petición a JIRA
    const jiraResponse = await fetch(jiraUrl, fetchOptions);
    
    // Obtener respuesta
    const responseBody = await jiraResponse.text();
    
    // Devolver respuesta al cliente
    res.status(jiraResponse.status);
    
    // Parsear JSON si es posible
    try {
      const jsonData = JSON.parse(responseBody);
      res.json(jsonData);
    } catch {
      res.send(responseBody);
    }
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Proxy error',
      message: error.message
    });
  }
});

// Endpoint específico para search
app.post('/api/jira/search', async (req, res) => {
  try {
    const jiraBaseUrl = req.headers['x-jira-url'] || req.query.jiraUrl;
    const email = req.headers['x-jira-email'] || req.query.email;
    const token = req.headers['x-jira-token'] || req.query.token;
    
    if (!jiraBaseUrl || !email || !token) {
      return res.status(400).json({
        error: 'Missing credentials',
        required: ['x-jira-url', 'x-jira-email', 'x-jira-token']
      });
    }
    
    const jiraUrl = `${jiraBaseUrl}/rest/api/3/search`;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    
    console.log('Proxying POST /search', req.body);
    
    const jiraResponse = await fetch(jiraUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await jiraResponse.json();
    res.status(jiraResponse.status).json(data);
    
  } catch (error) {
    console.error('Search proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para myself (test connection)
app.get('/api/jira/myself', async (req, res) => {
  try {
    const jiraBaseUrl = req.headers['x-jira-url'] || req.query.jiraUrl;
    const email = req.headers['x-jira-email'] || req.query.email;
    const token = req.headers['x-jira-token'] || req.query.token;
    
    if (!jiraBaseUrl || !email || !token) {
      return res.status(400).json({
        error: 'Missing credentials',
        required: ['x-jira-url', 'x-jira-email', 'x-jira-token']
      });
    }
    
    const jiraUrl = `${jiraBaseUrl}/rest/api/3/myself`;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    
    console.log('Proxying GET /myself');
    
    const jiraResponse = await fetch(jiraUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });
    
    const data = await jiraResponse.json();
    res.status(jiraResponse.status).json(data);
    
  } catch (error) {
    console.error('Myself proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`JIRA Proxy Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/`);
});
