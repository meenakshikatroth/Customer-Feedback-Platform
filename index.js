require('dotenv').config();

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
    }, (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    })
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));


const buttonStyle = `
    display: inline-block;
    padding: 10px 20px;
    margin: 10px;
    font-size: 16px;
    text-decoration: none;
    background-color: #4CAF50;
    color: white;
    border-radius: 5px;
    transition: background-color 0.3s;
`;
const hoverScript = `
    <script>
        const buttons = document.querySelectorAll("a.button");
        buttons.forEach(btn => {
            btn.addEventListener("mouseover", () => btn.style.backgroundColor = "#45a049");
            btn.addEventListener("mouseout", () => btn.style.backgroundColor = "#4CAF50");
        });
    </script>
`;


app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`
            <h2>Welcome back, ${req.user.displayName}!</h2>
            <a href="/profile" class="button" style="${buttonStyle}">Go to Profile</a>
            <a href="/logout" class="button" style="${buttonStyle}">Logout</a>
            ${hoverScript}
        `);
    } else {
        res.send(`
            <a href="/auth/google" class="button" style="${buttonStyle}">Login with Google</a>
            ${hoverScript}
        `);
    }
});


app.get("/auth/google", passport.authenticate('google', { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
    passport.authenticate('google', { failureRedirect: "/" }),
    (req, res) => {
        res.redirect('/profile');
    }
);


app.get("/profile", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send(`
        <h2>Welcome, ${req.user.displayName}</h2>
        <a href="/logout" class="button" style="${buttonStyle}">Logout</a>
        ${hoverScript}
    `);
});


app.get("/logout", (req, res) => {
    req.logOut(() => {
        res.redirect("/");
    });
});

app.listen(3000, () => {
    console.log(`Server is running at http://localhost:3000`);
});

