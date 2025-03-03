const express = require('express');
const tf = require('@tensorflow/tfjs-node');
const jimp = require('jimp');
const canvas = require('canvas');
const wav = require('node-wav');
const audio = require('web-audio-api');
const natural = require('natural');
const NLP = require('node-nlp');
const math = require('mathjs');
const plotly = require('plotly');
const Chart = require('chart.js');
const csv = require('csv-parser');
const path = require('path');

class LibraryManager {
    constructor() {
        this.libs = {
            tensor: {
                tf,
                createTensor: (data, shape) => tf.tensor(data, shape),
                matMul: (a, b) => tf.matMul(a, b)
            },
            vision: {
                jimp,
                canvas,
                loadImage: async (path) => await jimp.read(path)
            },
            audio: {
                wav,
                audio,
                readFile: (buffer) => wav.decode(buffer)
            },
            nlp: {
                natural,
                NLP,
                tokenize: (text) => natural.WordTokenizer().tokenize(text)
            },
            math: {
                math,
                evaluate: (expr) => math.evaluate(expr)
            },
            plot: {
                plotly,
                Chart,
                createChart: (data) => new Chart(data)
            },
            data: {
                csv,
                parse: () => csv()
            }
        };
    }

    getLib(name) {
        return this.libs[name];
    }
}

const app = express();
const libraryManager = new LibraryManager();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Library access endpoint
app.get('/api/libs/:name', (req, res) => {
    const lib = libraryManager.getLib(req.params.name);
    res.json({ lib });
});

// Script execution endpoint
app.post('/api/execute', (req, res) => {
    const { script } = req.body;
    try {
        // Execute the script using the library manager
        const result = executeScript(script, libraryManager);
        res.json({ success: true, result });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Serve library files
app.get('/libs/:name', (req, res) => {
    const libName = req.params.name;
    const lib = libraryManager.getLib(libName);
    res.json(lib);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running with all libraries loaded on port ${PORT}`);
});
