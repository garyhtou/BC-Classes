[https://github.com/BellevueCollege/data-api](https://github.com/BellevueCollege/data-api)

[https://github.com/BellevueCollege/ClassSchedule/wiki/Class-Schedule-Web-API](https://github.com/BellevueCollege/ClassSchedule/wiki/Class-Schedule-Web-API)

## get subjects
```javascript
var xmlHttp = new XMLHttpRequest();
   xmlHttp.open(
      "GET",
      "https://www2.bellevuecollege.edu/data/api/v1/classes/?format=json",
      false
   ); // false for synchronous request
   xmlHttp.send(null);

   res.json(JSON.parse(xmlHttp.responseText));
```

## get class info ???? 
```javascript
var xmlHttp = new XMLHttpRequest();
   xmlHttp.open(
      "GET",
      "https://www2.bellevuecollege.edu/data/api/v1/classes/?format=json",
      false
   ); // false for synchronous request
   xmlHttp.send(null);

   res.json(JSON.parse(xmlHttp.responseText));
```

## get class seats

POST to https://www2.bellevuecollege.edu/classes/Api/GetSeats
Body: {"classID": "3579C012" }

CtcClassSchedule.js from BC website
```javascript
$.ajax({
	url: g_getSeatsUrl,
	type: 'POST',
	data: { classID: classID },
	timeout: 4000,
	success: function (result) {
		var indexOfPipe = result.indexOf("|");
		var seatsAvailable = result.substring(0, indexOfPipe);
		var friendlyTime = result.substring(indexOfPipe + 1, result.length);
		//console.log("friendly time: " + friendlyTime);

		var curDate = new Date();
		var timeagoTime = $.timeago(curDate);
		var formattedTime = formatAMPM(curDate);
		var formattedDate = formattedTime + ' ' + (curDate.getMonth() + 1) + '/' + curDate.getDate();
		//console.log("formattedDate: " + formattedDate);

		if (seatsAvailable > 0) {
				$(availability).html(seatsAvailable);
				$(updateTime).html(timeagoTime);
				$(updateTime).attr('datetime', curDate);
				$(updateTime).attr('title', formattedDate);
				$(timeagoEl).timeago('update', curDate);
		} else {
				$(availability).html("Class full");
				//          $(updateTime).html("refreshed " + friendlyTime);
				$(updateTime).html("recheck");
				//$(courseUpdated).empty();
		}
	},
	error: function (x, t, m) {
		$(availability).html(originalSeatsAvailable);
		$(updateTime).html("[service unavailable]");
	}

});
```