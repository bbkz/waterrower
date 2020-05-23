# waterrower

A web ui for the s4 monitor on waterrower rowing machine

This is a fork of https://github.com/bfritscher/waterrower, where is stated that it's
initial base is a fork from https://github.com/gar3thjon3s/rower and is inspired by https://github.com/olympum/oarsman/blob/master/s4/s4.go and the Water Rower S4 & S5 USB Protocol document.

* http://[your host]:8000
* http://[your host]:8000/archive.html

## Features

* record workout details and overview
* show realtime graph and statistics
* view the archive of the workouts
* upload workouts to nextcloud or google fit

![Workout](/docs/screenshot1.png?raw=true "Workout View")

# Installation / Configuration

## Requirement

It uses python3, the python libraries needed to run are stated in the requirements.txt file. But here are some packages that i installed on raspbian 10 "buster":

```
sudo apt install python3-pip python3-serial python3-oauth2client
```

For additional and higher versions the following pip packages needs to be installed:

```
sudo pip3 install tornado pyocclient google-api-python-client
```

## Testing

There are two bash scripts that can be used to test and develop:

* bin/dev -> debugging enabled
* bin/waterrower -> productive environment

## Architecture

### interface.py

is all about the connection to the s4 - sensor hardware

### data

* all workout data is saved in json files
* a data folder inside `waterrower/static/` is required for the archive viewer, to access the data
