// Load in SJS-compiled dependencies
require( "sjs:apollo-sys" ).require( "/canvas-editor/js/text-apollo" );

var Output = {
	icons: {
		pass: "check",
		fail: "none",
		error: "alert",
		info: "info"
	},
	
	init: function( id ) {
		this.id = id;
		this.$elem = $( "#" + id );
		this.$editor = $( "#editor" );
		this.editor = this.$editor.data( "editor" ).editor;

		this.tests = [];
		this.testAnswers = [];

		this.errors = [];
		this.asserts = [];
		this.inTask = null;
		
		this.toExec = true;
		this.context = {};
		
		if ( curProblem && !curProblem.taskOpen ) {
			curProblem.taskOpen = [];
		}
		
		// Default to using CanvasOutput
		var type = CanvasOutput;
		
		// Prime the test queue
		if ( curProblem && curProblem.validate ) {
			Output.exec( curProblem.validate, Output.testContext );
			
			if ( Output.tests.length ) {
				for ( var i = 0; i < Output.tests.length; i++ ) {
					var test = Output.tests[i];
					
					if ( test.type !== "default" ) {
						type = test.type;
					}
				}
			}
		}
		
		Output.setOutput( type );
		
		this.bind();
	},
	
	bind: function() {
		if ( this.bound ) {
			return;
		}
		
		Output.editor.on( "change", function() {
			Output.toExec = Output.getUserCode();
		});
		
		setInterval(function() {
			if ( Output.toExec != null ) {
				Output.runCode( Output.toExec === true ?
					Output.getUserCode() :
					Output.toExec );
				
				Output.toExec = null;
			}
		}, 100 );
		
		this.bound = true;
	},
	
	setOutput: function( output ) {
		if ( Output.output ) {
			Output.output.kill();
		}
		
		Output.output = output.init();
	},
	
	registerOutput: function( output ) {
		if ( !this.outputs ) {
			this.outputs = [];
		}
		
		this.outputs.push( output );
		
		jQuery.extend( this.testContext, output.testContext );
	},
	
	props: function() {
		return Output.output ? Output.output.props : {};
	},
	
	propList: function() {
		var propList = [],
			externalProps = this.props();

		for ( var prop in externalProps ) {
			propList.push( prop + ":" + externalProps[ prop ] );
		}

		return propList.join( "," );
	},
	
	runCode: function( userCode ) {
		var doRunTests = !!JSHINT( "/*jshint undef:true, noempty:true, " + 
				"plusplus:true, noarg:true, latedef:true, eqeqeq:true, curly:true *//*global " +
				Output.propList() + "*/\n" + userCode ),
			hintData = JSHINT.data(),
			externalProps = Output.props();
		
		Output.globals = {};

		if ( hintData && hintData.globals ) {
			for ( var i = 0, l = hintData.globals.length; i < l; i++ ) (function( global ) {
				if ( global in TextOutput.props ) {
					if ( Output.output !== TextOutput ) {
						Output.setOutput( TextOutput.init() );
					}
				}

				// Do this so that declared variables are gobbled up
				// into the global context object
				if ( !externalProps[ global ] && !(global in Output.context) ) {
					Output.context[ global ] = null;
				}
				
				Output.globals[ global ] = true;
			})( hintData.globals[i] );
		}
		
		Output.errors = [];

		if ( doRunTests ) {
			// Run the tests
			Output.test( userCode );

			Output.exec( userCode, Output.context );

			/*
			// TODO(jlfwong): This breaks right now because runCode assumes
			// that Output.exec is synchronous when it's not
			if ( Output.output && Output.output.runCode ) {
				Output.output.runCode( userCode, Output.context );
				
			} else {
				Output.exec( userCode, Output.context );
			}
			*/
			
		} else {
			for ( var i = 0; i < JSHINT.errors.length; i++ ) {
	            var error = JSHINT.errors[ i ];

	            if ( error && error.line && error.character &&
						error.reason && !/unable to continue/i.test( error.reason ) ) {

	                Output.errors.push({
	                    row: error.line - 2,
	                    column: error.character - 1,
	                    text: clean( error.reason ),
	                    type: "error",
	                    lint: error
	                });
				}
	        }
		}
		
		Output.toggleErrors();
		
		extractResults( userCode );
	},
	
	toggleErrors: function() {
		var session = Output.editor.getSession(),
			hasErrors = !!Output.errors.length;
		
		session.clearAnnotations();
		
		$("#show-errors").toggleClass( "ui-state-disabled", !hasErrors );
		$("#output .overlay").toggle( hasErrors );
		
		Output.toggle( !hasErrors );
		
		if ( hasErrors ) {
			Output.errors = Output.errors.sort(function( a, b ) {
				return a.row - b.row;
			});

	        session.setAnnotations( Output.errors );
	
			if ( Output.errorDelay ) {
				clearTimeout( Output.errorDelay );
			}
			
			Output.errorDelay = setTimeout( function() {
				if ( Output.errors.length > 0 ) {
					$("#output").showTip( "Error", Output.errors, function() {
						$( ".tipbar.error .text" ).append( " (<a href=''>View Error</a>)" );
					});
				}
			}, 1500 );
			
		} else {
			$("#output").hideTip( "Error" );
		}
	},
	
	test: function( userCode ) {
		if ( Output.testAnswers.length ) {
			return;
		}
		
		var insert = $( "#results .desc" ).empty();
		
		Output.testing = true;
		Output.asserts = [];

		for ( var i = 0; i < Output.tests.length; i++ ) {
			var fieldset = $( "<fieldset><legend>" + Output.tests[i].name + " (<a href=''>View Output</a>)</legend><ul></ul></fieldset>" )
				.appendTo( insert );
		
			var testOutput = Output.runTest( userCode, Output.tests[i], i );
		
			fieldset.data( "output", testOutput || false );
		}
	
		Output.testing = false;

		var total = Output.asserts.length,
			pass = 0;

		for ( var i = 0; i < Output.asserts.length; i++ ) {
			if ( Output.asserts[i] ) {
				pass += 1;
			}
		}

		if ( total > 0 ) {
			if ( pass === total ) {
				problemDone();
			}

			$("#results")
			/*
				.find( "h3" ).text( pass === total ?
						"Test Results: All Tests Passed!" :
						"Test Results: " + (total - pass) + " Test" + (total - pass === 1 ? "" : "s") + " Failed." ).end()
				*/
					.toggleClass( "multiple", tests.length > 1 )
					.toggleClass( "error", pass < total )
					.show();
				
		} else {
			problemDone();
		}
	},
	
	runTest: function( userCode, test, i ) {
		Output.clear();
		
		if ( Output.output && Output.output.preTest ) {
			Output.output.preTest();
		}
		
		if ( typeof test.type === "object" ) {
			if ( test.type.runTest ) {
				test.type.runTest( userCode, test, i );
			}
		
		} else if ( curProblem && curProblem.validate ) {
			// We need to maintain the closure so we have to re-initialize the tests
			// and then run the current one. Definitely not ideal.
			Output.exec( userCode +
				"\n(function(){ Output.tests = [];\n" +
				curProblem.validate + "\n})(); Output.tests[" + i + "].fn();",
				Output.context, Output.testContext );
		}
		
		if ( Output.output && Output.output.postTest ) {
			return Output.output.postTest();
		}
	},

	toggle: function( toggle ) {
		if ( Output.output && Output.output.toggle ) {
			Output.output.toggle( toggle );
		}
	},
	
	start: function() {
		if ( Output.output && Output.output.start ) {
			Output.output.start();
		}
	},
	
	stop: function() {
		if ( Output.output && Output.output.stop ) {
			Output.output.stop();
		}
	},
	
	restart: function() {
		if ( Output.output && Output.output.restart ) {
			Output.output.restart();
		}
	},
	
	clear: function() {
		if ( Output.output && Output.output.clear ) {
			Output.output.clear();
		}
	},

	handleError: function( e ) {
		// Temporarily hide the errors generated by using a prompt()
		// See: #50
		if ( !/Unexpected end of input/.test( e.message ) ) {
			Output.errors.push({
				row: 0,
				column: 0,
				text: clean( e.message ),
				type: "error"
			});
		
			Output.testContext.assert( false, "Error: " + e.message,
			 	"A critical problem occurred in your program making it unable to run." );
			
			Output.toggleErrors();
		}
	},

	exec: function( code ) {
		var stubbed = function (obj) {
			var stubbedContext = {};

			// XXX(jlfwong): This won't work in general - I'm only
			// stubbing out the global functions and things that can be
			// serialized
			//
			// I could temporarily monkey patch Function.prototype.toJSON
			// Hmm...
			for ( var prop in obj ) {
				var val = obj[prop];
				
				if (_.isFunction(val)) {
					// Sentinel value to convert back into a stubbed
					// function
					stubbedContext[prop] = '__STUBBED_FUNCTION__';
				} else if (_.isNumber(val) || _.isNull(val) || _.isString(val) || _.isUndefined(val)) {
				
					stubbedContext[prop] = val;
				} else {
					// If it's serializable, stick it on, otherwise,
					// drop it
					try {
						JSON.stringify(val);

						// XXX(jlfwong): Figure out why this is causing 
						// DATA_CLONE_ERR: DOM Exception 25
						// stubbedContext[prop] = val;
					} catch(e) {
						// pass
					}
				}
			}

			return stubbedContext;
		};

		if ( Output.output && Output.output.compile ) {
			code = Output.output.compile( code );
		}	

		var contexts = Array.prototype.slice.call( arguments, 1 );

		var runForReal = function() {
			try {
				(new Function( code )).apply( Output.context, contexts );
			} catch( e ) {
				Output.handleError( e );
			}
		};
		
		for ( var i = 0; i < contexts.length; i++ ) {
			if ( contexts[i] ) {
				code = "with(arguments[" + i + "]){\n" + code + "\n}";
			}
		}

		
		if ( !window.Worker ) {
			// No web worker support
			runForReal();
			return;
		}

		var runId = _.uniqueId('run');

		if ( Output.worker ) {
			// Might have already terminated, but let's be sure
			Output.worker.terminate();
		}

		Output.worker = new Worker('/canvas-editor/js/worker.js');

		var terminated = false;
		var terminate = function() {
			if (terminated) return false;
			Output.worker.terminate();
			terminated = true;
			return true;
		};

		Output.worker.onmessage = function(event) {
			var data = event.data;
			var type = data.type;
			if (type === 'start') {
				// console.log('START');
			} else if (type === 'end') {
				// console.log('END');
				terminate();
				runForReal();
			} else if (type === 'log') {
				console.warn('WORKER:', data.message);
			}
		};
		Output.worker.onerror = function(event) {
			console.error('WORKERERROR:', event.message);
			// If there was an error, we'll run it locally in case it only
			// errored in the worker thread
			terminate();
			runForReal();
		};

		// If the thread doesn't finish executing quickly, kill it and
		// don't execute the code
		//
		// TODO(jlfwong): Compensate for the runtime difference between the
		// drawing routines and the no-ops used in the worker thread
		//
		// Calling ellipse() 10000 in the worker thread is almost free, but is
		// very expensive on the real canvas
		window.setTimeout(function() {
			if (terminate()) {
				Output.handleError({
					message: 'Took too long to run'
				});
			}
		}, 500);
		
		Output.worker.postMessage({
			code: code,
			globalContext: stubbed(Output.context),
			contexts: _(contexts).map(stubbed)
		});
	},
	
	testContext: {
		test: function( name, fn, type ) {
			if ( !fn ) {
				fn = name;
				name = "Test Case";
			}

			Output.tests.push({
				name: name,
				
				type: type || "default",

				fn: function() {
					try {
						return fn.apply( this, arguments );

					} catch( e ) {
						Output.handleError( e );
					}
				}
			});
		},
		
		testAnswer: function( name, val ) {
			Output.testAnswers.push({ answer: val, text: "<form>" + name +
				"<br/><input type='text'/>" +
				"<input type='submit' value='Check Answer' class='ui-button'/></form>" });
		},
		
		task: function( msg, tip ) {
			Output.testContext.log( msg, "pass", tip );
			
			var pos = $( "#results li.task" ).length,
				task = $( "#results li" ).last()
					.addClass( "task" )
					.append( "<ul></ul>" );
			
			if ( Output.inTask !== null ) {
				task.parents( "ul" ).last().append( task );
			}
			
			if ( curProblem && curProblem.taskOpen[ pos ] ) {
				task.find( "ul" ).show();
			}
			
			Output.inTask = true;
		},
		
		log: function( msg, type, expected ) {
			type = type || "info";
			
			Output.updateTask( type );

			$( "<li class='" + type + "'><span class='check'><span class='ui-icon ui-icon-" +
				Output.icons[ type ] + "'></span></span> <a href='' class='msg'>" +
				clean( msg ) + "</a></li>" )
				.data( "expected", expected || false )
				.appendTo( $("#results ul").last() )
		},

		assert: function( pass, msg, expected ) {
			pass = !!pass;
			
			Output.testContext.log( msg, pass ? "pass" : "fail", expected );
			Output.asserts.push( pass );

			return pass;
		},

		isEqual: function( a, b, msg ) {
			var pass = a === b;
			
			Output.testContext.log( msg, pass ? "pass" : "fail", [ a, b ] );
			Output.asserts.push( pass );

			return pass;
		}
	},
	
	updateTask: function( type ) {
		if ( Output.inTask === true && type !== "pass" ) {
			$( "#results li.task" ).last()
				.removeClass( "pass" )
				.addClass( type || "" )
				.find( ".ui-icon" )
					.removeClass( "ui-icon-" + Output.icons.pass )
					.addClass( "ui-icon-" + Output.icons[ type ] );
			
			Output.inTask = false;
		}
	},
	
	getUserCode: function() {
		return $("#editor").editorText();
	},
	
	stringify: function( obj ) {
		try {
			return typeof obj === "function" ?
				obj.toString() :
				JSON.stringify( obj );
		} catch ( e ) {
			console.error( e, obj );
			return "null";
		}
	}
};

