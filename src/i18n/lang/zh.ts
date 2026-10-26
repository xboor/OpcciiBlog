import type { UIStrings } from "../types";

export default {
  nav: {
    home: "首页",
    posts: "文章",
    tags: "标签",
    about: "关于",
    archives: "归档",
    search: "搜索",
    nav: "导航",
    langSwitch: "EN",
  },
  mirrorNotice: {
    text: "页面加载较慢？可以前往备用镜像站",
    link: "前往镜像站",
  },
  post: {
    publishedAt: "发布于",
    updatedAt: "更新于",
    sharePostIntro: "分享这篇文章：",
    sharePostOn: "分享到 {{platform}}",
    sharePostViaEmail: "通过邮件分享这篇文章",
    tagLabel: "标签",
    backToTop: "回到顶部",
    goBack: "返回",
    editPage: "编辑此页",
    previousPost: "上一篇",
    nextPost: "下一篇",
    toc: "目录",
  },
  pagination: {
    prev: "上一页",
    next: "下一页",
    page: "第",
  },
  home: {
    eyebrow: "OPCCII / 个人博客",
    headline: "把想法写下来，",
    headlineAccent: "让知识有迹可循。",
    intro:
      "记录技术、数学与生活。在这里，把零散的灵感整理成文字，也把探索的过程留给未来的自己。",
    startReading: "开始阅读",
    aboutSpace: "关于这个空间",
    spaceNote: "从一个问题开始，\n留下一点思考。",
    topics: "循着兴趣，继续探索",
    mirrorLink: "大陆镜像站",
    mirrorHint: "中国大陆用户推荐使用镜像站，访问更快",
    readPost: "阅读全文",
    writing: "文字与思考",
    socialLinks: "社交链接",
    featured: "精选",
    recentPosts: "最新文章",
    allPosts: "全部文章",
  },
  footer: {
    copyright: "版权所有",
    allRightsReserved: "保留所有权利。",
  },
  pages: {
    tagTitle: "标签",
    tagDesc: "该标签下的全部文章",

    tagsTitle: "标签",
    tagsDesc: "文章中出现的全部标签。",

    postsTitle: "文章",
    postsDesc: "我发布的全部文章。",

    archivesTitle: "归档",
    archivesDesc: "全部文章的归档。",

    searchTitle: "搜索",
    searchDesc: "搜索任意文章……",
  },
  a11y: {
    mainNavigation: "主导航",
    skipToContent: "跳到正文",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    toggleTheme: "切换主题",
    searchPlaceholder: "搜索文章……",
    noResults: "没有找到结果",
    goToPreviousPage: "上一页",
    goToNextPage: "下一页",
  },
  notFound: {
    title: "404 未找到",
    message: "页面不存在",
    goHome: "返回首页",
  },
} satisfies UIStrings;
