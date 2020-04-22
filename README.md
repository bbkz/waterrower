# waterrower

A web ui for the s4 monitor on waterrower rowing machine

This is a fork of https://github.com/bfritscher/waterrower, where is stated that it's
initial base is a fork from https://github.com/gar3thjon3s/rower and is inspired by https://github.com/olympum/oarsman/blob/master/s4/s4.go and the Water Rower S4 & S5 USB Protocol document.



## Requirement

It uses python3 the python libraries needed to run are stated in the requirements.txt file. But here are some packages that i installed on raspbian 10 "buster":

```
sudo apt install python3-pip python3-serial python3-oauth2client python3-tornado #python3-tornado4 (raspbian)
```

For uploading to nextcloud:

```
sudo pip3 install pyocclient google-api-python-client
```

## Testing

There are two bash scripts that can be used to test and develop:

* bin/dev -> debugging enabled
* bin/waterrower -> productive environment

## Architecture

### interface.py

is caring about the connection to the s4 - sensor hardware -> @todo make it plugable for other sensors

## Todo

- visualization; fix correlation between heart rate value and stroke rate value, in terms of numbers
- if there is none, do we split the graph in two or does it make sense to overlap them?
