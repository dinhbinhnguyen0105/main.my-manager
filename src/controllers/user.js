// user.js
const userServices = require("../services/user");

const listUser = () => userServices.handleListUser();
const getUser = (id) => userServices.handleGetUser(id);
const createUser = (user) => userServices.handleCreateUser(user);
const updateUser = (user) => userServices.handleUpdateUser(user);
const deleteUser = (id) => userServices.handleDeleteUser(id);
const launchUser = (payload) => userServices.handleLaunchUser(payload);

module.exports = {
    listUser,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    launchUser,
}