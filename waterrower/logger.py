# -*- coding: utf-8 -*-
import json
import threading
import copy
import time
import logging
import storage
import asyncio
import google_fit

IGNORE_LIST = ['graph', 'tank_volume', 'display_hr', 'display_min', 'display_sec', 'display_sec_dec']


class DataLogger(object):
    def __init__(self, rower_interface, config):
        self.config = config
        self.DATAPATH = config['global']['datapath']
        self.GOOGLE_FIT_ENABLED = config['google_fit'].getboolean('enabled')
        self.VERBOSE = False

        self._rower_interface = rower_interface
        self._rower_interface.register_callback(self.on_rower_event)
        self._event = {}
        self._events = []
        self._activity = None
        self._stop_event = threading.Event()

    def on_rower_event(self, event):
        if event['type'] in IGNORE_LIST:
            return
        if event['value']:
            self._event[event['type']] = event['value']

        if event['type'] == 'workout-start':
            self.end_activity()
            self.start_activity()

        if event['type'] == 'reset':
            self.end_activity()

        if event['type'] == 'exit':
            self.end_activity()

        #TODO allow to get history?

    def start_activity(self):
        self._stop_event = threading.Event()
        self._activity = {
            'start_time': int(round(time.time() * 1000))
        }
        self._event = {}
        self._events = []
        thread = threading.Thread(target=self._save_event)
        thread.daemon = True
        thread.start()

    def end_activity(self):
        self._stop_event.set()
        if self._activity:
            self._activity['end_time'] = int(round(time.time() * 1000))
            self._activity['total_strokes'] = 0
            self._activity['total_distance_m'] = 0
            if 'total_strokes' in self._event:
                self._activity['total_strokes'] = self._event['total_strokes']
            if 'total_distance_m' in self._event:
                self._activity['total_distance_m'] = self._event['total_distance_m']
            # TODO add global avg
            # TODO add max?

            with open(self.DATAPATH + '/event_%s.json' % self._activity['start_time'], 'w', encoding='utf-8') as f:
                f.write(json.dumps(self._events, ensure_ascii=False))
            activities = None
            try:
                with open(self.DATAPATH + '/workouts.json') as data_file:
                    activities = json.load(data_file)
            except:
                pass
            if activities is None:
                activities = []
            activities.append(self._activity)
            with open(self.DATAPATH + '/workouts.json', 'w', encoding='utf-8') as f:
                f.write(json.dumps(activities, ensure_ascii=False))

            # upload your data to google fit
            if self.GOOGLE_FIT_ENABLED == True:
                try:
                    if not self._rower_interface._demo:
                        google_fit.post_activity(self._activity)
                except Exception as e:
                    logging.error('[-] logger.py: end_activity() -> ', exc_info=1)

            # upload to storage @todo migrate google_fit into it
            s = storage.Storage(self.config)
            s.save_to_nextcloud()

            self._activity = None

    def _save_event(self):
        asyncio.set_event_loop(asyncio.new_event_loop())
        while not self._stop_event.is_set():
            #TODO keep track of max?
            #TODO keep track of history?
            self._event['time'] = int(round(time.time() * 1000))
            self._event['elapsed'] = self._event['time'] - self._activity['start_time']
            event = copy.deepcopy(self._event)
            self._events.append(event)
            # send graph event data to the websocket
            callback_data = {
                "type": "graph",
                "value": event,
                "raw": None,
                "at": event['time']
            }
            if self.VERBOSE:
                callback_data.update({"verbose": True})
            self._rower_interface.notify_callbacks(callback_data)
            self._event = {}
            self._stop_event.wait(5)
