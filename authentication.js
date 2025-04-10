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

async function createUser(newUser) {
    const result = await User.find({userName: newUser.userName});
    
    if (result.length === 1) {
        console.log(result.length);
        return 0;
    } else {
        try {
            const hash = await bcrypt.hash(newUser.password, 10);
            const user = new User({
                userName: newUser.userName,
                name: newUser.name,
                email: newUser.email,
                admin: newUser.admin,
                password: hash
            });
            await user.save();
            console.log('Success!');
            return 1;
        } catch (error) {
            console.log(error);
            return -1;
        }
    }
}
// createUser();

async function authenticate(user, userPassword) {
    try {
        const foundUser = await User.findOne({ userName: user });
        if (!foundUser) {
            return 0;
        }

        const response = await bcrypt.compare(userPassword, foundUser.password);
        if (response === true) {
            if(foundUser.admin){
                return 1;
            }
            return 2;
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
        console.log(error);
        return 0;
    }
}

async function getUser(userId){
    try {
        const user = await User.findOne({_id: userId});
        console.log(user)
        return user;
    } catch (error) {
        console.log(error);
        return 0;
    }
}
async function getUser1(userName){
    try {
        const user = await User.findOne({userName: userName});
        console.log(user)
        return user;
    } catch (error) {
        console.log(error);
        return 0;
    }
}

async function delUser(userId){
    try {
        await User.deleteOne({_id: userId}).then(()=>{
            return 1;
        });
    } catch (error) {
        console.log(error);
        return 0;
    }
}

async function updateUser(user) {
    console.log(user.userId);
    try {
        await User.updateOne({ _id: user.userId }, {
            name: user.name,
            userName: user.userName,
            email: user.email,
            admin: user.admin
        });
        return 1;

    } catch (error) {
        console.log(error);
        return 0;
    }
}


async function updatePass(user){
    
}

// authenticate('admin', 'admin1').then(result => console.log(result));

module.exports = {
    createUser,
    authenticate,
    getUsers,
    getUser,
    getUser1,
    delUser,
    updateUser
};
