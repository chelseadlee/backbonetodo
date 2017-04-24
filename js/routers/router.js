// Todo Router
// ----------

var app = app || {};

var Workspace = Backbone.Router.extend({
    routes:{
        // ** router uses a *splat to set up a default route which passes the string
        // **after '#/' in the URL to setFilter() which sets app.TodoFilter to that string
        '*filter': 'setFilter'
    },

    setFilter: function( param ) {
        // Set the current filter to be used
        if (param) {
            param = param.trim();
        }
        app.TodoFilter = param || '';

        // Trigger a collection filter event, causing hiding/unhiding
        // of Todo view items
        app.Todos.trigger('filter');
        // **once the filter has been set, we trigger 'filter' on our Todos collection
        // **to toggle which items are visible and which are hidden. AppView's filterAll()
        // **method is bound to the collection's filter event --> cause AppView to rerender.
    }
});

app.TodoRouter = new Workspace();
Backbone.history.start();