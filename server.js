const express = require('express');
const app = express();
const server = app.listen(9000);
const io = require('socket.io')(server);
var path = require("path");
var bodyParser = require('body-parser');
var session = require('express-session');
const flash = require('express-flash')
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/QuoteSchema', {
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;

app.use(express.static(__dirname + "/static"));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "Over 9000",
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 60000
    }
}))

var QuoteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2
    },
    quote: {
        type: String,
        required: true,
        minlength: 1
    },
}, {
    timestamps: true
})
mongoose.model('Quote', QuoteSchema);
var Quote = mongoose.model('Quote');



app.get('/', (req, res) => {
    res.render('index')
})


app.get('/quotes', (req, res) => {
    Quote.find({}, (err, quotes) => {
        if (err) {
            console.log('error!!!!', err)
        } else {
            console.log(quotes)
            res.render('quotes', {
                quotes: quotes
            })
        }
    })
})


app.post('/quotes/process', (req, res) => {
    console.log('POST DATA', req.body);
    var quotes = new Quote({
        name: req.body.name,
        quote: req.body.quote,
    }, {
        timestamps: req.body.createdAt
    });
    quotes.save((err) => {
        if (err) {
            console.log('something went wrong', err)
            for (var key in err.errors) {
                req.flash('reg', err.errors[key].message)
            }
            res.redirect('/')
        } else {
            console.log('successfully added a quote')
            res.redirect('/quotes')
        }

    })
})