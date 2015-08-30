#! /usr/bin/env bash

echo "Starting dbus-daemon"
/usr/bin/dbus-daemon --system

echo "Starting avahi-daemon"
/usr/sbin/service avahi-daemon start

if [ "$1" = "test" ]; then
	echo "Starting cast-central-service test"
	cd /opt/cast-central-service && /usr/local/bin/npm test
else
	echo "Starting cast-central-service"
	/usr/local/bin/node /opt/cast-central-service/bin/cast-central-service.js
fi
