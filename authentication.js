const bcrypt = require('bcryptjs');
const { name } = require('ejs');
const mongoose = require('mongoose');

//Connecting to the database
// mongoose.connect('mongodb://localhost:27017/furnitureDB');

const userSchema = {
    userName: String,
    name: String,
    email: String,
    admin: Boolean,
    password: String
};

const User = new mongoose.model('User', userSchema);

function createUser(newUser) {
    try {
       bcrypt.hash(newUser.password,10, (err, hash)=>{
        const user = new User({
            userName: newUser.userName,
            name: newUser.name,
            email: newUser.email,
            admin: newUser.admin,
            password: hash
        });
        user.save();
       });
    } catch (error) {
        console.log(error);
    }
};
// createUser();

async function authenticate(user, userPassword) {
    try {
        const foundUser = await User.findOne({ userName: user });
        if (!foundUser) {
            return 0;
        }

        const response = await bcrypt.compare(userPassword, foundUser.password);
        if (response === true) {
            return 1;
        } else {
            return -1;
        }
    } catch (error) {
        console.log(error);
        return 'error';
    }
};

async function getUsers(){
    try {
        const users = await User.find({});
        return users;
    } catch (error) {
        
    }
}

// authenticate('admin', 'admin1').then(result => console.log(result));

module.exports = {
    createUser,
    authenticate,
    getUsers
};
