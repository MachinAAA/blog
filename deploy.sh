#!/bin/bash
# ==========================================
# 个人博客一键部署到 GitHub Pages
# 用法: bash deploy.sh
# ==========================================
set -e
cd "D:/project/web/blog"

echo "[1/2] 提交变更..."
git add data/ assets/ index.html report.html gallery.html gallery-view.html gallery/ .gitignore
if git diff --cached --quiet; then
  echo "  没有变更，跳过提交。"
else
  git commit -m "更新内容 $(date +%Y-%m-%d_%H:%M)"
fi

echo "[2/2] 推送到 GitHub..."
git push https-origin master 2>/dev/null || git push ssh-origin master

echo ""
echo "✅ 部署完成！1-2 分钟后刷新："
echo "   https://chjzh.ccwu.cc"
echo "   https://machinaaa.github.io/blog/"
