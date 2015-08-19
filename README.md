[![Circle CI](https://circleci.com/gh/cast-central/service.svg?style=svg)](https://circleci.com/gh/cast-central/service)

# Cast Central
Welcome to 'cast-central' you're one stop shop for interfacing with casting devices (chromecast, or roku, send pull request if more is needed!) all in one place.  Just start the 'cast-central-service' on a you're target linux machine and use the 'cast-central-client' to interface with it.  Further information on what each gives you follows.

![the_ecosystem](https://raw.githubusercontent.com/cast-central/cast-central/wiki_stuff/images/the_ecosystem.png)

## cast-central-service
This is the main service which controls all the casting devices on a single network.  The cast-central-service is an express-js RESTFul web service which speak GET's and returns JSON.  The cast-central-client simply helps generate the GET requests for the user.

Below are the current actions the cast-central-service can perform:
### Discovery
- MDNS: Multicast Domain Name Service (mDNS) is primarily used for discovery all the current version of Chromecasts on a network.
- SSDP: Simple Service Discovery Protocol (SSDP) used in earlier version of Chromecasts (now uses mDNS) but is the primary use for discovering roku's on the network.

### Chromecast (courtesy of the 'node-castv2-client' and 'castv2-youtube' folks)
- Launch: Launches an application on the target casting device.  Currently you options are only 'Youtube' or the 'DefaultMediaReceiver' applicaitons.  More to come as needed.
- Load: Loads media onto an *already launched* application.  The arguments required for this varies widely based on the currently launched application.
- Volume: Sets the volume on the target casting device (number between 0 and 100).
- Mute: Mutes or un mutes the target casting device (boolean).
- Seek: Seeks the currently playing/loaded media (float 0.0 - 1.0).
- Stop: Stops the currently playing/loaded media on the target casting device.

### Roku (TODO)
This is in the works still.. It will be complete soon.  You can follow this latest work on the 'develop' branch.

## cast-central-client
This is the main interface for controlling the 'cast-central-service' while it's running.  It is a full command line interface and allows for performing any action with the 'cast-central-service'.

### Usage (because I'm lazy)
```
$ cast-central-client.js --help
Connect and control the cast-central-service.
Usage: nodejs ./bin/cast-central-client.js {list|launch|load|setVolume|setMute|seek|stop} <options>

Options:
  --host          The hostname/ip of the cast-central-service                               [required]  [default: "localhost"]
  --port          The port of the cast-central-service                                      [required]  [default: "8000"]
  -p, --protocol  Cast discovery protocol to use [mdns, ssdp]                             
  -s, --search    Search term to look for cast devices                                    
  -n, --name      Name of cast device to communicate with                                 
  -a, --app       Launch an application on the cast device [DefaultMediaReceiver, Youtube]
  -m, --media     Media to load onto launched application                                 
  --params        Extra parameters to send for the load action                            
  -v, --value     Value for seek, mute, or volume                                         
  --version       The version of the cast-central-service                                   [required]  [default: "v1"]
  --type          The type of cast to perform action on, available is chromecast            [required]  [default: "chromecast"]
  -t, --timeout   Amount of seconds to wait until give up                                   [default: 10]
  -h, --help      Shows this usage                                                        
```

# Contribute
Feel free to fork and send pull requests whenever.. Please mind that this is definitely not my full time job but is a hobby and turns out to be pretty useful for controlling all of my chromecasts in one spot.  Here are some things that will be in the works soon (unless someone else gets to them first).

In priority order:
1. Add Roku support (once I buy one :-))
2. Complete the unit tests.
3. Complete the Documentation.
