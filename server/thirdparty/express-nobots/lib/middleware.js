var bots = require('./bots')
var regex = new RegExp('\\b' + bots.join('\\b|\\b') + '\\b', 'i')

module.exports = exports = function(options) {
    if (!options) {
        return blockBots
    } else if (options.block) {
        return blockBots
    } else if (!options.block) {
        return tagBots
    }
}

var blockBots = function(req, res, next) {
    var ua = req.get('User-Agent')
    if (regex.test(ua))
        return res.status(401).send("Halt! Who goes there? T'is a bot!")
    else return next()
}

var tagBots = function(req, res, next) {
    var ua = req.get('User-Agent')
    if (regex.test(ua)) req.isBot = true
    else req.isBot = false
    return next()
}
