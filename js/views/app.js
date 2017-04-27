var app = app || {};

// The Application
// ---------------

// Our overall **AppView** is the top-level piece of UI.

// **an **AppView** will handle the creation of new todos and rendering of the
// **initial todo list. **TodoView** will be assoc with each individual Todo record.
// **Todo instances can handle editing, updating, and destroying their assoc. info.

app.AppView = Backbone.View.extend({

	// Instead of generating a new elment, bind to the existing skeleton
	// of the App already present in the HTML.
	el: '#todoapp',

	// Our template for the line of statistics at the bottom of the app.
	statsTemplate: _.template( $('#stats-template').html() ),

	// Delegated events for creating new items, and clearing completed ones.
	events: {
		'keypress #new-todo': 'createOnEnter',
		'click #clear-completed': 'clearCompleted',
		'click #toggle-all': 'toggleAllComplete'
	},



	// At initialization we bind to the relevant events on the 'Todos'
	// collection, when items are added or changed. Kick things off by
	// loading any preexisting todos that might be saved in *localStorage*.
	initialize: function() {
		// **cache elements it will be using into local properties (rel to this.$el )
		this.allCheckbox = this.$('#toggle-all')[0];
		this.$input = this.$('#new-todo');
		this.$footer = this.$('#footer');
		this.$main = this.$('#main');

		// **when add event is fired, the addOne() method is called and passed
		// **the new model. addOne() creates an instance of TodoView view, renders it,
		// **and appends the resulting element to our Todo list.
		this.listenTo(app.Todos, 'add', this.addOne);
		// **when reset event occurs (ie updating collection in bulk), addAll() is called, 
		// **which iterates over all of the Todos currently in our collection and fires addOne()
		// **for each item.
		this.listenTo(app.Todos, 'reset', this.addAll);

		// **listens for changes to the completed flag for any model in the collection. The
		// **affected todo is passed to the callback which triggers a custom *visible* 
		// **event on the model
		this.listenTo(app.Todos, 'change:completed', this.filterOne);
		// **filterAll() callback for filter events -- toggle which todo items are visible
		// **based on the filter currently selected in the UI (all, completed, remaining) via
		// **calls to filterOne()
		this.listenTo(app.Todos, 'filter', this.filterAll);
		// **sll event binds any event triggered on the Todos collection to the view's
		// **render method.
		this.listenTo(app.Todos, 'all', this.render);


		// **fetch previously saved todos from localStorage.
		app.Todos.fetch();
	},

	// Re-rendering the App just means refreshing the statistics -- the rest
	// of the app doesn't change.
	render: function() {
		var completed = app.Todos.completed().length;
		var remaining = app.Todos.remaining().length;

		// **display or hide main and footer depending on whether there are any todos 
		// **in the collection
		if ( app.Todos.length ) {
			this.$main.show();
			this.$footer.show();

			// **populated with HTML produced by instantiating the statsTemplate with the
			// **number of complted and remaining todo items.
			this.$footer.html(this.statsTemplate({
				completed: completed,
				remaining: remaining
			}));

			this.$('#filters li a')
				.removeClass('selected')
				.filter('[href="#/' + ( app.TodoFilter || '' ) + '"]')
				.addClass('selected');
		} else {
			this.$main.hide();
			this.$footer.hide();
		}

		// **updated based on whether there are remaining todos.
		this.allCheckbox.checked = !remaining;
	},

	// Add a single todo item to the list by creating a view for it, and
	// appending its element to the '<ul>'.
	addOne: function( todo ) {
		var view = new app.TodoView({ model: todo });
		$('#todo-list').append( view.render().el );
	},

	// Add all items in the **Todos** collection at once.
	addAll: function() {
		this.$('#todo-list').html('');
		app.Todos.each(this.addOne, this);
		// **we can use *this* to refer to the view because listenTo() implicitly
		// **set the callback's context to the view when it created the binding.
	},

	filterOne : function (todo) {
		todo.trigger('visible');
	},

	filterAll : function () {
		app.Todos.each(this.filterOne, this);
	},

	//Generate the attributes for a new Todo item.
	newAttributes: function() {
		return {
			title: this.$input.val().trim(),
			order: app.Todos.nextOrder(),
			completed: false
		};
	},

	// If you hit return in the main input field, create new Todo model,
	// persisting it to localStorage.
	createOnEnter: function( event ) {
		if ( event.which !== ENTER_KEY || !this.$input.val().trim() ) {
			return;
		}

		// **model is populated by newAttributes() which returns an object literal
		// **composed of title, order, completed state of new item. *this* = view
		// **since the callback was bound using the events hash.
		app.Todos.create( this.newAttributes() );
		this.$input.val('');
	},

	// Clear all completed todo items, destroying their models.
	clearCompleted: function() {
		_.invoke(app.Todos.completed(), 'destroy');
		return false;
	},

	toggleAllComplete: function() {
		var completed = this.allCheckbox.checked;

		app.Todos.each(function( todo ) {
			todo.save({
				'completed': completed
			});
		});
	}

});