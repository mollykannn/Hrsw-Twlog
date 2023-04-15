import { globby } from "@cjs-exporter/globby";
const ignoreSidebar = ["node_modules", "README.md", "index.md", "crawler"];

interface SideBar {
  text: String
  link?: String
  items?: SideBar[]
}

const loopPath = (path, value, saveData):SideBar => {
  Object.keys(value).forEach((e) => {
    if (Object.keys(value[e]).length === 0) {
      saveData.items.push({
        text: e.replace(".md", ""),
        link: `/${path}/${e}`,
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

export async function getSidebar() {
  let paths = await globby(["**.md"], {
    ignore: ignoreSidebar,
  });
  let posts:SideBar[] = [];
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
  // Reverse twitter post
  posts = posts.map(e => {
    if (e.text === 'Twitter') {
      e.items = e.items?.reverse();
    }
    return e
  })
  return posts;
}
