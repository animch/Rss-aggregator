const getValueAtribute = (data) => {
  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const link = data.querySelector('link').textContent;
  return {
    title, description, link,
  };
};

const parseRss = (content) => {
  try {
    const parse = new DOMParser();
    const parsedData = parse.parseFromString(content, 'text/xml');
    const feed = getValueAtribute(parsedData);
    const postElems = [...parsedData.querySelectorAll('item')];
    const posts = postElems.map((post) => getValueAtribute(post));
    return { feed, posts };
  } catch {
    const parseError = document.querySelector('parsererror');
    throw new Error(parseError.textContent);
  }
};

export default parseRss;
