var Exercise,
	player,
	track,
	curProblem,
	curPosition,
	toExec,
	pInstance,
	DEBUG = false,
	codeContext,
	externalPropString = "",
	externalProps = {
		input: false,
		inputNumber: false,
		print: false
	};

$(function(){
	// Start the editor and canvas drawing area
	var editor = new Editor( "editor" );
	Canvas.init();
	
	$("#editor")
		.data( "editor", editor )
		.hotNumber();
	
	// Set up toolbar buttons
	$(document).buttonize();
	
	$("#play").click(function() {
		if ( Record.playing ) {
			Record.pausePlayback();
		} else {
			Record.play();
		}
	});
	
	$("#progress").slider({
		range: "min",
		value: 0,
		min: 0,
		max: 100
	});
	
	$(Record).bind({
		playStarted: function( e, resume ) {
			// Reset the editor and canvas to its initial state
			if ( !resume ) {
				$("#editor").editorText( Exercise.code );
				setCursor({ row: 0, column: 0 });
				focusProblem();
				
				Canvas.clear( true );
				Canvas.endDraw();
			}
			
			$("html").addClass( "playing" );
			$("#editor-box .overlay").show();
			
			$("#play").addClass( "ui-state-active" )
				.find( ".ui-icon" )
					.removeClass( "ui-icon-play" ).addClass( "ui-icon-pause" );
		},
		
		playPaused: function() {
			$("html").removeClass( "playing" );
			$("#editor-box .overlay").hide();
			
			$("#play").removeClass( "ui-state-active" )
				.find( ".ui-icon" )
					.addClass( "ui-icon-play" ).removeClass( "ui-icon-pause" );
		}
	});
	
	$("#test").click(function() {
		var numTest = $("#tests h3").length + 1,
			testObj = { title: "Exercise #" + numTest };
		
		if ( !Record.log( testObj ) ) {
			return false;
		}
		
		insertExerciseForm( testObj );
	});
	
	$("#restart-code").bind( "buttonClick", function() {
		Output.restart();
	});
	
	// XXX(jlfwong): This logic is a bit convoluted - we're *actually*
	// checking to see if we can record, not if we're a developer
	if ( !$("#play-page").hasClass( "developer" ) ) {
		// If we can record, then a buttonClick handler gets
		// attached by record-ui.js instead
		$("#save-share-code").bind( "buttonClick", function() {
			$(this).addClass( "ui-state-disabled" );
		
			saveScratchpadRevision(function(scratchpad) {
				window.location.href = "/labs/code/" + scratchpad.slug +
					"/" + scratchpad.id;
			});
		});
	}
	
	$("#get-hint").bind( "buttonClick", function() {
		$("#editor-box").toggleTip( "Hint", curProblem.hints, function() {
			$("#get-hint .ui-button-text").text( Output.testAnswers.length > 0 ? "Answer" : "Hints" );
		});
		focusProblem();
	});
	
	$("#show-errors").bind( "buttonClick", function() {
		$("#editor-box").toggleTip( "Error", errors, setCursor );
		focusProblem();
	});
	
	$("#reset-code").bind( "buttonClick", function() {
		var code = $("#editor").editorText();
		
		if ( code !== curProblem.start &&
				confirm( "This will delete your code and reset it back to what you started with. Is this ok?") ) {
			curProblem.answer = "";
			textProblem();
			
			$("#editor-box").hideTip( "Error" );
			
			var session = $("#editor").data( "editor" ).editor.getSession();
			session.clearAnnotations();
		}
	});
	
	$(document).delegate( ".next-problem", "buttonClick", function() {
		var pos = Exercise.problems.indexOf( curProblem );
		
		if ( pos + 1 < Exercise.problems.length ) {
			$("#exercise-tabs").tabs( "select", pos + 1 );
			
		} else {
			var next = ExerciseMap[ Exercise.id ],
				nextmsg = next ?
					"this exercise, would you like to continue on to the next one?" :
					"all the exercises, congratulations!";
			
			var buttons = {},
				name = next ? "Next Exercise" : "Yay!";
			
			buttons[ name ] = function() {
				if ( next ) {
					window.location.search = "?" + next;
				} else {
					$(this).dialog( "close" );
				}
			};
			
			$("<p>You've completed " + nextmsg + "</p>")
				.appendTo( "body" )
				.dialog({
					title:"Exercise Complete!",
					resizable: false,
					draggable: false,
					modal: true,
					buttons: buttons
				});
		}
	});
	
	$(document).delegate( "#results li", "hover", function() {
		var $parent = $(this),
			expected = $parent.data( "expected" );
		
		if ( expected ) {
			var tip = $parent.find( ".tip" );
		
			if ( !tip.length ) {
				tip = $( "<span class='tip'>" + (typeof expected === "string" ? expected :
					"This test was expecting a result of <code>" +
					JSON.stringify( expected[1] ) + "</code>, your code produced a result of <code>" +
					JSON.stringify( expected[0] ) + "</code>.") + "</span>" )
						.appendTo( $parent )
						.hide();
			}
			
			tip.toggle();
		}
	});
	
	$(document).delegate( "#results ul a", "click", function() {
		var li = $(this).parent();
		
		if ( li.hasClass( "task" ) ) {
			var pos = $( "#results li.task" ).index( li ),
				visible = li.find( "ul" ).toggle().is( ":visible" );
			
			curProblem.taskOpen[ pos ] = visible;
		}
		
		return false;
	});
	
	$(document).delegate( "#results legend a", "click", function() {
		var output = $(this).parents( "fieldset" ).data( "output" );
		
		if ( output ) {
			var str = "";
			
			for ( var i = 0; i < output.length; i++ ) {
				str += "<div>" + clean( output[i] ) + "</div>";
			}
			
			$("#output-text").html( str );
		}
		
		return false;
	});
	
	$("#editor-box-tabs")
		.tabs({
			show: function( e, ui ) {
				if ( ui.panel.id === "editor-box" ) {
					focusProblem();
				
				// If we're loading the tests or solution tab
				} else if ( ui.panel.id === "tests-box" || ui.panel.id === "solution-box" ) {
					var $editor = $( ui.panel ).find( ".editor" ),
						editor = $editor.data( "editor" );
					
					if ( !editor ) {
						editor = new Editor( $editor.attr( "id" ) );
						$editor.data( "editor", editor );
						
						editor.editor.setReadOnly( true );
						editor.editor.setHighlightActiveLine( true );
					}
					
					$(ui.panel).find( ".tipbar" ).hide();
					
					if ( ui.panel.id === "tests-box" ) {
						$editor.editorText( curProblem.validate );
						
						$(ui.panel).showTip( "Tests", [ "These are the tests that are used to evaluate your code. " +
							"We run these tests to make sure that your program is running correctly. " +
							"You can hover your mouse over a test on the right-hand panel to see its expected results." ] );
					} else {
						$editor.editorText( curProblem.solution );
						
						$(ui.panel).showTip( "Solution", [ "This is a solution to this particular problem. " +
						 	"This solution may match your code, but that's ok if it does not. " +
							"There are many ways to solve a problem, many of which are valid." ] );
					}
				}
			}
		})
		.removeClass( "ui-widget ui-widget-content ui-corner-all" );
	
	$("#editor-box, #tests-box, #output-box, #solution-box")
		.removeClass( "ui-tabs-panel ui-corner-bottom" );
	
	/*
	$("#output")
		.removeClass( "ui-corner-bottom" )
		.addClass( "ui-corner-top" );
	*/
	
	$("#editor-box-tabs-nav")
		.removeClass( "ui-corner-all" )
		.addClass( "ui-corner-bottom" )
		.find( "li" )
			.removeClass( "ui-corner-top" )
			.addClass( "ui-corner-bottom" );
	
	$("#tests")
		.tabs()
		.find( ".ui-tabs-nav" )
			.removeClass( "ui-corner-all" )
			.addClass( "ui-corner-top" );
	
	$(window).bind( "beforeunload", function() {
		leaveProblem();
		saveResults();
	});
	
	// Implement the scratchpad functionality
	if ( $("#play-page").hasClass( "scratch" ) ) {
		if ( window.location.search.indexOf( "dark" ) >= 0 ) {
			$("html").addClass( "dark" );
			Output.dark = true;
			editor.editor.setTheme( "ace/theme/twilight" );
		}
		
		$(".content").addClass( "scratch" );
		
		editor.editor.setFontSize( "14px" );
		editor.editor.setHighlightSelectedWord( false );
		
		editor.editor.renderer.setShowGutter( false );
		editor.editor.renderer.setShowPrintMargin( false );
		
		// TODO(jlfwong): Deal with ?query_strings and trailing slashes/ for
		// these routes
		//
		// Right now, /labs/code/cool-fractal/123?debug=true will send
		// "123?debug=true" as the scratchpadId - similarly, 123/ will send
		// "123/" as the scratchpadId
		var CodeRouter = Backbone.Router.extend({
			routes: {
				""                    : "scratchpadNew",
				
				// The slug is just for vanity - only the scratchpadId is
				// actually used to retrieve data
				":slug/:scratchpadId" : "scratchpadShowLatest",
				"*defaultRoute"       : "defaultRoute"
			},
			scratchpadNew: function() {
				curProblem = {id: 1};
				
				Exercise = {
					id: 0,
					scratchpad: {},
					revision: {},
					problems: [curProblem]
				};
				
				loadResults(Exercise, startScratch);
			},
			scratchpadShowLatest: function(slug, scratchpadId) {
				scratchpadId = parseInt(scratchpadId, 10);
				
				getScratchpad(scratchpadId, function(scratchpad) {
					var revision = scratchpad.latest_revision;
					
					curProblem = {id: 1, answer: revision.code};
					
					Exercise.scratchpad = scratchpad;
					Exercise.revision = revision;
					
					Record.commands = Exercise.revision.recording;
					
					// For compatibility with existing code that uses properties
					// directly on Exercise, like Exercise.code, Exercise.title,
					// we merge the properties of revision and scratchpad into
					// Exercise.
					//
					// TODO(jlfwong): Remove this, make all accesses explicitly
					// to Exercise.revision or Exercise.scratchpad
					$.extend(Exercise, revision, scratchpad);
					
					// If an audio track is provided, load the track data
					// and load the audio player as well
					if (Exercise.audio_id) {
						connectAudio(function(data) {
							track = data;
							audioInit();
						});
					}
					
					Exercise.problems = [curProblem];
					
					startScratch();
				});
			},
			defaultRoute: function(path) {
				console.error('404 on path: ', path);
				// TODO(jlfwong): 404?
			}
		});
		
		var codeRouter = new CodeRouter();
		Backbone.history.start({ pushState: true, root: "/labs/code" })
		
		return;
	}
	
	if ( window.location.search ) {
		var parts = window.location.search.slice(1).split( "&" );
		
		for ( var i = 0; i < parts.length; i++ ) {
			if ( parts[i] === "debug" ) {
				DEBUG = true;
			}
		}
		
		getExercise( parts[0], openExercise );
		
	} else {
		openExerciseDialog( openExercise );
	}
});

