Polymer({
	model: "scope.m",
	
	ready: function() {
		
	}
});

function parseMapUrl(url, model) {
	var m = eval(model);
	
	if (!url || url.trim().length == 0) return;
	try {
		   var p = url.split("?")[1].split("#")[0].split("&");
		   for (i in p) {
		      if (p[i].startsWith("mlat")) {
		         m.gps_latitude = p[i].split("=")[1];
		      }
		      
		      if (p[i].startsWith("mlon")) {
		          m.gps_longitude = p[i].split("=")[1];
		      }
		   }
	} catch (e) {
		alert('Unable to parse map link. Please use OpenStreetMap share link feature with marker enabled.');
	}
}
