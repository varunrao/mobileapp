$(document).ready(function() {

	// Base Model
	var Note = Backbone.Model.extend({

		defaults: {
			title: "new note",
			details: "details",
			locate: "false",
			longitude: "0",
			latitude: "0"
		}
	});


	// Model Collection
	var NoteList = Backbone.Collection.extend({
		model: Note,
		localStorage: new Store("Notes"),

		comparator : function(note) {
			return (note.get("title") || "").toUpperCase();
		}
	});

	//<--- Views Start here
	// New Note view
	var NewNoteView = Backbone.View.extend({

		el: $("#new"),


		events: {
			"click button#save": "saveNote"
		},

		initialize: function() {
			_.bindAll(this, "render", "saveNote", "noteAdded", "showNote", "clearFields");
			this.collection = notesList;
			this.render();
		},

		render: function() {
			this.collection.bind("create", this.noteAdded);
		},

		showNote: function(note) {
			this.note = note;
			$("#title").val(note.get("title"));
			$("#details").val(note.get("details"));
			$("#headNewEditNote").text("Editing : " + note.get("title"));
			$("#locate").val(note.get("locate"));
			$("#locate").slider("refresh"); 
			if(note.get("locate") == 'yes') {
					$('#map_holder').show();
					$('#new').live("pageshow", function() {
							showMap(note.get("latitude"), note.get("longitude"));
						});
	       	}
			else
				$('#map_holder').hide();
			this.edit = true;
		},

		saveNote: function(e) {
			var note;

			if(!this.edit)
				note = new Note();
			else
				note = this.note;
			
			var attrs = this.getAttributes();
			var timeoutVal = 10 * 1000 * 1000;


			if(attrs.locate == 'yes') {
				$.mobile.showPageLoadingMsg("b", "Getting Location data. ", true);
				if ( navigator.geolocation )
				{
					var timeoutVal = 10 * 1000 * 1000;
					navigator.geolocation.getCurrentPosition(function(pos){
						alert("Your location is: " + pos.coords.latitude + ', ' + pos.coords.longitude);
						attrs.longitude = pos.coords.longitude;
						attrs.latitude = pos.coords.latitude;

						var saveProxy = $.proxy( save, newNoteView );
						saveProxy();
					}, displayError, { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0 });
				}
			 	else {
        	    	setMessage("Geolocation is not supported by this browser", "Geolocation is not supported by this browser");   
    	   		}
			}
			else {
				var saveProxy = $.proxy( save, newNoteView );
				saveProxy();
			}

			function displayError(error)
			{
				var errors = { 1: 'Permission denied', 2: 'Position unavailable', 3: 'Request timeout' };
		        alert("Error occured: " + errors[error.code], "Error occured: " + errors[error.code]);
			}

			
			function save() {
				note.set(attrs);
				if(!this.edit)
					this.collection.create(note);
				else
					note.save();
				this.noteAdded();
				this.edit = false;
			}

			e.preventDefault();
			e.stopPropagation();
		},

		getAttributes : function() {
			return {
				title: $("#title").val(),
				details: $("#details").val(),
				locate: $("#locate").val()
			}
		},

		noteAdded: function() {

			console.log("Callback from notes added");
			$(".ui-dialog").dialog("close")
		},

		clearFields : function() {
			$("#title").val("");
			$("#details").val("");
			$("#headNewEditNote").text("Add New Note");
			$('#map_holder').hide();
		}
	});


	// View for all the notes
	var AllNotesView = Backbone.View.extend({

		initialize: function() {
			_.bindAll(this, "addOne", "addAll");

			this.collection.bind("add", this.addOne);
			this.collection.bind("reset",this.render,this);
			this.collection.bind("refresh",this.addAll,this);
			//this.collection.fetch();
		},

		render: function() {
			this.addAll();
		},


		addOne: function(note) {
			var allNotesViewItem = new AllNotesViewItem({
				model: note
			});
			$(this.el).append(allNotesViewItem.render().el);
		},


		addAll: function() {
			$(this.el).empty();
			this.collection.each(this.addOne);
			 $(this.el).listview("refresh");

		}
	});

	// View for showing 1 element of the note.
	var AllNotesViewItem = Backbone.View.extend({

		template: _.template($("#note-item").html()),

		events: {

		},

		initialize: function() {
			_.bindAll(this, "render");
		},

		render: function() {
			$("#notesList").prepend(this.template({
				note: this.model
			}));
			return this;
		}
	});

	function showMap(latitude, longitude) {
		var yourStartLatLng = new google.maps.LatLng(latitude, longitude);
		 $('#map_canvas').gmap({'center': yourStartLatLng, 'zoom': 15, 'disableDefaultUI':true, 'callback': function() {
				var self = this;
				self.addMarker({'position': this.get('map').getCenter() }).click(function() {
				self.openInfoWindow({ 'content': 'Location of the note!' }, this);
				});
			}});
		 	$('#map_canvas').gmap('refresh');
	}
	//--> Views end here
	// <-- Initialization
	var notesList = new NoteList();
	var newNoteView = new NewNoteView();
	var allNotesView = null;

	// --> End Initialization
	//<-- Routing
	var applicationRouter = new $.mobile.Router({

		"#home": function() {
			console.log("INDEX!");
		},
		"#all": {
			handler: renderAllNotes,
			events: "bs"
		},

		"#new([?].*)": {
			handler: editNotes,
			events: "bs"
		},

		"#new.*": {
			handler: addNewNote,
			events: "bs"
		},

		".": {
			handler: renderHome,
			events: "bc"
		}
	});

	function renderHome() {
		//console.log("Rendering home");
	}

	function addNewNote(type,match,ui) {
		console.log("Add notes " + type + " -- " + match + " -- " + ui);
		if(match == "#new")
			newNoteView.clearFields();
	}

	function editNotes(type,match,ui) {
		console.log("Edit notes " + type + " -- " +  applicationRouter.getParams(match[1]).id + " -- " + ui);
		newNoteView.showNote(notesList.get(applicationRouter.getParams(match[1]).id));
	}

	function renderAllNotes() {
		//console.log("Rendering all notes");
		if (!allNotesView) {
			allNotesView = new AllNotesView({
				el: $("#all #notesList"),
				collection: notesList
			});
		}

		if (notesList.isEmpty()) {
			notesList.fetch();
			allNotesView.render();
		} else {
			allNotesView.render();
		}
	}

	//--> End Routing
});
