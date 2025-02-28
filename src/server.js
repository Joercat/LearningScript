const express = require('express');
const path = require('path');
const fs = require('fs');
const LearningScript = require('./learning_script');

const app = express();
const port = 3000;

// Set up middleware
app.use(express.static('public'));
app.use(express.json());
app.use('/libs', express.static('libs'));

// HTML template engine
app.set('view engine', 'ejs');

// Main route
app.get('/', (req, res) => {
    res.render('index', {
        packages: [
            'tensor',
            'vision',
            'audio',
            'text',
            'math',
            'plot',
            'data'
        ]
    });
});

// API endpoint for script execution
app.post('/execute', (req, res) => {
    const ls = new LearningScript();
    const result = ls.parseLSLScript(req.body.script);
    res.json({ result });
});

app.listen(port, () => {
    console.log(`LearningScript compiler running at http://localhost:${port}`);
});
