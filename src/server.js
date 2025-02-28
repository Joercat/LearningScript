const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware setup
app.use(express.static('public'));
app.use(express.json());

// Library handlers
const libs = {
    tensor: require('libs/tensor'),
    vision: require('libs/vision'),
    audio: require('libs/audio'),
    nlp: require('libs/nlp'),
    math: require('libs/math'),
    plot: require('libs/plot'),
    data: require('libs/data')
};

// API Routes
app.get('/api/libs/:name', (req, res) => {
    const lib = libs[req.params.name];
    res.json({ lib });
});

app.post('/api/execute', (req, res) => {
    const { script, packages } = req.body;
    const result = executeScript(script, packages);
    res.json({ result });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
