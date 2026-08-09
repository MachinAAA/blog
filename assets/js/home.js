/* ============================================================
   首页逻辑：渲染周报网格卡片 + 项目网格
   v3 — 卡片直接展示摘要，点击跳转详情
   ============================================================ */
(function () {
  "use strict";
  var C = window.BlogCore;

  // 渐变预设列表，给不同卡片不同顶部色条
  var GRADIENTS = ["gradient-1","gradient-2","gradient-3","gradient-4","gradient-5"];

  // 渲染单个周报卡片
  function renderCard(item, type, idx) {
    var card = document.createElement("article");
    card.className = "report-card";
    card.setAttribute("data-id", item.id);

    var tagsHtml = (item.tags || []).map(function (t) {
      return '<span class="tag">' + C.escapeHtml(t) + "</span>";
    }).join("");

    card.innerHTML =
      '<a href="report.html?type=' + type + "&id=" + encodeURIComponent(item.id) + '" style="color:inherit;text-decoration:none;display:block">' +
        '<div class="card-accent"></div>' +
        '<div class="card-body">' +
          '<h3 class="rh-title">' + C.escapeHtml(item.title) + "</h3>" +
          '<div class="rh-meta">' + tagsHtml + "</div>" +
          '<p class="summary">' + C.escapeHtml(item.summary || "") + "</p>" +
        "</div>" +
        '<div class="card-footer">' +
          '<span class="date">' + C.escapeHtml(item.date || "") + "</span>" +
          '<span class="arrow">→</span>' +
        "</div>" +
      "</a>";

    return card;
  }

  function renderGrid(containerId, type) {
    var box = document.getElementById(containerId);
    if (!box) return;
    var ds = C.getDataset(type);
    var list = ds.data;
    if (!list.length) {
      box.innerHTML = '<div class="empty">// 暂无内容，去 data/' +
        (type === "work" ? "work-weekly" : (type === "stock" ? "stock-weekly" : (type === "study" ? "study-weekly" : "tech-weekly"))) + '.js 添加第一条吧</div>';
      return;
    }
    // 按日期倒序排序
    var sorted = list.slice().sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    });

    // 最新一期直接渲染
    box.appendChild(renderCard(sorted[0], type, 0));

    if (sorted.length > 1) {
      // 折叠区域：剩余周报打包
      var fold = document.createElement("div");
      fold.className = "report-fold";
      for (var i = 1; i < sorted.length; i++) {
        fold.appendChild(renderCard(sorted[i], type, i));
      }
      box.appendChild(fold);

      // 折叠按钮
      var toggle = document.createElement("button");
      toggle.className = "report-toggle";
      toggle.setAttribute("type", "button");
      toggle.innerHTML = '<span class="toggle-icon">▼</span><span>展开全部 ' + (sorted.length - 1) + ' 期历史周报</span>';
      toggle.addEventListener("click", function () {
        var isOpen = box.classList.toggle("all-shown");
        if (isOpen) {
          toggle.innerHTML = '<span class="toggle-icon">▲</span><span>收起历史周报</span>';
        } else {
          toggle.innerHTML = '<span class="toggle-icon">▼</span><span>展开全部 ' + (sorted.length - 1) + ' 期历史周报</span>';
          // 滚动到最新卡片位置
          fold.previousElementSibling.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      box.appendChild(toggle);
    }
  }

  function renderProjects() {
    var grid = document.getElementById("projects-grid");
    if (!grid) return;
    var list = window.PROJECTS || [];
    if (!list.length) {
      grid.innerHTML = '<div class="empty">// 暂无项目，去 data/projects.js 添加</div>';
      return;
    }
    list.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "project-card";
      var stack = (p.stack || []).map(function (s) {
        return '<span class="tag">' + C.escapeHtml(s) + "</span>";
      }).join("");
      var prog = Math.max(0, Math.min(100, Number(p.progress) || 0));
      card.innerHTML =
        '<div class="p-top">' +
          "<h3>" + C.escapeHtml(p.name || "") + "</h3>" +
          '<span class="p-status">' + C.escapeHtml(p.status || "") + "</span>" +
        "</div>" +
        '<p class="p-desc">' + C.escapeHtml(p.desc || "") + "</p>" +
        '<div class="p-progress">' +
          '<div class="bar"><div class="fill" style="width:' + prog + '%"></div></div>' +
          '<div class="label"><span>进度</span><span>' + prog + "%</span></div>" +
        "</div>" +
        '<div class="p-stack">' + stack + "</div>";
      grid.appendChild(card);
    });
  }

  function initNav() {
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
      });
      links.addEventListener("click", function (e) {
        if (e.target.tagName === "A") links.classList.remove("open");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderGrid("tech-grid", "tech");
    renderGrid("work-grid", "work");
    renderGrid("study-grid", "study");
    renderGrid("stock-grid", "stock");
    renderProjects();
    initNav();

    // 计数
    var counts = { tech: "tech-count", work: "work-count", study: "study-count", stock: "stock-count" };
    Object.keys(counts).forEach(function (k) {
      var el = document.getElementById(counts[k]);
      if (el) el.textContent = (C.getDataset(k).data || []).length + " 篇";
    });
    var pc = document.getElementById("projects-count");
    if (pc) pc.textContent = (window.PROJECTS || []).length + " 个";

    // 关于我 - 统计
    renderAbout();
    // 打字机效果
    var twEl = document.getElementById("tw-text");
    if (twEl && window.typewriter) {
      window.typewriter(twEl, [
        "专注于 AI、前端工程与金融量化。",
        "用代码记录思考，用周报沉淀成长。",
        "保持简洁，保持清晰。",
        "永远在学习的路上。"
      ], 100, 2500);
    }
  });

  function renderAbout() {
    var box = document.getElementById("about-stats");
    if (!box) return;
    var allTypes = ["tech", "work", "study", "stock"];
    var totalArticles = 0;
    var allTags = {};
    allTypes.forEach(function (t) {
      var ds = C.getDataset(t);
      totalArticles += ds.data.length;
      ds.data.forEach(function (item) {
        (item.tags || []).forEach(function (tag) {
          allTags[tag] = (allTags[tag] || 0) + 1;
        });
      });
    });
    var topTags = Object.keys(allTags)
      .sort(function (a, b) { return allTags[b] - allTags[a]; })
      .slice(0, 8);
    var sections = allTypes.length;
    var projects = (window.PROJECTS || []).length;

    box.innerHTML =
      '<div class="stat-card">' +
        '<span class="stat-num">' + totalArticles + '</span>' +
        '<span class="stat-label">篇文章</span>' +
      '</div>' +
      '<div class="stat-card">' +
        '<span class="stat-num">' + sections + '</span>' +
        '<span class="stat-label">个板块</span>' +
      '</div>' +
      '<div class="stat-card">' +
        '<span class="stat-num">' + projects + '</span>' +
        '<span class="stat-label">个项目</span>' +
      '</div>' +
      '<div class="stat-card">' +
        '<span class="stat-num">' + Object.keys(allTags).length + '</span>' +
        '<span class="stat-label">个标签</span>' +
      '</div>';

    // 热门标签
    var tagWall = document.getElementById("tag-wall");
    if (tagWall && topTags.length) {
      tagWall.innerHTML = topTags.map(function (t) {
        return '<span class="tag tag-lg">' + C.escapeHtml(t) + '</span>';
      }).join("");
    }
  }
})();
