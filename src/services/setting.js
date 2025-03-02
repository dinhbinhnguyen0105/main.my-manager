const path = require("path");
const fs = require("fs");

const dbPath = path.resolve(__dirname, "..", "db", "settings.json");
if (!fs.existsSync(dbPath)) { fs.writeFileSync(dbPath, JSON.stringify({}), { encoding: "utf8" }) };

const handleListSetting = () => {
    return new Promise((resolve, reject) => {
        try {
            const rawDB = fs.readFileSync(dbPath, { encoding: "utf8" });
            const db = JSON.parse(rawDB);
            resolve({
                data: db,
                message: "Successfully retrieved data from the database [settings]",
                statusCode: 200,
            })
        } catch (err) {
            reject({
                statusCode: 500,
                message: err.toString(),
            });
        };
    });
};

const handleUpdateSetting = (settings) => {
    return new Promise((resolve, reject) => {
        try {
            const rawDB = fs.readFileSync(dbPath, { encoding: "utf8" });
            const db = JSON.parse(rawDB);
            const newDB = {
                ...db,
                ...settings,
            };
            fs.writeFileSync(dbPath, JSON.stringify(newDB), { encoding: "utf8" });
            resolve({
                statusCode: 200,
                message: "Successfully updated settings.",
            });
        } catch (err) {
            reject({
                statusCode: 500,
                message: err.toString(),
            });
        };
    });
};


module.exports = {
    handleListSetting,
    handleUpdateSetting
};
