(function(window, undefined) {

	/*
	 * Actions sent by the clients.
	 */
	var ACTION = {
		CLIENT: {
			// Triggered when a client connects
			CONNECT: 'quizjs-client-connect',
			// Triggered when a client subscribes to a question
			SUBSCRIBE: 'quizjs-client-subscribe'
		}
	};

	/**
	 * Events sent by the server.
	 */
	var EVENT = {
		CLIENT: {
			// Triggered when a client is registered to the server
			REGISTER: 'quizjs-client-register'
		},
		STATE: {
			RESET: 'quizjs-state-reset',
			UPDATE: 'quizjs-state-update'
		}
	};

	var socket;

	var connected = false;

	var eventHandlers = {};

	var clientId;

	function _callEventHandlers(eventId, data) {
		var currentEventHandlers = eventHandlers[eventId];
		if (Array.isArray(currentEventHandlers)) {
			for (var i = 0, len = currentEventHandlers.length; i < len; i++) {
				currentEventHandlers[i](data);
			}
		}
	}

	function on(eventId, handler) {
		if (!eventHandlers[eventId]) {
			eventHandlers[eventId] = [];
		}

		eventHandlers[eventId].push(handler);
	} 

	function connect(url) {
		socket = io(url);

		socket.on('connect', function() {
			socket.emit(ACTION.CLIENT.CONNECT);
		});

		socket.on(EVENT.CLIENT.REGISTER, function(data) {
			connected = true;
			clientId = data.clientId;
			_callEventHandlers(EVENT.CLIENT.REGISTER, data);
		});

		socket.on(EVENT.STATE.UPDATE, function(data) {
			_callEventHandlers(EVENT.STATE.UPDATE, data);
		});

		socket.on(EVENT.STATE.RESET, function(data) {
			_callEventHandlers(EVENT.STATE.RESET, data);
		});
	}

	function subscribe() {
		if (connected) {
			socket.emit(ACTION.CLIENT.SUBSCRIBE, {
				clientId: clientId
			});
		} else {
			console.error('Client not connected!');
		}
	}

	var QuizJsClient = window.QuizJsClient = {
		connect: connect,
		subscribe: subscribe,
		on: on
	};

})(this);