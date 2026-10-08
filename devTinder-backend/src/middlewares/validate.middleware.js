// Runs a validator (a function that throws ApiError on bad input) before
// the controller, so controllers only ever see validated requests.
// Express 5 forwards anything thrown here to the error middleware.
const validate = (validator) => (req, res, next) => {
    validator(req);
    next();
}

module.exports = validate;
