/**
 * This is a controller that will render a template and
 * write that into the document, based on the route supplied.
 */
if (history.state && history.state.router) {
	// if user returns to router, go back to previous page
	history.go(-1);
} else {
	// extract "activity" from URL params and load the activity
	define(['jquery-1.9.1.min', 
	        '../bower_components/nunjucks/browser/nunjucks.min',
	        'utils'], 
	 function(jquery, nunjucks, utils) {
		// handle routing
		var activity = location.queryString["r"]; 
		if (!activity) {
			route = "activities/default/default.html";
		} else {
			route = "activities/" + activity + "/" + activity + '.html';
		}

		// configure nunjucks
		nunjucks.configure('./', { autoescape: true });

		// Load appropriate template and render into the document
		$.get(route, '', function(template) {
			var html = nunjucks.renderString(template, {
				rootPath: ".",
				jsPath: "./activities/" + activity,
				activityPath: "./activities/" + activity,
				params: location.queryString
			});
			
			// Save state for back button handling
			history.replaceState({router:true},'',location.href);

			// this bit adds the current URL to the history back stack again
			document.open();
			document.write(html);
			document.close();
		}, 'html');
	});
}
