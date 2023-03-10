if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const bcrypt = require('bcrypt') 
const app = express()
const passport = require('passport')
const flash = require('express-flash') 
const session = require('express-session')
const initializePassport = require('./passport-config')
initializePassport(passport,email => users.find(user=> user.email ===email))

const users = []
 
app.set('view-engine',"ejs")
app.use(express.urlencoded({extended: false}))
app.use(flash())


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(__dirname))

app.get('/',(req,res)=>{
    res.render('index.ejs')
})
app.get('/login',(req,res)=>{
    res.render('login.ejs')
})
app.get('/register',(req,res)=>{
    res.render('register.ejs')
})
app.post('/login', passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.post('/register', async (req,res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        users.push({
            id: Date.now().toString(),
            name:req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch (error) {
        res.redirect('/register')
    }
    console.log(users)
})

app.listen(3000)