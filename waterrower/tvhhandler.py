import tornado
import logging
import json
import requests
import re

def get_playlist(config):
    TVH_ENABLED = config['tvh'].getboolean('enabled')
    if TVH_ENABLED == True:
        TVH_URL = config['tvh'].get('url')
        TVH_USERNAME = config['tvh'].get('username')
        TVH_PASSWORD = config['tvh'].get('password')

        req = requests.get(TVH_URL+"/playlist/channels.m3u?profile=webtv-vp8-vorbis-webm", auth=(TVH_USERNAME, TVH_PASSWORD))
        req.encoding = 'UTF-8'
        if req.status_code == 200:
            return parse_m3u(req.text)
    return False

def parse_m3u(data):
    playlist = []
    for line in data.splitlines():
        if line.startswith('#EXTINF'):
            match = re.findall(r'^\#EXTINF:(.*?)\s*?logo=(.*?)\s*?tvg-id=(.*?),(.*?)$', line)
            if match:
                meta = {
                    "name": match[0][3],
                    "duration": match[0][0].replace('"', ''),
                    "thumbnail": {"src": match[0][1].replace('"', '')},
                    "poster": match[0][1].replace('"', ''),
                    "tvgid": match[0][2].replace('"', '')
                    }
                playlist.append(meta)
        if line.startswith('http:'):
            playlist[-1]["sources"] = {"src": line.replace('"', ''), "type": "video/webm"}
    return playlist

class PlayerHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("player.html", title="TV Player")

class PlaylistHandler(tornado.web.RequestHandler):
    def initialize(self, config):
        self.playlist = get_playlist(config)

    def get(self):
        if self.playlist:
            self.write(json.dumps(self.playlist))
