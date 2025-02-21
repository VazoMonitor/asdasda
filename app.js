const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const WebSocket = require('ws');
const MonitoringService = require('./services/monitoringService');
const https = require('https');
const fs = require('fs');

// Carregar os certificados SSL gerados pelo Certbot
const privateKey = fs.readFileSync('/etc/letsencrypt/live/api.vazo.info/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/api.vazo.info/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/api.vazo.info/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

const app = express();
const port = process.env.PORT || 8880; // Alterando para usar a porta 8880

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

const wss = new WebSocket.Server({ noServer: true });

global.wss = wss;

wss.on('connection', (ws) => {
  console.log('Nova conexão WebSocket estabelecida');
  
  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message);
  });

  ws.on('error', (error) => {
    console.error('Erro WebSocket:', error);
  });
});

MonitoringService.init();

// Criar o servidor HTTPS
const server = https.createServer(credentials, app, () => {
  console.log(`Servidor HTTPS rodando na porta ${port}`);
});

// Conectar WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Iniciar o servidor
server.listen(port, () => {
  console.log(`Servidor rodando com HTTPS na porta ${port}`);
});
