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
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

const handler = (req, res) => {
  const d = new Date()
  res.end(d.toString())
}

module.exports = allowCors(handler)

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
