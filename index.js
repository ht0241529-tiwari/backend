require('dotenv').config();
// Import express
const express = require('express');

// Initialize app
const app = express();
const port = process.env.PORT || 4000; // use env PORT if available

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/twitter', (req, res) => {
  res.send('harsh.com');
});

app.get('/login', (req, res) => {
  res.send('<h1>You are logged in to this page, hello</h1>');
});

app.get('/youtube', (req, res) => {
  res.send('<h2>welcome to harsh youtube channel</h2>');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});