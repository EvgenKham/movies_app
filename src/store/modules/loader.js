import mutations from "@/store/mutations";

const { TOGGEL_LOADER } = mutations;

const loaderStore = {
  state: {
    isShowLoader: true,
  },
  getters: {
    isShowLoader: ({ isShowLoader }) => isShowLoader,
  },
  mutations: {
    [TOGGEL_LOADER](state, bool) {
      state.isShowLoader = bool;
    },
  },
  actions: {
    toggelLoader({ commit }, bool) {
      commit(TOGGEL_LOADER, bool);
    },
  },
};

export default loaderStore;
