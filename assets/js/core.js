/* ============================================================
   共享逻辑：轻量 Markdown 渲染 + 小工具
   首页与详情页都会用到，保持内容格式统一。
   ============================================================ */
(function () {
  "use strict";

  // 转义 HTML，防止内容里的 < > & 破坏页面
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // 行内格式：**粗体** *斜体* `代码` [文本](链接)
  function inlineMd(text) {
    var s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // A 股习惯：上涨红、下跌绿
    s = s.replace(/↑/g, '<span class="up">↑</span>');
    s = s.replace(/↓/g, '<span class="down">↓</span>');
    return s;
  }

  // 轻量 Markdown -> HTML（支持标题/列表/引用/代码块/段落）
  function mdToHtml(md) {
    var src = (md || "").replace(/\r\n/g, "\n").trim();
    if (!src) return "";
    var lines = src.split("\n");
    var html = [];
    var i = 0;
    var listType = null; // "ul" | "ol"

    function closeList() {
      if (listType) {
        html.push("</" + listType + ">");
        listType = null;
      }
    }

    while (i < lines.length) {
      var line = lines[i];

      // 围栏代码块 ```
      if (/^```/.test(line)) {
        closeList();
        var code = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) {
          code.push(lines[i]);
          i++;
        }
        i++; // 跳过结束 ```
        html.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
        continue;
      }

      // 标题
      var h = line.match(/^(#{1,3})\s+(.*)$/);
      if (h) {
        closeList();
        var lvl = h[1].length;
        html.push("<h" + lvl + ">" + inlineMd(h[2]) + "</h" + lvl + ">");
        i++;
        continue;
      }

      // 引用
      if (/^>\s?/.test(line)) {
        closeList();
        html.push("<blockquote>" + inlineMd(line.replace(/^>\s?/, "")) + "</blockquote>");
        i++;
        continue;
      }

      // 无序列表
      var ul = line.match(/^[-*]\s+(.*)$/);
      if (ul) {
        if (listType !== "ul") {
          closeList();
          html.push("<ul>");
          listType = "ul";
        }
        html.push("<li>" + inlineMd(ul[1]) + "</li>");
        i++;
        continue;
      }

      // 有序列表
      var ol = line.match(/^\d+\.\s+(.*)$/);
      if (ol) {
        if (listType !== "ol") {
          closeList();
          html.push("<ol>");
          listType = "ol";
        }
        html.push("<li>" + inlineMd(ol[1]) + "</li>");
        i++;
        continue;
      }

      // Markdown 表格（连续的行都以 | 开头）
      if (/^\|.+\|/.test(line)) {
        closeList();
        var tableLines = [];
        while (i < lines.length && /^\|.+\|/.test(lines[i])) {
          tableLines.push(lines[i]);
          i++;
        }
        // 至少需要表头 + 分隔行 + 一行数据
        if (tableLines.length >= 3) {
          var rows = tableLines.map(function (r) {
            return r.replace(/^\||\|$/g, "").split("|").map(function (c) { return c.trim(); });
          });
          var headerRow = rows[0];       // 表头
          var sepRow    = rows[1];       // 分隔行（如 :---:）
          var dataRows  = rows.slice(2); // 数据行

          html.push("<table><thead><tr>");
          headerRow.forEach(function (cell) {
            html.push("<th>" + inlineMd(cell) + "</th>");
          });
          html.push("</tr></thead><tbody>");
          dataRows.forEach(function (row) {
            html.push("<tr>");
            row.forEach(function (cell, ci) {
              html.push("<td>" + inlineMd(cell) + "</td>");
            });
            html.push("</tr>");
          });
          html.push("</tbody></table>");
        } else {
          // 不够 3 行，当成普通段落兜底
          html.push("<p>" + inlineMd(tableLines.join(" ")) + "</p>");
        }
        continue;
      }

      // 空行
      if (line.trim() === "") {
        closeList();
        i++;
        continue;
      }

      // 普通段落（合并连续非空行）
      closeList();
      var para = [line];
      i++;
      while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,3}\s|>\s?|[-*]\s|\d+\.\s|```)/.test(lines[i])) {
        para.push(lines[i]);
        i++;
      }
      html.push("<p>" + inlineMd(para.join(" ")) + "</p>");
    }
    closeList();
    return html.join("\n");
  }

  // 取 URL 查询参数
  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // 根据 type 返回对应的数据集与中文名
  function getDataset(type) {
    if (type === "work")  return { data: window.WORK_WEEKLY  || [], label: "个人工作周报" };
    if (type === "stock") return { data: window.STOCK_WEEKLY  || [], label: "股票周报" };
    if (type === "study") return { data: window.STUDY_WEEKLY  || [], label: "学习周报" };
    return { data: window.TECH_WEEKLY || [], label: "科技周报" }; // 默认 tech
  }

  function byId(list, id) {
    return list.filter(function (x) { return String(x.id) === String(id); })[0];
  }

  window.BlogCore = {
    escapeHtml: escapeHtml,
    inlineMd: inlineMd,
    mdToHtml: mdToHtml,
    getParam: getParam,
    getDataset: getDataset,
    byId: byId,
  };
})();

/* ============================================================
   粒子背景
   在所有页面中自动运行（需要 <canvas id="particles"> 标签）
   ============================================================ */
(function () {
  "use strict";
  var canvas = document.getElementById("particles");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var particles = [];
  var PARTICLE_COUNT = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r = Math.random() * 1.8 + 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
  }
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -20) this.x = canvas.width + 20;
    if (this.x > canvas.width + 20) this.x = -20;
    if (this.y < -20) this.y = canvas.height + 20;
    if (this.y > canvas.height + 20) this.y = -20;
  };
  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(99,102,241," + this.opacity + ")";
    ctx.fill();
  };

  for (var i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // 鼠标连线
  var mx = 0, my = 0;
  window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });

  function connect(p1, p2, maxDist) {
    var dx = p1.x - p2.x, dy = p1.y - p2.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < maxDist) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = "rgba(99,102,241," + (0.08 * (1 - dist / maxDist)) + ")";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  function drawMouseLine(p, maxDist) {
    var dx = mx - p.x, dy = my - p.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < maxDist) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(mx, my);
      ctx.strokeStyle = "rgba(6,182,212," + (0.12 * (1 - dist / maxDist)) + ")";
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      drawMouseLine(particles[i], 180);
      for (var j = i + 1; j < particles.length; j++) {
        connect(particles[i], particles[j], 120);
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();
