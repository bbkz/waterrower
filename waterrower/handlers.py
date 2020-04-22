# -*- coding: utf-8 -*-
import tornado.web
import logging
import json


class TemplateHandler(tornado.web.RequestHandler):
    def get(self, template='index.html'):
        self.render(template)


class DashboardWebsocketHandler(tornado.websocket.WebSocketHandler):
    def initialize(self, rower_interface):
        self._rower_interface = rower_interface

    def open(self):
        self._rower_interface.register_callback(self.on_rower_event)
        self._rower_interface.request_info()
        logging.info("[*] ws opened connection")

    def on_message(self, message):
        logging.info("[*] ws message from client: " + message)
        event = json.loads(message)
        self.handle_event(event)

    def handle_event(self, event):
        logging.info('[*] ws received event: ' + str(event))
        event_type = event.get('type')
        if event_type == 'workout-begin' and event['value']['target']:
            self._rower_interface.begin_workout(event['value']['type'], int(event['value']['target']))
        elif event_type == 'workout-end':
            self._rower_interface.end_workout()
        else:
            logging.info('[-] handler.py: DashboardWebsocketHandler->handle_event() -> do not understand event_type of ' + event_type)

    def on_close(self):
        self._rower_interface.remove_callback(self.on_rower_event)
        logging.info("[*] ws closed connection")

    def on_rower_event(self, event):
        self.write_message(event)