// TODO: Handle saved output from a test run

var TextOutput = {
	props: {
		input: false,
		inputNumber: false,
		print: false
	},
	
	init: function() {
		this.id = this.id || "output-text";
		this.$elem = $( "#" + this.id );
		this.$elem.show();
		
		this.oni = window.__oni_rt;
		
		// For managing real-time inputs
		if ( curProblem && !curProblem.inputs ) {
			curProblem.inputs = [];
		}
		
		// Need to execute the test code in apollo itself
		this.doCompile = true;
		
		this.focusLine = null;
		this.inputNum = 0;
		this.curLine = -1;
		this.toInput = null;
		
		Output.context = jQuery.extend( {}, TextOutput.context );
		
		this.bind();
		
		return this;
	},
	
	bind: function() {
		if ( this.bound ) {
			return;
		}
		
		var self = this,
			root = this.$elem;
		
		this.$elem.delegate( "input", "keydown keyup change", function() {
			var last = $(this).data( "last" ),
				val = $(this).val() || null;

			if ( last != val ) {
				var pos = root.find( "input" ).index( this );

				if ( !TextOutput.restarting ) {
					if ( curProblem ) {
						curProblem.inputs[ pos ] = val;
					}
					
					TextOutput.focusLine = root.children().index( this.parentNode );
				}

				$(this).data( "last", val );
			}
		});
		
		setInterval( function() {
			if ( TextOutput.focusLine != null ) {
				TextOutput.runCode( Output.getUserCode() );
				TextOutput.focusLine = null;
			}
		}, 13 );
		
		this.bound = true;
	},
	
	runCode: function( code ) {		
		TextOutput.clear();
		Output.exec( code, Output.context );
	},
	
	context: {
		print: function( msg ) {
			TextOutput.resumeTest();

			if ( TextOutput.focusLine != null && TextOutput.focusLine + 1 > ++TextOutput.curLine ) {
				return;
			}

			TextOutput.addLine( clean( msg ) );
			
			TextOutput.resumeTest( "waitTestPrint", msg );
		}
	},
	
	showInput: function( msg ) {
		if ( TextOutput.focusLine != null && TextOutput.focusLine + 1 > ++TextOutput.curLine ) {
			return;
		}

		var div = TextOutput.addLine( clean( msg ) + " <input type='text' class='text'/>" ),
			input = div.find( "input" )
				.val( TextOutput.toInput != null ? TextOutput.toInput : "" );

		if ( !Output.testing ) {
			TextOutput.$elem.scrollTop( TextOutput.$elem[0].scrollHeight );
		}

		if ( TextOutput.inputNum - 1 === TextOutput.focusInput ) {
			input.focus();
		}
	},
	
	addLine: function( line ) {
		var $line = $( "<div>" + line + "</div>" )
			.appendTo( this.$elem );
		
		// output.scrollTop( output[0].scrollHeight );
		
		return $line;
	},
	
	resumeTest: function( name, msg ) {
		name = name || "waitTest";
		
		if ( TextOutput[ name ] ) {
			var doResume = TextOutput[ name ];
			delete TextOutput[ name ];
			doResume( msg );
			
			return true;
		}
	},
	
	preTest: function() {
		TextOutput.$elem = $( "#" + this.id + "-test" );
	},
	
	postTest: function() {
		var oldElem = TextOutput.$elem[0];
		
		TextOutput.$elem = $( "#" + this.id );
		
		return oldElem;
	},
	
	runTest: function( userCode, test, i ) {
		// TODO: Have all tests run after user's code has been defined
		// Will need to force input/print statements to block during testMode
		
		Output.clear();

		// Load up the IO tests
		Output.exec( "waitfor() { TextOutput.waitTest = resume; } Output.tests[" + i + "].fn();", Output.testContext );
		
		// Need to execute the test code in apollo itself
		// Need to be compiled after they've been referenced
		if ( TextOutput.doCompile && curProblem && curProblem.validate ) {
			Output.tests = [];
			Output.exec( curProblem.validate, Output.testContext );
			TextOutput.doCompile = false;
		}

		// Then run the user's code
		Output.exec( userCode, Output.context );
		
		// Make sure the remaining IO tests are printed out so that the
		// user knows what's expected of them
		var checkIO;
		
		do {
			checkIO = false;
			
			TextOutput.resumeTest();
			
			checkIO = TextOutput.resumeTest( "waitTestInput", false ) || checkIO;
			checkIO = TextOutput.resumeTest( "waitTestPrint", false ) || checkIO;
		} while( checkIO );
	},
	
	testContext: {
		testIO: function( name, fn ) {
			Output.testContext.test( name, fn, TextOutput );
		}
	},
	
	clear: function() {
		if ( !Output.testing && TextOutput.focusLine != null ) {
			TextOutput.$elem.children().slice( TextOutput.focusLine + 1 ).remove();

		} else {
			TextOutput.$elem.empty();
		}

		TextOutput.inputNum = 0;
		TextOutput.curLine = -1;
	},
	
	compile: function( code ) {
		return TextOutput.oni.c1.compile( code );
	},
	
	kill: function() {
		TextOutput.$elem.empty();
		TextOutput.$elem.hide();
	},
	
	restart: function() {
		if ( curProblem ) {
			curProblem.inputs = [];
		}
		
		TextOutput.focusLine = null;
		TextOutput.inputNum = 0;
		TextOutput.curLine = -1;
		
		TextOutput.restarting = true;
		Output.runCode( Output.getUserCode() );
		TextOutput.restarting = false;
	}
};

