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

// Endpoint específico para search - DEBE IR ANTES del genérico /api/jira/*
app.get('/api/jira/search', async (req, res) => {
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
    
    // Extraer parámetros de query
    const { jql, fields, maxResults, startAt } = req.query;
    
    // Construir URL con query params (nuevo formato JIRA)
    const queryParams = new URLSearchParams();
    if (jql) queryParams.append('jql', jql);
    if (fields) queryParams.append('fields', fields);
    if (maxResults) queryParams.append('maxResults', maxResults);
    if (startAt) queryParams.append('startAt', startAt);
    
    const jiraUrl = `${jiraBaseUrl}/rest/api/3/search/jql?${queryParams.toString()}`;
    const auth = Buffer.from(`${email}:${token}`).toString('base64');
    
    console.log('Proxying GET /search/jql', jql);
    
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
