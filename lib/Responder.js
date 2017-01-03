var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    Configurable = require('./Configurable'),
    Monitorable = require('./Monitorable'),
    Component = require('./Component'),
    axon = require('@dashersw/axon');

module.exports = class Responder extends Monitorable(Configurable(Component)) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.on('added', obj => {
            obj.sock = new axon.RepSocket();
            obj.sock.connect(obj.advertisement.port, Responder.useHostNames ? obj.hostName : obj.address);
            obj.sock.set('retry timeout', 0);

            obj.sock.on('socket close', _ => this.emit('removed', obj));

            obj.sock.on('message', (req, cb) => req.type && this.emit(req.type, req, cb));
        });
    }

    get type() { return 'rep'; }
    get oppo() { return 'req'; }
}
