var mapView;
// list of markerTags created during the initialization
// of the application
var markerTags = [];
var boxInfowindow;

function ViewModel()
{
    initMap();

    // connect search input and list of venues using Knockout
    // use forEach() method, it's also fasten code
    this.searchInput = ko.observable("");
    var self = this;

    this.vizag = ko.computed(function() {
        var result = [];
        markerTags.forEach(function(marker) {
            if (marker.title.toLowerCase().includes(
                self.searchInput().toLowerCase())) {
                result.push(marker);
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }

        });

        return result;
    }, this);
}

// create and how infor window on top of a marker
function createInfowindow() {
    marker = this;
    infowindow = boxInfowindow;

    // bounce when show info window
    marker.setAnimation(google.maps.Animation.BOUNCE);

    // set BOUNCE animation timeout (one bounce 700ms, only few bounces)
    setTimeout(function() {
        self.marker.setAnimation(null);
    }, 1400);

    setFoursquareContent(infowindow);

    infowindow.marker = marker;
    infowindow.open(map, marker);

    // clear marker and remove animation
    infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
        marker.setAnimation(null);
    });
}

// fill info window with information featched from Foursquare
function setFoursquareContent(infowindow) {
    clientID = "FLIVBLCQ4RIPEE3URKE4TDFACCHP3RQEQ210SWZ410RJWPLS";
    clientSecret = "KLJBKURQFTYSB20ECH50ZG32T4ZTI2IC0TSTKMIMRXPDCFL4";

    var url = 'https://api.foursquare.com/v2/venues/search?v=20180125&ll=' +
        marker.position.lat() + ',' + marker.position.lng() + '&client_id=' + clientID +
        '&client_secret=' + clientSecret + '&query=' + marker.title;

    // console.log(url);

    // fetch data from Foursquare
    $.getJSON(url).done(function(marker) {
         response = marker.response.venues[0];

        // parse Foursquare response
        var name = response.name || 'no name found';
        var street = response.location.formattedAddress[0] || 'no street found';
        var city = response.location.formattedAddress[1] || 'no city found';
        var country = response.location.country || 'no country found';
        var category = response.categories[0].name || 'no category found';
        var url = response.url || 'no url found';
        var visitors = response.hereNow.summary || 'no visitors found';

        // format content for the info window
        content =
            '<h6>' + name + '</h6><p><i>' + category + '</i></p>' + 
            '<p>' + street + ', ' + city + ', ' + country + '</p>' +
            '<p> Visitors now: "' + visitors + '"</p>';
        infowindow.setContent(content);

    }).fail(function(e) {
        console.log(e.responseText);

        // notify user about errors
        infowindow.setContent('<h6>Error occured during retrieving data from Foursquare!</h6>');
    });
}

// create a venue
var Venue = function(venue) {
    this.title = venue.title;
    this.type = venue.type;

    var point = new google.maps.LatLng(venue.lat, venue.long);
    var marker = new google.maps.Marker({
        position: point,
        title: venue.title,
        url:venue.url,
        map: map,
        animation: google.maps.Animation.DROP
    });

    this.marker = marker;

    this.setVisible = function(v) {
        this.marker.setVisible(v);
    };

    this.marker.addListener('click', createInfowindow);

    // trigger click event to show info window
    this.showInfo = function() {
        google.maps.event.trigger(this.marker, 'click');
    };

};

// create map and initialize it with markerTags
function initMap() {
    // Berlin city center 
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 17.7384734, lng: 82.9823849},
        zoom: 13
    });

    // use "retro" map style
    map.setOptions({styles: retroStyle});

    // create info window
 boxInfowindow = new google.maps.InfoWindow();

    // add markerTags from venues.js file
    for (var i = 0; i < vizag.length; i++) {
        markerTags.push(new Venue(vizag[i]));
    }
}


function mapLoadError() {
    $('#map').html('Error while loading Google maps');
}


// main function - initialize view model
function initApp() {
    ko.applyBindings(new ViewModel());
}
