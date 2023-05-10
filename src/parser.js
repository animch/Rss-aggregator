const getValueAtribute = (data) => {
  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const link = data.querySelector('link').textContent;
  return {
    title, description, link,
  };
};

const parseRss = (content) => {
  const parse = new DOMParser();
  const parsedData = parse.parseFromString(content, 'text/xml');
  const errorNode = parsedData.querySelector('parsererror');
  if (errorNode) {
    throw new Error('parseError');
  } else {
    const feed = getValueAtribute(parsedData);
    const postElems = [...parsedData.querySelectorAll('item')];
    const posts = postElems.map((post) => getValueAtribute(post));
    return { feed, posts };
  }
};

export default parseRss;
