'use strict';

module.exports = function(sequelize, DataTypes) {
  var Snippet = sequelize.define('Snippet', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    language: DataTypes.ENUM(
      'text/plain',
      'text/x-coffeescript',
      'text/x-scss',
      'text/css',
      'text/x-markdown',
      'text/x-haml',
      'text/html',
      'text/x-less',
      'text/javascript',
      'application/json',
      'text/nginx',
      'text/x-ruby',
      'text/x-sql',
      'text/x-yaml'
    ),
    UserId: DataTypes.INTEGER,
    avg: DataTypes.FLOAT,
    isPublic: DataTypes.BOOLEAN
  }, {
    scopes: {
      withComments: function () {
        return {
          include: {
            model: sequelize.models.Comment,
            include: [sequelize.models.User],
            order: [['createdAt', 'DESC']]
          },
          order: [['createdAt', 'DESC']]
        };
      },
      lastComments: function () {
        return {
          include: {
            model: sequelize.models.Comment,
            include: [sequelize.models.User],
            limit: 5,
            order: [['createdAt', 'DESC']]
          },
          order: [['createdAt', 'DESC']]
        };
      },
      withVersions: function () {
        return {
          include: [sequelize.models.SnippetVersion],
          order: [['createdAt', 'DESC'], [sequelize.models.SnippetVersion, 'createdAt', 'DESC']]
        };
      },
      withAuthor: function () {
        return {
          include: [sequelize.models.User]
        };
      },
      withRatings: function (currentUserId) {
        if (currentUserId) {
          return {
            include: [{
              model: sequelize.models.Rating,
              required: false,
              where: {UserId: currentUserId}
            }]
          };
        } else {
          return {
            include: [sequelize.models.Rating]
          };
        }
      },
      fromCurrentMonth: function () {
        var today = new Date();
        var firstDayOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 0, 0 , 0));
        return {
          where: {
            createdAt: {
              $gte: firstDayOfMonth
            }
          }
        };
      },
      publicSnippets: function () {
        return {
          where: {
            isPublic: true
          }
        };
      }
    },
    instanceMethods: {
      toJson: function () {
        var json = {
          id: this.get('id'),
          name: this.get('name'),
          description: this.get('description'),
          language: this.get('language'),
          avg: this.get('avg') && this.get('avg').toFixed(2),
          content: '',
          versions: [],
          comments: [],
          createdAt: this.get('createdAt'),
          currentUserRating: 0,
          isPublic: this.get('isPublic')
        };

        if (this.User) {
          json.user = this.User.toJson();
        }
        if (this.SnippetVersions) {
          json.content = this.SnippetVersions.length ? this.SnippetVersions[0].content : '';
          json.versions = this.SnippetVersions.map(function (v) {
            return v.toJson();
          });
        }

        if (this.Comments) {
          json.comments = this.Comments.map(function (c) {
            return c.toJson();
          });
        }

        if (this.Ratings) {
          this.Ratings.map(function (r) {
            json.currentUserRating = r.value;
          });
        }

        return json;
      }
    },
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.User);
        this.hasMany(models.SnippetVersion, {onDelete: 'cascade', hooks: true});
        this.hasMany(models.Rating, {onDelete: 'cascade', hooks: true});
        this.hasMany(models.Comment, {onDelete: 'cascade', hooks: true});
      }
    }
  });
  return Snippet;
};
