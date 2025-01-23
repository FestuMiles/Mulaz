const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
//Importing an object from the data.js file
const objects = require('./data.js');


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', { bodycss: 'index.css', objects: objects });
});

app.get('/explore', (req, res) => {
    res.render('explore', { bodycss: 'explore.css' });
    }
);

app.get('/about', (req, res) => {
    res.render('about', { bodycss: 'about.css' });
    }
);



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});