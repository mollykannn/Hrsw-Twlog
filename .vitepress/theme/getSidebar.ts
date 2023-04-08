import { globby } from "@cjs-exporter/globby";

const loopPath = (path, value, saveData) => {
  Object.keys(value).forEach((e) => {
    if (Object.keys(value[e]).length === 0) {
      saveData.items.push({
        text: e.replace(".md", ""),
        link: `${path}/${e}`,
      })
      return saveData;
    } else {
      path = `${path}/${e}`;
      saveData.items.push({
        text: e,
        items: []
      })
      return loopPath(path, value[e], saveData.items[saveData.items.length - 1])
    }
  });
  return saveData
};

export async function getSidebar(ignorePath) {
  let paths = await globby(["**.md"], {
    ignore: ignorePath,
  });
  let posts = [];
  const fileObject = {};
  let current;
  for (const path of paths) {
    current = fileObject;
    for (const segment of path.split("/")) {
      if (segment !== "") {
        if (!(segment in current)) {
          current[segment] = {};
        }
        current = current[segment];
      }
    }
  }
  Object.keys(fileObject).forEach((key) => {
    if (Object.keys(fileObject[key]).length === 0) {
      posts.push({ text: key, link: key });
    } else {
      posts.push(loopPath(key, fileObject[key], { text: key, items: [] }));
    }
  });
  return posts;
}
