const path = require('path');

// Use the existing order data
const orders = require(path.resolve('src/data/orders-data'));

// Use this function to assign ID's when necessary
const nextId = require('../utils/nextId');

// validation functions
function isMethodTypeIncluded(type) {
    return (req, res, next) => {
        const { data = {} } = req.body;

        if (data[type]) {
            return next();
        } else {
            next({
                status: 400,
                message: `Order must include a ${type}`,
            });
        }
    };
}

function isDishesArray(req, res, next) {
    const { dishes } = req.body.data;

    if (Array.isArray(dishes) && dishes.length > 0) {
        res.locals.dishes = dishes;
        return next();
    }

    next({
        status: 400,
        message: 'Order must include at least one dish',
    });
}

function isQuantityValid(req, res, next) {
    const dishes = res.locals.dishes;
    dishes.forEach((dish, index) => {
        const { quantity } = dish;
        if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
            return next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`,
            });
        }
    });

    next();
}

function doesOrderIdExist(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }

    next({
        status: 404,
        message: `No matching order with id: ${orderId}`,
    });
}

function doesOrderIdMatch(req, res, next) {
    const { orderId } = req.params;
    const { id } = req.body.data;

    if (id && orderId !== id) {
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
        });
    }

    next();
}

function isStatusValid(req, res, next) {
    const statusTypes = ['pending', 'preparing', 'out-for-delivery', 'delivered'];
    const { status } = req.body.data;

    if (statusTypes.includes(status)) {
        return next();
    }

    next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
}

function isStatusPending(req, res, next) {
    const foundOrder = res.locals.order;
    if (foundOrder.status === 'pending') {
        return next();
    }

    next({
        status: 400,
        message: `An order cannot be deleted unless it is pending`,
    });
}


// route main functions

function list(req, res) {
    res.status(200).send({ data: orders });
}

function create(req, res) {
    const { deliverTo, mobileNumber, dishes, status } = req.body.data;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    };

    orders.push(newOrder);

    res.status(201).send({ data: newOrder });
}

function read(req, res) {
    res.status(200).send({ data: res.locals.order });
}

function update(req, res) {
    const { deliverTo, mobileNumber, dishes, status } = req.body.data;
    const order = res.locals.order;

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.dishes = dishes;
    order.status = status;

    res.status(200).send({ data: order });
}

function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);

    orders.splice(index, 1);

    res.sendStatus(204);
}


module.exports = {
    list,
    create: [
        isMethodTypeIncluded('deliverTo'),
        isMethodTypeIncluded('mobileNumber'),
        isDishesArray,
        isQuantityValid,
        create,
    ],
    read: [doesOrderIdExist, read],
    update: [
        doesOrderIdExist,
        doesOrderIdMatch,
        isMethodTypeIncluded('deliverTo'),
        isMethodTypeIncluded('mobileNumber'),
        isDishesArray,
        isQuantityValid,
        isStatusValid,
        update,
    ],
    destroy: [
        doesOrderIdExist,
        isStatusPending,
        destroy,
    ]
};
