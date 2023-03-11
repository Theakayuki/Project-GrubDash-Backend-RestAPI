const path = require('path');

// Use the existing dishes data
const dishes = require(path.resolve('src/data/dishes-data'));

// Use this function to assign ID's when necessary
const nextId = require('../utils/nextId');

// TODO: Implement the /dishes handlers needed to make the tests pass

// validator functions

function isPropertyIncluded(property) {
    return function (req, res, next) {
        const { data = {} } = req.body;

        if (data[property]) {
            return next();
        } else {
            next({
                status: 400,
                message: `An ${property} must be included!`,
            });
        }
    };
}

function isValidPrice(req, res, next) {
    const { price } = req.body.data;

    if (Number.isInteger(price) && +price > 0) {
        return next();
    } else {
        next({
            status: 400,
            message: 'Dish must have a price that is an integer greater than 0',
        });
    }
}

function doesDishExist(req, res, next) {
    const { dishId } = req.params;

    const foundDish = dishes.find((dish) => dish.id === dishId);

    if (foundDish) {
        res.locals.id = dishId;
        res.locals.dish = foundDish;
        res.locals.newDish = req.body.data;
        return next();
    } else {
        next({
            status: 404,
            message: `Dish does not exist: ${dishId}.`,
        });
    }
}

function doesIdMatch(req, res, next) {
    const { dishId } = req.params;
    const { id } = req.body.data;

    if (id && id !== dishId) {
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
        });
    } else {
        console.log('id matches');
        return next();
    }
}

// route method functions

function list(req, res) {
    res.send({ data: dishes });
}

function create(req, res) {
    const { name, description, price, image_url } = req.body.data;

    const newDish = {
        name,
        description,
        price: +price,
        image_url,
        id: nextId(),
    };

    dishes.push(newDish);

    res.status(201).send({ data: newDish });
}

function read(req, res) {
    res.status(200).send({ data: res.locals.dish });
}

function update(req, res) {
    const dish = { ...res.locals.dish, ...res.locals.newDish, id: res.locals.id };
    dishes[res.locals.id] = dish;
    res.status(200).send({ data: dish });
}

module.exports = {
    list,
    create: [
        isPropertyIncluded('name'),
        isPropertyIncluded('description'),
        isPropertyIncluded('price'),
        isPropertyIncluded('image_url'),
        isValidPrice,
        create,
    ],
    read: [doesDishExist, read],
    update: [
        doesDishExist,
        doesIdMatch,
        isPropertyIncluded('name'),
        isPropertyIncluded('description'),
        isPropertyIncluded('price'),
        isPropertyIncluded('image_url'),
        isValidPrice,
        update,
    ],
};
