from google.appengine.ext import db

class Lesson(db.Model):
    ## Title of lesson
    title = db.StringProperty(required=True)
    ## Problem description and examples
    description = db.TextProperty()
    ## Code that user starts out with in their editor
    default_code = db.TextProperty()
    ## Testing code prelude to eval before tests
    test_prelude = db.TextProperty()
    ## Tests to run against user code
    tests = db.StringListProperty()
    ## Description to show if passed
    tests_pass = db.StringListProperty()
    ## Description to show if failed
    tests_fail = db.StringListProperty()
    ## JSLint lesson-specific options
    # Allows relaxing or strengthening default options.
    # See http://www.jslint.com/lint.html for description.
    jslint_prelude = db.TextProperty()
    ## How to handle unused variables
    # 0 for ignore, 1 for warn, 2 for error
    jslint_unused = db.IntegerProperty()


lesson0 = Lesson(
    title='Defining functions',
    description='''<p>Here is an example of how to write a function.</p>
<textarea class="demo">function f(x) {
    return x + 1;
}</textarea>
<p>Here's another example:</p>
<textarea class="demo">function f(x) {
    return 2 * x;
}</textarea>
<p>
Write a function named <tt>f</tt> that adds three to its input.
</p>''',
    default_code='''function f(x) {
    return x + 3;
}''',
    test_prelude='''/* This is the prelude */
var n = 300;
/* Define some big tests */
var m = 2344253;''',
    tests=["f(0) || true", "f(3) === 6", "f(-1) === 2", "f(n) === n + 3"],
    tests_pass=["f is defined", "", "", ""],
    tests_fail=["f is not defined", "", "", ""], 
    jslint_prelude="/*globals alert: false*/",
    jslint_unused=1, 
)