var startScratch = function() {
	Output.init();
	textProblem();
	
	$("#overlay").hide();
	focusProblem();
	
	setTimeout(function() {
		$("#editor").hotNumber( true );
	}, 100 );
};

var openExercise = function( exercise ) {
	Exercise = exercise;

	// If an audio track is provided, load the track data
	// and load the audio player as well
	if ( Exercise.audio_id ) {
		connectAudio(function( data ) {
			track = data;
			audioInit();
		});
	}
	
	$("h1").text( Exercise.title );
	
	document.title = Exercise.title;
	
	// Show the exercise description if it exists and if
	// it's the user's first time doing it
	if ( Exercise.desc && Exercise.problems[0].done == null ) {
		$("<p>" + Exercise.desc + "</p>")
			.appendTo( "body" )
			.dialog({
				title: Exercise.title,
				resizable: false,
				draggable: false,
				modal: true,
				buttons: {
					"Start Exercise": function() {
						$(this).dialog("close");
						
						// Re-focus cursor after button click starting the exercise
						focusProblem();
					}
				}
			});
	}

	if ( Exercise.problems ) {
		for ( var i = 0, l = Exercise.problems.length; i < l; i++ ) {
			insertExercise( Exercise.problems[i] );
		}
	}
	
	var activeTab = 0;
	
	$("#exercise-tabs")
		.tabs({
			show: function( e, ui ) {
				showProblem( Exercise.problems[ ui.index ] );
			}
		})
		.removeClass( "ui-widget-content" )
		.find( "#main-tabs-nav" )
			.removeClass( "ui-corner-all" ).addClass( "ui-corner-top" )
			.find( "li" ).each(function( i ) {
				var done = Exercise.problems[i].done;
				
				if ( i === 0 || DEBUG || done != null ) {
					$(this).removeClass( "ui-state-disabled" );
					activeTab = i;
				}
				
				if ( done ) {
					$(this).markDone();
					activeTab = i + 1;
				}
			}).end()
		.end()
		.tabs( "select", activeTab );
	
	$("#overlay").hide();
	focusProblem();
};

