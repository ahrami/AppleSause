pool = require.main.pool;

postModel = require("../models/postModel");
userModel = require("../models/userModel");
favoritesModel = require("../models/favoritesModel");
fetchError = require("./fetchError");
fileModel = require("../models/fileModel");

const _ = require('lodash'); 
const multer  = require('multer');

getPosts = async (req, res) => {
	let readSize = 2;
	let {cursor, client} = {};
	if (req.query.category_id || req.query.string) {
		if(parseInt(req.query.category_id)) {
			({cursor, client} = await postModel.getPostsByCategoryCursorShuffle({
				closed: req.body.closed,
				category_id: parseInt(req.query.category_id)
			}));
		} else {
			({cursor, client} = await postModel.getAllPostsCursorShuffle({
				closed: req.body.closed
			}));
		}
	} else if(!req.body.username && !req.body.category_id) {
		if(req.body.shuffle) {
			({cursor, client} = await postModel.getAllPostsCursorShuffle({
				closed: req.body.closed
			}));
		} else {
			({cursor, client} = await postModel.getAllPostsCursor({
				closed: req.body.closed
			}));
		}
	} else if (!req.body.username) {
		if(req.body.shuffle) {
			({cursor, client} = await postModel.getPostsByCategoryCursorShuffle({ 
				closed: req.body.closed, 
				category_id: req.body.category_id 
			}));
		} else {
			({cursor, client} = await postModel.getPostsByCategoryCursor({ 
				closed: req.body.closed, 
				category_id: req.body.category_id 
			}));
		}
	} else if (!req.body.category_id) {
		user = await userModel.getUserByUsername(req.body.username);
		if (!user) {
			res.status(200).json({ posts: [] });
			return;
		}
		if(req.body.shuffle) {
			({cursor, client} = await postModel.getPostsByUserIdCursorShuffle({ 
				closed: req.body.closed, 
				user_id: user.user_id 
			}));
		} else {
			({cursor, client} = await postModel.getPostsByUserIdCursor({ 
				closed: req.body.closed, 
				user_id: user.user_id 
			}));
		}
	} else {
		user = await userModel.getUserByUsername(req.body.username);
		if (!user) {
			res.status(200).json({ posts: [] });
			return;
		}
		if(req.body.shuffle) {
			({cursor, client} = await postModel.getPostsByUserIdAndCategoryCursorShuffle({
				closed: req.body.closed, 
				user_id: user.user_id, 
				category_id: req.body.category_id 
			}));
		} else {
			({cursor, client} = await postModel.getPostsByUserIdAndCategoryCursor({
				closed: req.body.closed, 
				user_id: user.user_id, 
				category_id: req.body.category_id 
			}));
		}
	}

	if(!cursor) {
		if(client) {
			await client.release();
		}
		fetchError.sendError(res);
		return;
	}

	posts = [];

	if (!req.body.quantity){
		await cursor.close();
		await client.release();
		res.status(200).json({ posts });
		return;
	}

	rows = await cursor.read(readSize);
	while (rows.length) {
		if(posts.length < req.body.quantity) {

			postModel.choosePosts({ 
				posts: rows, 
				excludePostIds: req.body.excludePostIds, 
				quantity: req.body.quantity - posts.length,
				string: req.query.string
			}).forEach(post => {
				posts.push(post);
			});

			rows = await cursor.read(readSize);
		} else {
			await cursor.close();
			break;
		}
	}
	await client.release();
	
	res.status(200).json({ posts });
}

changeClosed = async (req, res) => {
	try {
		post = await postModel.getPostById({ post_id: parseInt(req.body.post_id) });
		if (post.user_id === req.userInfo.user_id) {
			closed = !!(post.closed);
			await postModel.setPostClosedById({ post_id: parseInt(req.body.post_id), closed: !closed });
			res.status(200).json({ redirect: undefined, closed: !closed });
		} else {
			fetchError.sendError(res);
		}
	} catch (err) {
		console.error("Error changing closed", err);
		fetchError.sendError(res);
	}
}

