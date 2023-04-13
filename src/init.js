import axios from 'axios';
import * from 'yup';
import i18next from 'i18next';
import _ from 'lodash';



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
    const rssList = watchedState.rss.feeds.map((feed) => feed.url);
    const schema = yup.string().trim().required().url().notOneOf(feedLinks);
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
    
    const TIME_STEP = 5000;

    




};