

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
			this.edit = true;
		},

		saveNote: function(e) {
			var note;

			if(!this.edit)
				note = new Note();
			else
				note = this.note;
			
			var attrs = this.getAttributes();

			note.set(attrs);
			
			
			if(!this.edit)
				this.collection.create(note);
			else
				note.save();
			this.noteAdded();
			this.edit = false;

			

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

	//--> Views end here
