  $(document).ready(function() {
	var foursquareClientId = 'SKOR1HV5KVXDGHVKZJEJ1IUMV4ITN2PENSJZ2IMAUDJIG2RK';
	var foursquareClientSecret = '4EZKQRMDYYCFKOE5UOVWVED1KVOXKQXJGAGR4FGIXE0DLY3R';
	var mapContainer = $('#map-container')[0];
	var bigMap = new google.maps.Map(mapContainer, {
		zoom: 13,
		scrollwheel: false,
	});
	var markers = [];

	console.log('document is ready');
	searchVenues(); 
	var openVenueWindow = false;

	function searchVenues(location) {

		var params = {};
		window.location.search.replace('?', '').split('&').forEach(function(v){
			var param = v.split('=');
			params[param[0]] = param[1];
			// console.log(param[1])
		$('[name="'+ param[0] +'"]').val(param[1]);
		});
		
		markers.forEach(function(marker) {
			marker.setMap(null);
		});
		markers = [];
	// console.log(params);
		$.ajax({
			type: 'GET',
			dataType: 'jsonp',
			url: 'https://api.foursquare.com/v2/venues/search/?query=' + params.drink + '&near=' + params.location + '&client_id=' + foursquareClientId + '&client_secret=' + foursquareClientSecret + '&v=20140701',

			success: function(response) {
				// console.log(response);
				var locations = [];
				response.response.venues.forEach(function(venue) {
					locations.push([venue.location.lat, venue.location.lng]);
				})
				// console.log(locations);
				var centre = GetCenterFromDegrees(locations);

				bigMap.setCenter(new google.maps.LatLng(centre[0], centre[1]));

				response.response.venues.forEach(function(venue) {
					// console.log(venue);
					
					var venueMarker = new google.maps.Marker({
						position: new google.maps.LatLng(venue.location.lat, venue.location.lng),
						map: bigMap,
					});
					markers.push(venueMarker);

					var venueWindowContent = '';
					venueWindowContent += '<a class="window-text" target="_blank" href="https://foursquare.com/v/' 
						+ venue.id 
						+ '">'
						+ venue.name
						+ '</a>';

					var venueWindow = new google.maps.InfoWindow({
						content: venueWindowContent,
					});

					google.maps.event.addListener(venueMarker, 'click', function(event) {
						console.log(event);
						if (openVenueWindow) {
							openVenueWindow.close()
						}
						venueWindow.open(bigMap, venueMarker);
						bigMap.setCenter(event.latLng);
						openVenueWindow = venueWindow;
					});//event listener for click on marker
				});//forEach function
			},//success function
		}); //ajax
	};//searchVenues function
});//document ready

/**
 * Get a center latitude,longitude from an array of like geopoints
 *
 * @param array data 2 dimensional array of latitudes and longitudes
 * For Example:
 * $data = array
 * (
 *   0 = > array(45.849382, 76.322333),
 *   1 = > array(45.843543, 75.324143),
 *   2 = > array(45.765744, 76.543223),
 *   3 = > array(45.784234, 74.542335)
 * );
*/
function GetCenterFromDegrees($data)
{
    $num_coords = $data.length;

    $X = 0.0;
    $Y = 0.0;
    $Z = 0.0;

    $data.forEach(function($coord) {
        $lat = $coord[0] * Math.PI / 180;
        $lon = $coord[1] * Math.PI / 180;

        $a = Math.cos($lat) * Math.cos($lon);
        $b = Math.cos($lat) * Math.sin($lon);
        $c = Math.sin($lat);

        $X += $a;
        $Y += $b;
        $Z += $c;
    });

    $X /= $num_coords;
    $Y /= $num_coords;
    $Z /= $num_coords;

    $lon = Math.atan2($Y, $X);
    $hyp = Math.sqrt($X * $X + $Y * $Y);
    $lat = Math.atan2($Z, $hyp);

    return [$lat * 180 / Math.PI, $lon * 180 / Math.PI];
}