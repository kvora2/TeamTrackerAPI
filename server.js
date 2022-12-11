/*************************************************************************
* BTI325– Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Kelvin Vora  Student ID: 157616210 Date: 11th Dec 2022
*
* Your app’s URL (from cyclic) : 
https://panicky-toad-scrubs.cyclic.app 
*
**************************************************************************/

var express = require("express");
var multer = require("multer");
var exphbs = require('express-handlebars');
const fs = require('fs');
var clientSessions = require('client-sessions');
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var path = require("path");

var HTTP_PORT = process.env.PORT || 8080;
const data = require("./data-service.js");
const dataServiceAuth = require("./data-service-auth.js");

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

app.engine('.hbs', exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set("view engine", ".hbs");

// Setup client-sessions
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

const upload = multer({ storage: storage });

app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
})

// checking if the user is authenticated
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

app.get("/", function (req, res) {
    res.render('home');
});

app.get("/about", function (req, res) {
    res.render('about')
});

app.get("/images/add", ensureLogin, function (req, res) {
    res.render('addImage');
});

app.get("/employees/add", ensureLogin, function (req, res) {
    data.getDepartments(req.body).then((data) => {
        res.render("addEmployee", { departments: data })
    }).catch(() => {
        res.render("addEmployee", { departments: [] })
    });
});

app.post("/employees/add", ensureLogin, (req, res) => {
    data.addEmployee(req.body).then((data) => {
        res.redirect("/employees");
    }).catch(() => {
        console.log("unable to add employee")
    });
});

app.post("/departments/add", ensureLogin, (req, res) => {
    data.addDepartment(req.body).then(() => {
        res.redirect("/departments/add")
    }).catch((err) => {
        console.log(err);
    });
});

app.get("/employees", ensureLogin, (req, res) => {
    if (req.query.status) {
        data.getEmployeesByStatus(req.query.status).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data })
            }
            else {
                res.render("employees", { message: "No Results!!" })
            }
        }).catch((err) => {
            res.json({ ERROR: err });
        })
    }
    else if (req.query.department) {
        data.getEmployeesByDepartment(req.query.department).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data })
            }
            else {
                res.render("employees", { message: "No Results!!" })
            }
        }).catch((err) => {
            res.json({ ERROR: err });
        })
    }
    else if (req.query.manager) {
        data.getEmployeesByManager(req.query.manager).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data })
            }
            else {
                res.render("employees", { message: "No Results!!" })
            }
        }).catch((err) => {
            console.log(err);
            res.render({ message: "no results" });
        })
    }
    else {
        data.getAllEmployees().then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data })
            }
            else {
                res.render("employees", { message: "No Results!!" })
            }
        }).catch((err) => {
            res.render({ message: err });
        });
    }
});

app.get("/departments", ensureLogin, (req, res) => {
    data.getDepartments().then((data) => {
        if (data.length > 0) {
            res.render("departments", { departments: data })
        }
        else {
            res.render("departments", { message: "No Results!!" })
        }
    }).catch((err) => {
        console.log(err);
    });
});

app.get("/images", ensureLogin, (req, res) => {
    fs.readdir("./public/images/uploaded", (err, items) => {
        if (err) {
            res.render({ message: "error opening the file!" });
        }
        else {
            res.render("images", { data: items });
        }
    });
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
    fs.readdir("./public/images/uploaded", (err, items) => {
        if (err) {
            console.log(err);
        }
        else {
            res.json({ images: items });
        }
    })
})



app.get("/employee/:empNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    data.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(data.getDepartments)
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching
            // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee[0].department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                console.log(viewData.employee[0].firstName)
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        });
});

app.post("/employee/update", ensureLogin, (req, res) => {
    data.updateEmployee(req.body).then(() => {
        res.redirect("/employees");
    }).catch((err) => {
        console.log(err);
    })
});

app.get("/departments/add", ensureLogin, (req, res) => {
    res.render('addDepartment');
})

app.post("/department/update", ensureLogin, (req, res) => {
    data.updateDepartment(req.body).then(() => {
        res.redirect("/departments");
    }).catch((err) => {
        console.log(err);
    })
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
    data.getDepartmentById(req.params.departmentId).then((data) => {
        if (data == undefined) {
            res.status(404).send("Department Not Found");
        }
        else {
            res.render("department", { department: data });
        }
    }).catch((err) => {
        res.status(404).send("Department Not Found");
    })
})

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    data.deleteEmployeeByNum(req.params.empNum).then(() => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Employee / Employee not found)");
    })
})

// new routes for a6
app.get("/login", (req, res) => {
    res.render('login');
})

app.get("/register", (req, res) => {
    res.render('register');
})

app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body).then(() => {
        res.render("register", { successMessage: "User created" });
    }).catch((err) => {
        res.render("register", { errorMessage: err, userName: req.body.userName });
    })
})

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
            userName: user.userName, // complete it with authenticated user's userName
            email: user.email, // complete it with authenticated user's email
            loginHistory: user.loginHistory // complete it with authenticated user's loginHistory
        }
        res.redirect("/employees");
    }).catch((err) => {
        res.render("login", { errorMessage: err, userName: req.body.userName });
    })
})

app.get("/logout", function (req, res) {
    req.session.reset();
    res.redirect("/login");
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/404.html"));
})

data.initialize().then(dataServiceAuth.initialize).then(function () {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function (err) {
    console.log("unable to start server: " + err);
});