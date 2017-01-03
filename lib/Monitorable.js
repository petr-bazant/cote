module.exports = Base => class Monitorable extends Base {
    constructor(...args) {
        super(...args);
        this.discovery.on('added', obj => {
            var adv = obj.advertisement;

            if (adv.type != 'monitor') return;

            if (adv.key && adv.key != this.advertisement.key) return;

            var statusPublisher = new axon.PubEmitterSocket();
            statusPublisher.connect(adv.port, this.constructor.useHostNames ? obj.hostName : obj.address);
            var statusInterval = this.discoveryOptions && this.discoveryOptions.statusInterval || 5000;

            setInterval(_ => this.onInterval(), statusInterval);
        });
    }

    onInterval() {
        var nodes = [];

        for (var id in this.discovery.nodes) {
            var node = this.discovery.nodes[id];

            if (node.sock)
                nodes.push(id);
        }

        statusPublisher.emit('status', {
            id: this.discovery.me.id,
            nodes: nodes
        });
    }
}
