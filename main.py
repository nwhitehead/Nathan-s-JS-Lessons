#!/usr/bin/env python

import os
import model

from google.appengine.api import memcache, users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.template import render
from google.appengine.ext.webapp.template import register_template_library
from google.appengine.ext.webapp import util

def make_template_handler(filename):
    class TemplateHandler(webapp.RequestHandler):
        def get(self):
            user = users.get_current_user()
            context = {
                'user': user,
                'login': users.create_login_url(self.request.uri),
                'logout': users.create_logout_url(self.request.uri),
            }
            tmpl = os.path.join(os.path.dirname(__file__), filename)
            self.response.out.write(render(tmpl, context))
    return TemplateHandler

class LessonHandler(webapp.RequestHandler):
    def get(self):
        lesson_id = self.request.get('id')
        lang = self.request.get('lang')
        if lang == '':
            lang = 'en'
        user = users.get_current_user()
        context = {
            'user': user,
            'login': users.create_login_url(self.request.uri),
            'logout': users.create_logout_url(self.request.uri),
        }
        tmpl = os.path.join(os.path.dirname(__file__), 'lang/' + lang + '/' + lesson_id + '.html')
        self.response.out.write(render(tmpl, context))

def make_static_lesson_handler(lesson, lang='en'):
    class Handler(webapp.RequestHandler):
        def get(self):
            lesson_id = lesson # default lesson
            user = users.get_current_user()
            context = {
                'user': user,
                'login': users.create_login_url(self.request.uri),
                'logout': users.create_logout_url(self.request.uri),
            }
            tmpl = os.path.join(os.path.dirname(__file__), 'lang/' + lang + '/' + lesson_id + '.html')
            self.response.out.write(render(tmpl, context))
    return Handler

application = webapp.WSGIApplication([
    ('/', make_static_lesson_handler('1000')),
    ('/lesson', LessonHandler),
    ('/about', make_template_handler('lang/en/about.html')),
    ('/news', make_template_handler('lang/en/news.html')),
], debug=True)

def main():
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
