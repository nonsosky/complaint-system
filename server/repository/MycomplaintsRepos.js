const CrudRepository = require('../crud/CrudRepository');

class MycomplaintsRepos extends CrudRepository {
    constructor(){
        super('complaints', null);
    }
}

module.exports = new MycomplaintsRepos();