const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// validation functions
function isMethodTypeIncluded(type){
    return (req, res, next) => {
        const {data = {}} = req.body;

        if (data[type]){
            return next();
        } else {
            next({
                status: 400,
                message: `Order must include a ${type}`,
            });
        }
    };
};

// route main functions

function list(req, res){
    res.status(200).send({data: orders});
};

module.exports = {
    list,
};