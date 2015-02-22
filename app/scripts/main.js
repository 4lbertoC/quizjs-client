/* global io */

(function() {
	'use strict';

	/*
	 * Events received by the clients.
	 */
	var ACTION = {
		CLIENT: {
			// Triggered when a client connects
			CONNECT: 'quizjs-client-connect',
			// Triggered when a client subscribes to a question
			SUBSCRIBE: 'quizjs-client-subscribe'
		},
		MASTER: {
			// Triggered when the master resets the state
			RESET: 'quizjs-master-reset',
			// Triggered when a client's answer was wrong and the master lets the next person answer
			NEXT: 'quizjs-master-next'
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
		MASTER: {
			// Triggered when a client is registered to the server
			REGISTER: 'quizjs-master-register'
		},
		STATE: {
			RESET: 'quizjs-state-reset',
			UPDATE: 'quizjs-state-update'
		}
	};

	var bigRedButton = $('.big-red-button');
	var infoText = $('.info-text');
	var body = $('body');
	var yourIdIs = $('.yourIdIs');
	var yourId = $('.yourId');

	var connected = false;
	var hasSubmitted = false;
	var clientId;

	function resizeButton() {
		var minSize = Math.min($(window).width(), $(window).height());
		bigRedButton.css({
			width: minSize * 0.8,
			height: minSize * 0.8
		});
	}

	$(window).on('resize', function() {
		if (connected) {
			resizeButton();
		}
	});

	var socket = io('https://quizjs.herokuapp.com');
	socket.on('connect', function() {
		socket.emit(ACTION.CLIENT.CONNECT);
	});

	socket.on(EVENT.CLIENT.REGISTER, function(data) {
		$('.connecting').hide();
		resizeButton();
		bigRedButton.show();
		clientId = data.clientId;
		yourId.text(clientId);
		yourIdIs.show();
		connected = true;
	});

	socket.on(EVENT.STATE.UPDATE, function(data) {
		var speakerId = data.speakerId;

		if (!hasSubmitted) {
			return;
		}

		if (speakerId === clientId) {
			bigRedButton.hide();
			infoText.text('You can answer!');
			body.addClass('can-answer');
		} else if(body.hasClass('can-answer')) {
			infoText.text('Wrong answer!');
			body.addClass('wrong-answer');
		} else {
			infoText.text('Too slow!');
			body.addClass('too-slow');
		}
	});

	socket.on(EVENT.STATE.RESET, function() {
		bigRedButton.show();
		infoText.text('');
		body.removeClass('can-answer');
		body.removeClass('wrong-answer');
		body.removeClass('too-slow');
		hasSubmitted = false;
	});

	bigRedButton.on('click', function() {
		hasSubmitted = true;
		socket.emit('quizjs-client-subscribe', {
			clientId: clientId
		});
	});
})();