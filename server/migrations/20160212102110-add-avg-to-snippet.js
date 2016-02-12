'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Snippets',
      'avg',
      {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0
      }
    );
    models.Snippet.findAll()
    .then( function(snippets) {
      snippets.map(function(snippet) {
        models.Ratings.aggregate('value', 'avg', { where : { SnippetId : snippet.id } })
        .then(function(average) {
          snippet.avg = average;
          snippet.save();
        });
      });
    });
  },

  down: function (queryInterface) {
    queryInterface.removeColumn('Snippets', 'avg');
  }
};
