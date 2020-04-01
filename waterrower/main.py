# -*- coding: utf-8 -*-
import os.path
import json
import logging
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import handlers
import interface
import signal
import sys
import datetime
import argparse
from logger import DataLogger

## Set up the command-line options (parameters)
parser = argparse.ArgumentParser(description='Waterrower S4')
parser.add_argument("-d", help="show debug informations", default=False, action="store_true", dest="debug")
parser.add_argument("-p", "--port", default=8000, help="webserver port to use", dest="port")
parser.add_argument("-t", "--test", default=False, action="store_true", dest="demo")

## Parse the parameters from command-line (options)
options = parser.parse_args()

# logging class / debug informations
if options.debug:
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)


class Application(tornado.web.Application):
    def __init__(self, rower_interface):
        routes = [
            (r"/ws", handlers.DashboardWebsocketHandler, dict(rower_interface=rower_interface)),
            (r"/(.*.html)", handlers.TemplateHandler),
            (r"/", handlers.TemplateHandler),
            ]
        settings = {
            'template_path': os.path.join(os.path.dirname(__file__), "templates"),
            'static_path': os.path.join(os.path.dirname(__file__), "static"),
            'debug': options.debug
            }
        tornado.web.Application.__init__(self, routes, **settings)


def build_cleanup(rower_interface):
    def cleanup(signum, frame):
        logging.info("cleaning up")
        rower_interface.close()
        sys.exit(0)
    return cleanup


def main():
    rower_interface = interface.Rower(options)
    #TODO allow to load history of logger?
    DataLogger(rower_interface)
    cleanup = build_cleanup(rower_interface)
    signal.signal(signal.SIGINT, cleanup)
    rower_interface.open()
    http_server = tornado.httpserver.HTTPServer(Application(rower_interface))
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
