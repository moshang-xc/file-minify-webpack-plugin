function isArray(item) {
    return Object.prototype.toString.call(item) === '[object Array]';
}

function isObject(item) {
    return Object.prototype.toString.call(item) === '[object Object]';
}

module.exports = {
    isArray,
    isObject
};