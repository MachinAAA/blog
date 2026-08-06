/* ============================================================
   图库清单
   ------------------------------------------------------------
   在 gallery/gallery1/ 或 gallery/gallery2/ 目录下放置图片，
   命名为 1.webp, 2.webp, 3.webp ...（支持 jpg / png / webp），
   然后更新 total 数字和 ext 格式即可。网站会自动读取并展示。
   ============================================================ */
window.GALLERY_CONFIG = {
  gallery1: {
    label: "1 号图库",
    password: "750102",
    total: 0, // ← 图库 1 有多少张图片就填多少
    ext: "webp", // 图片格式：jpg / png / webp
    dir: "gallery/gallery1/"
  },
  gallery2: {
    label: "阿慧呀",
    password: "050308",
    total: 2, // ← 图库 2 有多少张图片就填多少
    ext: "jpg",
    dir: "gallery/gallery2/"
  }
};
