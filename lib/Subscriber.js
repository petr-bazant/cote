var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    Configurable = require('./Configurable'),
    Monitorable = require('./Monitorable'),
    Component = require('./Component'),
    axon = require('@dashersw/axon');

module.exports = class Subscriber extends Monitorable(Configurable(Component)) {
    constructor(advertisement, discoveryOptions) {
        super(advertisement, discoveryOptions);

        this.advertisement.subscribesTo = this.advertisement.subscribesTo || ['*'];

        this._on('added', obj => {
            obj.sock = new axon.SubEmitterSocket();
            obj.sock.sock.connect(obj.advertisement.port, Subscriber.useHostNames ? obj.hostName : obj.address);
            obj.sock.sock.on('connect', _ => {
                this.emit(this.formatTypeWithNamespace('connect'), obj)
            });

            obj.sock.sock.set('retry timeout', 0);

            obj.sock.sock.on('socket close', _ => this.emit('removed', obj));

            this.advertisement.subscribesTo.forEach(topic => {
                var namespace = '';
                if (this.advertisement.namespace)
                    namespace = this.advertisement.namespace + '::';

                topic = 'message::' + namespace + topic;

                (topic => {
                    obj.sock.on(topic, (...args) => {
                        if (args.length == 1)
                            args.unshift(topic.substr(9));
                        else
                            args[0] = namespace + args[0];

                        this.emit(...args);
                    });
                })(topic);
            });
        });
    }

    on(type, listener) {
        return super.on(this.formatTypeWithNamespace(type), listener);
    }

    _on(type, listener) {
        return super.on(type, listener);
    }

    formatTypeWithNamespace(type) {
        var namespace = '';
        if (this.advertisement.namespace)
            namespace = this.advertisement.namespace + '::';

        return namespace + type;
    }

    get type() { return 'sub-emitter'; }
    get oppo() { return 'pub-emitter'; }
}
