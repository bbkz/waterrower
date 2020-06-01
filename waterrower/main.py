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
import configparser
from logger import DataLogger
import tvhhandler

## Set up the command-line options (parameters)
parser = argparse.ArgumentParser(description='Waterrower S4')
parser.add_argument("-c", "--config", default=False, help="optional path to config file otherwise it will look in the following order: "+os.path.dirname(__file__)+"/waterrower.cfg | /usr/local/etc/waterrower.cfg | /etc/waterrower.cfg", dest="config")
parser.add_argument("-d", "--debug", help="show debug informations", default=False, action="store_true", dest="debug")
parser.add_argument("-p", "--port", default=8000, help="webserver port to use", dest="port")
parser.add_argument("-t", "--test", default=False, action="store_true", dest="demo")


## Parse the parameters from command-line (options)
options = parser.parse_args()

# logging class / debug informations
if options.debug:
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)

# Parse configuration file
config = configparser.ConfigParser()

if options.config:
    if os.path.isfile(options.config):
        try:
            config.read(options.config)
            logging.debug("[*] configuration "+options.config+" loaded...")
        except Exception as e:
            logging.error('[-] ', exc_info=1)
            sys.exit(1)
else:
    if os.path.isfile(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'waterrower.cfg')):
        try:
            config.read(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'waterrower.cfg'))
            logging.debug("[*] configuration "+os.path.join(os.path.dirname(os.path.abspath(__file__)), 'waterrower.cfg')+" loaded...")
        except Exception as e:
            logging.error('[-] ', exc_info=1)
            sys.exit(1)
    elif os.path.isfile('/usr/local/etc/waterrower.cfg'):
        try:
            config.read('/usr/local/etc/waterrower.cfg')
            logging.debug("[*] configuration /usr/local/etc/waterrower.cfg loaded...")
        except Exception as e:
            logging.error('[-] ', exc_info=1)
            sys.exit(1)
    elif os.path.isfile('/etc/waterrower.cfg'):
        try:
            config.read('/etc/waterrower.cfg')
            logging.debug("[*] configuration /etc/waterrower.cfg loaded...")
        except Exception as e:
            logging.error('[-] ', exc_info=1)
            sys.exit(1)
    else:
        logging.error('[-] no configuration file found')
        sys.exit(1)


class Application(tornado.web.Application):
    def __init__(self, rower_interface):
        routes = [
            (r"/ws", handlers.DashboardWebsocketHandler, dict(rower_interface=rower_interface)),
            (r"/(.*.html)", handlers.TemplateHandler),
            (r"/", handlers.TemplateHandler),
            (r"/tv", tvhhandler.PlayerHandler),
            (r"/tv/playlist", tvhhandler.PlaylistHandler, dict(config=config)),
            ]
        settings = {
            'template_path': os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates"),
            'static_path': os.path.join(os.path.dirname(os.path.abspath(__file__)), "static"),
            'debug': options.debug
            }
        tornado.web.Application.__init__(self, routes, **settings)


def build_cleanup(rower_interface):
    def cleanup(signum, frame):
        logging.info("[*] cleaning up serial interface")
        rower_interface.close()
        sys.exit(0)
    return cleanup


def main():
    rower_interface = interface.Rower(options)
    DataLogger(rower_interface, config)
    cleanup = build_cleanup(rower_interface)
    signal.signal(signal.SIGINT, cleanup)
    http_server = tornado.httpserver.HTTPServer(Application(rower_interface))
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
