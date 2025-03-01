// user.js
const path = require("path");
const fs = require("fs");
const mergeWithCondition = require("../utils/mergeWithCondition");
const userModel = require("../model/user");


const dbPath = path.resolve(__dirname, "..", "db", "users.json");
if (!fs.existsSync(dbPath)) { fs.writeFileSync(dbPath, JSON.stringify([]), { encoding: "utf8" }) };

const handleListUser = () => {
    return new Promise((resolve, reject) => {
        try {
            const rawDB = fs.readFileSync(dbPath, { encoding: "utf8" });
            const db = JSON.parse(rawDB);
            resolve({
                data: db,
                message: "Successfully retrieved data from the database [users]",
                statusCode: 200,
            })
        } catch (err) {
            reject({
                statusCode: 500,
                message: err.toString(),
            })
        };
    });
};
const handleGetUser = (id) => {
    return new Promise((resolve, reject) => {
        try {
            const rawDB = fs.readFileSync(dbPath, { encoding: "utf8" });
            const db = JSON.parse(rawDB);
            const user = db.find(item => item.info.id === id);
            resolve({
                data: user,
                message: `Successfully retrieved user data with ID ${id}`,
                statusCode: 200,
            })
        } catch (err) {
            reject({
                statusCode: 500,
                message: err.toString(),
            })
        };
    });
};
const handleCreateUser = (user) => {
    return new Promise((resolve, reject) => {
        try {
            const rawDB = fs.readFileSync(dbPath, { encoding: "utf8" });
            const db = JSON.parse(rawDB);
            const newUser = mergeWithCondition(user, userModel);
            const newDB = [...db, newUser];
            fs.writeFileSync(dbPath, JSON.stringify(newDB), { encoding: "utf8" });
            resolve({
                message: `Successfully created new user with ID: ${newUser.info.id}`,
                statusCode: 200,
            })
        } catch (err) {
            reject({
                statusCode: 500,
                message: err.toString(),
            })
        };
    });
};
const handleUpdateUser = (user) => {
    return new Promise((resolve, reject) => {
        try {
            const rawDB = fs.readFileSync(dbPath, { encoding: "utf8" });
            const db = JSON.parse(rawDB);
            const newDB = db.map(_user => _user.info.id === user.info.id ? user : _user);
            fs.writeFileSync(dbPath, JSON.stringify(newDB), { encoding: "utf8" });
            resolve({
                statusCode: 200,
                message: `Successfully updated user with ID: ${user.info.id}`,
            });
        } catch (err) {
            reject({
                statusCode: 500,
                message: err.toString(),
            })
        };
    });
};
const handleDeleteUser = (id) => {
    return new Promise((resolve, reject) => {
        try {
            const rawDB = fs.readFileSync(dbPath, { encoding: "utf8" });
            const db = JSON.parse(rawDB);
            const newDB = db.filter(_user => _user.info.id !== id);
            fs.writeFileSync(dbPath, JSON.stringify(newDB), { encoding: "utf8" });
            resolve({
                message: `Successfully deleted user with ID: ${id}`,
                statusCode: 200,
            });
        } catch (err) {
            reject({
                statusCode: 500,
                message: "",
            })
        };
    });
};
const handleLaunchUser = (id) => {
    return new Promise((resolve, reject) => {
        try {

        } catch (err) {
            reject({
                statusCode: 500,
                message: "",
            })
        };
    });
};

module.exports = {
    handleListUser,
    handleGetUser,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleLaunchUser
};