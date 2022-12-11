var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
    "userName": String,
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});
let User;

exports.initialize = () => {
    return new Promise((res, rej) => {
        let pass1 = encodeURIComponent("Kelvin@1234");
        db = mongoose.createConnection(`mongodb+srv://KelvinV:${pass1}@senecaweb.rzvicok.mongodb.net/web322_week8?retryWrites=true&w=majority`);
        if (db) {
            User = db.model("users", userSchema);
            res();
        }
        else {
            rej("Unable to establish connection")
        }
    })
}

exports.registerUser = (userData) => {
    return new Promise((res, rej) => {
        if ((userData.password.trim().length === 0) || (userData.password2.trim().length === 0)) {
            rej("Error: user name cannot be empty or only white spaces!");
        }
        else if (userData.password != userData.password2) {
            rej("Error: Passwords do not match");
        }
        else {
            bcrypt.hash(userData.password, 10).then(hash => { // Hash the password using a Salt that was generated using 10 rounds
                // TODO: Store the resulting "hash" value in the DB
                userData.password = hash;
            }).catch((err) => {
                console.log(err); // Show any errors that occurred during the process
                rej("There was an error encrypting the password");
            });
            let newUser = new User(userData);
            newUser.save().then(() => {
                res()
            }).catch((err) => {
                if (err.code == 11000)
                    rej("User Name already taken");
                else
                    rej(`There was an error creating the user: ${err}`);
            })
        }
    })
}

exports.checkUser = (userData) => {
    return new Promise((res, rej) => {
        User.findOne({ userName: userData.userName }).exec().then((user_) => {
            if (!user_) {
                console.log("HERE");
                rej(`Unable to find user: ${userData.userName}`);
            }
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(user_.password, salt);
            bcrypt.compare(userData.password, hash).then((result) => {
                console.log(userData.password)
                console.log(hash)
                console.log(result)
                // result === true
                if (result === true) {
                    user_.loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
                    User.updateOne(
                        { userName: user_.userName },
                        { $set: { loginHistory: user_.loginHistory } }
                    ).exec().then(() => {
                        res(user_);
                    }).catch((err) => {
                        rej(`There was an error verifying the user: ${err}`);
                    })
                }
                else {
                    rej(`Unable to find user: ${userData.userName}`);
                }
            }).catch((err) => {
                console.log(err);
            })
        }).catch((err) => {
            console.log(err);
            rej(`Unable to find user: ${userData.userName}`);
        })
    })
}