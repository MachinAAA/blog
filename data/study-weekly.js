/* ============================================================
   学习周报数据
   ------------------------------------------------------------
   字段与「科技周报 / 工作周报 / 股票周报」完全一致：
        id      : 唯一标识（建议用日期）
        date    : 显示用日期
        title   : 周报标题
        tags    : 标签数组，可空 []
        summary : 列表展开后显示的摘要
        content : 正文，支持轻量 Markdown
   新增方式：复制一个 {...} 对象粘贴到数组末尾，保存后刷新即可。
   ============================================================ */
window.STUDY_WEEKLY = [
  {
    id: "2026-08-08",
    date: "2026-08-08",
    title: "学习周报 #02 · Godot 4 引擎核心与 GDScript 实践",
    tags: ["Godot", "游戏开发", "GDScript"],
    summary:
      "通过 CarRoad 小游戏系统学习 Godot 4 引擎，掌握场景系统、三类物理节点、碰撞层与信号机制，熟练运用 Input.get_vector、move_and_slide、queue_free 等核心 API。",
    content: `## 本周学习内容

> 通过 CarRoad 小游戏系统学习 Godot 4 引擎，掌握场景系统、物理节点与 GDScript 核心 API。

## 一、节点与场景

- **场景即类**：每个 .tscn 文件是可复用组件，可独立运行、实例化、继承
- **三类物理节点**：CharacterBody2D（可碰撞移动）、Area2D（区域检测）、StaticBody2D（静态阻挡）
- **y_sort_enabled**：俯视角按 Y 坐标排序渲染，实现正确遮挡
- **CanvasLayer**：UI 层独立于游戏世界坐标，不受相机影响
- **Marker2D**：纯标记节点，用于定义生成点

## 二、核心 GDScript API

| 方法 / 函数 | 作用 |
|------|------|
| preload(path) | 类加载时预加载资源，避免运行时重复加载 |
| .instantiate() | 实例化 PackedScene，类似 new 一个对象 |
| Input.get_vector() | 一行获取四方向输入，返回单位向量 |
| move_and_slide() | CharacterBody2D 标准移动，自动处理碰撞 |
| .pick_random() | 数组随机取元素，替代 randi() % size |
| queue_free() | 安全销毁节点，帧结束后执行 |
| call_deferred() | 延迟到安全帧执行，物理回调中切场景必用 |
| $NodePath | get_node() 语法糖，路径快捷访问 |
| str() | 类型转字符串 |

## 三、碰撞层与信号

- **collision_layer / collision_mask**：用位掩码加法组合多层（1 加 4 加 8 等于 13）
- **信号机制**：观察者模式，编辑器静态绑定 + 代码 connect 动态绑定
- **Autoload 单例**：注册后全局访问，跨场景共享状态

## 四、代码实践

\`\`\`gdscript
extends CharacterBody2D

var speed: int = 150

func _physics_process(_delta: float) -> void:
    var direction = Input.get_vector('left', 'right', 'up', 'down')
    velocity = direction * speed
    move_and_slide()
\`\`\`

## 五、踩坑记录

| 问题 | 解决 |
|------|------|
| 物理回调中切换场景报错 | call_deferred 延迟到安全帧 |
| _process 手动移动抖动 | 乘 delta 保证帧率无关 |
| 大量车辆累积卡顿 | VisibleOnScreenNotifier2D 检测屏幕外自动清理 |

## 下周计划

- Godot 动画系统与 Tween 补间
- TileMap 瓦片地图
- 打包导出到各平台

## 学习资源

- Godot 官方文档（GDScript 基础）
- 节点与场景系统官方教程`,
  },
  {
    id: "2026-08-04",
    date: "2026-08-04",
    title: "学习周报 #01 · 数据结构与算法 · 二叉树专题",
    tags: ["数据结构", "算法", "二叉树"],
    summary:
      "本周集中学习了二叉树的遍历（前序/中序/后序/层序）、BST 的增删查、以及平衡二叉树（AVL）的旋转操作，结合 LeetCode 刷题巩固。",
    content: `## 本周学习内容

> 本周进入二叉树专题，这是面试中最高频的数据结构之一，也是很多复杂算法的基础。

## 一、二叉树基础

- **定义**：每个节点最多有两个子节点（左 / 右）的树形结构
- **满二叉树**：除叶子节点外每个节点都有两个子节点
- **完全二叉树**：除最后一层外每层都填满，最后一层从左到右填充
- **二叉搜索树（BST）**：左子树所有节点 < 根节点 < 右子树所有节点

## 二、遍历方式

| 遍历方式 | 顺序 | 应用场景 |
|------|------|------|
| **前序遍历** | 根 → 左 → 右 | 序列化、复制树 |
| **中序遍历** | 左 → 根 → 右 | BST 升序输出 |
| **后序遍历** | 左 → 右 → 根 | 删除树、表达式求值 |
| **层序遍历** | 按层从上到下 | BFS、最短路径 |

核心代码（递归版）：
\`\`\`
function inorder(root) {
  if (!root) return;
  inorder(root.left);
  console.log(root.val);
  inorder(root.right);
}
\`\`\`

## 三、LeetCode 刷题记录

1. **94. 二叉树的中序遍历**：递归 + 迭代（栈）两种解法都掌握了
2. **102. 二叉树的层序遍历**：BFS + 队列，注意每层节点数记录
3. **98. 验证二叉搜索树**：利用中序遍历递增特性，O(n)
4. **110. 平衡二叉树**：自底向上计算高度，提前剪枝

## 四、下周计划

- AVL 树旋转操作的代码实现
- 红黑树的基本概念（不要求手写，理解原理即可）
- 图论入门：BFS / DFS 在图中的应用

## 学习资源

- 《算法（第4版）》第 3 章
- LeetCode 二叉树标签题目
- visualgo.net 可视化理解`,
  },
  {
    id: "2026-07-28",
    date: "2026-07-28",
    title: "学习周报 #00 · React 18 并发特性",
    tags: ["React", "前端"],
    summary:
      "学习了 React 18 的并发渲染机制，包括 Suspense、useTransition、useDeferredValue 等新 API 的原理与实践。",
    content: `## 核心概念

- **并发渲染** 不等于并行执行，而是 React 可以在渲染过程中"暂停"，优先处理更高优先级的更新。
- 通过 \`createRoot\` 启用并发特性，替代旧版 \`ReactDOM.render\`。

## 关键 API

- **Suspense**：声明式加载状态，配合 \`React.lazy\` 做代码分割
- **useTransition**：将某些状态更新标记为低优先级，保持 UI 响应
- **useDeferredValue**：延迟更新非关键数据，类似防抖但更优雅

## 实践体会

> 并发模式的核心是"可中断渲染"。React 不再是一口气把整棵树算完，而是按时间片分批处理，这要求副作用（Effect）必须幂等。

下周继续深入 Server Components 与 Streaming SSR。`,
  },
];