var focusProblem = function() {
	if ( Output.testAnswers && Output.testAnswers.length > 0 ) {
		$(".tipbar input").first().focus();
	
	} else {
		$("#editor").data("editor").editor.focus();
		//setCursor( curProblem );
	}
};

var showQuestion = function() {
	$("#editor-box").showTip( "Question", Output.testAnswers, function() {
		$(".tipbar").buttonize();
		$(".tipbar input").first().val( Output.testAnswers.length > 0 ? curProblem.answer : "" ).focus();
		
		if ( !$("#get-hint").is(".ui-state-disabled") ) {
			$("#get-hint .ui-button-text").text( "Hints" );
		}
	});
};

var leaveProblem = function() {
	if ( curProblem ) {
		$( ".tipbar" ).hide();
		$("#editor").extractCursor( curProblem );
		extractResults( $("#editor").editorText() );
	}
};

var textProblem = function() {
	if ( curProblem ) {
		var editor = $("#editor").data( "editor" ).editor;
		
		$("#editor")
			.editorText( Output.testAnswers.length === 0 && curProblem.answer || curProblem.start || "" )
			.setCursor( curProblem, Output.testAnswers.length === 0 );
	}
};

var showProblem = function( problem ) {	
	leaveProblem();
	
	curProblem = problem;
	
	if ( curProblem.done == null ) {
		curProblem.done = false;
	}
	
	Output.init();
	
	var doAnswer = Output.testAnswers.length > 0;
	
	$("#results").hide();
	
	$("#code").toggleClass( "done", !!problem.done );
	$("#next-problem-desc").toggle( !!problem.done );
	$(".next-problem").toggle( !!problem.done );
	$("#solution-nav").toggleClass( "ui-state-disabled", !problem.done );
	// TODO: Have a next exercise button
	
	$("#editor-box-tabs").tabs( "select", 0 );
	$("#output-nav").addClass( "ui-state-disabled" );
	$("#tests-nav").toggleClass( "ui-state-disabled",  !problem.validate || doAnswer );
	$("#solution-nav").toggle( !!problem.solution );
	
	textProblem();
	
	$("#problem")
		.find( ".title" ).text( problem.title || "" ).end()
		.find( ".text" ).html( (problem.desc || "").replace( /\n/g, "<br>" ) ).end();
	
	$("#get-hint")
		.toggleClass( "ui-state-disabled", !(problem.hints && problem.hints.length) )
		.find( ".ui-button-text" ).text( "Hints" );
	
	$("#show-errors, #run-code, #reset-code").toggle( !doAnswer );
	
	if ( doAnswer ) {
		showQuestion();
		
	} else {
		$("#tipbar").hide();
	}
};

