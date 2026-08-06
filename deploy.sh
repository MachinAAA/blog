#!/bin/bash
# ==========================================
# 个人博客一键部署
# 用法: bash deploy.sh
# ==========================================
set -e

BLOG_DIR="D:/project/web/blog"
NODE="C:/Users/Machin/.workbuddy/binaries/node/versions/22.22.2/node.exe"
EDGEONE="D:/project/web/blog/eo-cli/node_modules/edgeone/edgeone-bin/edgeone.js"
DEPLOY_DIR="D:/project/web/blog/_deploy"

echo "[1/3] 提交 Git 变更..."
cd "$BLOG_DIR"
git add data/ assets/ index.html report.html gallery.html gallery-view.html gallery/ .gitignore deploy.sh
if git diff --cached --quiet; then
  echo "  没有变更，跳过提交。"
else
  git commit -m "更新内容 $(date +%Y-%m-%d_%H:%M)"
fi

# GitHub 尝试推送（被墙则跳过）
echo "[2/3] 推送到 GitHub Pages..."
git push origin master 2>/dev/null && echo "  GitHub 推送成功" || echo "  GitHub 被墙，跳过（EdgeOne 会兜底）"

echo "[3/3] 部署到 EdgeOne Pages..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/assets/css" "$DEPLOY_DIR/assets/js" "$DEPLOY_DIR/data" "$DEPLOY_DIR/gallery/gallery1" "$DEPLOY_DIR/gallery/gallery2"
cp index.html report.html gallery.html gallery-view.html "$DEPLOY_DIR/"
cp assets/css/style.css "$DEPLOY_DIR/assets/css/"
cp assets/js/*.js "$DEPLOY_DIR/assets/js/"
cp data/*.js "$DEPLOY_DIR/data/"
"$NODE" "$EDGEONE" makers deploy "$DEPLOY_DIR" -n personal-blog
rm -rf "$DEPLOY_DIR"

echo ""
echo "✅ 部署完成！"
echo "   EdgeOne: https://personal-blog-hsqsy0l6.edgeone.cool?eo_token=26dc3a5009d6d47cd72b224f78c5904c&eo_time=1785980798"
echo "   GitHub:  https://chjzh.ccwu.cc（需要 VPN）"
