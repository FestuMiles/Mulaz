const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
//Importing an object from the data.js file
const objects = require('./data.js');
const mongoose = require('mongoose');
const authentication = require('./authentication.js');
const multer = require('multer');
const path = require('path');
let imageName = '';

const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, path.join(__dirname, 'public/images'));
  },
  filename: (req, file, cb)=>{
    console.log(file);

    imageName = Date.now() + path.extname(file.originalname);
    console.log(imageName);
    cb(null, imageName);
  }
});

const upload = multer({storage: storage});

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

const categorySchema = {
  name: String,
  furnitures: [furnitureSchema]
};



//Creating a model
const Furniture = mongoose.model('Furniture', furnitureSchema);

const Category = mongoose.model('Category', categorySchema);

const price = 300;

const livingRoom = [];

// Furniture.find({tag: 'final'}).then((results) => {
//   results.forEach((result) => {
//     console.log(result);
//     livingRoom.push(result);
//   });
//   const newCategory = new Category({
//     name: 'Final Detail',
//     furnitures: livingRoom
//   });
//   newCategory.save();
// }).catch((err) => {
//   console.log(err);
// });







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

// Ensure the correct paths for static files
app.use('/item/stock/css', express.static(__dirname + '/public/css'));
app.use('/item/stock/Scripts', express.static(__dirname + '/public/Scripts'));
app.use('/item/stock/icons', express.static(__dirname + '/public/icons'));
app.use('/item/stock/images', express.static(__dirname + '/public/images'));

app.use('/category/css', express.static(__dirname + '/public/css'));
app.use('/category/Scripts', express.static(__dirname + '/public/Scripts'));
app.use('/category/icons', express.static(__dirname + '/public/icons'));
app.use('/category/images', express.static(__dirname + '/public/images'));

app.use('/new-furniture/css', express.static(__dirname + '/public/css'));
app.use('/new-furniture/Scripts', express.static(__dirname + '/public/Scripts'));
app.use('/new-furniture/icons', express.static(__dirname + '/public/icons'));
app.use('/new-furniture/images', express.static(__dirname + '/public/images'));

app.get('/', (req, res) => {
  Furniture.find({}).then((furniture) => {
    res.render('index', { bodycss: 'index.css', objects: furniture });
  }).catch((err) => {
    console.log(err);
  });
  // res.render('index', { bodycss: 'index.css', objects: objects });
});

app.get('/explore', (req, res) => {
  Category.find({}).then((categories) => {
    res.render('explore', { bodycss: 'explore.css', categories: categories });
  }).catch((err) => {
    console.log(err);
  });
    // res.render('explore', { bodycss: 'explore.css' });
    }
);

app.get('/about', (req, res) => {
    res.render('about', { bodycss: 'about.css' });
    }
);

app.get('/item/stock/:objectsId', (req, res)=>{
  const ids = req.params.objectsId.split('+');
  const categoryId = ids[1];
  const itemId = ids[0];
  Category.findOne({_id: categoryId}).then((results)=>{
    // console.log(results);
    const items = results.furnitures;
    const item = items.find(item => item._id.toString() === itemId);
    console.log(item);
    res.render('item', { item: item, bodycss: 'item.css' });
    // console.log(item);
  }).catch((err)=>{
    console.log(err);
    res.status(404).send('Item not found');
  });
  // Furniture.findOne({_id: req.params.itemId}).then((result)=>{
  //   console.log(req.params.categoryId);
  //   console.log(result);
  //   res.render('item', {item: result, bodycss: 'item.css'});
  // }).catch((err) => {
  //   console.log(err);
  //   res.status(404).send('Item not found');
  // });
});

app.get('/admin', (req, res)=>{
  res.render('admin/login',{bodycss: 'login.css'});
});

app.get('/category/:categoryId', (req, res)=>{
  Category.findOne({_id: req.params.categoryId}).then((furnitures)=>{
    console.log(furnitures.furnitures);
    res.render('admin/manage-furnitures', {id: furnitures._id, name: furnitures.name, furnitures: furnitures.furnitures, bodycss: 'manage-furnitures.css'});
  });
});
app.get('/new-furniture/:categoryId', (req, res)=>{
  res.render('admin/add-furniture',{categoryId: req.params.categoryId, bodycss: 'add-furniture.css'});
});
app.get('/furniture-categories', (req, res)=>{
  Category.find({}).then((categories)=>{
    // categories.forEach((category)=>{
    //   console.log(category.name);
    // });
    res.render('admin/furniture-categories', {categories: categories, bodycss: 'furniture-categories.css'});
  });
});

app.post('/add-furniture/:categoryId', upload.single('image'), (req, res)=>{
  Category.findOne({_id: req.params.categoryId}).then((results)=>{
    console.log(results);
    const item = new Furniture({
      name: req.body.name,
      price: req.body.price,
      priceTag: 'K' + req.body.price,
      imageUrl: 'images/'+imageName,
      tag: 'default'
  
    })
    results.furnitures.push(item);
    results.save();
  });
  res.send('Image uploaded successfully!');
});
app.post('/login', (req, res)=>{
  
  authentication.authenticate(req.body.userName, req.body.password).then((authorize)=>{
    // console.log(authorize);
    if(authorize === 0){
      res.send('User not found!');
    }
    if(authorize === 1){
      res.render('admin/dash', {bodycss: 'dash.css'});
    }
    if(authorize === -1){
      res.send('Incorrect Password! Try Again.');
    }
  });
  
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});