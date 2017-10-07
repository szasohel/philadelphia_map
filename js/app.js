// model codes
var data = [{
        title: 'Independence National Historical Park',
        type: 'Park',
        location: {
            lat: 39.949531,
            lng: -75.149732
        }
    },
    {
        title: 'Independence Hall',
        type: 'Museum',
        location: {
            lat: 39.948874,
            lng: -75.150023
        }
    },
    {
        title: 'Hill-Physick-Keith House',
        type: 'Museum',
        location: {
            lat: 39.944312,
            lng: -75.148354
        }
    },
    {
        title: 'National Museum of American Jewish History',
        type: 'Museum',
        location: {
            lat: 39.950181,
            lng: -75.148426
        }
    },
    {
        title: 'Thaddeus Kosciuszko National Memorial',
        type: 'Museum',
        location: {
            lat: 39.943464,
            lng: -75.147278
        }
    },
    {
        title: 'Athenaeum of Philadelphia',
        type: 'Museum',
        location: {
            lat: 39.946873,
            lng: -75.150959
        }
    },
    {
        title: 'Benjamin Franklin Museum',
        type: 'Museum',
        location: {
            lat: 39.950122,
            lng: -75.146682
        }
    }
];

var map;
var markers = [];

//=================================viewmodel codes=================================
var ViewModel = function() {
	var self = this;
	// initializes bounds
    var bounds = new google.maps.LatLngBounds();
    
    // initializes infoWindow
    var infowindow = new google.maps.InfoWindow();

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');

    // Location constructor
    var Location = function(data) {
        this.title = data.title;
        this.type = data.type;
    };

    self.dataList = ko.observableArray([]);

    // creates new location object and pushes into dataList array

    data.forEach(function(locationItem) {
        self.dataList.push(new Location(locationItem));
    });


    for (var i = 0; i < data.length; i++) {
        var position = data[i].location;
        var title = data[i].title;

        var marker = new google.maps.Marker({
            position: position,
            title: title,
            map: map, // take it out and put it in the show listing
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);

        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function() {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
                markers[i].setIcon(defaultIcon);
            }
            populateInfoWindow(this, infowindow);
            this.setAnimation(google.maps.Animation.BOUNCE);
            this.setIcon(highlightedIcon);
        });
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
    // to call populateInfoWindow() when clicked on the list
    this.openInfoWindow = function(clickedMarker) {
        if (clickedMarker) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
                markers[i].setIcon(defaultIcon);
            }
        }
        clickedMarker.setIcon(highlightedIcon);
        clickedMarker.setAnimation(google.maps.Animation.BOUNCE);
        populateInfoWindow(clickedMarker, infowindow);
    }

    self.typeOptions = ['All', 'Park', 'Museum'];

    self.selection = ko.observable(self.typeOptions[0]);

    self.filterItems = ko.computed(function() {
        var selection = self.selection();
        for (var i = 0; i < self.dataList().length; i++) {

            if (selection === self.typeOptions[0]) {
                if (marker) {
                    markers[i].setVisible(true);
                }
            } else if (selection !== self.dataList()[i].type) {
                markers[i].setVisible(false);
            } else {
                markers[i].setVisible(true);
            }
        }
    });


    // populates and opens a infowindow 
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

        // AJAX request for wiki article about the place
        var $wikiLink = $('#wikipedia-links');
        var $wikiBody = $('#wikipedia-body');
        var $wikiHead = $('#wikipedia-header');
        // clear out old data before new request
        $wikiLink.text("");
        $wikiHead.text("");
        $wikiBody.text("");
        // wikipedia AJAX request
        wiki_url = 'http://en.wikipedia.org/w//api.php?action=opensearch&search=' +
            marker.title + '&format=json&callback=wikiCallback';
        console.log(wiki_url);

        var wiki_timeout = setTimeout(function() {
            $wikiHead.text('Failed to get wiki resources');
        }, 8000);

        $.ajax({
            url: wiki_url,
            dataType: "jsonp",
            jsonp: "callback",
            success: function(response) {
                var article_title = response[1];
                var articles = response[2];
                var links = response[3];
                if (article_title.length == 0) {
                    $wikiHead.append('Sorry!!! No article is available for ' + marker.title);
                } else {
                    header = article_title[0];
                    article = articles[0];
                    link = links[0];

                    $wikiHead.append('<a href="' + links + '">' + header + '</a>');
                    $wikiBody.text(article);
                }
                clearTimeout(wiki_timeout);
            }

        });

    }

    // make marker icon
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

}

// Map initialization
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        // center: {lat: 39.812265, lng: -74.929979},
        center: {
            lat: 39.952584,
            lng: -75.165222
        },
        zoom: 13,
        mapTypeControl: false
    });


    ko.applyBindings(new ViewModel());
}