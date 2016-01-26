import React from 'react';
import PageWrapper from '../page-wrapper';
import SnippetsList from '../snippets/snippets-list';
import SearchBar from '../search-bar';
import SnippetActions from '../../actions/snippet-actions';
import SnippetStore from '../../stores/snippet-store';
import SnippetSearchStore from '../../stores/snippet-search-store';
import Paginator from 'react-paginate-component'

export default class SnippetsIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getPropsFromStores();
    this._searchSnippets = this._searchSnippets.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onSearch = this._onSearch.bind(this);
  }

  componentDidMount() {
    this.storeListeners = [];
    this.storeListeners.push(SnippetStore.listen(this._onChange));
    this.storeListeners.push(SnippetSearchStore.listen(this._onSearch));
    this._getPaginatedSnippets(1);
    this.setState({
      loading: false,
      currentPage: 1
    });
  }

  _getPaginatedSnippets(page){
    this.setState({
      loading: true
    });

    SnippetActions.getPaginatedSnippets(page, 2).then(function (){
      this.setState({
        loading: false,
        currentPage: page
      });
    });
  }

  getPropsFromStores() {
    return SnippetStore.getState();
  }

  getPropsFromSearchStore() {
    return SnippetSearchStore.getState();
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.getPropsFromStores(nextProps, this.context));
  }

  componentWillUnmount() {
    this.storeListeners.forEach(unlisten => unlisten());
  }

  _onChange() {
    this.setState(this.getPropsFromStores(this.state, this.context));
  }

  _onSearch() {
    this.setState(this.getPropsFromSearchStore(this.state, this.context));
  }

  _searchSnippets (value) {
    SnippetActions.search(value);
  }

  render() {
    let s = this.state;
    const pages = [1,2,3,4,5].map((page) => {
      return (<li key={page} className={s.currentPage === page ? 'active' : ''}>
          <a href="#">{page}</a>
        </li>
      );
    });

    return (
      <PageWrapper>
        <h2 style={{fontSize: '24px', margin: '20px 0'}}>All snippets:</h2>
        <SearchBar label='Search by name:' onSearch={this._searchSnippets} />
        <div style={{clear: 'right'}}>
          {(() => {
            if(this.state.snippets.length > 0){
              return (
                <div>
                  <SnippetsList snippets={this.state.snippets}/>
                  <nav>
                    <ul className={'pagination'}>
                      <li className={s.currentPage === 1 ? 'disabled' : ''}>
                        <a href="#">
                          <span aria-hidden="true">&laquo;</span>
                          <span className="sr-only">Prev</span>
                        </a>
                      </li>
                      {pages}
                      <li className={s.currentPage === 5 ? 'disabled' : ''}>
                        <a href="#">
                          <span aria-hidden="true">&raquo;</span>
                          <span className="sr-only">Next</span>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              );
            } else {
              return (
                <h2 style={{textAlign: 'center', fontWeight: 'normal'}}>
                  Sorry, there are no snippets to display at this time.
                </h2>
              );
            }
          })()}
      </div>
      </PageWrapper>
    );
  }
}
