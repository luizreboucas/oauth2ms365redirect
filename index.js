const express = require('express');
const passport= require('passport');
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');

const MICROSOFT_GRAPH_CLIENT_ID = 'e8977818-584e-446a-a158-c668f36106fa';
const MICROSOFT_GRAPH_CLIENT_SECRET = '616cde65-1751-49e3-8568-7248b78b09a8';
const MICROSOFT_GRAPH_TENANT_ID = '336a1d34-4508-4a74-ac8a-d0e6becabf62';

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
    callbackURL: 'http://localhost:4000/auth/microsoft/callback',
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
        
        res.json(req, res);
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