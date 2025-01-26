const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
//Importing an object from the data.js file
const objects = require('./data.js');
const mongoose = require('mongoose');

//Connecting to the database
mongoose.connect('mongodb://localhost:27017/furnitureDB');

//Creating a schema
const furnitureSchema = {
  name: String,
  price: Number,
  priceTag: String,
  imageUrl: String,
  tag: String
};



//Creating a model
const Furniture = mongoose.model('Furniture', furnitureSchema);

const price = 300;

// const furniture = new Furniture({
//   name: 'Name of Furniture',
//   price: price,
//   priceTag: 'K' + price + '.00',
//   imageUrl: 'images/1.jpg',
//   tag: 'best-selling'
// });
// furniture.save();

// objects.forEach((object) => {
//   const furniture = new Furniture({
//     name: object.name,
//     price: object.price,
//     priceTag: object.priceTag,
//     imageUrl: object.imageUrl,
//     tag: object.tag
//   });
//   furniture.save();
// });

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  Furniture.find({}).then((furniture) => {
    res.render('index', { bodycss: 'index.css', objects: furniture });
  }).catch((err) => {
    console.log(err);
  });
  // res.render('index', { bodycss: 'index.css', objects: objects });
});

app.get('/explore', (req, res) => {
  Furniture.find({}).then((furniture) => {
    res.render('explore', { bodycss: 'explore.css', objects: furniture });
  }).catch((err) => {
    console.log(err);
  });
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