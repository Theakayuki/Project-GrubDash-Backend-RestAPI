const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// validator functions

function isPropertyIncluded(property) {
    return function (req, res, next){
        const { data = {} } = req.body;

        if (data[property]) {
            return next()
        } else {
            next({
                status: 400,
                message: `An ${property} must be included!`,
            });
        }
    };
};

function isValidPrice(req, res, next){
    const {price} = req.body.data;

    if (Number.isInteger(price) && +price > 0){
        return next();
    } else {
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        });
    }
};


// route method functions

function list(req, res) {
    res.send({data: dishes});
};

function update(req, res) {
    const { name, description, price, image_url } = req.body.data;

    const newDish = {
        name,
        description,
        price: +price,
        image_url,
        id: nextId(),
    };

    dishes.push(newDish);

    res.status(201).send({data: newDish});
};

module.exports = {
    list,
    update: [
        isPropertyIncluded('name'),
        isPropertyIncluded('description'),
        isPropertyIncluded('price'),
        isPropertyIncluded('image_url'),
        isValidPrice,
        update,
    ],
};