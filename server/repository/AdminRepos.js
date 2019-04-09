const CrudRepository = require('../crud/CrudRepository');

class AdminRepos extends CrudRepository {
    constructor(){
        super('admin', null);
    }
}

module.exports = new AdminRepos();