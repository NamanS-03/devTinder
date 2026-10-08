const authService = require('../services/auth.service');
const { TOKEN_COOKIE_NAME, tokenCookieOptions } = require('../config/cookie');

//-----------------------------------------SIGNUP CONTROLLER-------------------------------------------//
const signup = async (req, res) => {
    await authService.signup(req.body);

    res.status(201).json({
        message: "New User Added Successfully"
    })
}

//----------------------------------------LOGIN CONTROLLER--------------------------------------------//
const login = async (req, res) => {
    const { user, token } = await authService.login(req.body);

    res.cookie(TOKEN_COOKIE_NAME, token, tokenCookieOptions);
    res.status(200).json({
        message: user.firstName + " Logged In Successfully.",
        data: user
    })
}

//----------------------------------------LOGOUT CONTROLLER-------------------------------------------//
const logout = async (req, res) => {
    // Best-effort identification of who's logging out, purely for the
    // message. An expired/missing/invalid token must never block logout
    // itself, since clearing the cookie has to always succeed.
    let loggedInUserName = "User";
    try {
        const user = await authService.getUserFromToken(req.cookies?.[TOKEN_COOKIE_NAME]);
        loggedInUserName = user.firstName;
    } catch (err) {
        // ignored on purpose - see above
    }

    // clearCookie needs the same options the cookie was set with (minus maxAge)
    const { maxAge, ...clearOptions } = tokenCookieOptions;
    res.clearCookie(TOKEN_COOKIE_NAME, clearOptions);

    res.status(200).json({
        message: loggedInUserName + " Logged Out Successfully."
    })
}

module.exports = {
    signup,
    login,
    logout
}
