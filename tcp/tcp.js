'use strict';
var tcpStream = require('./tcpStream');
var net = require('net');
var Encryptor = require("../encrop/encrypt").Encryptor;
var debug = require('debug')('tcp');
debug('tcp');
var server = net.createServer(function(socket) {
	let encryptor = new Encryptor('Huangyao1', 'aes-256-cfb')
	let stream = new tcpStream(socket, encryptor);
	let remote = net.connect('9183', '128.199.110.63');
	remote.on('connect', function() {
		debug('connect');
		socket.pipe(stream).pipe(remote).pipe(encryptor).pipe(socket);
	});
	remote.on('close', function() {
		debug('remote close');
		this.destroy();
	});
	remote.on('error', function() {
		debug('remote error');
		if (remote)
			this.destroy();
	});
	socket.on('close', function() {
		debug('sockets close');
		clean();
	});
	socket.on('error', function(e) {
		debug('socket error', e);
		clean();
	});
	socket.setTimeout(6000, function() {
		debug('sockets timeout');
		clean();
	});

	function clean() {
		if (remote)
			remote.destroy();
		if (socket)
			socket.destroy();
	}
});
server.clean = function() {
	this.close();
	this.isStart = false;
}
server.start = function () {
	this.listen({
		port: Number(global.config.local_port)
	}, function() {
		debug('listen in', global.config.local_port);
	});
	this.isStart = true;
}
module.exports = server;