const CrudRepository = require('../crud/CrudRepository');

class StudentRepos extends CrudRepository {
    constructor(){
        super('student', null);
    }
}

module.exports = new StudentRepos();