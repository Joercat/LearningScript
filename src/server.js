const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/execute', (req, res) => {
    const result = executeScript(req.body.script);
    res.json({ result });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
