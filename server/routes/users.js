var express = require('express');
var router = express.Router();
var models = require('../models');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var randtoken = require('rand-token');
var User = models.User;

/* GET users listing. */
router.get('/', function(req, res) {
  User.findAll().then(function(users) {
    var mappedUsers = users.map(function(user) {
      return ({ id: user.id, name: user.name, email: user.email });
    });

    res.send(mappedUsers);
  });
});

router.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    res.cookie('rememberMeToken', req.user.get('authToken'), { expires: new Date(Date.now() + 30 * 24 * 3600), httpOnly: true, path: '/' });
    res.send({ user: req.user });
  }
);

router.get('/current',
  function(req, res, next) {
    var _send_user_or_401_status = function() {
      if(req.user) {
        res.send({ user: req.user });
      } else {
        res.status(401).send('Not logggend in');
      }
    };

    if(req.cookies.rememberMeToken) {
      User.find({ where: { authToken: req.cookies.rememberMeToken } }).then(function(user) {
        req.login(user, function(err) {
          if (err) { return next(err); }
          _send_user_or_401_status();
        });
      });
    } else {
      _send_user_or_401_status();
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
    authToken: randtoken.generate(16),
    passwordSalt: salt
  };
  User.create(attributes).then(function(user) {
    req.logIn(user, function() {
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
