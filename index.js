const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/user')

dotenv.config();
mongoose.connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();
app.use('/', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json());

app.post('/api/register', async (req, res) => {
    const { username, password: plainTextPassword } = req.body

    if (!username || typeof username !== 'string') {
        return res.json({ status: 'error', error: 'Invalid username' })
    }

    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid password' })
    }

    if (plainTextPassword.length < 5) {
        return res.json({
            status: 'error',
            error: 'Password too small. Should be atleast 6 characters'
        })
    }

    const password = await bcrypt.hash(plainTextPassword, 10)

    try {
        const response = await User.create({
            username,
            password
        })
        console.log('User created successfully: ', response)
    } catch (error) {
        if (error.code === 11000) {
            return res.json({ status: 'error', error: 'Username already in use' })
        }
        throw error
    }

    res.json({ status: 'ok' })
})

const PORT = 8080;
app.listen(PORT, (err) => {
    if (err) {
        throw err;
    } else {
        console.log(`Server UP and running at http://localhost:${PORT}`);
    }
});