var insertExercise = function( testObj ) {
	$( $("#tab-tmpl").html() )
		.find( ".ui-icon" ).remove().end()
		.find( "a" ).append( testObj.title || "Problem" ).end()
		.appendTo("#main-tabs-nav");
};

var seekTo = function( time, noUpdate ) {
	if ( !noUpdate ) {
		$("#progress").slider( "option", "value", time / 1000 );
	}
	
	Record.seekTo( time );
	player.setPosition( time );
};

// track.waveform_url (hot)
var audioInit = function() {
	var wasPlaying;
	
	// An empty track means that the server is still processing the audio
	if ( track.duration === 0 ) {
		$("#playbar")
			.show()
			.html( "<span class='loading-msg'>Audio is processing, reload page in a minute." +
				"<span class='loading'></span></span>" );
		return;
	}
	
	var updateTimeLeft = function( time ) {
		$("#timeleft").text( "-" + formatTime( (track.duration / 1000) - time ) );
	};
	
	$("#progress").slider( "option", "max", track.duration / 1000 );

	Record.time = 0;

	updateTimeLeft( 0 );
	
	$("#playbar")
		.show()
		.append( "<span class='loading-msg'>Loading audio... " +
			"<span class='loading'></span></span>" );

	player = SC.stream( Exercise.audio_id.toString(), {
		autoLoad: true,
		
		whileplaying: function() {
			updateTimeLeft( player.position );
			$("#progress").slider( "option", "value", player.position / 1000 );
		},
		
		onplay: Record.play,
		onresume: Record.play,
		onpause: Record.pausePlayback,
		onfinish: function() {
			$(Record).trigger( "playPaused" );
			$(Record).trigger( "playStopped" );
			$(Record).trigger( "playEnded" );
		}
	});
	
	var checkStreaming = setInterval(function() {
		// We've loaded enough to start playing
		if ( player.bytesLoaded > 0 ) {
			$( "#playbar .loading-msg" ).hide();
			$( "#playbar .playarea" ).show();
			clearInterval( checkStreaming );
		}
	}, 16 );
	
	$("#progress").slider({
		start: function() {
			wasPlaying = Record.playing;
			Record.pausePlayback();
		},
		
		slide: function( e, ui ) {
			updateTimeLeft( ui.value );
			seekTo( ui.value * 1000, true );
		},
		
		change: function( e, ui ) {
			updateTimeLeft( ui.value );
		},
		
		stop: function( e, ui ) {
			if ( wasPlaying ) {
				Record.play();
			}
		}
	});
	
	$(Record).bind({
		playStarted: function() {
			if ( player.paused ) {
				player.resume();

			} else if ( player.playState === 0 ) {
				player.play();
			}
		},
		
		playPaused: function() {
			player.pause();
		},
		
		playStopped: function() {
			seekTo( 0 );
		}
	});
};
