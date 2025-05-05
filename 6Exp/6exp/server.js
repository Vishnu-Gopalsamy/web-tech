const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Error handling for module loading
process.on('uncaughtException', (err) => {
    if (err.code === 'MODULE_NOT_FOUND') {
        console.error('Please run "npm install" to install required dependencies');
        process.exit(1);
    }
    throw err;
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname)));

// MongoDB Schema
const personSchema = new mongoose.Schema({
    name: String,
    email: String,
    dob: Date,
    rollno: String,
    phone: String
});

const Person = mongoose.model('Person', personSchema);

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/personsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB at mongodb://127.0.0.1:27017/personsDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Personal Info Routes
app.post('/add', async (req, res) => {
    try {
        const { name, email, dob, rollno, phone } = req.body;
        console.log('Received data:', { name, email, dob, rollno, phone });
        
        // Check if user with roll number already exists
        const existingPerson = await Person.findOne({ rollno: rollno });
        console.log('Existing person check:', existingPerson);
        
        if (existingPerson) {
            return res.status(400).json({ 
                message: 'User with this roll number already exists',
                error: 'duplicate_rollno' 
            });
        }

        const newPerson = new Person({
            name,
            email,
            dob,
            rollno,
            phone,
        });
        
        const savedPerson = await newPerson.save();
        console.log('Saved person:', savedPerson);
        res.status(201).json(savedPerson);
    } catch (err) {
        console.error('Error in /add route:', err);
        res.status(400).json({ message: 'Error adding person', error: err.message });
    }
});

app.get('/all', async (req, res) => {
    try {
        const people = await Person.find();
        console.log('Retrieved all people:', people);
        res.json(people);
    } catch (err) {
        console.error('Error in /all route:', err);
        res.status(400).json({ message: 'Error fetching people', error: err.message });
    }
});

app.put('/update/:id', async (req, res) => {
    try {
        const { name, email, dob, rollno, phone } = req.body;
        const personId = req.params.id;

        // Check if new rollno already exists for different person
        const existingPerson = await Person.findOne({ 
            rollno: rollno,
            _id: { $ne: personId }
        });

        if (existingPerson) {
            return res.status(400).json({ 
                message: 'User with this roll number already exists',
                error: 'duplicate_rollno' 
            });
        }

        const updatedPerson = await Person.findByIdAndUpdate(
            personId,
            { name, email, dob, rollno, phone },
            { new: true }
        );

        if (!updatedPerson) {
            return res.status(404).json({ message: 'Person not found' });
        }

        res.json(updatedPerson);
    } catch (err) {
        console.error('Error in /update route:', err);
        res.status(400).json({ message: 'Error updating person', error: err.message });
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        const personId = req.params.id;
        await Person.findByIdAndDelete(personId);
        res.status(200).json({ message: 'Person deleted' });
    } catch (err) {
        res.status(400).json({ message: 'Error deleting person', error: err });
    }
});

// Login route
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
