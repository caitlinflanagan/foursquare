  $(document).ready(function() {
	var instagramClientId = 'd73fd06d0eb840b6ae6d2b983007a1b9';
	var mapContainer = $('#map-container')[0];
	var centerOfToronto = new google.maps.LatLng(43.653226000000000000, -79.383184299999980000);
	var theBigMap = new google.maps.Map(mapContainer, {
		zoom: 16,
		center: centerOfToronto,
	}); //theBigMap variable
	var markers = [];//step 1 for photo marker in different locations

	console.log('document is ready');
	searchPhotos(centerOfToronto); 
	var openPhotoWindow = false;//start with all info windows closed

	google.maps.event.addListener(theBigMap, 'click', function(event) {
		searchPhotos(event.latLng);
	})//create new photo marker

	function searchPhotos(location) {
		markers.forEach(function(marker) {
			marker.setMap(null);
		});
		markers = [];
		$.ajax({
			type: 'GET',
			dataType: 'jsonp',
			url: 'https://api.instagram.com/v1/media/search?client_id=' + instagramClientId + '&lat=' + location.lat() + '&lng=' + location.lng(),
			success: function(response) {
				response.data.forEach(function(photo) {
					console.log(photo.location);
					console.log(photo);
					
					var customPhotoMarker = {
						    url: photo.user.profile_picture,
						    scaledSize: new google.maps.Size(50, 50),
						    origin: new google.maps.Point(0, 0),
						    anchor: new google.maps.Point(0, -120)
					};//customPhotoMarker variable
					
					var photoMarker = new google.maps.Marker({
						position: new google.maps.LatLng(photo.location.latitude, photo.location.longitude),
						map: theBigMap,
						icon: customPhotoMarker,
					});//photoMarker variable
					markers.push(photoMarker);

					var photoWindowContent = '';
					photoWindowContent += '<a href="' 
						+ photo.link 
						+ '"><img class="insta-photo" src=' 
						+ photo.images.low_resolution.url 
						+ '/></a><p>Photo Courtesy of ' 
						+ photo.user.full_name
						+ ' (@' 
						+ photo.user.username 
						+ ')</p>';
					if (photo.location.name) {
						photoWindowContent += '<p>Photo Taken at '
							+ photo.location.name
							+ '</p>';
					}//if statement for if the location name is available

					var photoWindow = new google.maps.InfoWindow({
						content: photoWindowContent,
					});//photoWindow variable

					google.maps.event.addListener(photoMarker, 'click', function(event) {
						console.log(event);
						if (openPhotoWindow) {
							openPhotoWindow.close()
						}
						photoWindow.open(theBigMap, photoMarker);
						theBigMap.setCenter(event.latLng);
						openPhotoWindow = photoWindow;
					});//event listener for click on marker
				});//forEach function
			},//success function
		}); //ajax
	};//searchPhotos function
});//document ready

console.log('testing 1 2 3');