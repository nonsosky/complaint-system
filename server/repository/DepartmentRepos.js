const CrudRepository = require('../crud/CrudRepository');

class DepartmentRepos extends CrudRepository {
    constructor(){
        super('department', null);
    }
}

module.exports = new DepartmentRepos();