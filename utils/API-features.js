
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString
    }

    /* URL contains page*/
    paginate() {
        const limit = 6
        const parsedPage = parseInt(this.queryString.page)
        const page = !isNaN(parsedPage) && parsedPage > -1
            ? parsedPage
            : 1;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        this.page = page;
        this.limit = limit;
        return this;
    }
    /* URL contains filter*/
    filter() {
        const queryObj = { ...this.queryString };

        const excludedFields = ['page', 'limit', 'sort'];
        excludedFields.forEach(el => delete queryObj[el]);

        if (queryObj.categories) {
            queryObj.categories = {
                $elemMatch: {
                    name: {
                        $in: queryObj.categories.split(',')
                    }
                }
            };
        }

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this
    }


}

module.exports = APIFeatures;