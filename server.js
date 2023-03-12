const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

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
            thought : String
        }
    ]
});

const User = mongoose.model("User", userSchema);

var usrMail = ""; // gobal name
var regErrString = "";

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
            usrMail = "";
            console.log("successful");
            const ufn = results.firstName;
            const uln = results.lastName;
            const email = results.email;
            
            res.render('usrPage.ejs', {
                uFirstName : ufn,
                uLastName: uln,
                email : email
            });
        }
    )
    .catch(
        function(err){
            console.log(err);
        }
    );
});
app.get('Dashboard',(req,res)=>{
    regErrString = "";
    res.render('loginPage.ejs');
});
app.get('/happy',(req,res)=>{
    regErrString = "";
    res.render('loginPage.ejs');
});
app.get('/sad',(req,res)=>{
    regErrString = "";
    res.render('loginPage.ejs');
});


app.post('/register', function(req,res){
    console.log(req.body); 
    
    const fName = req.body.firstName;
    const lName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const gEmail = req.body.gEmail;

    User.findOne({email : email})
    .then(
        function(results){
            console.log(results);
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

    console.log(req.body);

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
                console.log(usrMail);
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



app.listen(3000 , function(){
    console.log("server up and runing");
})