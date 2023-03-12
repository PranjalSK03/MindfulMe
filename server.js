const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"))

app.set("view engine", "ejs");

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
    firstName : String,
    lastName : String,
    email : String,
    password : String,
    gaurdianEmail : String,
    thread : [
        {
            Date : String,
            scale : Number,
            thought : String
        }
    ]
});

const User = mongoose.model("User", userSchema);

var usrMail = ""; // gobal name
var regErrString = "";
var rating = 5;

app.get('/',(req,res)=>{
    usrMail = "";
    regErrString = "";
    res.render('index.ejs');
});
app.get('/login',(req,res)=>{
    usrMail = "";
    regErrString = "";
    res.render('login.ejs');
});
app.get('/register',(req,res)=>{
    usrMail = "";
    regErrString = "";
    res.render('register.ejs');
});
app.get('/loginError',(req,res)=>{
    usrMail = "";
    regErrString = "";
    res.render('login_error.ejs');
});

app.get('/registerError',(req,res)=>{
    usrMail = "";
    res.render("register_error.ejs", {
        errString : regErrString
    });
});

app.get('/userPage',(req,res)=>{
    regErrString = "";
    User.findOne({email : usrMail})
    .then(
        function(results){
            console.log("successful");
            res.render('usrPage.ejs');
        }
    )
    .catch(
        function(err){
            console.log(err);
        }
    );
});


app.get('/happy',(req,res)=>{
    regErrString = "";
    User.findOne({email : usrMail})
    .then(
        function(results){
            console.log("successful");
            const email = results.email;
            
            res.render('happy.ejs');
        }
    )
    .catch(
        function(err){
            console.log(err);
        }
    );
});

app.get('/sad',(req,res)=>{
    regErrString = "";
    User.findOne({email : usrMail})
    .then(
        function(results){
            console.log(results);
            console.log("successful");
            
            res.render('sad.ejs');
        }
    )
    .catch(
        function(err){
            console.log(err);
        }
    );
});

app.get('/dashboard', (req,res)=>{
    regErrString = "";
    const day = date.getDate();
    User.findOne({email : usrMail})
    .then(
        function(results){
            console.log("successful");
            const name = results.firstName;
            const threads = results.thread;

            let avg = 0;
            for(let i=0; i<threads.length ; i++){
                avg += threads[i].scale;
            } 
            avg /= threads.length;
            
            res.render('dashboard.ejs', {
                currDate : day,
                name : name,
                usrThoughts : threads,
                report : avg 
            });
        }
    )
    .catch(
        function(err){
            console.log(err);
        }
    );
});


app.post('/register', function(req,res){
    //console.log(req.body); 
    
    const fName = req.body.firstName;
    const lName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const gEmail = req.body.gEmail;

    User.findOne({email : email})
    .then(
        function(results){
            //console.log(results);
            if(results == null){
                const user = new User({
                    firstName : fName,
                    lastName : lName,
                    email : email,
                    password : password,
                    gaurdianEmail : gEmail,
                });

                user.save().then(()=>{console.log("successfully entered")}).catch((err)=>{console.log("error cant save: " + err)});

                res.redirect("/login");
            }
            else if(results.password == password && results.email == email){
                regErrString = "you are a registerd user";
                res.redirect("/registerError");
            }
            else {
                regErrString = "this email is already in use!";
                res.redirect("/registerError");
            }
        }
    )
    .catch(
        function(err){
            console.log(err);
        }
    )
});

app.post('/login', function(req,res){

    //console.log(req.body);

    const email = req.body.email;
    const pw = req.body.password;

    User.findOne({email : email, password : pw})
    .then(
        function(results){
            if(results == null){
                res.redirect("/loginError");
                
            }
            else{
                usrMail = results.email;
                res.redirect("/userPage");
            }
        }
    )
    .catch(
        function(err){
        console.log("an error occured" + err);
        }
    )
});

app.post("/userPage", function(req, res){

    console.log(req.body);
    rating = req.body.myRange;

    const day = date.getDate();
    let str="";

    if(req.body.myRange >= 5){
        res.redirect("/happy");
    }
    else{ 
        res.redirect("/sad");
    }
});

app.post("/happy", function(req, res){

    const day = date.getDate();

    console.log(day);
    console.log(rating);

    const th = {
        Date : day,
        scale : rating,
        thought : req.body.thoughts
    }

    User.updateOne({email: usrMail},{$push: {thread: th}})
    .then(
        function(){
            console.log("successful");
            res.redirect("/dashboard");
        }
    )
    .catch(
        function(err){
            console.log(err);
        }
    )

});

app.post("/sad", function(req, res){
    const day = date.getDate();

    console.log(day);
    console.log(rating);

    const th = {
        Date : day,
        scale : rating,
        thought : req.body.thoughts
    }

    User.updateOne({email: usrMail},{$push: {thread: th}})
    .then(
        function(){
            console.log("successful");
            res.redirect("/dashboard");
        }
    )
    .catch(
        function(err){
            console.log(err);
        }
    )
});

app.listen(3000 , function(){
    console.log("server up and running");
});