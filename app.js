const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const WebSocket = require('ws');
const MonitoringService = require('./services/monitoringService');

const app = express();
const port = process.env.PORT || 3000;

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

const server = app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
}); 