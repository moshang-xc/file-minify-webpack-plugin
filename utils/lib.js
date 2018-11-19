function isObject(item) {
    return Object.prototype.toString.call(item) === '[object Object]';
}

module.exports = {
    isObject
};