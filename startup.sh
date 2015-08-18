#! /usr/bin/env bash

echo "Starting dbu-daemon"
/bin/dbus-daemon --system

echo "Starting avahi-daemon"
/usr/sbin/service avahi-daemon start

echo "Starting cast-central-service"
/usr/local/bin/node /opt/cast-central-service/bin/cast-central-service.js
