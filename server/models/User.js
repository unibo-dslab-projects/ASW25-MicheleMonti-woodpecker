const mongoose = require('mongoose');

const userSubSchema = new mongoose.Schema({
    username: String,
    password_hash: String
}, { _id: false });

const usersCollectionSchema = new mongoose.Schema({
    users: [userSubSchema]
}, { 
    collection: 'users',
    versionKey: false
});

module.exports = mongoose.model('UsersCollection', usersCollectionSchema);