const authService = require('../services/auth.service');
const { TOKEN_COOKIE_NAME } = require('../config/cookie');

// Gate for protected routes: resolves the token cookie to a user and
// attaches it as req.user. Any failure is reported as 401 by the error middleware.
const peopleAuth = async (req, res, next) => {
    req.user = await authService.getUserFromToken(req.cookies?.[TOKEN_COOKIE_NAME]);
    next();
}

module.exports = {
    peopleAuth
}
