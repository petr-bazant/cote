var Requester = require('../').Requester;

var randomRequest = new Requester({
    name: 'randomReq',
    // namespace: 'rnd',
    requests: ['randomRequest', 'promised request']
});

randomRequest.on('ready', function() {
    setInterval(function() {
        var req = {
            type: 'randomRequest',
            val: ~~(Math.random() * 10)
        };
        console.log('sending request cb', req);
        randomRequest.send(req, function(res) {
            console.log('request cb', req, 'answer', res);
        });

        var reqPromise = {
            type: 'promised request',
            val: ~~(Math.random() * 10)
        };

        console.log('sending request promise', reqPromise);
        randomRequest.send(reqPromise).then((res) => {
            console.log('request promise', reqPromise, 'answer', res);
        });

    }, 5000);
});
