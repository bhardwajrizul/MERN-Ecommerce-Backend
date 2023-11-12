
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString
    }
    // populate(field, select = '') {
    //     this.query = this.query.populate(field, select);
    //     return this;
    // }

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

    filter() {
        const queryObj = { ...this.queryString };

        // Exclude fields that are not part of the filter
        const excludedFields = ['page', 'limit', 'sort', 'searchQuery'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Filter based upon selected categories 
        if (queryObj['categories']) {
            const categories = queryObj['categories'].split(',');
            this.query = this.query.find({ 'categories.name': { $in: categories } });
            delete queryObj['categories']
        }
        
        // Convert query object to a string for manipulation
        let queryStr = JSON.stringify(queryObj);

        // Replace MongoDB operators gte, gt, lte, lt
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // Apply initial filtering
        this.query = this.query.find(JSON.parse(queryStr));

        // Implement AND-based search if searchQuery is provided
        if (this.queryString.searchQuery) {
            const searchTerms = this.queryString.searchQuery.split(' ');
            const searchConditions = searchTerms.map(term => {
                const regex = new RegExp(term, 'i');
                return {
                    $or: [
                        { name: { $regex: regex } },
                        { 'categories.name': { $regex: regex } },
                        { 'categories.subcategories': { $regex: regex } }
                    ]
                };
            });

            // Apply the search conditions using $and
            this.query = this.query.find({ $and: searchConditions });
        }

        return this;
    }

}



module.exports = APIFeatures;