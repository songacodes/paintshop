const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Serve static files from the shop directory
app.use(express.static(__dirname));

// Serve shared files from the common directory
app.use('/common', express.static(path.join(__dirname, '..', 'common')));

// A simple endpoint to get the local shop's configuration
app.get('/api/config', (req, res) => {
    const configPath = path.join(__dirname, 'shop-config.json');
    if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        res.json(config);
    } else {
        res.status(404).json({ error: 'shop-config.json not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Shop server running on http://localhost:${PORT}`);
});
