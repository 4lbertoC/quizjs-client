/* global io */

(function() {
	'use strict';


	var bigRedButton = $('.big-red-button');
	var infoText = $('.info-text');
	var body = $('body');
	var yourIdIs = $('.yourIdIs');
	var yourId = $('.yourId');

	var connected = false;
	var hasSubmitted = false;
	var clientId;

	function onQuizJsClientRegister(data) {
		$('.connecting').hide();
		resizeButton();
		bigRedButton.show();
		clientId = data.clientId;
		yourId.text(clientId);
		yourIdIs.show();
		connected = true;
	}

	function onQuizJsStateUpdate(data) {
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
	}

	function onQuizJsStateReset() {
		bigRedButton.show();
		infoText.text('');
		body.removeClass('can-answer');
		body.removeClass('wrong-answer');
		body.removeClass('too-slow');
		hasSubmitted = false;
	}

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

	// QuizJsClient.connect('http://quizjs.herokuapp.com');
	QuizJsClient.connect('http://localhost:2450');
	QuizJsClient.on('quizjs-state-update', onQuizJsStateUpdate);
	QuizJsClient.on('quizjs-state-reset', onQuizJsStateReset);
	QuizJsClient.on('quizjs-client-register', onQuizJsClientRegister);

	bigRedButton.on('click', function() {
		hasSubmitted = true;
		QuizJsClient.subscribe();
	});
})();