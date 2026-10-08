const express = require('express');
const router = express.Router();
const authRouter = require('./auth.routes');
const profileRouter = require('./profile.routes');
const requestRouter = require('./request.routes');
const userRouter = require('./user.routes');

// used by load balancers / uptime checks
router.get('/health', (req, res) => {
    res.status(200).json({ status: "ok" });
});

router.use('/', authRouter);
router.use('/profile', profileRouter);
router.use('/request', requestRouter);
router.use('/user', userRouter);

module.exports = router;
