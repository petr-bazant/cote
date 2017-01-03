var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Configurable = require('./Configurable'),
    Component = require('./Component'),
    axon = require('@dashersw/axon'),
    portfinder = require('portfinder');

module.exports = class Publisher extends Configurable(Component) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.advertisement.axon_type = 'pub-emitter';

        var host = this.discoveryOptions && this.discoveryOptions.address || '0.0.0.0';

        var onPort = (err, port) => {
            this.advertisement.port = +port;

            this.sock = new axon.PubEmitterSocket();
            this.sock.sock.bind(port);
            this.sock.sock.server.on('error', err => {
                if (err.code != 'EADDRINUSE') throw err;

                portfinder.getPort({ host: host, port: this.advertisement.port }, onPort);
            });

            this.sock.sock.on('bind', _ => this.emit('ready', this.sock));
        }

        portfinder.getPort({ host: host, port: this.advertisement.port }, onPort);
    }

    publish(topic, data) {
        var namespace = '';

        if (this.advertisement.namespace)
            namespace = this.advertisement.namespace + '::';

        topic = 'message::' + namespace + topic;

        this.sock && this.sock.emit(topic, data);
    };

    get type() { return 'pub-emitter'; }
    get oppo() { return 'sub-emitter'; }
}
