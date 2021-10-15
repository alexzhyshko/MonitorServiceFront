roomNumber = document.getElementById("roomNumber");
airPollution = document.getElementById("airPollution");
peopleInside = document.getElementById("peopleInside");
lastUpdated = document.getElementById("lastUpdated");
clientStatusMarker = document.getElementById("clientStatusMarker");

var coll = document.getElementsByClassName("collapsible");
var textArea = document.getElementById("textArea");

for (var i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
		content.classList.toggle("display");
  });
}

var alreadyRunning = false;

var roomStatsChart = new Chart("roomStatsChart", {
type: "line",
data: {
	datasets: [{
		backgroundColor: "rgba(255,255,255,0.8)",
		borderColor: "rgba(247,104,24,0.6)"
	}]
	},
options: {
  maintainAspectRatio: false,
	legend: {
    labels: {
      fontColor: "blue",
      ontSize: 18
    }
  },
	scales: {
		x: {
			ticks: {
				color: 'white'
			},
			grid: {
        color: 'rgba(255,255,255,0.3)',
        borderColor: 'white'
      }
		},
		y: {
			ticks: {
				color: 'white'
			},
			grid: {
				color: 'rgba(255,255,255,0.3)',
				borderColor: 'white'
			}
		}
	}
}
});


async function loadRoomStatus() {
  if (alreadyRunning)
    return;
  var alreadyRunning = true;
  let xhr = new XMLHttpRequest();
  var number = roomNumber.value;
	loadStats(number);
	loadLogs(number);
  xhr.open("GET", "http://localhost:4567/mockStatus?roomId=" + number, true);
  xhr.send();
  xhr.onload = function() {
    var responseObj = JSON.parse(xhr.response);
    airPollution.innerHTML = responseObj.airPollution;
		var timeDifference = Math.round(Math.abs(new Date()-new Date(responseObj.lastUpdatedTime))/(1000*60));
		var timeDifferenceRounded = Math.round(Math.abs(new Date()-new Date(responseObj.lastUpdatedTime))/(1000*60));
		if(timeDifference<1){
			lastUpdated.innerHTML = "Less then a minute ago";
		}else if(timeDifference==1){
			lastUpdated.innerHTML = "1 minute ago";
		}else{
			lastUpdated.innerHTML = timeDifferenceRounded+" minutes ago";
		}

		if(Math.abs(new Date(responseObj.lastUpdatedTime)-new Date())>=1000*60*2){
			clientStatusMarker.innerHTML = '<span style="color:darkred;">Offline</span>';
		}else{
			clientStatusMarker.innerHTML = '<span style="color:darkgreen;">Online</span>';
		}


    setTimeout(loadRoomStatus, 5000);
  };
}

async function loadStats(number){
	let xhr = new XMLHttpRequest();
	xhr.open("GET", "http://localhost:4567/mockRoomStats?roomId=" + number+"&entriesCount=15", true);
  xhr.send();
  xhr.onload = function() {
		var stats = JSON.parse(xhr.response).stats;
		var statsXValues = stats.map(stat=>{return stat.pollution});
		var statsYValues = stats.map(stat=>{return dateTimeToTimeString(new Date(stat.dateTime))});
		roomStatsChart.data.datasets[0].data=statsXValues;
		roomStatsChart.data.labels=statsYValues;
		roomStatsChart.update();
	}
}

async function loadLogs(number){
	let xhr = new XMLHttpRequest();
	xhr.open("GET", "http://localhost:4567/mockRoomLogs?roomId=" + number+"&entriesCount=15", true);
  xhr.send();
  xhr.onload = function() {
		var logs = JSON.parse(xhr.response).logs;
		var logsMessages = logs.map(log=>{return "\r\n["+dateTimeToDateTimeString(new Date(log.dateTime))+"] "+log.message});
		textArea.innerHTML=logsMessages;
	}
}

function dateTimeToTimeString(dateTime){
	return getHours(dateTime)+":"+getMinutes(dateTime);
}

function dateTimeToDateTimeString(dateTime){
	return dateTimeToDateString(dateTime)+" "+getHours(dateTime)+":"+getMinutes(dateTime)+":"+getSeconds(dateTime);
}

function dateTimeToDateString(dateTime){
	return getYear(dateTime)+"-"+getMonth(dateTime)+"-"+getDay(dateTime);
}

function getSeconds(dateTime){
	return (dateTime.getSeconds().toString().length==2?dateTime.getSeconds():"0"+dateTime.getSeconds());
}

function getMinutes(dateTime){
	return (dateTime.getMinutes().toString().length==2?dateTime.getMinutes():"0"+dateTime.getMinutes());
}

function getHours(dateTime){
	return (dateTime.getHours().toString().length==2?dateTime.getHours():"0"+dateTime.getHours());
}


function getDay(dateTime){
	return (dateTime.getDate().toString().length==2?dateTime.getDate():"0"+dateTime.getDate());
}

function getMonth(dateTime){
	return ((dateTime.getUTCMonth()+1).toString().length==2?(dateTime.getUTCMonth()+1):"0"+(dateTime.getUTCMonth()+1));
}

function getYear(dateTime){
	return dateTime.getUTCFullYear().toString();
}
