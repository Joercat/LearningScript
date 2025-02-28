import LearningScript from './lsl.js';

class IDE {
    constructor() {
        this.ls = new LearningScript();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('run').addEventListener('click', () => this.executeCode());
    }

    async executeCode() {
        const code = document.getElementById('editor').value;
        const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                script: code,
                packages: Object.keys(this.ls.packages)
            })
        });
        const result = await response.json();
        this.displayResult(result);
    }

    displayResult(result) {
        document.getElementById('output').innerHTML = JSON.stringify(result, null, 2);
    }
}

new IDE();
