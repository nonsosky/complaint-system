const CrudRepository = require('../crud/CrudRepository');

class PostRepos extends CrudRepository {
    constructor(){
        super('post', null);
    }
}

module.exports = new PostRepos();