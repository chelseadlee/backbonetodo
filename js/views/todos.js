var app = app || {};

// Todo Item View
// --------------
// **in charge of individual Todo records, making sure the view updates when
// **the todo does. We will add event listeners to the view that listen for
// **events on an individual todo's HTML representation.

// The DOM element for a todo item..
app.TodoView = Backbone.View.extend({

	// ...is a list tag.
	tagName: 'li',

	// Cache the template function for a single item.
	template: _.template($('#item-template').html() ),

	// The DOM events specific to an item.
	events: {
		'click .toggle': 'toggleCompleted',
		'dblclick label': 'edit',
		'click .destroy': 'clear',
		'keypress .edit': 'updateOnEnter',
		'blur .edit': 'close'
	},

	// The TodoView listens for changes to its model, re-rendering. Since there's
	// a one-to-one correspondence between a **Todo** and a **TodoView** in this
	// app, we set a direct reference on the model for convenience.
	initialize: function() {
		// **listener monitors a todo model's change event. When the todo gets
		// **updated, the app will re-render the view and visually reflect its changes.
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'visible', this.toggleVisible);
	},

	// Re-renders the titles of the todo item.
	render: function() {
		// **render #item-tempalte, which returns an HTML fragment that replaces
		// **the content of the view's element (an li element was implicitly created
		// **for us based on the tagName property)... the rendered template is now present
		// **under this.el and can be appended to the todo list in the user interface.
		this.$el.html( this.template( this.model.attributes ) );
		// **cache the input element within the instantiated template into this.$input.

		this.$el.toggleClass( 'completed', this.model.get('completed') );
		this.toggleVisible();

		this.$input = this.$('.edit');
		return this;
	},

	// Toggles visibility of item
	toggleVisible : function () {
		this.$el.toggleClass( 'hidden', this.isHidden() )
	},

	// Determines if item should be hidden
	isHidden : function () {
		var isCompleted = this.model.get('completed');
		return ( // hidden cases only
		(!isCompleted && app.TodoFilter === 'completed')
		|| (isCompleted && app.TodoFilter === 'active')
		);
	},

	// Toggle the '"completed"' state of the model.
	toggleCompleted: function() {
		this.model.toggle();
	},

	// Switch this view into '"editing"' mode, displaying the input field. 
	edit: function() {
		this.$el.addClass('editing');
		this.$input.focus();
	},

	// Close the '"editing"' mode, saving changes to the todo.
	close: function() {
		var value = this.$input.val().trim();

		if ( value ) {
			this.model.save({ title: value });
		}

		this.$el.removeClass('editing');
	},

	// If you hit 'enter', we're through editing the item.
	updateOnEnter: function( e ) {
		if ( e.which === ENTER_KEY ) {
			this.close();
		}
	},

	// Remove the item, destroy the model from *localStorage* and delete its view
	clear: function() {
		this.model.destroy();
	}
});