access_key = "cdbbd80f8b4646ecbb0666971c0aa1e9";   /// geolocation API

var allData; // all station
var currentStation;
var map1;
var map2;

// let tDate;
window.onload = main;

function main() {
  // event.preventDefault();
  getUserCoordinates();
  countEarthQuake();

}

function getUserCoordinates() {
  // get the API result via jQuery.ajax
  $.ajax({
    url: "https://api.ipgeolocation.io/ipgeo?apiKey=" + access_key,
    //dataType: 'jsonp',
    success: function (data) {
      //mapOSM(data.latitude, data.longitude);
      earthquakeLocation(data.latitude, data.longitude);
    }
  });
}

function countEarthQuake() {
  service_url = "https://earthquake.usgs.gov/fdsnws/event/1/count?format=geojson";
  $.getJSON(service_url, function (data) {
    message = document.getElementById("countEarthQuake").innerHTML = `Total number of earthquake in the world till now are  ${data.count}`;
  });
}

function earthquakeLocation($lat, $lon) {

  service_url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=" + $lat + "&longitude=" + $lon + "&maxradius=10&limit=15";
  $.getJSON(service_url, function (data) {
    currentLocation = data.features;
    mapOSM(currentLocation);
  });
}

function mapOSM(currentLocation) {

  lat = currentLocation[0].geometry.coordinates[1]
  lon = currentLocation[0].geometry.coordinates[0]
  name = currentLocation[0].properties.place;

  var map = L.map('map').setView([lat, lon], 6);
  // add an OpenStreetMap tile layer

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // marker loop
  for (var i = 0; i < currentLocation.length; i++) {
    placeName = currentLocation[i].properties.place;
    markers = new L.marker([currentLocation[i].geometry.coordinates[1], currentLocation[i].geometry.coordinates[0]])
      .bindPopup(placeName)
      .addTo(map);
  }

} // end of mapOSM



$(document).on("change", "#userSelect", function (event) {
  //Prevent the usual navigation behaviour
  event.preventDefault();
  hideOption();
  userSelectValue = document.getElementById("userSelect").value;
  if (userSelectValue === 'byLocation') {
    document.getElementById('location-section').className = 'show';
  }
  else if (userSelectValue === 'byDate') {
    document.getElementById('date-section').className = 'show';
  }
  else if (userSelectValue === 'byMag') {
    document.getElementById('magnitude-section').className = 'show';
  }
  else {
    hideOption();
  }

});

function hideOption() {
  document.getElementById('date-section').className = 'hide';
  document.getElementById('location-section').className = 'hide';
  document.getElementById('magnitude-section').className = 'hide';
  document.getElementById("errorMessage").className = 'hide';

  document.getElementById("startDate").value = '';
  document.getElementById("endDate").value = '';
  document.getElementById("lati").value = '';
  document.getElementById("long").value = '';


}

function displayErrorMessage() {
  document.getElementById("errorMessage").className = 'show';
  document.getElementById("errorMessage").innerHTML = "Please select the data for selection";
  document.getElementById("errorMessage").style.color = 'red';
}



$(document).on("click", "#date-btn", function (event) {
  //Prevent the usual navigation behaviour
  event.preventDefault();
  document.getElementById("errorMessage").className = 'hide';
  startDate = document.getElementById("startDate").value;
  endDate = document.getElementById("endDate").value;
  if (startDate == "" || endDate == "" || (startDate > endDate)) {
    displayErrorMessage();
  }
  else {
    getDateDataUSGS(startDate, endDate);
  }
});

$(document).on("click", "#magnitude-btn", function (event) {
  //Prevent the usual navigation behaviour
  event.preventDefault();

  document.getElementById("errorMessage").className = 'hide';
  usermag = document.getElementById("magSelect").value;
  if (usermag == "" || usermag == "none") {
    displayErrorMessage();
  }
  else {
    getMagDataUSGS(usermag);
  }

});    // end of code when user click on Magnitude submit button