module.exports.post_post = (req, res) => {
	if (req.body.get) {
		getPosts(req, res);
	} else if (req.userInfo) {
		if (req.body.changeClosed) {
			changeClosed(req, res);
		}
	} else {
		fetchError.sendError(res);
	}
}

module.exports.createPost_get = (req, res) => {
	res.render('createpost', { title: 'Create' });
}

module.exports.createPost_post = async (req, res) => {
	try{
		if(req.headers['content-type'].split(';')[0] === "multipart/form-data"){
			require.main.upload.single('picture')(req, res, async (err) => {
				if (err instanceof multer.MulterError) {
		     	console.error('Multer error', err.stack);
					res.status(500).render('500', { title: 'Error' });
		    } else if (err) {
		      console.error('Unknown error', err.stack);
					res.status(500).render('500', { title: 'Error' });
		    } else {
		    	try {
			    	post = await postModel.createPost({
							user_id: req.userInfo.user_id, 
							category_id: parseInt(req.body.category), 
							title: req.body.title, 
							description: req.body.description, 
							price: req.body.price, 
							address: req.body.address,
							picture_filename: req.file ? req.file.filename : "",
						});
						if (post) {
							res.status(302).redirect(`/post/${post.post_id}`);
						} else {
							throw new Error();
						}
					} catch {
						if(req.file) {
							fileModel.deleteFile(req.file.filename);
						}
						throw "Could not create post";
					}
		    }
		  });
		} else {
			throw "Unhandled request";
		}
	} catch {
		console.error('Error while creating post', err);
		res.status(500).render('500', { title: 'Error' });
	}
}

module.exports.updatePost_get = (req, res) => {
	if (!_.isInteger(parseInt(req.params.id))) {
	  res.status(404).render('404', { title: 'Post Not Found' });
	} else {
		postModel.getPostById({ post_id: parseInt(req.params.id) })
		.then(post => {
			if(!post){
				res.status(404).render('404', { title: 'Post Not Found' });
			} else if (post.user_id === req.userInfo.user_id) {
				res.render('updatepost', { title: 'Post', post: post });
			} else {
				res.status(500).render('500', { title: 'Error' });
			}
		})
		.catch(err => {
			console.error('Error getting updatepost', err);
			res.status(500).render('500', { title: 'Error' });
		});
	}
}

module.exports.updatePost_post = async (req, res) => {
	try {
		if (!_.isInteger(parseInt(req.params.id))) {
		  throw "Could not find post";
		} else if(req.headers['content-type'].split(';')[0] === "multipart/form-data") {
			require.main.upload.single('picture')(req, res, async (err) => {
				if (err instanceof multer.MulterError) {
		     	console.error('Multer error', err.stack);
					res.status(500).render('500', { title: 'Error' });
		    } else if (err) {
		      console.error('Unknown error', err.stack);
					res.status(500).render('500', { title: 'Error' });
		    } else {
		    	post = await postModel.getPostById({ post_id: parseInt(req.params.id) });
		    	if(post && post.user_id === req.userInfo.user_id) {
				    if (req.file) {
							fileModel.deletePostPicture(post);
							try {
								post = await postModel.updatePostById_pic({
									category_id: parseInt(req.body.category), 
									title: req.body.title, 
									description: req.body.description, 
									price: req.body.price, 
									address: req.body.address,
									picture_filename: req.file.filename,
									post_id: post.post_id
								});
								if (post) {
									res.redirect(`/post/${post.post_id}`);
								}
								else {
									throw new Error();
								}
							} catch {
								fileModel.deleteFile(req.file.filename);
								throw "Could not update post";
							}
						} else {
							post = await postModel.updatePostById_nopic({
									category_id: parseInt(req.body.category), 
									title: req.body.title, 
									description: req.body.description, 
									price: req.body.price, 
									address: req.body.address,
									post_id: parseInt(req.params.id)
								});
							if (post) {
								res.redirect(`/post/${post.post_id}`);
							}
							else {
								throw "Could not update post";
							}
				    }
				  } else {
				  	res.status(500).render('500', { title: 'Error' });
				  }
			  }
		  });
		} else {
			throw "Unhandled request type";
		}
	} catch (err) {
		console.error(err);
		res.status(500).render('500', { title: 'Error' });
	}
}

