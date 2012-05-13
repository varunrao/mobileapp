
// Base Model
	var Note = Backbone.Model.extend({

		defaults: {
			title: "new note",
			details: "details",
			locate: "false"
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