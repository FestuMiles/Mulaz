const express = require('express');
const ejs = require('ejs');
require('dotenv').config(); // Load environment variables from .env file
const bodyParser = require('body-parser');
const session = require('express-session');
//Importing an object from the data.js file
const objects = require('./data.js');
const mongoose = require('mongoose');
const authentication = require('./authentication.js');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer'); // Import nodemailer module for sending emails
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
  tag: String,
  bestSell: Boolean,
  inStock: Boolean,
  desc: String
};

const categorySchema = {
  name: String,
  furnitures: [furnitureSchema]
};

const orderSchema = {
  customerName: String,
  customerEmail: String,
  customerNumber: String,
  date: String,
  orders: [String]
}


//Creating a model
const Furniture = mongoose.model('Furniture', furnitureSchema);

const Order = mongoose.model('Order', orderSchema);

const Category = mongoose.model('Category', categorySchema);

const price = 300;

const livingRoom = [];
const cart = [];

let message = 'none';


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
app.use(express.json()); // Parse JSON bodies


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

app.use('/update-furniture/css', express.static(__dirname + '/public/css'));
app.use('/update-furniture/Scripts', express.static(__dirname + '/public/Scripts'));
app.use('/update-furniture/icons', express.static(__dirname + '/public/icons'));
app.use('/update-furniture/images', express.static(__dirname + '/public/images'));

app.use('/update-user/css', express.static(__dirname + '/public/css'));
app.use('/update-user/Scripts', express.static(__dirname + '/public/Scripts'));
app.use('/update-user/icons', express.static(__dirname + '/public/icons'));
app.use('/update-user/images', express.static(__dirname + '/public/images'));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}));


app.get('/', (req, res) => {
  if(!req.session.cart){
    req.session.cart = [];
  }
  Category.find({}).then((categories) => {
    // let furnitures = []
    // categories.forEach((category)=>{
    //   furnitures = furnitures.concat(category.furnitures);
    // });
    // console.log(categories);
    res.render('index', {  bodycss: 'index.css', categories: categories });
  }).catch((err) => {
    console.log(err);
  });
  // Furniture.find({}).then((furniture) => {
  //   res.render('index', { bodycss: 'index.css', objects: furniture });
  // }).catch((err) => {
  //   console.log(err);
  // });

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
    // console.log(item);
    res.render('item', { item: item, bodycss: 'item.css', objectsId: req.params.objectsId, message: message });
    message = 'none'
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
    res.render('admin/manage-furnitures', {categoryId: req.params.categoryId, id: furnitures._id, name: furnitures.name, furnitures: furnitures.furnitures, bodycss: 'manage-furnitures.css'});
  });
});
app.get('/new-furniture/:categoryId', (req, res)=>{
  res.render('admin/add-furniture',{categoryId: req.params.categoryId, bodycss: 'add-furniture.css'});
});
app.get('/new-category', (req, res)=>{
  res.render('admin/add-category',{bodycss: 'add-furniture.css'});
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
      desc: req.body.desc,
      bestSell: req.body.bestSell,
      inStock: req.body.inStock
    })
    results.furnitures.push(item);
    results.save();
  });
  // res.send('Image uploaded successfully!');
  res.redirect('/category/'+req.params.categoryId);
});
const { ObjectId } = require('mongodb');
const { Console, profile } = require('console');

app.get('/del-furniture/:objectsId', (req, res) => {
  const ids = req.params.objectsId.split('+');
  const categoryId = new ObjectId(ids[1]);
  const itemId = new ObjectId(ids[0]);

  console.log('Category ID:', categoryId);
  console.log('Item ID:', itemId);

  Category.updateOne(
    { _id: categoryId },
    { $pull: { furnitures: { _id: itemId } } }
  ).then((result) => {
    console.log('Update result:', result);
    if (result.modifiedCount > 0) {
      res.redirect('/category/'+ids[1]);
    } else {
      res.status(404).send('Item not found');
    }
  }).catch((err) => {
    console.log(err);
    res.status(500).send('Error removing item');
  });
});
app.get('/del-category/:categoryId', (req,res)=>{
  Category.deleteOne({_id: req.params.categoryId}).then(()=>{
    res.redirect('/furniture-categories');
  }).catch((err)=>{
    console.log(err);
    res.status(500).send('Error deleting category');
  });
});
app.get('/update-furniture/:objectsId', (req,res)=>{
  const ids = req.params.objectsId.split('+');
  const categoryId = ids[1];
  const itemId = ids[0];

  console.log('Category ID:', categoryId);
  console.log('Item ID:', itemId);

  Category.findOne({_id: categoryId}).then((results)=>{
    const item = results.furnitures.find(obj => obj.id === itemId);
    console.log(item);
  res.render('admin/update-furniture', {bodycss: 'add-furniture.css', categoryId: categoryId, item: item});

  }).catch((err)=>{
    console.log(err);
    res.send('Item not found!');
  });
});

