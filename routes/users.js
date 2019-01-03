const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
//User model
const User = require('../models/User');

//Login Page
router.get('/login', (req, res, next) => {
    res.render('login')
});
//Register Page
router.get('/register', (req, res, next) => {
    res.render('register')
});

//Register Handle
router.post('/register', (req, res, next) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    //Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }
    //Check passwords match
    if (password !== password2){
        errors.push({ msg: 'Passwords do not match' });
    }
    //Check password length
    if (password.length < 6){
        errors.push({ msg: 'Password should be at least 6 characters' });
    }
    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //Validation passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // User exists
                    errors.push({ msg: 'Email is already registered' });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    }); 
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    //Hash Password
                    bcrypt.genSalt(12, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) {
                                throw err;
                            }
                            //Set password to hashed
                            newUser.password = hash;
                            //Save user
                            newUser
                            .save()
                            .then(user => {
                                res.redirect('/user/login');
                            })
                            .catch(err => {
                                throw err;
                            })
                        })
                    })
                }
            })
            .catch(err => {
                throw err;
            });
    }

});

module.exports = router;