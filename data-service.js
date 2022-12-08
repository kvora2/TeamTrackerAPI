// const fs = require('fs');
// const { resolve } = require('path');
// var employees, departments; // declaring global emp and depart variables
const e = require('express');
const Sequelize = require('sequelize');

var sequelize = new Sequelize('hzuhrafk', 'hzuhrafk', 'oCB59viJeMZ6FyO7FHhAS0T0oi0Xmvy1', {
    host: 'hansken.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

sequelize.authenticate().then(() => console.log('Connection success.'))
    .catch((err) => console.log("Unable to connect to DB.", err));

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
}, {createdAt: false, updatedAt: false});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
}, {createdAt: false, updatedAt: false});

// Department.hasMany(Employee);

// In the below function, employees and departments var will be populated if the files are readable
exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(resolve()).catch(
            reject("unable to sync the database")
        )
    })
}

// Getting all of the employees
exports.getAllEmployees = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            Employee.findAll().then(function (data) {
                resolve(data);
            }).catch(() => {
                reject("no results returned");
            })
        })
    })
}

// Getting all of the managers among employees
exports.getManagers = () => {
    return new Promise((resolve, reject) => {
        reject();
    })
}

// Getting all the departments
exports.getDepartments = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
        Department.findAll().then(function (data) {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        })
    })
})
}

exports.addEmployee = (empData) => {
    return new Promise((res, rej) => {
        empData.isManager = (empData.isManager) ? true : false;
        for (var prop in empData) {
            if (prop == "") {
                prop = NULL;
            }
        }
        sequelize.sync().then(function () {
        Employee.create( empData ).then((data) => {
            res(data)
        }).catch(() => {
            rej("unable to create employee")
        })
        console.log(empData.firstName);
    })
    })
}

exports.getEmployeesByStatus = (status) => {
    return new Promise((res, rej) => {
        sequelize.sync().then(function () {
        Employee.findAll({
            where: {
                status: status
            }
        }).then(function (data) {
            res(data);
        }).catch(() => {
            rej("no results returned")
        })
    })
    })
}

exports.getEmployeesByDepartment = (department) => {
    return new Promise((res, rej) => {
        sequelize.sync().then(function () {
        Employee.findAll({
            where: {
                department: department
            }
        }).then(function (data) {
            res(data);
        }).catch(() => {
            rej("no results returned")
        })
    })
    })
}

exports.getEmployeesByManager = (manager) => {
    return new Promise((res, rej) => {
        sequelize.sync().then(function () {
        Employee.findAll({
            where: {
                employeeManagerNum: manager
            }
        }).then(function (data) {
            res(data);
        }).catch(() => {
            rej("no results returned")
        })
    })
    })
}

exports.getEmployeeByNum = (num) => {
    return new Promise((res, rej) => {
        sequelize.sync().then(function () {
        Employee.findAll({
            where: {
                employeeNum: num
            }
        }).then(function (data) {
            console.log("-------");
            console.log(data);
            res(data);
        }).catch(() => {
            rej("no results returned")
        })
    })
    })
}

exports.updateEmployee = (employeeData) => {
    return new Promise((res, rej) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (var prop in employeeData) {
            if (prop == "") {
                prop = NULL;
            }
        }
        sequelize.sync().then(function () {
        Employee.update( employeeData , {
            where: {
                employeeNum: employeeData.employeeNum
            }
        }).then((data) => {
            res(data);
        }).catch(() => {
            rej("unable to update employee");
        });
    })
    })
}

exports.addDepartment = (body) => {
    return new Promise((res, rej) => {
        for (var prop in body) {
            if (prop == "") {
                prop = NULL;
            }
        }
        sequelize.sync().then(function () {
        Department.create( body ).then((data) => {
            res(data);
        }).catch(() => {
            rej("unable to create department");
        })
        })
    })
}

exports.updateDepartment = (departmentData) => {
    return new Promise((res, rej) => {
        for (var prop in departmentData) {
            if (prop == "") {
                prop = NULL;
            }
        }
        sequelize.sync().then(function () {
        Department.update( departmentData , {
            where: {
                departmentId: departmentData.departmentId
            }
        }).then((data) => {
            res(data);
        }).catch(() => {
            rej("unable to update department");
        });
    })
    })
}

exports.getDepartmentById = (id) => {
    return new Promise((res, rej) => {
        sequelize.sync().then(function () {
        Department.findAll({
            where: {
                departmentId: id
            }
        }).then(function (data) {
            res(data[0]);
        }).catch(() => {
            rej("no results returned")
        })
    })
    })
}

exports.deleteEmployeeByNum = (empNum) => {
    return new Promise((res, rej) => {
        sequelize.sync().then(function () {
        Employee.destroy({
            where: {
                employeeNum: empNum
            }
        }).then(function () {
            res();
        }).catch(() => {
            rej("was rejected");
        })
    })
    })
}