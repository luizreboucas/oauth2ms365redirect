const dotenv = require('dotenv').config()
const express = require('express');
const passport= require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');

const MICROSOFT_GRAPH_CLIENT_ID = process.env.MICROSOFT_GRAPH_CLIENT_ID;
const MICROSOFT_GRAPH_CLIENT_SECRET = process.env.MICROSOFT_GRAPH_CLIENT_SECRET;
const MICROSOFT_GRAPH_TENANT_ID = process.env.MICROSOFT_GRAPH_TENANT_ID;

console.log(process.env.MICROSOFT_GRAPH_CLIENT_ID)
passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((obj, done) => {
    done(null, obj);
})

passport.use(new MicrosoftStrategy({
    clientID : MICROSOFT_GRAPH_CLIENT_ID,
    clientSecret: MICROSOFT_GRAPH_CLIENT_SECRET,
    scope: ['user.read'],
    tenant: MICROSOFT_GRAPH_TENANT_ID,
    callbackURL: 'https://oauth2ms365redirect.onrender.com/auth/microsoft/callback',
    addUPNAsEmail: true
},
(accessToken, refreshToke, profile, done) => {
    process.nextTick(() => {
        return done(null, profile);
    })
}));

const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({
    secret: 'rwarw',
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req,res) => {
    res.render('index', {user: req.user})
})

app.get('/auth/microsoft', passport.authenticate('microsoft', {
    prompt: 'select_account'
}), (req,res) => {});

app.get('/auth/microsoft/callback', 
    passport.authenticate('microsoft', { failureRedirect: '/'}),
    (req, res) => {
        console.log('req => ',req)
        console.log('res =>',res)
        res.json({req: req.user});
    }
);
app.get('/profile', (req, res) => {
    // Ensure user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.redirect('/');
    }
    // Send the user information to your PHP application
    res.render('profile', { user: req.user });
});

app.listen(4000);

console.log('App running on http://localhost:4000');
