const express = require('express');
const router = express.Router();
const { MessSchema, UserSchema } = require('../../models');

const jsonParser = express.json()

router.get('/messages/', async (req, res) => {
    const messages = await MessSchema.find().select('-__v').limit(250).sort({_id:-1});
    res.json(messages.reverse());
});

router.post('/message/', jsonParser, async (req, res) => {
    const { user, message, dateTime } = req.body;
    const newMess = new MessSchema({ user, message, dateTime });
    try {
        await newMess.save();
        res.json(newMess);
    } catch (e) {
        console.error(e);
        res.status(500).json();
    }
});

router.post('/user/', jsonParser, async (req, res) => {
    const { user } = req.body;
    const newUser = new UserSchema({ user });
    try {
        await newUser.save();
        res.json(newUser);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "try another Username" });
    }
});

router.delete('/user/:user', async (req, res) => {
    const { user } = req.params;

    try {
        await UserSchema.deleteOne({ user });
        res.json(true);
    } catch (e) {
        console.error(e);
        res.status(500).json();
    }
});

module.exports = router;
