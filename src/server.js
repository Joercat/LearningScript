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
function executeScript(script, libraryManager) {
    const context = {
        libs: libraryManager.libs,
        models: {},
        data: null,
        currentModel: null
    };
    const lines = script.split('\n');
    const results = [];
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;
        if (line.startsWith('package.add')) {
            const libName = line.split(' ')[1];
            results.push(`Loaded package: ${libName}`);
            continue;
        }
        if (line.startsWith('new')) {
            const modelName = line.match(/"([^"]+)"/)[1];
            context.models[modelName] = {
                layers: [],
                config: {}
            };
            context.currentModel = context.models[modelName];
            results.push(`Created model: ${modelName}`);
            continue;
        }
        if (line.startsWith('add')) {
            const layerMatch = line.match(/add (\w+)(.*)/);
            if (layerMatch) {
                const layerType = layerMatch[1];
                const params = {};
                const paramMatches = layerMatch[2].match(/(\w+):(\w+)/g) || [];
                paramMatches.forEach(param => {
                    const [key, value] = param.split(':');
                    params[key] = isNaN(value) ? value : Number(value);
                });
                if (context.currentModel) {
                    context.currentModel.layers.push({type: layerType, ...params});
                    results.push(`Added ${layerType} layer`);
                }
            }
            continue;
        }
        if (line.startsWith('learn')) {
            const modelMatch = line.match(/"([^"]+)"/);
            const modelName = modelMatch ? modelMatch[1] : null;
            const model = context.models[modelName];
            if (model) {
                const epochs = line.includes('epochs:') ? 
                    Number(line.match(/epochs:(\d+)/)[1]) : 10;
                results.push(`Training model ${modelName} for ${epochs} epochs`);
            }
            continue;
        }
        if (line.startsWith('guess')) {
            const modelMatch = line.match(/"([^"]+)"/);
            const modelName = modelMatch ? modelMatch[1] : null;
            if (context.models[modelName]) {
                results.push(`Making prediction with model ${modelName}`);
            }
            continue;
        }
        if (line.startsWith('save')) {
            const modelMatch = line.match(/"([^"]+)"/);
            const modelName = modelMatch ? modelMatch[1] : null;
            if (context.models[modelName]) {
                results.push(`Saved model ${modelName}`);
            }
            continue;
        }
        if (line.startsWith('load')) {
            const modelMatch = line.match(/"([^"]+)"/);
            const modelName = modelMatch ? modelMatch[1] : null;
            results.push(`Loaded model ${modelName}`);
            continue;
        }
        if (line.startsWith('show')) {
            const modelMatch = line.match(/"([^"]+)"/);
            const modelName = modelMatch ? modelMatch[1] : null;
            if (context.models[modelName]) {
                results.push(`Visualizing model ${modelName}`);
            }
            continue;
        }
    }
    return results;
}
const app = express();
const libraryManager = new LibraryManager();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/api/libs/:name', (req, res) => {
    const lib = libraryManager.getLib(req.params.name);
    res.json({ lib });
});
app.post('/api/execute', (req, res) => {
    const { script } = req.body;
    try {
        const result = executeScript(script, libraryManager);
        res.json({ success: true, result });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});
app.get('/libs/:name', (req, res) => {
    const libName = req.params.name;
    const lib = libraryManager.getLib(libName);
    res.json(lib);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running with all libraries loaded on port ${PORT}`);
});
