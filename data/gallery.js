/* ============================================================
   图库清单
   ------------------------------------------------------------
   在 gallery/gallery1/ 或 gallery/gallery2/ 目录下放置图片，
   命名为 1.jpg, 2.png, 3.webp, 4.gif ...（任意常见格式），
   然后更新 total 数字即可。系统会自动探测格式，无需指定 ext。
   ============================================================ */
window.GALLERY_CONFIG = {
  gallery1: {
    label: "1 号图库",
    password: "750102",
    total: 0, // ← 有多少张图片就填多少
    dir: "gallery/gallery1/"
  },
  gallery2: {
    label: "阿慧呀",
    password: "050308",
    total: 2,
    dir: "gallery/gallery2/"
  }
};