app.get('/add-to-order/:objectsId',(req,res)=>{
  const item = req.params.objectsId;
  if(!req.session.cart){
    req.session.cart = [];
  }
  req.session.cart.push(item);
  message = 'Added successfully!';
  res.redirect('/item/stock/'+item);
});

app.get('/remove-from-order/:objectsId',(req,res)=>{
  const item = req.params.objectsId;

  let index = req.session.cart.indexOf(item);

if (index !== -1) {
  req.session.cart.splice(index, 1);
}

  message = 'Removed successfully!';
  res.redirect('/order');
});

app.get('/order', (req, res) => {
  let total = 0;
  const furnitures = [];
  const list = req.session.cart;
  const promises = [];

  list.forEach((item) => {
    const ids = item.split('+');
    const categoryId = ids[1];
    const itemId = ids[0];

    const promise = Category.findOne({ _id: categoryId }).then((results) => {
      const items = results.furnitures;
      const object = items.find(item => item._id.toString() === itemId);
      furnitures.push(object);
      total += object.price;
    }).catch((err) => {
      console.log(err);
    });

    promises.push(promise);
  });

  Promise.all(promises).then(() => {
    res.render('order', { furnitures: furnitures, bodycss: 'order.css', total: total, message: message, list: list });
    message = 'none';
  }).catch((err) => {
    res.status(500).send('Error processing the order');
  });
});

app.get('/dash-board',(req,res)=>{
if(!req.session.credentials){
  res.send('Unauthorized! Please login.');
}
else{
  const name = req.session.credentials[0];
const pass = req.session.credentials[1];

authentication.authenticate(name, pass).then((authorize)=>{
  // console.log(authorize);
  if(authorize === 0){
    res.send('Unauthorized! Please login.');
  }
  if(authorize === 1){
    res.render('admin/dash', {bodycss: 'dash.css'});
  }
  if(authorize === 2){
    req.session.credentials = [name, pass, 0];
    Category.find({}).then((categories)=>{
      res.render('admin/furniture-categories', {categories: categories, bodycss: 'furniture-categories.css'});
    });
  }
  if(authorize === -1){
    res.send('Incorrect Password! Try Again.');
  }
});
}
});

app.get('/users', (req,res)=>{
  if(!req.session.credentials){
    res.send('Unauthorized! Please login.');
  }
  else{
    const name = req.session.credentials[0];
  const pass = req.session.credentials[1];
  
  authentication.authenticate(name, pass).then((authorize)=>{
    // console.log(authorize);
    if(authorize === 0){
      res.send('Unauthorized! Please login.');
    }
    if(authorize === 1){
      authentication.getUsers().then((users)=>{
        // console.log(users);
      res.render('admin/users', {bodycss: 'users.css', users: users});

      })
    }
    if(authorize === -1){
      res.send('Incorrect Password! Try Again.');
    }
  });
  }
});

app.get('/new-user', (req, res)=>{
  if(!req.session.credentials){
    res.send('Unauthorized! Please login.');
  }
  else{
    const name = req.session.credentials[0];
  const pass = req.session.credentials[1];
  
  authentication.authenticate(name, pass).then((authorize)=>{
    // console.log(authorize);
    if(authorize === 0){
      res.send('Unauthorized! Please login.');
    }
    if(authorize === 1){
      
      res.render('admin/add-user', {bodycss: 'add-user.css'});

    }
    if(authorize === -1){
      res.send('Incorrect Password! Try Again.');
    }
  });
  }
});

