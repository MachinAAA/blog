/* ============================================================
   详情页逻辑：根据 ?type= & ?id= 渲染对应周报完整内容
   ============================================================ */
(function () {
  "use strict";
  var C = window.BlogCore;

  document.addEventListener("DOMContentLoaded", function () {
    var type = C.getParam("type") || "tech";
    var id = C.getParam("id");
    var ds = C.getDataset(type);

    // 填充返回链接与标题归属
    var backLink = document.getElementById("backLink");
    if (backLink) backLink.href = "index.html#" + type;

    var item = id ? C.byId(ds.data, id) : null;

    if (!item) {
      document.getElementById("detailTitle").textContent = "未找到该内容";
      document.getElementById("detailContent").innerHTML =
        '<p>请检查链接中的 <code>type</code> 与 <code>id</code> 是否正确，' +
        '或回到 <a href="index.html">首页</a> 重新进入。</p>';
      document.title = "未找到内容 · 个人博客";
      return;
    }

    document.title = item.title + " · 个人博客";
    document.getElementById("detailTitle").textContent = item.title;

    var tags = (item.tags || []).map(function (t) {
      return '<span class="tag">' + C.escapeHtml(t) + "</span>";
    }).join("");

    document.getElementById("detailMeta").innerHTML =
      "<span>📅 " + C.escapeHtml(item.date || "") + "</span>" +
      "<span>📂 " + C.escapeHtml(ds.label) + "</span>";

    document.getElementById("detailTags").innerHTML = tags;
    document.getElementById("detailContent").innerHTML = C.mdToHtml(item.content || item.summary || "");

    // 相邻条目导航（上一篇/下一篇）
    var sorted = ds.data.slice().sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
    var pos = sorted.map(function (x) { return String(x.id); }).indexOf(String(item.id));
    if (pos > -1) {
      var nav = document.getElementById("detailNav");
      var prev = sorted[pos + 1]; // 更旧
      var next = sorted[pos - 1]; // 更新
      var html = "";
      if (next) html += '<a class="btn ghost" href="report.html?type=' + type + "&id=" + encodeURIComponent(next.id) + '">← 更新的</a>';
      if (prev) html += '<a class="btn ghost" href="report.html?type=' + type + "&id=" + encodeURIComponent(prev.id) + '">更早的 →</a>';
      if (html) nav.innerHTML = html;
    }
  });
})();