module.exports.post_get = async (req, res) => {
	if (!_.isInteger(parseInt(req.params.id))) {
	  res.status(404).render('404', { title: 'Post Not Found' });
	} else {
		try {
			post = await postModel.getPostByIdIncrementViews({ post_id: parseInt(req.params.id) });
			if (!post) {
				res.status(404).render('404', { title: 'Post Not Found' });
				return;
			}
			await postModel.updatePostFavoritesById({ post_id: post.post_id });
			owner = await userModel.getUserById(post.user_id);
			if (!owner) {
				res.status(500).render('500', { title: 'Error' });
				return;
			}
			category = await postModel.getCategoryById(post.category_id);
			if (!category) {
				res.status(500).render('500', { title: 'Error' });
				return;
			}
			let favorite = false;
			if (req.userInfo) {
				favorite = !!(await favoritesModel.getFavorite({ user_id: req.userInfo.user_id, post_id: post.post_id }));
			}
			res.render('post', { title: 'Post', post, owner, category, favorite });
		} catch (err) {
			console.error('Error getting post', err);
			res.status(500).render('500', { title: 'Error' });
		}
	}
}

module.exports.post_delete = async (req, res) => {
	if (!_.isInteger(parseInt(req.params.id)) ) {
	  fetchError.sendError(res);
	} else {
		try {
			post = await postModel.getPostById({ post_id: parseInt(req.params.id) });
			if(post && req.userInfo.user_id === post.user_id) {
				await postModel.deletePostById({ post_id: post.post_id });
				await favoritesModel.deleteFavoritesByPostId(post.post_id);
				fileModel.deletePostPicture(post);
				res.json({ redirect: '/' });
			} else {
				throw "could not delete post";
			}
		} catch (err) {
			console.error('Error deleting post', err);
			fetchError.sendError(res);
		}
	}
}

module.exports.allCategories_get = (req, res) => {
	postModel.getAllCategories((err, categories) => {
		if (err) {
			console.error('Error executing query', err.stack);
			fetchError.sendError(res);
		} else {
			res.status(200).json({ categories: categories })
		}
	});
}

/*
deleteAllPosts = () => {
	console.log('deleting all posts');
	postModel.getAllPosts((qerr, posts) => {
		if (qerr) {
			console.error('Error executing query', qerr.stack);
		} else {
			posts.forEach(post => {
				postModel.deletePostById(post.post_id, (qerr, post) => {
					if (qerr) {
						console.error('Error executing query', qerr.stack);
					}
				});
			})
		}
	});
}

createPosts = () => {
	console.log('creating posts');

	userModel.getAllUsers(({ qerr, users }) => {
		if (qerr) {
			console.error('Error executing query', qerr.stack);
		} else {
			var allUserIds = [];
			users.forEach(user => {
				allUserIds.push(user.user_id);
			});

			for (let i = 0; i < 500; i++) {
				var myuser_id = _.sample(allUserIds)

				var w = _.random(0, 7);
				var mytitle = _.capitalize(_.sample(require.main.words));
				for (let i = 0; i < w; i++) {
					if (_.random(0, 1)) { 
						mytitle = mytitle + " " + _.sample(require.main.words);
					} else{
						mytitle = mytitle + " " + _.capitalize(_.sample(require.main.words));
					}
				}

				var d = _.random(5, 100);
				var mydescr = _.capitalize(_.sample(require.main.words));
				for (let i = 0; i < d; i++) {
					if (_.random(0, 1)) { 
						mydescr = mydescr + " " + _.sample(require.main.words);
					} else{
						mydescr = mydescr + " " + _.capitalize(_.sample(require.main.words));
					}
				}
				postModel.createPost({
					user_id: myuser_id, 
					category_id: _.random(1, 12),
					title: mytitle, 
					description: mydescr, 
					price: `${_.random(0, 9999)}`,
					address: users.find(user => {return (user.user_id === myuser_id)}).address,
				}, ({ qerr, post}) => {
					if (qerr) {
						console.error('Error executing query', qerr.stack);
					}
					console.log(post);
				});
			}
		}
	});
}
*/