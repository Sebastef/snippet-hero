import alt from '../libs/alt';
import update from 'react-addons-update';
import _ from 'lodash';
import SnippetActions from '../actions/snippet-actions';
import RatingActions from '../actions/rating-actions';
import UserSnippetsStore from './user-snippets-store';

// TODO create tests
class SnippetStore {
  constructor() {
    this.bindActions(SnippetActions);
    this.bindActions(RatingActions);
    this.state = {
      snippets: [],
      lastCreateSuccess: false,
      snippetCreated: false,
      snippetsAvg: {},
      usersRatings: {}
    };
  }

  getAll (data) {
    if (data.ok) {
      const {snippets} = this.state;

      this.setState({
        snippets: snippets.concat(data.snippets)
      });
    } else {
      // TODO react to errors
      // console.log(data.error.message)
    }
  }


  create() {
    this.setState({
      snippetCreated: false
    });
    this.preventDefault();
  }

  createRating(data) {
    if (data.ok) {
      const ratings = this.state.ratings;
      const createdRating = data.rating.rating;
      var snippetsAverage = this.state.snippetsAvg;
      snippetsAverage[createdRating.SnippetId] = data.rating.avg;

      var allRatings = this.state.usersRatings;
      var userRating = allRatings[createdRating.UserId];
      userRating[createdRating.SnippetId] = createdRating.value;
      allRatings[createdRating.UserId] = userRating;

      this.setState({
        ratings: ratings.concat(createdRating),
        snippetsAvg: snippetsAverage,
        usersRatings: allRatings
      });
    } else {
      // TODO
    }
  }

  onCreateSuccess(data) {
    const {snippets} = this.state;

    this.setState({
      snippets: snippets.concat(data.snippet),
      snippetCreated: true,
      lastCreateSuccess: true
    });
  }

  onCreateFail() {
    this.setState({
      snippetCreated: true,
      lastCreateSuccess: false
    });
  }

  getAllComments(data) {
    const {snippets} = this.state;
    if (data.ok) {
      let snippetIndex = _.findIndex(snippets, 'id', data.snippetId);
      let newSnippets = update(snippets, {[snippetIndex]: {comments: {$set: data.comments}}});
      this.setState({
        snippets: newSnippets
      });
    }
  }

  commentSnippet(data) {
    const {snippets} = this.state;
    if (data.ok) {
      let snippetIndex = _.findIndex(snippets, 'id', data.comment.SnippetId);
      let newSnippets = update(snippets, {[snippetIndex]: {comments: {$unshift: [data.comment]}}});
      this.setState({
        snippets: newSnippets
      });
    } else {
      // TODO react to errors
      // console.log(data.error.message)
    }
  }

  getSnippetRatings (data) {
    if (data.ok) {
      var snippetsAverage = this.state.snippetsAvg;
      const snippetId = data.avg.snippetId;
      const avarage = data.avg.avg;

      snippetsAverage[snippetId] = avarage;

      this.setState({
        snippetsAvg: snippetsAverage
      });
    }
  }

  getUserSnippetRating (data) {
    if (data.ok) {
      var userId = data.userId;
      var snippetId = data.snippetId;
      var ratings = data.ratings;
      var userRate = this.state.usersRatings;

      if(userId != null && snippetId != null){
        userRate[userId][snippetId] = ratings;
      }

      this.setState({
        usersRatings: userRate
      });
    }
  }

  getCurrentUserRating (data) {
    if (data.ok) {
      var userId = data.grade.user;
      var snippetId = data.grade.snippet;
      var grade = data.grade.rate;
      var userRate = this.state.usersRatings;

      if (userId != null) {
        var snippetRating = {};
        if (userRate[userId]){
          snippetRating = userRate[userId];
        }
        snippetRating[snippetId] = grade;
        userRate[userId] = snippetRating;

        this.setState({
          usersRatings: userRate
        });
      }
    }
  }

  destroySnippet (data) {
    if (data.ok){
      var oldSnippets = this.state.snippets;

      oldSnippets.forEach(function (snippet) {
        if(snippet.id == data.res){
          var indexOfSnippet = oldSnippets.indexOf(snippet);
          oldSnippets.splice(indexOfSnippet, 1);
        }
      });

      this.setState({
        snippets: oldSnippets
      });
      UserSnippetsStore.destroyUserSnippet(data);
    }
  }
}

export default alt.createStore(SnippetStore, 'SnippetStore');
