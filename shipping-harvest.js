

function go() {
  processProvider("USPS");
  processProvider("Paypal");
}

function processProvider(provider){
  
  var func = "get" + provider + "Conversations";
  var conversations = this[func]();
    
  var ids = [];
  var errors = [];
  var data = [];
  for (i in conversations) {
    var messages = conversations[i].getMessages();
    for (j in messages) {
      var message = messages[j];
      var body = message.getBody(); 
      var info = "From: " + message.getFrom() + " - Subject:" + message.getSubject() + " - Date:" + message.getDate();
      try{
        ids.push(message.getId());
        func = "match" + provider + "HTML";
        var shipments = this[func](body);
        for(s in shipments){
          data.push(shipments[s]);
        }
      }
      catch(err){
        var str = "Error parsing email - " + info + " - Error:" + err;
        Logger.log(str);
        errors.push(str);
      }
      
    }
  }
  
  var user = Session.getActiveUser().getEmail();
  if(data.length > 0){
    
    var body = createEmailBody(data, "packagetrackr");
    Logger.log("BODY:\n" + body);
    GmailApp.sendEmail("track@packagetrackr.com", "Add Packages", body, {bcc: user});
    for(id in ids){
      GmailApp.getMessageById(ids[id]).markRead();
    }
  }
  if(errors.length > 0 ){
    var err = "";
    for(e in errors){
      err += errors[e] + "\n";
    }
    GmailApp.sendEmail(user, "Shipping harvest error report", err);
  }
}
  



function createEmailBody(data, service){
  var func;
  var body = "";
  if(service == "packagetrackr"){
    func="formatForPackageTrackr";
  }
  else{
    Logger.log("Unsupported service: " + service);
  }
  Logger.log(data);
  for(d in data){
    body += this[func](data[d]["number"], data[d]["carrier"], data[d]["person"]);
  }
  return body;
}


// ----------   Provider Functions below ---------- //

function getUSPSConversations(){
  return GmailApp.search("in:usps is:unread subject:(Click-N-Ship)");
}


function getPaypalConversations(){
  return GmailApp.search("in:paypal is:unread subject:(You created a shipping label)");
}


function matchUSPSHTML(data){
  var out = [];
  var track_num = data.match( /TrackConfirmAction\Winput\.action\WtLabels\=(\d+)/g);
  var to = data.match(/Shipped.to.*[\r\n]*.*>([a-zA-Z\s]*)<br>/g);
  for(i in track_num){
    var o = new Object();
    var track = track_num[i].match(/(\d+)/g);
    Logger.log("Track " + i + ": " + track[0]);
    var person = to[i].match(/>([a-zA-Z\s]+)<br>/);
    var myPerson = person[1].replace(/(\r\n|\n|\r)/gm,"")
    o["number"]=track[0];
    o["carrier"]="USPS";
    o["person"]=myPerson;
    out.push(o);
    Logger.log("Person " + i + ": " + myPerson);   
  }
  //body += formatForPackageTrackr(track[0] , "USPS" , myPerson ) ;
  return out;
}

function matchPaypalHTML(data){
  var out = [];
  var track_num = data.match( /Tracking\snumber:\s(\d+)/g);
  var to = data.match(/Shipping.address.*<br>([a-zA-Z\s]*)<br>/g);
  for(i in track_num){
    var o = new Object();
    var track = track_num[i].match(/(\d+)/g);
    Logger.log("Track " + i + ": " + track[0]);
    var person = to[i].match(/>([a-zA-Z\s]+)<br>/);
    var myPerson = person[1].replace(/(\r\n|\n|\r)/gm,"")
    o["number"]=track[0];
    o["carrier"]="USPS";
    o["person"]=myPerson;
    out.push(o);
    Logger.log("Person " + i + ": " + myPerson);   
  }
  //body += formatForPackageTrackr(track[0] , "USPS" , myPerson ) ;
  return out;
}


function formatForPackageTrackr(tracking_num, service, person){
  return "#:" + tracking_num + " " + service + " " + person + "\n";
}


