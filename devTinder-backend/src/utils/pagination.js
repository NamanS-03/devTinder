const { PAGINATION } = require("../constants");

// turns ?page=&limit= into safe numbers; bad or out of range values fall
// back to the defaults instead of erroring
const getPagination = (query = {}) => {
    let page = parseInt(query.page, 10);
    let limit = parseInt(query.limit, 10);

    if(!Number.isInteger(page) || page < 1) {
        page = PAGINATION.DEFAULT_PAGE;
    }
    if(!Number.isInteger(limit) || limit < 1) {
        limit = PAGINATION.DEFAULT_LIMIT;
    }
    limit = Math.min(limit, PAGINATION.MAX_LIMIT);

    return {
        page,
        limit,
        skip: (page - 1) * limit
    };
}

module.exports = {
    getPagination
}
