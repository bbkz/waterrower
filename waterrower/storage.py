import sys
import os
import logging
import json
from urllib.error import HTTPError

class Storage(object):
    def __init__(self, config):
        self.DATAPATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../" ,config['global'].get('datapath')) #dev hack
        self.NEXTCLOUD_ENABLED = config['nextcloud'].getboolean('enabled')
        self.NEXTCLOUD_URL = config['nextcloud'].get('url')
        self.NEXTCLOUD_USERNAME = config['nextcloud'].get('username')
        self.NEXTCLOUD_PASSWORD = config['nextcloud'].get('password')
        self.NEXTCLOUD_FOLDER = config['nextcloud'].get('folder')
        self.VERBOSE = False

    def save_to_nextcloud(self):
        if self.NEXTCLOUD_ENABLED == True:
            import owncloud
            # login to nextcloud
            try:
                oc = owncloud.Client(self.NEXTCLOUD_URL)
                oc.login(self.NEXTCLOUD_USERNAME, self.NEXTCLOUD_PASSWORD)
                nc_version = oc.get_version()
                logging.debug('[*] storage.py: save_to_nextcloud() -> connected to server version: ' + nc_version)
            except Exception as e:
                logging.error('[-] storage.py: save_to_nextcloud() -> ', exc_info=1)

            # check or create folder on nextcloud
            try:
                folder_info = oc.file_info(self.NEXTCLOUD_FOLDER)
                if folder_info.file_type != "dir":
                    logging.error('[-] storage.py: save_to_nextcloud() -> folder is not a dir, this will not work')
            except owncloud.owncloud.HTTPResponseError as e:
                logging.debug('[*] storage.py: save_to_nextcloud() -> HTTPResponseError: '+str(e.status_code))
                if e.status_code == 404:
                    logging.debug('[*] storage.py: save_to_nextcloud() -> 404 not found, i will try to create the folder')
                    oc.mkdir(self.NEXTCLOUD_FOLDER)
            except Exception as e:
                logging.error('[-] storage.py: save_to_nextcloud() -> ', exc_info=1)

            # upload overview of all workouts
            try:
                overview_file_info = oc.file_info(self.NEXTCLOUD_FOLDER + "/workouts.json")
                if overview_file_info == "file":
                    logging.debug('[*] storage.py: save_to_nextcloud() -> workouts.json file already exists')
            except owncloud.owncloud.HTTPResponseError as e:
                logging.debug('[*] storage.py: save_to_nextcloud() -> HTTPResponseError: '+str(e.status_code))
                if e.status_code == 404:
                    logging.debug('[*] storage.py: save_to_nextcloud() -> 404 not found, i will try to upload workouts.json')
                    oc.put_file(os.path.join(self.NEXTCLOUD_FOLDER, 'workouts.json'), os.path.join(self.DATAPATH, 'workouts.json'))
            except Exception as e:
                logging.error('[-] storage.py: save_to_nextcloud() -> ', exc_info=1)

            # upload detailed view of each workouts
            for filename in os.listdir(self.DATAPATH):
                if filename.endswith(".json"):
                    if filename != "workouts.json":
                        upload_path = os.path.join(self.NEXTCLOUD_FOLDER, filename)
                        try:
                            event_file_info = oc.file_info(upload_path)
                            if event_file_info == "file":
                                logging.debug('[*] storage.py: save_to_nextcloud() -> '+upload_path+' already exists')
                        except owncloud.owncloud.HTTPResponseError as e:
                            logging.debug('[*] storage.py: save_to_nextcloud() -> HTTPResponseError: '+str(e.status_code))
                            if e.status_code == 404:
                                logging.debug('[*] storage.py: save_to_nextcloud() -> 404 not found, i will try to upload ' + filename)
                                oc.put_file(upload_path, os.path.join(self.DATAPATH, filename))
                        except Exception as e:
                            logging.error('[-] storage.py: save_to_nextcloud() -> ', exc_info=1)

            oc.logout()
