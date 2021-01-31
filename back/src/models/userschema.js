const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    user: {
        type: String, required: true, unique: true
    }
});

module.exports = model('Users', userSchema);
