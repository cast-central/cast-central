FROM node:0.12
MAINTAINER Justin Lathrop <jelathrop@gmail.com>

RUN apt-get update
RUN apt-get install -y wget libavahi-compat-libdnssd-dev \
					   python make g++ avahi-daemon avahi-utils

# Get dbus working
RUN mkdir /var/run/dbus

RUN mkdir -p /opt/cast-central-service
WORKDIR /opt/cast-central-service
ADD /package.json package.json
ADD /bin bin
ADD /lib lib
ADD /test test
RUN npm install

WORKDIR /
ADD /startup.sh /startup.sh
RUN chmod +x /startup.sh

EXPOSE 8000:8000
ENV DEBUG=*
ENTRYPOINT ["/startup.sh"]
