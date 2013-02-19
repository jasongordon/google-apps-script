google-apps-script
========

#### shipping-harvest.js ####

This is a script which reads incoming emails from shippers, parses out who it is being sent to and the tracking number and adds it to a tracking service.

Right now, USPS is the shipper and packagetrackr.com is the tracking service.  Look for unread USPS Click-N-Ship emails in a label called usps and parse out the data and email packagetrackr.  Once we have processed the email, mark it read so we dont process it again.  You would want to set up a time based trigger for all of this.

This could easily be extended for other services.


