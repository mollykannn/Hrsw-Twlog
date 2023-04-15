import { getSidebar } from "./theme/getSidebar";
import { withPwa } from "@vite-pwa/vitepress";
import { SearchPlugin } from "vitepress-plugin-search";
const { getTokenizer } = require(`kuromojin`)

const config = async () => {
  const tokenizer = await getTokenizer().then(tokenizer => tokenizer);
  return withPwa({
    title: "Hrsw@Twlog",
    description: "Hrsw@Twlog",
    base: "/Hrsw-Twlog",
    srcExclude: ['README.md'],
    vite: {
      plugins: [SearchPlugin({
        encode: function (str) {
          if (!str) return [];
          str = str.replaceAll('---', '');
          const POS_LIST = [`名詞`, `動詞`, `形容詞`] // post_list
          const POS_DETAIL = [`サ変接続`, `数`, `空白`] // pos_detail_1
          const MIN_LENGTH = 2
          let allTokens = tokenizer.tokenize(str).filter(token => POS_LIST.includes(token.pos) && !POS_DETAIL.includes(token.pos_detail_1)).map(e => e.surface_form);
          return [...new Set(allTokens)].filter(word => word.length >= MIN_LENGTH)
        },
        tokenize: "forward",
        previewLength: 62,
        buttonLabel: "Search",
        placeholder: "Search docs",
      })],
    },
    head: [
      [
        'link',
        { rel: 'icon', href: '/Hrsw-Twlog/icons/favicon.ico' },
      ],
      [
        'meta',
        { name: 'theme-color', content: '#000000' },
      ],
    ],
    themeConfig: {
      nav: [{ text: "Home", link: "/" }],
      sidebar: await getSidebar(),
      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/mollykannn/Hrsw-Twlog",
        },
      ],
    },
    pwa: {
      base: "/Hrsw-Twlog/",
      outDir: ".vitepress/dist",
      registerType: "autoUpdate",
      selfDestroying: true,
      includeAssets: ["robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Hrsw@Twlog",
        short_name: "Hrsw@Twlog",
        description: "Hrsw@Twlog",
        theme_color: "#0079d2",
        start_url: "./index.html",
        lang: "zh-Hant-HK",
        dir: "ltr",
        orientation: "portrait",
        icons: [
          {
            src: "icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/android-chrome-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/android-chrome-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    },
  });
};

export default config();
