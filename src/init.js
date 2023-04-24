import axios from 'axios';
import { string } from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/index.js';
import watchState from './view.js';
import parseRss from './parser.js';


export default () => {
  const initialState = {
    form: {
        state: 'filling',
        error: null,
    },
    posts: [],
    feeds: [],
    seenPosts: [],
  };

  const validate = (url) => {
    const rssList = watchedState.feeds.map((feed) => feed.url);
    const schema = string().url().notOneOf(rssList);
    return schema.validate(url);
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
  const watchedState = watchState(initialState, i18nextInstanse, elements);
    
  const delay = 5000;

  const postsEventListener = (e) => {
    const targetPost = e.target;
    if (targetPost.tagName !== 'A') {
      return;
    }
    const targetPostId = e.target.dataset.id;
    if (!watchedState.seenPosts.includes(targetPostId)) {
      watchState.seenPosts.push(targetPostId);
    }
  };

  const modalEventListener = (e) => {
    const button  = e.relatedTarget;
    const buttonId = button.dataset.id;
    const currentPost = watchedState.posts.find((post) => post.id === buttonId);
    const { id } = currentPost;

    if (!watchedState.seenPosts.includes(id)) {
      watchedState.seenPosts.push(id);
    }
    watchedState.modal = { ...currentPost };
  };

  const addPostsId = (posts) => {
    if (posts.length === 0) {
      return [];
    }
    return posts.map((post) => {
      const id = _.uniqueId();
      return { ...posts, id };
    });
  };

  const updatePosts = (posts) => {
    const titles = watchedState.posts.map((post) => post.title);
    const postsToUpdate = posts.filter((post) => !titles.includes(post.title));
    const postsWithId = addPostsId(postsToUpdate);
    watchedState.posts.push(...postsWithId);
  };

  const makeProxy = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

  const getUpdateRSS = () => {
    const rssList = watchedState.feeds.map((feed) => feed.url);
    return rssList.map((rss) => axios.get(makeProxy(rss))
      .then((response) => parseRss(response.data.contents)));
  }
    
  const checkUpdates = () => {
    const promises = getUpdateRSS();
    Promise.allSettled(promises)
      .then((results) => {
        const fullFieldPosts = results
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value.posts);
        updatePosts(fullFieldPosts.flat());
      })
      .finally(() => {
        setTimeout(checkUpdates, delay);
      });
  };

  const { modal, form, input } = elements;
  window.addEventListener('click', postsEventListener);
  modal.addEventListener('show.bs.modal', modalEventListener);

  i18nextInstanse.init({
    lng: 'ru',
    dubug: true,
    resources
  }).then(() => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = input.value;
      validate(url)
        .then(() => {
          watchedState.form.status = 'inProcess';
          return axios.get(makeProxy(url));
        })
        .then((response) => {
          const { feed, posts } = parseRss(response.data.contents);
          feed.url = url;
          const postsWithId = addPostsId(posts);
          watchedState.form.status = 'succes';
          watchedState.feeds.push(feed);
          watchedState.posts.push(...postsWithId);
        })
        .cath((e) => {
          let errorMessage;
          if (e.name === 'AxiosError') {
            errorMessage = 'networkError';
          } else if (e.message === 'parseError') {
            errorMessage = 'invalidRss'
          } else {
            errorMessage = e.type;
          }
          watchedState.form.error = errorMessage;
          watchedState.form.status = 'error';
        });
    });
  });
  checkUpdates();
};