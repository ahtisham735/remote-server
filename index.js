const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');

// Serve static files
app.use(express.static('public', {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}),cors());
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, API!' });
});
// Store connected clients
const clients = new Map();
app.use(cors());

// Serve the HTML file with the form to input the client ID
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle socket connection
io.on('connection', (socket) => {
  console.log('A client connected');

  // Handle join message
  socket.on('join-message', (clientId) => {
    // Store the socket reference with the client ID
    clients.set(clientId, socket);
    console.log(`Client joined: ${clientId}`);
  });
  socket.on('screen-data', (screenshotData) => {
    io.emit('screen-data', screenshotData);
  });
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('A client disconnected');

    // Remove the socket reference from the stored clients
    clients.forEach((value, key) => {
      if (value === socket) {
        clients.delete(key);
        console.log(`Client left: ${key}`);
      }
    });
  });
});

// Start the server
const port = 5000;
http.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
