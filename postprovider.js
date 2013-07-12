var DATE_SEPERATOR = '/'

var mongoose = require('mongoose'),
	slug = require('slug'),
	moment = require('moment');
	
mongoose.connect('mongodb://localhost/x');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var Comments = new Schema({
    person     : String
  , slug	   : String
  , comment    : String
  , created_at : Date
});

var Post = new Schema({
    author      : ObjectId
  , title       : String
  , slug		: { type: String, index: true }
  , _id			: String
  , body        : String
  , url			: String
  , created_at  : Date
  , comments    : [Comments]
});

Post.pre('save', function (next) {

	var date = moment(this.created_at),
	    formatted = date.format('YYYY[/]MMMM[/]');

    this.slug = slug(this.title);
    this.url = formatted + this.slug;
    next();
    
});

var Post = mongoose.model('Post', Post);

PostProvider = function(){};

//Find all posts
PostProvider.prototype.findAll = function(callback) {
  Post.find({}, function (err, posts) {
    callback( null, posts )
  });  
};

//Find post by date and slug
PostProvider.prototype.findBySlug = function(year, month, slug, startDate, endDate, callback) {
	Post.findOne({'slug' : slug})
		.where('created_at').gte(startDate).lt(endDate)
		.exec(function(err, post) {
		
		if (!err && post) {
			callback( null, post ); 
		}
	});
};

//Update post by ID
PostProvider.prototype.updateById = function(id, body, callback) {
  Post.findById(id, function (err, post) {
    if (!err) {
	  post.title = body.title;
	  post.body = body.body;
	  post.save(function (err) {
	    callback();
	  });
	}
  });
};

//Create a new post
PostProvider.prototype.save = function(params, callback) {
  var post = new Post({title: params['title'], body: params['body'], created_at: new Date()});
  post.save(function (err) {
    callback();
  });
};

//Add comment to post
PostProvider.prototype.addCommentToPost = function(postId, comment, callback) {
  this.findById(postId, function(error, post) {
    if(error){
	  callback(error)
	}
    else {
	  post.comments.push(comment);
	  post.save(function (err) {
	    if(!err){
		  callback();
	    }	
	  });
    }
  });
};

exports.PostProvider = PostProvider;
