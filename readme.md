IPS Design:

Database
//scanners : id, identifier, BeaconID, last known time
//becons: BeaconId, lat , long, timestamp

//Controller
getLastFoundBeacons()-> {EMEI, BeconId, timestamp}
getScannersLocations(identifier) -> {identifier, beaconId, lat, lng, time}
