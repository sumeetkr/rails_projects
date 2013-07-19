#!/usr/bin/python

"""
 pyfly-client.py

 Client connects to a SLIPstream server on the specified port and receives
 UDP data as it is transmitted. Data is converted to JSON format and sent
 to AWS.

 Authors: C. Aaron Cois, cacois@cert.org
          Chris Taschner, taschner@cert.org
          Bob Iannucci, bob@sv.cmu.edu
          Sumeet Kumar, sumeet.kumar@sv.cmu.edu

 Copyright (C) 2012 C. Aaron Cois, Chris Taschner, Bob Iannucci

 http://tempo-db.com/api/write-series/#write-series-by-key
"""

import sys
import socket
import pyfly
import ujson
import logging
# import _mysql
import urllib
import urllib2
import xively
import datetime
import random
import thread
import time
from tempodb import Client, DataPoint
from datetime import datetime

remote_ip = '10.0.1.111'
port = '5004'

#xively
xively_key = 'zbIPnljLPXanIHrL1tE7FSvreWv8ZmavlMNS7Hx477g8NjaB'
feed_id = 1083186400
api = xively.XivelyAPIClient(xively_key)
feed = api.feeds.get(feed_id)

# TempoDB
API_KEY = '011fa33030ab425da128d3e995391f09'
API_SECRET = 'e70d8449a6dc4f2e889997ed72f81de9'
SERIES_KEY_base = 'building:CMIL.firefly:'
tempodb_client = Client(API_KEY, API_SECRET)

aws_url = 'http://cmu-sds.herokuapp.com/sensor_readings'

logging.basicConfig(filename='/tmp/pyfly.log',level=logging.DEBUG)

class udp:
  def __init__(self):
    self.src_mac = 0x00000000
    self.dst_mac = 0xffffffff
    self.type = pyfly.PING
    self.payload_len = 0
  def Packet(self):
    return

def dbVersion():
    try:
        con = _mysql.connect('localhost', 'root', '', '')
        con.query("SELECT VERSION()")
        result = con.use_result()
        print "MySQL version: %s" % result.fetch_row()[0]
    
    except _mysql.Error, e:
        print "Error %d: %s" % (e.args[0], e.args[1])
        sys.exit(1)
    finally:
        if con:
            con.close()
            
def record_locally(p):
    try:
        con = _mysql.connect('localhost', 'andrew', 'andrew', 'andrew')
        con.query("INSERT INTO `readings` (mac, timestamp, bat, temp, digital_temp, light, humidity, pressure, acc_x, acc_y, acc_z, audio_p2p, motion, gpio_state) VALUES('%s', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%d')" % (p.id, p.timestamp, p.bat, p.temp, p.digital_temp, p.light, p.humidity, p.pressure, p.acc_x, p.acc_y, p.acc_z, p.audio_p2p, p.motion, p.gpio_state))
    except _mysql.Error, e:
        print "Error %d: %s" % (e.args[0], e.args[1])
        sys.exit(1)
    finally:
        if con:
            con.close()

def record_aws(p):
  prepped_dict = pyfly.json_prep(p)
  json = ujson.dumps(prepped_dict)
  # json_urlencoded = urllib.urlencode(json)
  req = urllib2.Request(aws_url, json, {'Content-Type': 'application/json'})
  f = urllib2.urlopen(req)
  response = f.read()
  f.close()
  return


def connect_slipstream():
  # Connect socket
  server_address = (remote_ip, port)
  logging.info('Establishing connection to sensor gateway address %s on port %s' % server_address)
  print 'Establishing connection to sensor gateway address %s on port %s' % server_address
  sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
  sock.settimeout(20)
  sock.connect(server_address)
  logging.info('Collecting data from sensor gateway address %s on port %s' % server_address)
  print 'Collecting data from sensor gateway address %s on port %s' % server_address

  udp_packet = udp()
  udp_packet.src_mac = 0x00000000
  udp_packet.dst_mac = 0xffffffff
  udp_packet.type = pyfly.PING
  udp_packet.payload_len = 0
  buf = pyfly.pkt_to_buf(udp_packet)
  sock.send(buf)

  return sock

def push_to_xievely(p):
  ff_id = str(p.id)
  timestamp = p.timestamp
  digital_temp = ((float(9*p.digital_temp)/50)) + 32.0
  light = (-1*p.light) + 1024
  motion = p.motion
  audio_p2p = p.audio_p2p
  acc_x = p.acc_x
  acc_y = p.acc_y
  acc_z = p.acc_z 

  stream = feed.datastreams[0]

  # Push data to Xively
  feed.datastreams = [
      xively.Datastream(id='digital_temp'+ff_id, current_value=float(digital_temp)),
      xively.Datastream(id='light'+ff_id, current_value=int(light)),
      xively.Datastream(id='motion'+ff_id, current_value=int(motion)),
      xively.Datastream(id='audio_p2p'+ff_id, current_value=int(audio_p2p)),
      xively.Datastream(id='acc_x'+ff_id, current_value=int(acc_x)),
      xively.Datastream(id='acc_y'+ff_id, current_value=int(acc_y)),
      xively.Datastream(id='acc_z'+ff_id, current_value=int(acc_z))
  ]
  feed.update()
  print 'pushed data to xively '+ "id:" + str(p.id)
  return