Output.registerOutput( TextOutput );

var CanvasOutput = {
	init: function( id ) {
		this.id = id || "output-canvas";
		this.$elem = $( "#" + this.id );
		this.$elem.show();
		
		CanvasOutput.lastGrab = null;
		
		CanvasOutput.build( this.id );
		
		if ( !CanvasOutput.props ) {
			var props = CanvasOutput.props = {};
			
			// Make sure that only certain properties can be manipulated
			for ( var prop in Output.context ) {
				if ( prop.indexOf( "__" ) < 0 ) {
					props[ prop ] = !(/^[A-Z]/.test( prop ) ||
						typeof Output.context[ prop ] === "function");
				}
			}

			props.draw = true;
		}
		
		return this;
	},
	
	build: function( canvas ) {
		CanvasOutput.canvas = Output.context = new Processing( canvas, function( instance ) {
			instance.draw = CanvasOutput.DUMMY;
		});
		
		CanvasOutput.canvas.size( 400, 400 );
		CanvasOutput.canvas.frameRate( 30 );
		CanvasOutput.clear();
	},
	
	DUMMY: function(){},
	
	preTest: function() {
		CanvasOutput.oldContext = Output.context;
		
		CanvasOutput.testCanvas = document.createElement( "canvas" );
		CanvasOutput.build( CanvasOutput.testCanvas );
	},
	
	postTest: function() {
		CanvasOutput.canvas = Output.context = CanvasOutput.oldContext;
		
		return CanvasOutput.testCanvas;
	},
	
	runTest: function( userCode, test, i ) {
		// TODO: Add in Canvas testing
		// Create a temporary canvas and a new processing instance
		// temporarily overwrite Output.context
		// Save the canvas for later and return that as the output
		// CanvasOutput.runCode( userCode );
	},
	
	runCode: function( userCode ) {
		// Grab all the externally-exposed variables
		var grabAll = {},
			fnCalls = [];
		
		// TODO: Make sure these calls don't have a side effect
		for ( var global in Output.globals ) (function( global ) {
			grabAll[ global ] = typeof Output.context[ global ] === "function" ?
				function(){ fnCalls.push([ global, arguments ]); } :
				Output.context[ global ];
		})( global );
		
		Output.exec( userCode, grabAll );

		// Inject the newly-changed code
		var externalProps = Output.props(),
			inject = "";

		// Look for new top-level function calls to inject
		for ( var i = 0; i < fnCalls.length; i++ ) {
			var props = Array.prototype.slice.call( fnCalls[i][1] );
			inject += fnCalls[i][0] + "(" + props.join( "," ) + ");\n";
		}

		// We also look for newly-changed top-level variables to inject
		for ( var prop in grabAll ) {
			grabAll[ prop ] = Output.stringify( grabAll[ prop ] );

			if ( CanvasOutput.lastGrab && externalProps[ prop ] !== false &&
					(!(prop in CanvasOutput.lastGrab) || grabAll[ prop ] != CanvasOutput.lastGrab[ prop ]) ) {
				inject += "var " + prop + " = " + grabAll[ prop ] + ";\n";
			}
		}
		
		// Make sure that deleted variables go away
		for ( var prop in CanvasOutput.lastGrab ) {
			if ( !(prop in grabAll) && (!(prop in CanvasOutput.props) || prop === "draw") ) {
				inject += "delete Output.context." + prop + ";\n";
				
				if ( prop === "draw" ) {
					CanvasOutput.clear();
				}
			}
		}
		
		// Make sure the matrix is always reset
		Output.context.resetMatrix();
		
		// Make sure the various draw styles are also reset
		// if they were just removed
		if ( CanvasOutput.lastGrab ) {
			if ( !grabAll.background && CanvasOutput.lastGrab.background ) {
				CanvasOutput.resetBackground();
			}
		
			if ( !grabAll.stroke && CanvasOutput.lastGrab.stroke ) {
				CanvasOutput.resetStroke();
			}
		
			if ( !grabAll.strokeWeight && CanvasOutput.lastGrab.strokeWeight ) {
				CanvasOutput.resetStrokeWeight();
			}
		
			if ( !grabAll.fill && CanvasOutput.lastGrab.fill ) {
				CanvasOutput.resetFill();
			}
		}
		
		// Re-run the entire program if we don't need to inject the changes
		if ( Output.context.draw === CanvasOutput.DUMMY || !CanvasOutput.lastGrab ) {
			CanvasOutput.clear();
			Output.exec( userCode, Output.context );
			
		} else if ( inject ) {
			Output.exec( inject, Output.context );
		}
		
		// Need to make sure that the draw function is never deleted
		// (Otherwise Processing.js starts to freak out)
		if ( !Output.context.draw ) {
			Output.context.draw = CanvasOutput.DUMMY;
		}

		CanvasOutput.lastGrab = grabAll;
	},
	
	restart: function() {
		CanvasOutput.lastGrab = null;
		CanvasOutput.runCode( Output.getUserCode() );
	},
	
	testContext: {
		testCanvas: function( name, fn ) {
			Output.testContext.test( name, fn, CanvasOutput );
		}
	},
	
	toggle: function( doToggle ) {
		if ( doToggle ) {
			CanvasOutput.start();
			
		} else {
			CanvasOutput.stop();
		}
	},
	
	stop: function() {
		CanvasOutput.canvas.noLoop();
	},
	
	start: function() {
		CanvasOutput.canvas.loop();
	},
	
	clear: function() {
		CanvasOutput.resetStrokeWeight();
		CanvasOutput.resetStroke();
		CanvasOutput.resetBackground();
		CanvasOutput.resetFill();
	},
	
	resetStroke: function() {
		if ( Output.dark ) {
			CanvasOutput.canvas.stroke( 255, 255, 255 );
		} else {
			CanvasOutput.canvas.stroke( 0, 0, 0 );
		}
	},
	
	resetStrokeWeight: function() {
		CanvasOutput.canvas.strokeWeight( 1 );
	},
	
	resetBackground: function() {
		if ( Output.dark ) {
			CanvasOutput.canvas.background( 15, 15, 15 );
		} else {
			CanvasOutput.canvas.background( 255 );
		}
	},
	
	resetFill: function() {
		if ( Output.dark ) {
			CanvasOutput.canvas.fill( 15, 15, 15 );
		} else {
			CanvasOutput.canvas.fill( 255, 255, 255 );
		}
	},
	
	kill: function() {
		CanvasOutput.canvas.exit();
		CanvasOutput.$elem.hide();
	}
};

Output.registerOutput( CanvasOutput );

var clean = function( str ) {
	return String( str ).replace( /</g, "&lt;" );
};
