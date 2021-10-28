const path = require("path");
const fs = require("fs");
const { constants } = require('../config');

const loadControllers = async function (app) {

    try {
        const modulesPath = path.join(__dirname, "../app");
        const modules = fs.readdirSync(modulesPath);
        for (let i = 0, { length } = modules; i < length; i++) {
            const moduleFiles = modules[i];
            const controllerPath = path.join(modulesPath, moduleFiles);
            const controllers = fs.readdirSync(controllerPath);
            controllers.forEach(function (file) {
                const fileName = file.split(".");
                const modelData = fileName[1];
                if (modelData && (modelData.toLowerCase() === "controller" || modelData.toLowerCase() === "middleware")) {
                    return (require(path.join(controllerPath, file)))(app);
                }
            });
        }
    } catch (error) {
        const loggerObject = {
            fileName: "server-utils.js",
            methodName: "loadControllers",
            type: constants.LOGGER_LEVELS.ERROR,
            error,
        };
        global.logger(loggerObject);
        throw new Error(`Error while loading all controllers: ${error}`);
    }
};

const loadRoutesAndMiddleware = async function (app) {
    try {
        const modulesPath = path.join(__dirname, "../app");
        const modules = fs.readdirSync(path.join(__dirname, "../app"));
        for (let i = 0, { length } = modules; i < length; i++) {
            const moduleFiles = modules[i];
            const routePath = path.join(modulesPath, moduleFiles);
            const routes = fs.readdirSync(routePath);
            routes.forEach(function (file) {
                const fileName = file.split(".");
                const modelData = fileName[1];
                if (modelData && (modelData.toLowerCase() === "route" || modelData.toLowerCase() === "utill")) {
                    return (require(path.join(routePath, file)))(app);
                }
            });
        }
    } catch (error) {
        const loggerObject = {
            fileName: "server-utils.js",
            methodName: "loadRoutesAndMiddleware",
            type: constants.LOGGER_LEVELS.ERROR,
            error,
        };
        global.logger(loggerObject);
        throw new Error(`Error while loading all routes and utils file: ${error}`);
    }
};

module.exports = {
    appUtility: {
        loadControllers,
        loadRoutesAndMiddleware,
    },
};