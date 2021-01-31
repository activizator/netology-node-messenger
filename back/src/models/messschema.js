const { Schema, model } = require('mongoose');

const messSchema = new Schema({
    user: {
        type: String, required: true
    },
    message: {
        type: String, default: ''
    },
    dateTime: {
        type: Number, default: Date.now()
    }
});

module.exports = model('Messages', messSchema);
