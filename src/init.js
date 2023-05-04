import { string } from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/index.js';
import watchState from './view.js';
import parseRss from './parser.js';

export default () => {
  const state = {
    formStatus: 'ready',
    rss: {
      feeds: [],
      posts: [],
      seenPosts: [],
    },
    error: null,
    modal: {},
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    statusMessage: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modal: document.getElementById('modal'),
  };

  const i18nextInstanse = i18next.createInstance();
  const watchedState = watchState(state, i18nextInstanse, elements);

  const TIME_STEP = 5000;

  const postsEventListener = (e) => {
    const targetPost = e.target;
    if (targetPost.tagName !== 'A') {
      return;
    }
    const targetPostId = targetPost.dataset.id;
    if (!watchedState.rss.seenPosts.includes(targetPostId)) {
      watchedState.rss.seenPosts.push(targetPostId);
    }
  };

  const modalEventListener = (e) => {
    const button = e.relatedTarget;
    const buttonId = button.dataset.id;
    const currentPost = watchedState.rss.posts.find((post) => post.id === buttonId);
    const { id } = currentPost;
    if (!watchedState.rss.seenPosts.includes(id)) {
      watchedState.rss.seenPosts.push(id);
    }
    watchedState.modal = { ...currentPost };
  };

  const validateUrl = (url) => {
    const rssList = watchedState.rss.feeds.map((feed) => feed.url);
    const urlSchema = string().url().notOneOf(rssList);
    return urlSchema.validate(url);
  };

  const makeProxy = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

  const addPostsID = (posts) => {
    if (posts.length === 0) return [];
    return posts.map((post) => {
      const id = _.uniqueId();
      return { ...post, id };
    });
  };

  const getUpdatedRss = () => {
    const rssList = watchedState.rss.feeds.map((feed) => feed.url);
    return rssList.map((rss) => axios.get(makeProxy(rss))
      .then((response) => parseRss(response.data.contents)));
  };

  const updatePosts = (posts) => {
    const titles = watchedState.rss.posts.map((post) => post.title);
    const postsToUpdate = posts.filter((post) => !titles.includes(post.title));
    const postsWithID = addPostsID(postsToUpdate);
    watchedState.rss.posts.push(...postsWithID);
  };

  const checkForUpdates = () => {
    const promises = getUpdatedRss();
    Promise.allSettled(promises)
      .then((results) => {
        const fullfiledPosts = results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value.posts);
        updatePosts(fullfiledPosts.flat());
      })
      .finally(() => {
        setTimeout(checkForUpdates, TIME_STEP);
      });
  };

  const { modal, form, input } = elements;
  window.addEventListener('click', postsEventListener);
  modal.addEventListener('show.bs.modal', modalEventListener);

  i18nextInstanse.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(() => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const url = input.value;
      validateUrl(url)
        .then(() => {
          watchedState.formStatus = 'inProcess';
          return axios.get(makeProxy(url));
        })
        .then((response) => {
          const { feed, posts } = parseRss(response.data.contents);
          feed.url = url;
          const postsWithID = addPostsID(posts);
          watchedState.formStatus = 'success';
          watchedState.rss.feeds.push(feed);
          watchedState.rss.posts.push(...postsWithID);
        })
        .catch((e) => {
          let errorMessage;
          if (e.name === 'AxiosError') {
            errorMessage = 'networkError';
          } else if (e.message === 'parseError') {
            errorMessage = 'invalidRss';
          } else {
            errorMessage = e.type;
          }
          watchedState.error = errorMessage;
          watchedState.formStatus = 'error';
        });
    });
  });
  checkForUpdates();
};
