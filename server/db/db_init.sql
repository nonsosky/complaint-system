DROP DATABASE IF EXISTS `complaint-system`;

CREATE DATABASE `complaint-system`;

CREATE TABLE `department` (
    `id`   INT(3) AUTO_INCREMENT,
    `dept_name`   VARCHAR(30) NOT NULL,

    CONSTRAINT `department_PK` PRIMARY KEY (`id`)
);

CREATE TABLE `student` (
    `id`  INT(3) AUTO_INCREMENT,
    `lastName`  VARCHAR(30) NOT NULL,
    `firstName`   VARCHAR(30) NOT NULL,
    `middleName`  VARCHAR(30),
    `gender`  VARCHAR(6),
    `emailAddress`    VARCHAR(40) UNIQUE,
    `password`    CHAR(60),
    `dob`     DATE,
    `matric_no`   VARCHAR(30),
    `pictureDir`  VARCHAR(100),
    `dept_id`   INT(3),
    `user_type` INT(3) DEFAULT 1,


    CONSTRAINT `student_pk` PRIMARY KEY (`id`),
    CONSTRAINT `student_dept_FK` FOREIGN KEY (`dept_id`) REFERENCES `department` (`id`) 
);

CREATE TABLE `complaints` (
    `id`   INT(3) AUTO_INCREMENT,
    `complaint`   VARCHAR(500) NOT NULL,
    `createdAt`    DATE,
    `status`      BOOLEAN DEFAULT FALSE,
    `student_id`  INT(3),

    CONSTRAINT `complaints_pk` PRIMARY KEY (`id`),
    CONSTRAINT `complaints_student_FK` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`)
);

CREATE TABLE `admin` (
    `id`    INT(3) AUTO_INCREMENT,
    `emailAddress`    VARCHAR(30),
    `password`      CHAR(60),
    `pictureDir`    VARCHAR(100),
    `user_type` INT(3) DEFAULT 0,

    CONSTRAINT `admin_pk` PRIMARY KEY (`id`)
);

CREATE TABLE `post` (
    `id`   INT(3) AUTO_INCREMENT,
    `createdAt` DATE,
    `reply`     VARCHAR(500),
    `complaint_id`  INT(3),
    `student_id`    INT(3),
    `admin_id`      INT(3),
    `user_type`     INT(3) DEFAULT 0,

    CONSTRAINT `post_pk` PRIMARY KEY (`id`),
    CONSTRAINT `post_complaints_FK` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`),
    CONSTRAINT `post_student_FK` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`),
    CONSTRAINT `post_admin_FK` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`)
);


INSERT INTO `department` (`dept_name`) 
VALUES("computer science"), ("public administration");

INSERT INTO `student` (`lastName`, `firstName`, `middleName`, `gender`, `emailAddress`, `password`, `dob`, `matric_no`, `pictureDir`, `dept_id`) 
VALUES("okpara", "kenneth", "chinonso", "male", "nonsoskyokpara@gmail.com", "nonsosky", "1995-07-06", "2017/HND/CST/76849", "", 1),
     ("Iwuji", "Jude", "U.", "male", "jude@gmail.com", "00000", "1995-07-06", "2017/HND/CST/77102", "", 1);

-- Store admin data into DB
INSERT INTO `admin` (`emailAddress`,`password`)
VALUES ('nonsosky@gmail.com',00000);

-- Store complaint data into DB
INSERT INTO `complaints` (`createdAt`, `student_id`, `complaint`)
VALUES ("2019-03-03", 1, "Cult threat"),
       ("2019-03-04", 2, "Handout over payment");

-- Store post data into db
-- Note user_type = 0 (admin) user_type = 1 (student)
INSERT INTO `post` (`createdAt`, `student_id`, `admin_id`, `reply`, `complaint_id`, `user_type`)
VALUES ("2019-03-03", 1, 1, "Is it around school premises?", 1, 0),
       ("2019-03-03", 1, 1, "Yes", 1, 1);

