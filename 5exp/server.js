const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Error handling for module loading
process.on('uncaughtException', (err) => {
    if (err.code === 'MODULE_NOT_FOUND') {
        console.error('Please run "npm install" to install required dependencies');
        process.exit(1);
    }
    throw err;
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
        res.send(`
            <html>
                <head>
                    <title>Login Successful</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        body { 
                            height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                        }
                        .success-card {
                            text-align: center;
                            padding: 2rem;
                            background: white;
                            border-radius: 15px;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        }
                    </style>
                </head>
                <body>
                    <div class="success-card">
                        <h1 class="text-success mb-4">Login Successful!</h1>
                        <p class="text-muted">Welcome ${username}</p>
                        <a href="/main.html" class="btn btn-primary mt-3">Continue to Homepage</a>
                    </div>
                </body>
            </html>
        `);
    } else {
        res.redirect('/pages/login.html?error=true');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
