/* ============================================================
   图库清单
   ------------------------------------------------------------
   在 gallery/gallery1/ 或 gallery/gallery2/ 目录下放置图片，
   命名为 001.webp, 002.webp, 003.webp ...（推荐 WebP），
   然后更新下方 TOTAL 数字即可。网站会自动读取并展示。
   ============================================================ */
window.GALLERY_CONFIG = {
  gallery1: {
    label: "1 号图库",
    password: "750102",
    total: 0, // ← 图库 1 有多少张图片就填多少
    dir: "gallery/gallery1/"
  },
  gallery2: {
    label: "阿慧呀",
    password: "050308",
    total: 2, // ← 图库 2 有多少张图片就填多少
    dir: "gallery/gallery2/"
  }
};
