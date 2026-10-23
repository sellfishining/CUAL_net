# CUAL / 飞行日志

CUAL（CAUC Unmanned Aerial Lab，中国民航大学无人飞行器实验室）官网 **cual.neocities.org 的线上源码**（第十五版起已替换原多页站，本目录即线上内容）。

- 线上地址 https://cual.neocities.org/ ，自定义域名 https://cual.neotics.org 。
- 单页站点，无构建步骤、无外部 CDN、无追踪脚本；图片与字体均走本地/系统字体。
- 内容在 `assets/js/data.js` / `crew.js` 两个数据文件里（原 `config.js` / `members.js` 已迁移过来）。
- NAS 归档：`共享文件夹/CUAL/CUAL-neocities官网网站与维护/网站第N版--YYYY.MM.DD/`（`更新说明.txt` + `cual-site/`）。

## 预览

直接双击 `index.html` 即可打开。若浏览器限制本地文件，可在本目录起一个静态服务器：

```powershell
# Node
npx serve .
# 或 Python
python -m http.server 8788
```

然后访问 `http://localhost:8788/`。

## 结构

```
cual-flightlog/
├─ index.html              # 页面骨架与无障碍标记
├─ assets/
│  ├─ css/main.css         # 设计系统、版式、动效、响应式
│  ├─ js/data.js           # 站点内容（window.CUAL_CONFIG）
│  ├─ js/crew.js           # 44 名成员（window.CUAL_MEMBERS）
│  ├─ js/app.js            # 全部渲染与交互
│  ├─ js/sim-model.js      # 影像页真机 3D 渲染器（WebGL，零依赖）
│  ├─ models/              # 真机模型数据 m0-2.glb（CUALMDL1 分片混淆）+ 海报 airframe-poster.jpg
│  ├─ images/              # 43 张本地图片：通用/项目/飞机/合照/赛场风采/一些日常/赞助/生成
│  └─ tools/gen-plate.cjs  # 程序化生成半调海报（开发用，不进页面）
└─ README.md
```

## 版块

| 编号 | 版块 | 内容 |
| --- | --- | --- |
| 00 | 首屏 | FLIGHT LOG 2023—2026、航线图、任务索引、滚动 ticker |
| 01 | 概况 | 4 项统计、实验室简介、使命 / 愿景 |
| 02 | 项目 | 4 个竞赛项目手风琴 + 3 个未来方向 |
| 03 | 历程 | 2023—2026 四段航程 |
| 04 | 战绩 | 26 项国家级奖项总览、按年份筛选的完整获奖记录 |
| 05 | 成员 | 指导老师、创始人、44 人名单，按项目 / 部门筛选 |
| 06 | 影像 | 生成海报、可旋转的 26-1 号机真机 3D 模型、飞行器 / 赛场 / 合影 / 日常 四条横向照片带（30 张）+ 灯箱 |
| 07 | 加入 | 招新介绍、5 个方向、流程、理由、FAQ |
| 08 | 联系 | 邮箱、地址、学院、社团、地图、招新群二维码 |
| — | 页脚 | 站点导航、赞助商、版权说明 |

## 交互

