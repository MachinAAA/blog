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
  var PARTICLE_COUNT = 80;

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
    ctx.fillStyle = "rgba(99,102,241," + (this.opacity * 0.6) + ")";
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
      ctx.strokeStyle = "rgba(99,102,241," + (0.06 * (1 - dist / maxDist)) + ")";
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
      ctx.strokeStyle = "rgba(14,165,233," + (0.1 * (1 - dist / maxDist)) + ")";
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

/* ============================================================
   风格切换：默认玻璃态 ↔ 新粗野主义
   ============================================================ */
(function () {
  "use strict";
  var toggleBtn = document.getElementById("styleToggle");
  if (!toggleBtn) return;
  var STYLE_KEY = "blog_style";

  // 读取持久化偏好
  if (localStorage.getItem(STYLE_KEY) === "neo") {
    document.body.classList.add("neo-brutalist");
  }

  toggleBtn.addEventListener("click", function () {
    var neo = document.body.classList.toggle("neo-brutalist");
    localStorage.setItem(STYLE_KEY, neo ? "neo" : "glass");
  });
})();

/* ============================================================
   滚动进度条
   ============================================================ */
(function () {
  "use strict";
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.innerHTML = '<div class="scroll-progress-fill"></div>';
  document.body.appendChild(bar);
  var fill = bar.firstChild;
  window.addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0;
    fill.style.width = pct + "%";
  });
})();

/* ============================================================
   回到顶部按钮
   ============================================================ */
(function () {
  "use strict";
  var btn = document.createElement("button");
  btn.className = "back-top";
  btn.innerHTML = "↑";
  btn.title = "回到顶部";
  btn.setAttribute("aria-label", "回到顶部");
  document.body.appendChild(btn);
  window.addEventListener("scroll", function () {
    btn.classList.toggle("visible", window.scrollY > 400);
  });
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ============================================================
   打字机效果
   ============================================================ */
window.typewriter = function (el, texts, speed, pause) {
  speed = speed || 120;
  pause = pause || 2000;
  var ti = 0, ci = 0, forward = true;
  function tick() {
    if (!el) return;
    var t = texts[ti % texts.length];
    if (forward) {
      el.textContent = t.slice(0, ci + 1);
      ci++;
      if (ci >= t.length) { forward = false; setTimeout(tick, pause); return; }
      setTimeout(tick, speed);
    } else {
      el.textContent = t.slice(0, ci);
      ci--;
      if (ci < 0) { forward = true; ti++; setTimeout(tick, speed * 3); return; }
      setTimeout(tick, speed / 3);
    }
  }
  tick();
};

/* ============================================================
   PC 侧边浮动装饰 — 彩色几何体跟随鼠标和滚动
   ============================================================ */
(function () {
  "use strict";
  if (window.innerWidth < 900) return;
  var container = document.createElement("div");
  container.className = "side-decorations";
  document.body.appendChild(container);

  var shapes = [
    { type: "circle", color: "#6366f1", size: 60, x: 4, y: 15, speed: 0.3 },
    { type: "square", color: "#a855f7", size: 40, x: 2, y: 35, speed: 0.5, rotate: 15 },
    { type: "circle", color: "#0ea5e9", size: 50, x: 96, y: 20, speed: 0.4 },
    { type: "square", color: "#f472b6", size: 35, x: 94, y: 50, speed: 0.6, rotate: 25 },
    { type: "circle", color: "#6366f1", size: 45, x: 3, y: 65, speed: 0.35 },
    { type: "square", color: "#22d3ee", size: 55, x: 95, y: 75, speed: 0.45, rotate: -10 },
    { type: "circle", color: "#a855f7", size: 38, x: 96, y: 42, speed: 0.5 },
    { type: "square", color: "#f472b6", size: 48, x: 4, y: 88, speed: 0.55, rotate: 20 },
  ];

  shapes.forEach(function (s) {
    var el = document.createElement("div");
    el.className = "side-shape side-shape-" + s.type;
    el.style.cssText =
      "left:" + s.x + "%;top:" + s.y + "%;width:" + s.size + "px;height:" + s.size + "px;" +
      "background:" + s.color + ";opacity:0.12;" +
      (s.rotate ? "transform:rotate(" + s.rotate + "deg);" : "");
    el.setAttribute("data-speed", s.speed);
    if (s.type === "circle") el.style.borderRadius = "50%";
    container.appendChild(el);
  });

  var mx = window.innerWidth/2, my = window.innerHeight/2;
  window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });

  function parallax() {
    var sy = window.scrollY;
    var els = container.children;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var speed = parseFloat(el.getAttribute("data-speed"));
      var baseX = parseFloat(el.style.left);
      var baseY = parseFloat(el.style.top);
      var ox = (mx - window.innerWidth/2) * speed * 0.02;
      var oy = (my - window.innerHeight/2) * speed * 0.02 + sy * speed * 0.03;
      el.style.transform = "translate(" + ox + "px," + oy + "px)";
    }
    requestAnimationFrame(parallax);
  }
  requestAnimationFrame(parallax);
})();
