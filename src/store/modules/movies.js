/* eslint-disable */

import IDs from "@/store/mock/imdb_top250";
import axios from "@/plugins/axios";
import mutations from "@/store/mutations";

function serializeResponse(movies) {
  return movies.reduce((acc, movie) => {
    acc[movie.imdbID] = movie;
    return acc;
  }, {});
};

const { MOVIES, CURRENT_PAGE, REMOVE_MOVIE, TODDLE_SEARCH } = mutations;

const moviesStore = {
  namespaced: true,
  state: {
    top250IDs: IDs,
    moviesPerPage: 12,
    currentPage: 1,
    movies: {},
    isSearch: false,
  },
  getters: {
    moviesList: ({ movies }) => movies,
    sliceIDs: ({ top250IDs }) => (from, to) => top250IDs.slice(from, to),
    currentPage: ({ currentPage }) => currentPage,
    moviesPerPage: ({ moviesPerPage }) => moviesPerPage,
    moviesLength: ({ top250IDs }) => Object.keys(top250IDs).length,
    isSearch: ({isSearch }) => isSearch,
  },
  mutations: {
    [MOVIES](state, value) {
      state.movies = value;
    },
    [CURRENT_PAGE](state, value) {
      state.currentPage = value;
    },
    [REMOVE_MOVIE](state, index) {
      state.top250IDs.splice(index, 1);
    },
    [TODDLE_SEARCH](state, bool) {
      state.isSearch = bool;
    }
  },
  actions: {
    async fetchMovies({ getters, commit, dispatch }) {
      try {
        dispatch("toggelLoader", true, { root: true });
        const { currentPage, moviesPerPage, sliceIDs } = getters;

        const from = currentPage * moviesPerPage - moviesPerPage;
        const to = currentPage * moviesPerPage;
        const moviesToFetch = sliceIDs( from, to );

        const requests = moviesToFetch.map(id => axios.get(`/?i=${id}`));
        const response = await Promise.all(requests);
        const movies = serializeResponse(response);
        commit(MOVIES, movies);
      } catch (err) {
        console.log(err);
      }
      finally{
        dispatch("toggelLoader", false, { root: true });
      }
    },
    changeCurrentPage({ commit, dispatch }, page) {
      commit(CURRENT_PAGE, page);
      dispatch("fetchMovies");
    },
    removeMovie({ commit, dispatch, state }, id) {
      const index = state.top250IDs.findIndex(item => item === id);

      if (index !== -1) {
        commit(REMOVE_MOVIE, index);
        dispatch("fetchMovies");
      }
    },
    async searchMovies({ commit, dispatch }, query) {
      try {
        dispatch("toggelLoader", true, { root: true });

        const response = await axios.get(`/?s=${query}`);

        if(response.Error) {
          throw Error(response.Error);
        }

        const movies = serializeResponse(response.Search);
        commit(MOVIES, movies);

      } catch (err) {
        dispatch("showNotify", {
          msg: err.message,
          title: "Error",
          variant: "danger",
        }, { root: true });
      } finally {
        dispatch("toggelLoader", false, { root: true });
      }
    },
    toggleSearchState({ commit }, bool){
      commit(TODDLE_SEARCH, bool);
    }
  },

};

export default moviesStore;
