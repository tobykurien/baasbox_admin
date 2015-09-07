Polymer({
	model : '', // name of model in backend
	m : null, // instance of model for binding
	models : [], // array of models being displayed
	where : '', // parameters to pass to REST query
	orderBy : '', // parameters to pass to REST query
	readonly : false, // show edit/del/add

	// Columns to render in list (space-separated)
	cols : "name",
	columns : function() {
		// return the columns as an array
		return this.cols.split(" ");
	},

	// external operations
	actions : "",
	operations : [],
	onAction : "",

	// Called when component is ready to render
	ready : function() {
		scope = this;
		this.page = 0;

		if (this.model == '') {
			alert('Model not defined for data-table');
			return;
		}

		if (this.childElementCount == 0) {
			this.readonly = true;
		}

		// load external operations
		if (this.actions.trim().length > 0) {
			this.operations = this.actions.split(" ");
		} else {
			this.operations = []
		}
		
		BaasBox.setEndPoint(config.baasbox.url);
		BaasBox.appcode = config.baasbox.appcode;
		scope.loadData(0);
	},

	// Called to load the edit form for "add new" or "edit" operations
	loadForm : function() {
		// render edit form with bindings to model as "m" variable
		var editForm = this.children[0];
		var formHTML = editForm.innerHTML.replace(new RegExp("\\[\\[", "g"),
				"{{");
		formHTML = formHTML.replace(new RegExp("\\]\\]", "g"), "}}");
		this.injectBoundHTML(formHTML, this.$.model_form);

		// hide data table
		this.$.data_table.style.display = 'none';
		this.$.data_table.style.visibility = 'hidden';
	},

	// Called when "edit" button is clicked
	edit : function(e, detail, sender) {
		var m = e.target.templateInstance.model.m;
		this.m = m;
		this.loadForm();
	},

	// called when "add new" is clicked
	create : function() {
		this.m = {};
		this.loadForm();
	},

	// called when the search "Go!" button is clicked
	search : function(e, detail, sender) {
		var input = $('#search')[0].value;
		if (input && input.trim().length > 3) {
			scope.where = "any().toLowerCase() like '%" + input.replace(/'/g, "`").toLowerCase() + "%'";
			scope.loadData(0);
		} else if (!input || input.trim().length == 0) {
			scope.where = undefined;
			scope.loadData(0);
		}
	},
	
	// Generic user-defined operation callback. It will call the javascript
	// function
	// defined in the onAction attribute with operation and model details.
	operation : function(e, detail, sender) {
		var model = e.target.templateInstance.model;
		if (this.onAction && this.onAction.trim().length > 0) {
			var fn = window[this.onAction];
			if (fn && typeof fn === 'function') {
				fn(model.o, model.m);
			}
		}
	},

	// called to load a page from the paginator (i.e. page number clicked)
	loadPage : function(e, detail, sender) {
		var p = e.target.templateInstance.model.pIndex;
		this.loadData(p);
	},

	// load previous page from paginator
	previousPage : function() {
		if (this.page >= 1) {
			this.page = this.page - 1;
			this.loadData(this.page);
		}
	},

	// load next page from paginator
	nextPage : function() {
		if (this.page < this.pages - 1) {
			this.page = this.page + 1;
			this.loadData(this.page);
		}
	},

	// display data in a list for the specified page. Backend decides how many
	// items per page.
	loadData : function(page) {
		scope = this;

		if (page || page === 0) {
			this.page = page;
		}

		var count = 0;
		// get count of data
		BaasBox.loadCollectionWithParams(scope.model, {
			where : scope.where,
			count : true
		}).done(function(countRes) {
			count = countRes[0]["count"];
			// load data
			BaasBox.loadCollectionWithParams(scope.model, {
				page : scope.page,
				recordsPerPage : 50,
				where : scope.where,
				orderBy : scope.orderBy
			}).done(function(res) {
				scope.models = res;
				scope.pages = Math.ceil(count / 50);
				scope.pagesArray = new Array(scope.pages);
			}).fail(function(error) {
				alert(error.statusText);
			})
		}).fail(function(error) {
			alert(error.statusText);
		})
	},

	// Called when "delete" is clicked
	del : function(e, detail, sender) {
		var scope = this;
		var m = e.target.templateInstance.model.m;

		if (m.id != null && confirm("Are you sure?")) {
			BaasBox.deleteObject(m.id, this.model).done(function(res) {
				scope.loadData();
			}).fail(function(error) {
				alert(error.statusText);
			})
		}
	},

	cancel : function() {
		// show data table
		this.$.data_table.style.display = 'block';
		this.$.data_table.style.visibility = 'visible';

		// remove edit form
		this.$.model_form.innerHTML = '';
	},

	// Called when a create or edit form is submitted. If id > 0, then it's an
	// edit.
	submit : function(e, detail, sender) {
		var scope = this;
		var m = e.target.templateInstance.model.m;
		this.cancel();

		// save data
		BaasBox.save(m, this.model)
		  .done(function(res) {
		  	scope.loadData();
		  })
		  .fail(function(error) {
			alert(error.statusText);
		  });
	},
	
	// upload a file
	upload: function(e, detail, sender) {
		e.preventDefault();
		var scope = this;
		var formData = new FormData(e.target.form);
		var field = e.target.name;
		
		BaasBox.uploadFile(formData)
			.done(function(res) {
				// save file id
				var fileid = JSON.parse(res).data.id;
				scope.m[field] = fileid;
				alert("File uploaded, click Submit to save");
			})
			.fail(function(error) {
				alert(error.statusText);
			})
	},
	
	// delete a file
	deleteFile: function(e, detail, sender) {
		e.preventDefault();
		var scope = this;
		var field = e.target.name;
		
		BaasBox.deleteFile(scope.m[field])
			.done(function(res) {
				// save file id
				scope.m[field] = '';
				alert("File deleted, click Submit to save");
			})
			.fail(function(error) {
				alert(error.statusText);
			})
	},

	imageUrl: function(fileid) {
	    return BaasBox.endPoint+"/file/"+fileid+"?X-BB-SESSION="+BaasBox.getCurrentUser().token;
	}
});
