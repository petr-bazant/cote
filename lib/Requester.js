var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Configurable = require('./Configurable'),
    Component = require('./Component'),
    axon = require('@dashersw/axon'),
    portfinder = require('portfinder');

module.exports = class Requester extends Configurable(Component) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        var host = this.discoveryOptions && this.discoveryOptions.address || '0.0.0.0';

        var onPort = (err, port) => {
            this.advertisement.port = +port;

            this.sock = new axon.ReqSocket();
            this.sock.bind(port);
            this.sock.server.on('error', err => {
                if (err.code != 'EADDRINUSE') throw err;

                portfinder.getPort({ host: host, port: this.advertisement.port }, onPort.bind(this));
            });

            this.sock.on('bind', _ => this.emit('ready', this.sock));
        }

        portfinder.getPort({ host: host, port: this.advertisement.port }, onPort.bind(this));
    }

    send(...args) {
        if (this.sock) this.sock.send(...args);
        else console.log(`trying to send ${args} but not ready yet.`);
    }

    get type() { return 'req'; }
    get oppo() { return 'rep'; }

}
