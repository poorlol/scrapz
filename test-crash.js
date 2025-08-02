// Test script to check crash game multiplier progression
const fs = require('fs');
const WebSocket = require('ws');

const protocol = "ws:";
const wsUrl = `${protocol}//localhost:5000/ws`;
const socket = new WebSocket(wsUrl);

const logFile = fs.createWriteStream('test-crash.log', { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  console.log(message);
  logFile.write(logMessage);
}

socket.onopen = () => {
  log('Connected to crash game WebSocket');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'multiplier_update') {
    log(`Current multiplier: ${data.data.currentMultiplier}x`);
  } else if (data.type === 'crash_game_started') {
    log('🚀 Game started!');
  } else if (data.type === 'crash_game_crashed') {
    log(`💥 Game crashed at ${data.data.crashPoint}x`);
  } else {
    log(`Other message: ${data.type}`);
  }
};

socket.onclose = () => {
  log('Disconnected from crash game');
  logFile.end();
};

socket.onerror = (error) => {
  log(`WebSocket error: ${error.message}`);
};