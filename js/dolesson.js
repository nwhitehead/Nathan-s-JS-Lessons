var myTypeOf = function (value) {
    var s = typeof value;
    if (s === 'object') {
        if (value) {
            if (typeof value.length === 'number' &&
                !(value.propertyIsEnumerable('length')) &&
                typeof value.splice === 'function') {
                s = 'array';
            }
        } else {
            s = 'null';
        }
    }
    return s;
}

Array.prototype.compareArrays = function(arr) {
    if (this.length != arr.length) return false;
    for (var i = 0; i < arr.length; i++) {
        if (this[i].compareArrays) { //likely nested array
            if (!this[i].compareArrays(arr[i])) return false;
            else continue;
        }
        if (this[i] != arr[i]) return false;
    }
    return true;
}

$.fn.animateHighlight = function(highlightColor, duration) {
    var highlightBg = highlightColor || "#FFFF9C";
    var animateMs = duration || 1500;
    var originalBg = this.css("backgroundColor");
    this.stop().css("background-color", highlightBg).animate({backgroundColor: originalBg}, animateMs);
};

$(function() {
    // After page load
    
    // hide next lesson link
    $('#nextlesson').hide();
    // Set next lesson target
    var target = '/lesson?id=' + next_lesson + '&lang=' + lang;
    $('#nextlesson_a1').attr("href", target);
    $('#nextlesson_a2').attr("href", target);
    // If nothing there, hide prelude and button
    if (test_prelude === '') {
        $('#toggleprelude').hide();
        $('#prelude').hide();
    }

    //// Options for CodeMirror areas
    // Demonstration areas have no cursor and are not editable
    var cm_demo_options = {
        mode:  "javascript",
        theme: "nojw-demo",
        indentUnit: 4,
        lineNumbers: true,
        matchBrackets: false,
        readOnly: "nocursor"
    };
    // User input area
    var cm_options = {
        mode:  "javascript",
        theme: "nojw",
        indentUnit: 4,
        lineNumbers: true,
        matchBrackets: true,
    };
    // Use textareas with class "demo" as CodeMirror areas
    var i;
    var demos = $(".demo");
    for (i = 0; i < demos.length; i++) {
        CodeMirror.fromTextArea(demos[i], cm_demo_options);
    }
    // Prelude area is just like demo area, but we remember it
    var prelude_textarea = document.getElementById('prelude');
    var prelude_editor;
    if (prelude_textarea) {
        prelude_editor = CodeMirror.fromTextArea(prelude_textarea, cm_demo_options);
        prelude_editor.setValue(test_prelude);
    }
    // Create user editor area
    cm_options.onCursorActivity = function () {
        var pos = myeditor.getCursor();
        $('#cursor').html((pos.line + 1) + ':' + (pos.ch + 1)); 
    };
    var myeditor = CodeMirror.fromTextArea(document.getElementById('code'), cm_options);
    myeditor.setValue(default_code);

    // Run JSLINT on some input and organize results
    function lint_check(txt) {
        var lint_result = JSLINT(txt, jslint_options);
        var lint_data = JSLINT.data();
        var lint_unused = lint_data.unused;
        var lint_globals = lint_data.globals;
        var lint_errors = lint_data.errors;
        if (typeof lint_unused === 'undefined') {
            lint_unused = [];
        }
        if (typeof lint_errors === 'undefined') {
            lint_errors = [];
        }
        // jslint_unused is global option
        //   0 ignore unused variables
        //   1 show warnings for unused variables
        //   2 show errors for unused variables
        if ((jslint_unused > 1) && lint_unused.length > 0) {
            lint_result = false;
        }
        var res = {
            result: lint_result,
            globals: lint_globals,
            errors: lint_errors,
            unused: lint_unused,
            error_report: JSLINT.report(true)
        };
        return res;
    }

    //// The console is for testing output about user program
    var console_txt = '';
    var console_time = 0;
    // Clear console area
    function console_clear() {
        console_txt = '';
        console_time = 0;
        $('#console').html(console_txt);
    }
    // Log html to console
    function console_log(txt) {
        console_txt += txt;
        console_time += 1;
        var update_func = function(msg) {
            var mymsg = msg;
            return function() {
                $('#console').html(mymsg);
            }
        }(console_txt);
        setTimeout(update_func, console_time * console_delay);
    }
    // Unlock next lesson
    function console_unlock() {
        console_time += 1;
        setTimeout(function () {
            $('#nextlesson').show();
        }, console_time * console_delay);
    }
    //// The prelude area shows testing code, toggle hide
    if (prelude_editor) {
        var prelude_elem = $(prelude_editor.getWrapperElement());
        prelude_elem.hide();
        $('#toggleprelude').click(function() {
            prelude_elem.slideToggle(300, function() {
                if (prelude_elem.is(':visible')) {
                    $('#toggleprelude').val('Hide prelude');
                    prelude_editor.refresh();
                } else {
                    $('#toggleprelude').val('Show prelude');
                }
            });
        });
    }
    //// Return short PASSED or FAILED tag
    // if set, msg replaces default text
    // 0 blank
    // 1 pass
    // 2 fail
    // 3 warning
    // 4 error
    // 5 success
    // 6 log
    function status(lvl, msg) {
        if (lvl === 0) {
            msg = typeof(msg) !== 'undefined' ? msg : "      ";
            return "<span>" + msg + "</span>  ";
        } else if (lvl === 1) {
            msg = typeof(msg) !== 'undefined' ? msg : "PASSED";
            return "<span class='passed'>" + msg + "</span>  ";
        } else if (lvl === 2) {
            msg = typeof(msg) !== 'undefined' ? msg : "FAILED";
            return "<span class='failed'>" + msg + "</span>  ";
        } else if (lvl === 3) {
            msg = typeof(msg) !== 'undefined' ? msg : "WARNING";
            return "<span class='warning'>" + msg + "</span>  ";
        } else if (lvl === 4) {
            msg = typeof(msg) !== 'undefined' ? msg : "ERROR&nbsp;";
            return "<span class='error'>" + msg + "</span>  ";
        } else if (lvl === 5) {
            msg = typeof(msg) !== 'undefined' ? msg : "&nbsp;&nbsp;ALL TESTS PASS!&nbsp;&nbsp;";
            return "<span class='success'>" + msg + "</span>  ";
        } else if (lvl === 6) {
            msg = typeof(msg) !== 'undefined' ? msg : "LOG&nbsp;&nbsp;&nbsp;";
            return "<span class='log'>" + msg + "</span>  ";
        }
    }
    // From JSLint object, create message about unused variables
    function unused_msg(un) {
        return "Unused variable " + un.name + " on line " + un.line + " in function " + un['function'];
    }
    // From JSLint object, create message about errors
    // This is copied and modified from JSLint internals.
    function error_msg(err) {
        var msg = 'Problem' + (isFinite(err.line) ?
            ' at line ' + String(err.line) + ' character ' +
            String(err.character) : '') +
            ': ' + err.reason.entityify();
        return msg;
    }
    function log() {
        var i, txt;
        txt = "";
        for(i = 0; i < arguments.length; i++) {
            txt = txt + arguments[i] + " ";
        }
        console_log("<p>" + status(6) + txt + "</p>");
    }
    //// When user clicks submit
    $('#submitbutton').click(function() {
        var i;
        // all_passed is true if no errors have been seen
        var all_passed = true;
        // Clear console
        console_clear();
        //// Lint check
        // jslint_prelude allows specialization of jslint options
        var v = jslint_prelude + myeditor.getValue();
        var lint_result = lint_check(v);
        // Check whether we had errors in JSLint
        if(!lint_result.result) {
            // Show all errors
            for(i = 0; i < lint_result.errors.length; i += 1) {
                var err = lint_result.errors[i];
                if (err) {
                    console_log("<p>" + status(4) + error_msg(err) + "</p>");
                }
            }
            all_passed = false;
        }
        // Log unused variable warnings/errors
        if ((jslint_unused > 0) && lint_result.unused.length > 0) {
            for(i = 0; i < lint_result.unused.length; i++) {
                var un = lint_result.unused[i];
                console_log("<p>" + status((jslint_unused < 2) ? 3 : 4) + 
                    unused_msg(un) + "</p>");
            }
        }
        // Show JSLint summary
        if(lint_result.result) {
            console_log("<p>" + status(1) + "No JSLint errors</p>");
        } else {
            console_log("<p>" + status(2) + "JSLint errors</p>");
        }
        // If we passed, continue on to tests
        if(lint_result.result) {
            try {
                eval(test_prelude);
                try {
                    eval(v);
                }
                catch(err) {
                    console_log("<p>" + status(4) + "Could not evaluate program (" + err + ")</p>");
                }
            }
            catch(err) {
                console_log("<p>" + status(4) + "Internal error with test prelude</p>");
            }
            // Now do all tests
            for(i = 0; i < tests.length; i++) {
                var output_;
                var res = false;
                var test_ = tests[i];
                var test_txt;
                var msg = '';
                if(test_.type === 'assert') {
                    test_.txt = '({ left: (' + test_.left + '), right: (' + test_.right + ') })';
                    if(test_.desc !== '') {
                        msg = test_.desc;
                    } else {
                        msg = test_.left + ' === ' + test_.right;
                    }
                } else if(test_.type === 'bool') {
                    test_.txt = '({ left: (' + test_.left + ') })';
                    if(test_.desc !== '') {
                        msg = test_.desc;
                    } else {
                        msg = test_.left;
                    }
                } else if(test_.type === 'null') {
                    test_.txt = test_.left;
                    if(test_.desc !== '') {
                        msg = test_.desc;
                    } else {
                        msg = test_.left;
                    }
                }
                // Evaluate test, ignore exceptions
                try {
                    output_ = eval(test_.txt);
                    if(test_.type === 'bool') {
                        if(output_.left) {
                            res = true;
                        }
                    } else if(test_.type === 'null') {
                        res = true;
                    } else if(test_.type === 'assert') {
                        if(output_.left === output_.right) {
                            res = true;
                        } else {
                            msg += '  (' + output_.left + ' !== ' + output_.right + ')';
                        }
                    }
                }
                catch(err) {
                    msg += '  (' + err + ')';
                }
                if(res) {
                    console_log("<p>" + status(1) + msg + "</p>");
                } else {
                    console_log("<p>" + status(2) + msg + "</p>");
                    all_passed = false;
                }
            }
        } else {
        }
        if (all_passed) {
            console_log("<p>" + status(5) + "</span></p>");
            console_unlock();
        }
    });
});
