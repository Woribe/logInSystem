if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

const initPassport = require('./passport-config')
initPassport(
    passport,
    email => users.find(user => user.email === email)
)



app.set('view engine', 'pug')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

const users = []

app.get('/', (req, res) => {
    res.json(users)
})

app.get('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/login', (req, res) => {

})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {id: Date.now().toString(), name: req.body.name, email: req.body.email, password:hashedPassword}
        users.push(user)
        res.status(200).redirect('/login')
    } catch (error) {
        console.log('Error: ' + error);
        res.status(500).json({Error: error}).redirect('/register')
    }
    
})

app.get('/users', (req,res) => {
    res.json(users)
})

app.post('/users', async (req, res) => {
    try {
        const hashedPAssword = await bcrypt.hash(req.body.password, 10)
        console.log('HashedPassword: ' + hashedPAssword)
        const user = {name: req.body.name, password: hashedPAssword}
        users.push(user)
        res.status(201).send()
    } catch (error) {
        console.log('Error: ' + error);
        res.status(500).json({Error: error})
    }
})

app.use('/users/login', async (req,res) => {
    const user = users.find(user => user.name == req.body.name)
    if(user == null) {
        return res.status(400).json({Error: "Cannot find user"})
    }
    try {
        if(await bcrypt.compare(req.body.password, user.password)) {
            res.send('Sucess')
        } else {
            res.send('Not allowed')
        }
    } catch (error) {
        console.log('Error: ' + error);
        res.status(500).json({Error: error})
    }
})

app.listen(8080, () => {
    console.log('Server is running at 8080');
})