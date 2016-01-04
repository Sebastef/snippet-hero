var express = require('express');
var router = express.Router();
var models = require('../models');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var randtoken = require('rand-token');
var User = models.User;

/* GET users listing. */
router.get('/', function(req, res) {
  models.User.findAll().then(function(users) {
    var mappedUsers = users.map(function(user) {
      return ({ id: user.id, name: user.name, email: user.email });
    });

    res.send(mappedUsers);
  });
});

router.post('/login',
  passport.authenticate('local'),
  function(req, res, next) {
    res.send({ user: req.user });
  }
);

router.get('/current',
  function(req, res, next) {
    if(req.user) {
      res.send({ user: req.user });
    } else {
      res.status(401).send('Not logggend in');
    }
  }
);


router.delete('/logout', function(req, res) {
  req.logout();
  res.send(true);
});

router.post('/register', function(req, res) {
  var body = req.body;
  var salt = bcrypt.genSaltSync();
  var attributes = {
    email: body.email,
    name: body.name,
    encryptedPassword: bcrypt.hashSync(body.password, salt),
    passwordSalt: salt
  };
  User.create(attributes).then(function(user) {
    req.logIn(user, function(err) {
      res.status(201).send({ user: user });
    });
  }).catch(function(err) {
    res.status(422).send(err.message);
  });
});

router.get('/:id', function(req, res) {
  User.findById(req.params.id).then(function(user) {
    res.send(user);
  });
});

router.get('/:id/snippets', function(req, res) {
  models.Snippet.findAll({ where: { UserId: req.params.id } }).then(function(snippets) {
    var snippet_ids = snippets.map(function(snippet) {
      return snippet.id;
    });

    res.send({ snippet_ids: snippet_ids });
  });
});

module.exports = router;
