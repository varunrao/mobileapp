$(document).ready(function() {

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
		} else {
			allNotesView.render();
		}
	}

	//--> End Routing
});