app.get('/del-user/:userId', (req, res)=>{
  if(!req.session.credentials){
    res.send('Unauthorized! Please login.');
  }
  else{
    const name = req.session.credentials[0];
  const pass = req.session.credentials[1];
  
  authentication.authenticate(name, pass).then((authorize)=>{
    // console.log(authorize);
    if(authorize === 0){
      res.send('Unauthorized! Please login.');
    }
    if(authorize === 1){
      
      authentication.delUser(req.params.userId).then((success)=>{
        res.redirect('/users');
      }).catch((error)=>{
        console.log(error);
        res.send('Ooops! An error occured!');
      });

    }
    if(authorize === -1){
      res.send('Incorrect Password! Try Again.');
    }
  });
  }
});

app.get('/update-user/:userId', (req, res)=>{
  if(!req.session.credentials){
    res.send('Unauthorized! Please login.');
  }
  else{
    const name = req.session.credentials[0];
  const pass = req.session.credentials[1];
  
  authentication.authenticate(name, pass).then((authorize)=>{
    // console.log(authorize);
    if(authorize === 0){
      res.send('Unauthorized! Please login.');
    }
    if(authorize === 1){
      
      authentication.getUser(req.params.userId).then((user)=>{
        console.log('User to be Updated:');
        console.log(user);
        console.log('userId:');
        console.log(user._id);
        res.render('admin/update-user', {bodycss: 'add-user.css', user: user});
      });
    }
    if(authorize === -1){
      res.send('Incorrect Password! Try Again.');
    }
  });
  }
});

app.get('/my-profile', (req, res)=>{
  if(!req.session.credentials){
    res.send('Unauthorized! Please login.');
  }
  else{
    const name = req.session.credentials[0];
    const pass = req.session.credentials[1];
  
  authentication.authenticate(name, pass).then((authorize)=>{
    // console.log(authorize);
    if(authorize === 0){
      res.send('Unauthorized! Please login.');
    }
    if(authorize === 1 || authorize === 2){
      authentication.getUser1(name).then((user)=>{
        res.render('admin/my-profile',{bodycss: 'my-profile.css', user: user})
      });
      

    }
    if(authorize === -1){
      res.send('Incorrect Password! Try Again.');
    }
  });
  }
});

app.get('/logout', (req,res)=>{
  req.session.credentials = [];
  res.render('admin/login',{bodycss: 'login.css'});
});


app.post('/update-user', (req, res)=>{
  const name = req.body.name;
  const userName = req.body.userName;
  const email = req.body.email;
  let admin = false;
  const userId = req.body.userId;

  if(req.body.level === 'admin'){
    admin = true;
  }

  const user = {
    name: name,
    userName: userName,
    email: email,
    admin: admin,
    userId: userId
  }

  authentication.updateUser(user).then((result)=>{
    console.log(result);
    res.redirect('/users');
  });
});

app.post('/add-user', (req, res)=>{
  let admin = false;

  if(req.body.level === 'admin'){
    admin = true;
  }

  const name = req.body.name;
  const userName = req.body.userName;
  const email = req.body.email;
  const password = req.body.password;

  const user = {
    name: name,
    userName: userName,
    email: email,
    password: password,
    admin: admin
  }
  authentication.createUser(user).then((result)=>{
    console.log(result);
    if(result === 1){
      // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
      }
  });

  // Set up email data
  const mailOptions = {
      from: 'www.festusmiles@gmail.com',
      to: email,
      subject: `Mulaz.com Account Created`,
      text: `Dear ${name}, \nYour Mulaz account has been created successfully. Find below the login credentials.\nUser Name: ${userName} \nPassword: ${password} \nPlease update your password for security reasons.\nClick here: https://localhost:3000/admin`
  };

  console.log(mailOptions);


  // Send mail with defined transport object
  transporter.sendMail(mailOptions).then(() => {
      console.log('Mail sent successfully!');
      // res.send('Successfully created account!');
      res.redirect('/users');
  }).catch((err) => {
      console.log(err);
      res.status(404).send('Account not created! Try Again.');
  });
    }else if(result === 0){
      res.send('User Already Exist!');
    }else{
      res.send('Unable to create user! Try Again.')
    }
  });
    
});

