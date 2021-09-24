roomNumber = document.getElementById("roomNumber");
airPollution = document.getElementById("airPollution");
peopleInside = document.getElementById("peopleInside");
lastUpdated = document.getElementById("lastUpdated");
clientStatusMarker = document.getElementById("clientStatusMarker");

var alreadyRunning = false;

async function pingServer() {
  if (alreadyRunning)
    return;
  var alreadyRunning = true;
  let xhr = new XMLHttpRequest();
  var number = roomNumber.value;
  xhr.open("GET", "http://localhost:4567/status?roomId=" + number, true);
  xhr.send();
  xhr.onload = function() {
    var responseObj = JSON.parse(xhr.response);
    airPollution.innerHTML = responseObj.airPollution;
    peopleInside.innerHTML = responseObj.peopleInsideCount;
		lastUpdated.innerHTML = responseObj.lastUpdatedTime;
		if(Math.abs(new Date(responseObj.lastUpdatedTime)-new Date())>=1000*60*2){
			clientStatusMarker.innerHTML = '<span style="color:darkred;">Offline</span>';
		}else{
			clientStatusMarker.innerHTML = '<span style="color:darkgreen;">Online</span>';
		}
    setTimeout(pingServer, 5000);
  };
}
