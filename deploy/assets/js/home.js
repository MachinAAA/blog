/* ============================================================
   首页逻辑：渲染周报列表（可展开/再点跳转）与项目网格
   ============================================================ */
(function () {
  "use strict";
  var C = window.BlogCore;

  // 渲染单个周报卡片
  function renderCard(item, type, idx) {
    var card = document.createElement("article");
    card.className = "report-card";
    card.setAttribute("data-id", item.id);

    var tagsHtml = (item.tags || []).map(function (t) {
      return '<span class="tag">' + C.escapeHtml(t) + "</span>";
    }).join("");

    card.innerHTML =
      '<div class="report-head">' +
        '<div class="rh-main">' +
          '<h3 class="rh-title">' + C.escapeHtml(item.title) + "</h3>" +
          '<div class="rh-meta">' +
            "<span>📅 " + C.escapeHtml(item.date || "") + "</span>" +
            tagsHtml +
          "</div>" +
        "</div>" +
        '<div class="chevron" aria-hidden="true">▾</div>' +
      "</div>" +
      '<div class="report-body">' +
        '<p class="summary">' + C.escapeHtml(item.summary || "") + "</p>" +
        '<div class="actions">' +
          '<a class="btn primary" href="report.html?type=' + type + "&id=" + encodeURIComponent(item.id) + '">查看完整详情 →</a>' +
          '<button class="btn ghost" type="button" data-act="collapse">收起</button>' +
        "</div>" +
      "</div>";

    // 交互：首次点击展开；已展开时再次点击跳转到独立详情页
    card.querySelector(".report-head").addEventListener("click", function () {
      if (!card.classList.contains("expanded")) {
        card.classList.add("expanded");
      } else {
        window.location.href = "report.html?type=" + type + "&id=" + encodeURIComponent(item.id);
      }
    });
    card.querySelector('[data-act="collapse"]').addEventListener("click", function (e) {
      e.stopPropagation();
      card.classList.remove("expanded");
    });

    return card;
  }

  function renderList(containerId, type) {
    var box = document.getElementById(containerId);
    if (!box) return;
    var ds = C.getDataset(type);
    var list = ds.data;
    if (!list.length) {
      box.innerHTML = '<div class="empty">// 暂无内容，去 data/' +
        (type === "work" ? "work-weekly" : (type === "stock" ? "stock-weekly" : (type === "study" ? "study-weekly" : "tech-weekly"))) + '.js 添加第一条吧</div>';
      return;
    }
    // 按日期倒序（新的在前）
    list.slice().sort(function (a, b) {
      return String(b.date || "").localeCompare(String(a.date || ""));
    }).forEach(function (item, i) {
      box.appendChild(renderCard(item, type, i));
    });
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
    renderList("tech-list", "tech");
    renderList("work-list", "work");
    renderList("study-list", "study");
    renderList("stock-list", "stock");
    renderProjects();
    initNav();
    // 更新计数
    var counts = { tech: "tech-count", work: "work-count", study: "study-count", stock: "stock-count" };
    Object.keys(counts).forEach(function (k) {
      var el = document.getElementById(counts[k]);
      if (el) el.textContent = (C.getDataset(k).data || []).length + " 篇";
    });
    var projectsCount = document.getElementById("projects-count");
    if (projectsCount) projectsCount.textContent = (window.PROJECTS || []).length + " 个";
    // 板块折叠/展开
    document.querySelectorAll(".section-head").forEach(function (head) {
      head.addEventListener("click", function () {
        var section = head.closest(".section");
        if (section) section.classList.toggle("open");
      });
    });
  });
})();
