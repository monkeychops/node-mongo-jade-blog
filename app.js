/**
 * Module dependencies.
 */

var express = require('express'),
	moment = require('moment'),
	app = express();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var PostProvider = require('./postprovider').PostProvider;
var PostProvider= new PostProvider();

// Routes
app.get('/', function(req, res){    
	PostProvider.findAll( function(error, docs){        
		res.render('index.jade', {
			title: 'Blog', 
			articles: docs
		});    
	})
});

app.get('/blog/new', function(req, res) {
    res.render('blog_new.jade', {
        title: 'New Post'
    });
});

app.post('/blog/new', function(req, res){
    PostProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function( error, docs) {
        res.redirect('/')
    });
});

app.get('/blog/:year/:month/:slug', function(req, res) {

	var year = req.params.year
      , month = req.params.month.format('YYYY[/]MMMM[/]')
      , slug = req.params.slug
      , startDate = new Date(year, month - 1, 1)
      , endDate = new Date(year, month, 1);
	
    PostProvider.findBySlug(year, month, slug, startDate, endDate, function(error, article) {
        res.render('blog_show.jade', {
	         title: article.title,
	         article: article
        });
    });
});

app.post('/blog/addComment', function(req, res) {
    PostProvider.addCommentToArticle(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/blog/' + req.param('_id'))
       });
});

app.listen(3000);
//console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);