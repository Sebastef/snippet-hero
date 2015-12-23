'use strict';
var moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define('Comment', {
    content: DataTypes.TEXT,
    UserId: DataTypes.INTEGER,
    SnippetId: DataTypes.INTEGER
  }, {
    instanceMethods: {
      toJson: function () {
        return {
          content: this.get('content'),
          id: this.get('id'),
          SnippetId: this.get('SnippetId'),
          createdAt: moment(this.get('createdAt')).format('DD-MM-YYYY HH:mm')
        };
      }
    },
    classMethods: {
      associate: function(models) {
        this.belongsTo(models.User);
        this.belongsTo(models.Snippet);
      }
    }
  });
  return Comment;
};