def push_to_tempodb(p):

  ff_id = str(p.id)
  timestamp = p.timestamp
  digital_temp = ((float(9*p.digital_temp)/50)) + 32.0
  light = (-1*p.light) + 1024
  motion = p.motion
  audio_p2p = p.audio_p2p
  acc_x = p.acc_x
  acc_y = p.acc_y
  acc_z = p.acc_z 

  # Push data to TempoDB
  write_to_tempodb(tempodb_client,SERIES_KEY_base+ ff_id + '.digital_temp.1', float(digital_temp))
  write_to_tempodb(tempodb_client,SERIES_KEY_base+ ff_id + '.light.1', int(light))
  write_to_tempodb(tempodb_client,SERIES_KEY_base+ ff_id + '.motion.1', int(motion))
  write_to_tempodb(tempodb_client,SERIES_KEY_base+ ff_id + '.audio_p2p.1', int(audio_p2p))
  write_to_tempodb(tempodb_client,SERIES_KEY_base+ ff_id + '.acc_x.1', int(acc_x))
  write_to_tempodb(tempodb_client,SERIES_KEY_base+ ff_id + '.acc_y.1', int(acc_y))
  write_to_tempodb(tempodb_client,SERIES_KEY_base+ ff_id + '.acc_z.1', int(acc_z))
  print 'pushed data to TempoDB '+ "id:" + str(p.id)
  return

def write_to_tempodb(client, key, value):
  data = []
  date = datetime.now()
  data.append(DataPoint(date, value))
  client.write_key(key, data)
  return
# --------------------------------------------------------------------------------

if (len(sys.argv) > 2):
    remote_ip = sys.argv[1]
    port = int(sys.argv[2])

else:
    print 'Usage: %s <gateway_address> <port>' % (sys.argv[0])
    exit()

# dbVersion()
sock_slipstream = connect_slipstream()

f = open('room2', 'w')

count = 0 #used to find presence of person
motion_device_id = 8
last_time_pushed = 0
temp_array = [0,0,0,0,0]


while(True):

  try:

    data = bytearray(B" " * pyfly.MAXLEN)
    nbytes = sock_slipstream.recv_into(data)
  
    if nbytes > 0:
      pkt = pyfly.buf_to_pkt(data)
  
      if (pkt != None):
  
        try:
          sensor_type = pkt.payload[1]
          if sensor_type in pyfly.sensor_interpreters:
            proc_pkt = pyfly.sensor_interpreters[sensor_type](pkt, pyfly.DataFormats.RAW)
            #pkt_json = pyfly.serialize_data(proc_pkt, pyfly.DataFormats.JSON)

            p = proc_pkt
            print 'got data from device with '+ "id:" + str(p.id)
            ff_id = str(p.id)
            timestamp = p.timestamp
            digital_temp = ((float(9*p.digital_temp)/50)) + 32.0
            light = (-1*p.light) + 1024
            motion = p.motion
            audio_p2p = p.audio_p2p
            acc_x = p.acc_x
            acc_y = p.acc_y
            acc_z = p.acc_z 

            ff_id_last_digit = int(ff_id[-1])-1
            if(motion > 900):
              print motion
              motion_device_id = ff_id_last_digit
            else:
              motion_device_id = 8

            # print int(ff_id[-1])-1
            temp_array[ff_id_last_digit]= digital_temp*10

            # Print data to file
            value =   ff_id+ "," + str(timestamp) + "," + str(motion) +"," + str(light) +"," + str(audio_p2p)+"," + str(acc_x) +"," + str(digital_temp)+"," + str(acc_y)+"," + str(acc_z)
            # f.write(value +'\n')
            #print value

            # push every 5 secs or when there is a motion
            if(count > 14 or motion_device_id <8):
              time.sleep(0.5) 
              print str(motion_device_id+1)+str(temp_array[0])[0:3]+str(temp_array[1])[0:3]+str(temp_array[2])[0:3]+str(temp_array[3])[0:3]+str(temp_array[4])[0:3]
              feed.datastreams = [
                  xively.Datastream(id='motion_temps'+'1', current_value= str(motion_device_id+1)+str(temp_array[0])[0:3]+str(temp_array[1])[0:3]+str(temp_array[2])[0:3]+str(temp_array[3])[0:3]+str(temp_array[4])[0:3])
              ]
              feed.update()
              count =0
              # thread.start_new_thread( push_to_xievely, (proc_pkt, ) )
            
            count = count +1

          else:
            print "Unknown sensor type packet received. Ignoring."
        except Exception as err:
        	print err
      else:
        print "Empty Packet received. Ignoring."

  except socket.timeout:
    print "Socket timeout, reconnecting..."
    sock_slipstream.close()
    sock_slipstream = connect_slipstream()


