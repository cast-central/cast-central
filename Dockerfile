FROM ubuntu:latest
MAINTAINER Justin Lathrop <jelathrop@gmail.com>

RUN apt-get update
RUN apt-get install -y wget libavahi-compat-libdnssd-dev \
					   python make g++ avahi-daemon avahi-utils

# Install newest nodejs from source
WORKDIR /tmp
RUN wget https://nodejs.org/dist/v0.12.7/node-v0.12.7.tar.gz
RUN tar -zxf node-v0.12.7.tar.gz
WORKDIR node-v0.12.7
RUN ./configure && make && make install

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

EXPOSE 8000
ENV DEBUG=*
ENTRYPOINT /startup.sh
