// model codes
var data = [
      {title: 'Independence National Historical Park', location: {lat: 39.949531, lng: -75.149732}},
      {title: 'Independence Hall', location: {lat: 39.948874, lng: -75.150023}},
      {title: 'Hill-Physick-Keith House', location: {lat: 39.944312, lng: -75.148354}},
      {title: 'Liberty Bell', location: {lat: 39.949610, lng: -75.150282}},
      {title: 'Thaddeus Kosciuszko National Memorial', location: {lat: 39.943464, lng: -75.147278}},
      {title: 'Athenaeum of Philadelphia', location: {lat: 39.946873, lng: -75.150959}}
    ];
    
var map;
var markers = [];

var Locations = function(data){
	this.title = ko.observable(data.title);
}

// viewmodel codes
var ViewModel = function(){
	var bounds = new google.maps.LatLngBounds();
	var self = this;

	// initializes infoWindow
	var infowindow = new google.maps.InfoWindow();

	// Style the markers a bit. This will be our listing marker icon.
	var defaultIcon = makeMarkerIcon('0091ff');

	// Create a "highlighted location" marker color for when the user
	// mouses over the marker.
	var highlightedIcon = makeMarkerIcon('FFFF24');

	this.locationList = ko.observableArray([]);

	for (var i = 0; i < data.length; i++) {
		self.locationList.push(new Locations({title: data[i].title}));
	}

	for (var i = 0; i < data.length; i++) {
		var position = data[i].location;
		var title = data[i].title;

		var marker = new google.maps.Marker({
			position: position,
			title: title,
			map:map,
			animation: google.maps.Animation.DROP,
			icon: defaultIcon,
	        id: i
		});

		// Push the marker to our array of markers.
	    markers.push(marker);
	    // Create an onclick event to open the large infowindow at each marker.
		marker.addListener('click', function() {
			populateInfoWindow(this, infowindow);
			this.setIcon(highlightedIcon);
			this.setAnimation(google.maps.Animation.BOUNCE);
		});
		
		marker.addListener('mouseout', function() {
			this.setIcon(defaultIcon);
		});
		bounds.extend(markers[i].position);
	}
	map.fitBounds(bounds);

	this.openInfoWindow = function (clickedMarker){
		if(clickedMarker){
			for (var i = 0; i < markers.length; i++) {
				markers[i].setAnimation(null);
				markers[i].setIcon(defaultIcon);
			}
		}
		clickedMarker.setIcon(highlightedIcon);
		clickedMarker.setAnimation(google.maps.Animation.BOUNCE);
		populateInfoWindow(clickedMarker, infowindow);
	}


	function populateInfoWindow(marker, infowindow) {
		// Check to make sure the infowindow is not already opened on this marker.
		if (infowindow.marker != marker) {
			// Clear the infowindow content to give the streetview time to load.
			infowindow.setContent(marker.title);
			infowindow.marker = marker;
			// Make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick', function() {
				infowindow.marker = null;
				marker.setAnimation(null);
				marker.setIcon(defaultIcon);
			});
			infowindow.open(map, marker);
		}
	}

	function makeMarkerIcon(markerColor) {
		var markerImage = new google.maps.MarkerImage(
			'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
			'|40|_|%E2%80%A2',
			new google.maps.Size(21, 34),
			new google.maps.Point(0, 0),
			new google.maps.Point(10, 34),
			new google.maps.Size(21,34));
		return markerImage;
	}



}

// Map initialization
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		// center: {lat: 39.812265, lng: -74.929979},
		center: {lat: 39.952584, lng: -75.165222},
		zoom: 13,
		mapTypeControl: false
	});


	ko.applyBindings(new ViewModel());
}