$(document).on("click", "#location-btn", function (event) {
  //Prevent the usual navigation behaviour
  event.preventDefault();
  document.getElementById("errorMessage").className = 'hide';
  userLati = document.getElementById("lati").value;
  userLong = document.getElementById("long").value;
  if (userLati == "" || userLong == "" || userLati >= 91 || userLati <= -91 || userLong >= 181 || userLong <= -181) {
    displayErrorMessage();
  }
  else {
    getLocationDataUSGS(userLati, userLong);
  }

});    // end of code when user click on location submit button


function getDateDataUSGS(startDate, endDate) {
  service_url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" + startDate + "&endtime=" + endDate + "&limit=50";
  $.getJSON(service_url, function (data) {
    allData = data.features;
    if (allData.length == 0) {
      showDialogMessage();
    }
    else {
      mapOSM1(data);
    }

  })
}  // end of getDateDataUSGS funtion

function getMagDataUSGS(magValue) {

  service_url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=" + magValue + "&limit=50";
  $.getJSON(service_url, function (data) {
    allData = data.features;
    console.log(allData);
    if (allData.length == 0) {
      showDialogMessage();
    }
    else {
      mapOSM1(data);
    }

  })

} // end of getMagDataUSGS funtion


function getLocationDataUSGS(userLati, userLong) {
  service_url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=" + userLati + "&longitude=" + userLong
    + "&maxradius=20" + "&limit=50";
  $.getJSON(service_url, function (data) {
    allData = data.features;

    if (allData.length == 0) {
      showDialogMessage();
    }
    else {
      mapOSM1(data);
    }

  })

} //end of getLocationDataUSGS function

function showDialogMessage() {
  clearMap();
  document.getElementById("dialog-confirm").className = 'show';
  $("#dialog-confirm").dialog({
    buttons: {
      Cancel: function () {
        $(this).dialog("close");
        document.getElementById("dialog-confirm").className = 'hide';
      }
    }
  });
} // end of dialogmessgae function




function mapOSM1(data) {
  clearMap();

  lat = data.features[0].geometry.coordinates[1]
  lon = data.features[0].geometry.coordinates[0]
  name = data.features[0].properties.place;

  map1 = L.map('div2').setView([lat, lon], 6);
  mapLink =
    '<a href="http://openstreetmap.org">OpenStreetMap</a>';
  L.tileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; ' + mapLink + ' Contributors',
    minZoom: 2,
  }).addTo(map1);

  // marker loop
  for (var i = 0; i < data.features.length; i++) {
    placeName = data.features[i].properties.place;
    markers = new L.marker([data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]])
      .bindPopup(placeName)
      .addTo(map1);
  }

} // end of mapOSM

function clearMap() {
  if (map1 != undefined || map1 != null) {
    map1.remove();
    map1 = null;
  }
}


$(document).on("click", "#to_page3", function (e) {
  $('#station_list').empty();
  // add new stations to list

  $.each(allData, function (index, station) {
    $('#station_list').append('<li> <a href ="#" class= "to_details">' + station.properties.place + '<span id = "' + index + '"class = "ui-li-count">' + station.properties.mag +
      '</span>' + '</a><li>');
  });

});

// Navigate to Details
$(document).on("pagebeforeshow", "#page3", function () {
  $('#station_list').listview('refresh');
  $(document).on("click", ".to_details", function (e) {
    //Prevent native behaviour
    e.preventDefault();
    e.stopImmediatePropagation();

    //Store the current item in the list     //store some data
    currentStation = allData[e.target.children[0].id];
    //Change to the new page
    $.mobile.changePage("#details");
  });

});


//Event to Populate UI of Details
$(document).on("pagebeforeshow", "#details", function (e) {
  e.preventDefault();

  //Rest of data
  $('#placeName').text('Name: ' + currentStation.properties.place);
  $('#alert').text('Alert: ' + currentStation.properties.alert);
  $('#magValue').text('Magbitude-Value:  ' + currentStation.properties.mag);
  $('#latValue').text('Latitude-Coordinate:  ' + currentStation.geometry.coordinates[1]);
  $('#lonValue').text('Longitude-Coordinate:  ' + currentStation.geometry.coordinates[0]);

});


$('#refresh-btn').on('click', function () {
  clearMap();
  // map1.remove();
  // map1 = null;
  hideOption();


});
















