import { getSidebar } from "./theme/getSidebar";
import { withPwa } from "@vite-pwa/vitepress";
import { SearchPlugin } from "vitepress-plugin-search";
const { getTokenizer } = require(`kuromojin`)

const ignoreSidebar = ["node_modules", "README.md", "index.md", "crawler"];
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
          const POS_LIST = [`名詞`, `動詞`, `形容詞`] // 対象品詞
          const IGNORE_REGEX = /^[!-/:-@[-`{-~、-〜”’・]+$/
          const MIN_LENGTH = 2
          let allTokens = tokenizer.tokenize(str).filter(token => POS_LIST.includes(token.pos))
          .map(e => e.surface_form);
          return [...new Set(allTokens)]
          .filter(word => !IGNORE_REGEX.test(word))
          .filter(word => word.length >= MIN_LENGTH)
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
      sidebar: await getSidebar(ignoreSidebar),
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