app.post('/update-furniture', (req, res) => {
  const categoryId = req.body.categoryId;
  const itemId = req.body.furnitureId;
  const name = req.body.name;
  const price = req.body.price;
  const desc = req.body.desc;
  const bestSell = req.body.bestSelling;
  const inStock = req.body.inStock;


  console.log('CategoryId:', categoryId);
  console.log('ItemId:', itemId);
  console.log('Name:', name);
  console.log('Price:', price);
  console.log('Desc:', desc);

  const filter = { _id: categoryId, 'furnitures._id': itemId };
  const update = {
    $set: {
      'furnitures.$.name': name,
      'furnitures.$.price': price,
      'furnitures.$.priceTag': 'K' + price,
      'furnitures.$.inStock': inStock,
      'furnitures.$.bestSell': bestSell,
    }
  };

  console.log('Filter:', filter);
  console.log('Update:', update);

  Category.updateOne(filter, update)
    .then((result) => {
      console.log('Update result:', result);
      res.redirect('/category/' + categoryId);
    })
    .catch((err) => {
      console.log('Error updating item:', err);
      res.status(500).send('Error updating item');
    });
});

app.post('/add-category', (req,res)=>{
  const newCategory = new Category({
    name: req.body.name,
    furnitures: []
  });
    newCategory.save();
    res.redirect('/furniture-categories');
});
app.post('/login', (req, res)=>{
  const name = req.body.userName;
  const pass = req.body.password;
  authentication.authenticate(name, pass).then((authorize)=>{
    
    // console.log(authorize);
    if(authorize === 0){
      res.send('User not found!');
    }
    if(authorize === 1){
      req.session.credentials = [name, pass,1];
      res.render('admin/dash', {bodycss: 'dash.css'});
    }
    if(authorize === 2){
      req.session.credentials = [name, pass, 0];
      Category.find({}).then((categories)=>{
        // categories.forEach((category)=>{
        //   console.log(category.name);
        // });
        res.render('admin/furniture-categories', {categories: categories, bodycss: 'furniture-categories.css'});
      });
      // res.render('admin/furniture-categories', {bodycss: 'furniture-categories.css'});
    }
    if(authorize === -1){
      res.send('Incorrect Password! Try Again.');
    }
  });
});

app.post('/submit-order', (req, res)=>{
  const customerName = req.body.name;
  const customerEmail = req.body.email;
  const customerNumber = req.body.phone;
  const cart = req.session.cart;
  console.log(cart);

  const newOrder = new Order({
    customerName: customerName,
    customerEmail: customerEmail,
    customerNumber: customerNumber,
    date: new Date().toLocaleDateString(),
    orders: cart
  });

  console.log(newOrder);
  
});

// const categoryId = req.body.categoryId;
// const itemId = req.body.furnitureId;
// const inStock = true;
// const bestSell = true;
// const desc = "Features: Material: Upholstered in high-quality, soft velvet fabric for a luxurious feel. Color Options: Available in Emerald Green, Royal Blue, Charcoal Gray, and Classic Beige. Frame: Sturdy hardwood frame for durability and longevity. Cushions: High-density foam cushions with pocketed coils provide exceptional comfort and support. Design: Sleek, modern silhouette with tufted backrest and polished brass legs. Dimensions: 84\" W x 35\" D x 34\" H, offering ample seating space for 3-4 people. Additional Features: Removable and washable cushion covers for easy maintenance.";

// const filter = { _id: "67980459bc469907ec1a56e8", 'furnitures._id': "6797fa8ec451f95b4141918a" };
// const update = {
//   $set: {
//     'furnitures.$.inStock': true,
//     'furnitures.$.desc': desc,
//     'furnitures.$.bestSell': true
//   }
// };

// console.log('Filter:', filter);
// console.log('Update:', update);

// Category.updateOne(filter, update)
//   .then((result) => {
//     console.log('Update result:', result);
//     // res.redirect('/category/' + categoryId);
//   })
//   .catch((err) => {
//     console.log('Error updating item:', err);
//     // res.status(500).send('Error updating item');
//   });









const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});