/* global io */

(function() {
	'use strict';


	var bigRedButton = $('.big-red-button');
	var infoText = $('.info-text');
	var body = $('body');
	var yourIdIs = $('.yourIdIs');
	var yourId = $('.yourId');

	var qjp = new QuizJsPlayer();
	
	var connected = false;
	var hasSubmitted = false;
	var playerId;

	function onQuizJsPlayerRegister(data) {
		$('.connecting').hide();
		resizeButton();
		bigRedButton.show();
		playerId = data.playerId;
		yourId.text(playerId);
		yourIdIs.show();
		connected = true;
	}

	function onQuizJsStateUpdate(data) {
		var speakerId = data.speakerId;

		if (!hasSubmitted) {
			return;
		}

		if (speakerId === playerId) {
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

	// qjp.connect('http://quizjs.herokuapp.com');
	qjp.connect('http://localhost:2450');
	qjp.on('quizjs-state-update', onQuizJsStateUpdate);
	qjp.on('quizjs-state-reset', onQuizJsStateReset);
	qjp.on('quizjs-player-register', onQuizJsPlayerRegister);

	bigRedButton.on('click', function() {
		hasSubmitted = true;
		qjp.subscribe();
	});
})();