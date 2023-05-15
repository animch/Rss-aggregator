import onChange from 'on-change';

const renderProcessForm = (input, statusMessage, formButton) => {
  input.setAttribute('readonly', 'true');
  input.classList.remove('is-invalid');
  statusMessage.textContent = '';
  formButton.setAttribute('disabled', '');
};

const renderSuccessForm = (input, statusMessage, i18next, formButton) => {
  input.classList.remove('is-invalid');
  input.value = '';
  statusMessage.classList.remove('text-danger');
  statusMessage.classList.add('text-success');
  statusMessage.textContent = i18next.t('status.success');
  input.removeAttribute('readonly');
  formButton.removeAttribute('disabled');
};

const renderErrorForm = (input, statusMessage, i18next, error, formButton) => {
  input.classList.add('is-invalid');
  statusMessage.classList.add('text-danger');
  statusMessage.textContent = i18next.t(`status.${error}`);
  input.removeAttribute('readonly');
  formButton.removeAttribute('disabled');
};

const renderContainer = (type, i18next) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  container.append(cardBody);
  cardBody.classList.add('card-body');
  const header = document.createElement('h2');
  cardBody.append(header);
  header.classList.add('card-title', 'h4');
  header.textContent = type === 'feeds' ? i18next.t('feeds.title') : i18next.t('posts.title');
  const list = document.createElement('ul');
  cardBody.append(list);
  list.classList.add('list-group', 'border-0', 'rounded-0');
  return container;
};

const renderPosts = (postsEl, i18next, postList) => {
  postsEl.innerHTML = '';
  if (postList.length === 0) {
    return;
  }
  const view = renderContainer('posts', i18next);
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
    button.textContent = i18next.t('posts.button');
    list.append(post);
  });
  postsEl.append(view);
};

const renderFeeds = (feedsEl, i18next, feedList) => {
  feedsEl.innerHTML = '';
  if (feedList.length === 0) {
    return;
  }
  const view = renderContainer('feeds', i18next);
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

const keepSeenPosts = (iDs) => {
  iDs.forEach((id) => {
    const seenPost = document.querySelector(`a[data-id="${id}"]`);
    seenPost.classList.remove('fw-bold');
    seenPost.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModalWindow = (modalEl, modalState) => {
  const title = modalEl.querySelector('#modal .modal-title');
  const body = modalEl.querySelector('#modal .modal-body');
  const readFullArticle = modalEl.querySelector('#modal a');
  title.textContent = modalState.title;
  body.textContent = modalState.description;
  readFullArticle.href = modalState.link;
};

export default (state, i18next, el) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.status':
      switch (value) {
        case 'success':
          renderSuccessForm(el.input, el.statusMessage, i18next, el.formButton);
          break;
        case 'inProcess':
          renderProcessForm(el.input, el.statusMessage, el.formButton);
          break;
        case 'error':
          renderErrorForm(el.input, el.statusMessage, i18next, state.form.error, el.formButton);
          break;
        default:
          throw new Error('Unexpected form status');
      }
      break;
    case 'rss.feeds':
      renderFeeds(el.feeds, i18next, value);
      break;
    case 'rss.posts':
      renderPosts(el.posts, i18next, value);
      keepSeenPosts(state.rss.seenPosts);
      break;
    case 'rss.seenPosts':
      keepSeenPosts(value);
      break;
    case 'modal':
      renderModalWindow(el.modal, value);
      break;
    default:
      break;
  }
});
