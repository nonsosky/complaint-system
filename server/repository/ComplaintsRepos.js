const CrudRepository = require('../crud/CrudRepository');

class ComplaintsRepos extends CrudRepository {
    constructor(){
        super('complaints', null);
    }
}

module.exports = new ComplaintsRepos();