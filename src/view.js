import onChange from 'on-change';

const renderProcessForm = (input, statusMessage) => {
  input.setAttribute('readonly', 'true');
  input.classList.remove('is-invalid');
  statusMessage.textContent = '';
};

const renderSuccessForm = (input, statusMessage, i18nextInstance) => {
  input.classList.remove('is-invalid');
  input.value = '';
  statusMessage.classList.remove('text-danger');
  statusMessage.classList.add('text-success');
  statusMessage.textContent = i18nextInstance.t('rssStatusMessage.success');
  input.removeAttribute('readonly');
};

const renderErrorForm = (input, statusMessage, i18nextInstance, error) => {
  input.classList.add('is-invalid');
  statusMessage.classList.add('text-danger');
  statusMessage.textContent = i18nextInstance.t(`rssStatusMessage.${error}`);
  input.removeAttribute('readonly');
};

const renderContainer = (type, i18nextInstance) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  container.append(cardBody);
  cardBody.classList.add('card-body');
  const header = document.createElement('h2');
  cardBody.append(header);
  header.classList.add('card-title', 'h4');
  header.textContent = type === 'feeds' ? i18nextInstance.t('feeds.title') : i18nextInstance.t('posts.title');
  const list = document.createElement('ul');
  cardBody.append(list);
  list.classList.add('list-group', 'border-0', 'rounded-0');
  return container;
};

const renderPosts = (postsEl, i18nextInstance, postList) => {
  postsEl.innerHTML = '';
  if (postList.length === 0) {
    return;
  }
  const view = renderContainer('posts', i18nextInstance);
  const list = view.querySelector('ul');
  postList.forEach((el) => {
    const post = document.createElement('li');
    post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    post.append(a);
    a.href = el.link;
    a.classList.add('fw-bold');
    a.setAttribute('target', '_blank');
    a.setAttribute('data-id', el.id);
    a.setAttribute('rel', 'noopener');
    a.setAttribute('rel', 'noreffer');
    a.textContent = el.title;
    const button = document.createElement('button');
    post.append(button);
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', el.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nextInstance.t('posts.button');
    list.append(post);
  });
  postsEl.append(view);
};

const renderFeeds = (feedsEl, i18nextInstance, feedList) => {
  feedsEl.innerHTML = '';
  if (feedList.length === 0) {
    return;
  }
  const view = renderContainer('feeds', i18nextInstance);
  const list = view.querySelector('ul');
  feedList.forEach((el) => {
    const feed = document.createElement('li');
    feed.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedHeader = document.createElement('h3');
    feed.append(feedHeader);
    feedHeader.classList.add('h6', 'm-0');
    feedHeader.textContent = el.title;
    const description = document.createElement('p');
    feed.append(description);
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = el.description;
    list.append(feed);
  });
  feedsEl.append(view);
};

const renderSeenPosts = (IDs) => {
  IDs.forEach((id) => {
    const seenPost = document.querySelector(`a[data-id="${id}"]`);
    seenPost.classList.remove('fw-bold');
    seenPost.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModalWindow = (modalEl, modalState) => {
  const title = modalEl.querySelector('.modal-title');
  const body = modalEl.querySelector('.modal-body');
  const readFullArticle = modalEl.querySelector('.full-article');
  title.textContent = modalState.title;
  body.textContent = modalState.description;
  readFullArticle.href = modalState.link;
};

export default (state, i18nextInstance, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'formStatus':
      switch (value) {
        case 'success':
          renderSuccessForm(elements.input, elements.statusMessage, i18nextInstance);
          break;
        case 'inProcess':
          renderProcessForm(elements.input, elements.statusMessage);
          break;
        case 'error':
          renderErrorForm(elements.input, elements.statusMessage, i18nextInstance, state.error);
          break;
        default:
          throw new Error('Unexpected form status');
      }
      break;
    case 'rss.feeds':
      renderFeeds(elements.feeds, i18nextInstance, value);
      break;
    case 'rss.posts':
      renderPosts(elements.posts, i18nextInstance, value);
      renderSeenPosts(state.rss.seenPosts);
      break;
    case 'rss.seenPosts':
      renderSeenPosts(value);
      break;
    case 'modal':
      renderModalWindow(elements.modal, value);
      break;
    default:
      break;
  }
});