- 首屏航线描边动画、飞行器轨迹点随滚动移动、底部成绩 ticker。
- 首屏背景是一层原生 WebGL 片元着色器：12 级主等高线 + 40 级细等高线，鼠标附近只有很轻的涟漪（振幅 .0045），沿航线缓慢漂移；不依赖 three.js。
- 首屏字符入场：CUAL 四字母与中文逐字从裁切线下方升起（`clip-path` + translateY，错峰 35–75ms），眉题、正文、按钮、任务卡依次淡入；`prefers-reduced-motion` 下直接显示终态。
- 影像区第一块是程序生成的双色半调海报（`assets/images/生成/gen-plate-01.jpg`）：读取试飞照片明度，按 10px 网格重排网点，再叠国际橙。
- 影像区第二块是 26-1 号机真机 3D 模型（`assets/js/sim-model.js`，自写 WebGL、不引 three.js）：拖动旋转、滚轮缩放、双击 / `Esc` 复位，空闲缓慢自转，HUD 显示零件数与三角面数；进入视野才懒加载，失败回落静态海报。
- 3D 模型下方不再有独立的 WebGL 地面层（旧的 `#simFloor` / `initSimFloor()` 已随线框机架一起下线，代码保留但不再执行）。
- 滚动渐显、数字滚动计数、年份幽灵字、高度尺 / 当前章节进度。
- 项目手风琴：一次只展开一个。
- 战绩按年份筛选；成员按项目 + 部门组合筛选，并实时更新人数。
- 影像四条轨道可鼠标拖拽 / 触控横滑，点击任意照片打开灯箱（← → 切换，Esc 关闭）。
- 招新 FAQ 折叠。
- 顶栏 `GRID`（或按 `G`）切换 12 栏网格叠加；移动端 `INDEX` 打开全屏目录。
- 自定义光标环（精确指针设备）、系统时间（Asia/Shanghai）、回到首屏的 `00` 目录项。
- `prefers-reduced-motion: reduce` 下关闭动效、着色器只画一帧、3D 模型停止自转，数字直接置为最终值。

## 生成与着色器

- 着色器源码在 `assets/js/app.js` 的 `initHeroShader()`：全屏三角形 + 片元着色器，DPR 上限 1.25；不可用/无 WebGL 时直接跳过，不影响内容。
- 历程区与联系区复用 `initSectionShader()`：`storyShader` 为风场等高线，`contactShader` 为呼吸点阵；同样单帧回退、IntersectionObserver 离屏暂停。
- 真机 3D 在 `assets/js/sim-model.js`：自写 WebGL 渲染器（零依赖），数据是 `assets/models/m0-2.glb`（自定义包 CUALMDL1 → gzip → 三等分 xorshift32 混淆），运行时 fetch → 逐片 XOR → 拼接 → `DecompressionStream('gzip')` 解压 → 解析顶点与索引；`app.js` 的 `initSim()` / `initSimFloor()` 已早退不再接管。
- 模型流水线（维护机 `C:\Users\lenovo\.dsh\dsh_orb\cad-export\`）：SolidWorks COM 逐件导出 STL → `merge_parts.py quad 0.5` 减面合并 → `pack_model.py` 打包混淆。换模型后必须同步 `sim-model.js` 顶部的 `GZ_BYTES` 与 `CHUNKS` 尺寸。
- 海报由 `tools/gen-plate.cjs` 生成：需要本机 Edge + `playwright-core`，在 `cual-flightlog` 起 8788 静态服务后运行 `node tools/gen-plate.cjs`。脚本输出 1200×1600 原图；页面实际用的是压到 900×1200 的 JPEG（`assets/images/生成/gen-plate-01.jpg`）。改 `step`、亮度阈值、橙色圆与字号即可重生成。
- 没有接入云端 AI 生图：免费接口实测 503/402 限流，因此改用可复现的程序化半调生成，避免页面依赖外部服务。

## 响应式

- ≥1200：完整双栏 / 三栏版式，6 列成员网格，高度尺可见。
- 1000–1200：导航收起为 `INDEX`，高度尺隐藏，成员网格收窄。
- ≤1000：单栏版式，项目图占满内容宽，成员网格 4 列。
- ≤720：移动版式，统计 2 列，成员 2 列，照片带单张为主，顶栏保留 `INDEX` / `GRID`。

## 说明

- 图片来自实验室公开素材；新增图片请放 `assets/images/<分类>/`。
- 页面不采集任何数据，邮箱为 `mailto:`。
- 内容更新改 `assets/js/data.js` / `crew.js` 即可，无需改渲染逻辑；发布前记得更新 `sitemap.xml` 的 `lastmod`。
- 部署：先连 iKuuuVPN，用 `deploy-node.cjs`（Node fetch + FormData）只传改动文件；Neocities 免费站对 `.bin/.gz/.dat/.wasm/.webp` 等扩展名会返回 `invalid_file_type`，模型分片因此取名 `.glb`。
