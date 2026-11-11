/* ============================================================================
 * CUAL 网站内容数据（单一数据源）
 * ----------------------------------------------------------------------------
 * 本文件是网站所有文字内容的唯一来源：所有页面（index/about/projects/...）和
 * 后台（admin.html）都读取这份数据。修改内容请到后台编辑并导出，或直接编辑本文件。
 *
 * 【维护规范】多人维护，改动前必读（完整版见 README.md、「更新说明.txt」）
 *  1. 数据驱动：全站文字只改本文件与 members.js，不要手改 HTML；页面由
 *     assets/js/data-render.js 自动渲染，改完打开 index.html 确认控制台无报错。
 *  2. 格式约定：本文件是 JS 对象字面量——2 空格缩进、一个键一行、字符串用双引号、
 *     逗号只加在中间项后面（最后一项后不加）；只改要改的字段，不要重排结构、
 *     不要改键名、不要用自动格式化工具。
 *  3. 图片命名规范（均在 assets/images/ 下，引用一律写全路径；新增图必须先按下面规则
 *     改名再入库，禁止直接使用「微信图片_*」「IMG_*」等相机/聊天软件默认名）：
 *       飞机/       plane1.jpg … planeN.jpg
 *                   连续编号、不留空缺；新增取现有最大号 +1；删图后整体重编号，
 *                   并同步改本文件 projects.aircraft.total。
 *       合照/       <年份><事件>.jpg
 *                   如 2024CUAL合照.jpg、2026聚餐.jpg；同事件多张加序号（如 2026聚餐2.jpg）。
 *       一些日常/   1.jpg … N.jpg
 *                   连续编号、不留空缺；新增取现有最大号 +1（影像集「日常」分区）。
 *       赛场风采/   <年份><赛事><事件>.jpg
 *                   如 2025模拟搜救总决赛合照.jpg；同一事件多张按「…1.jpg、…2.jpg」顺延序号。
 *       赞助/       sponsor-<品牌小写>.<ext>
 *                   如 sponsor-iflight.png、sponsor-sunnysky.webp。
 *       通用/       站点级素材固定名：CUAL logo.PNG（兼作 favicon）、og-image.jpg、
 *                   map-location.png、队旗1.png、招新二维码/海报、2026新生群.jpg；
 *                   新增素材用「用途-年份」小写英文名。
 *     统一要求：扩展名用小写 .jpg/.png（历史大写文件可保留）；文件名不用空格与
 *     特殊符号；上传前先压缩（飞机图长边 1280、普通照片长边 1600，logo/二维码
 *     单独处理），单张控制体积。
 *  4. 删图必须重新连续编号、不留空缺（飞机/日常），并同步改 projects.aircraft.total。
 *  5. 影像集小图：影像集页展示用 <分类>/小图/、灯箱用原图；新增/更换照片后在
 *     cual-site 运行 python3 生成小图.py（--force 全量重建），生成物的
 *     assets/js/image-meta.js 勿手改；小图与 image-meta.js 要和图片一并上传
 *     （少了小图页面会自动回退原图）。
 *  6. 新增页面/入口：在 site.nav 加一项（layout.js 会全站注入导航与页脚，无需逐页
 *     改 HTML），并同步 sitemap.xml；影像集分区与图片由本文件 showcase 配置决定。
 *  7. 成员数据在 members.js；两文件都只存数据，渲染与交互逻辑在 assets/js/ 下。
 *  8. 版本与发布：每次改动前先询问是否新开版本（命名「网站第X版--YYYY.MM.DD」，
 *     备份名加「_备份」），完成后在「更新说明.txt」追加条目；发布 Neocities 前需
 *     经确认，只上传发生变更的文件。
 *  9. 安全：绝不把 API key / 密码写进任何网站文件。
 *
 * 字段说明：含 <br> / <strong> 的字符串为 HTML 片段，其余为纯文本。
 * ========================================================================== */

window.CUAL_CONFIG = {
  /* ---- 站点级 ---- */
  site: {
    name: "CUAL",
    fullName: "CAUC Unmanned Aerial Lab",
    description: "中国民航大学无人飞行器实验室",
    logo: "assets/images/通用/CUAL logo.PNG",
    footer: "© 2026 CAUC Unmanned Aerial Lab (CUAL). All rights reserved.",
    /* 导航与页脚链接（单一数据源，layout.js 渲染；新增入口只改这里） */
    nav: [
      { href: "index.html",        label: "首页" },
      { href: "about.html",        label: "关于我们" },
      { href: "projects.html",     label: "研究项目" },
      { href: "members.html",      label: "成员" },
      { href: "achievements.html", label: "成果展示" },
      { href: "gallery.html",      label: "影像集" },
      { href: "contact.html",      label: "联系方式" },
      { href: "recruit.html",      label: "招新" },
      { href: "sponsors.html",     label: "赞助商" }
    ]
  },

  /* ---- 首页 index.html ---- */
  home: {
    title: "CAUC Unmanned Aerial Lab",
    subtitle: "中国民航大学无人飞行器实验室 — 以创新为翼，以蓝天为梦",
    stats: [
      { number: "4",   label: "活跃项目" },
      { number: "26",  label: "国家级奖项" },
      { number: "40+", label: "团队成员" },
      { number: "3",   label: "参赛年份" }
    ],
    projects: [
      {
        icon: "life-buoy",
        title: "CADC 模拟搜救",
        description: "模拟搜救项目要求飞行器在限定时间内完成搜索与物资投放任务，考验飞手的操控精度与飞行器稳定性。2025 年获单项二等奖、三等奖及团体第三名，2026 年再获单项一等奖、三等奖及团体二等奖。"
      },
      {
        icon: "plane",
        title: "CADC 微型折叠飞行器",
        description: "微型折叠飞行器项目注重结构设计与折叠创新，飞行器须在紧凑尺寸中实现优异气动性能。2025、2026 连续两届各斩获两项单项一等奖，并分获团体第二名与团体二等奖。"
      },
      {
        icon: "target",
        title: "CUADC 精准打击",
        description: "精准打击是穿越机模拟战场上无人机的打击任务，要求无人机对指定目标进行精确识别与打击。2025 年获国赛一等奖、国赛团体第三名，区域赛获三等奖。2026 年将新增短距起降项目。"
      },
      {
        icon: "award",
        title: "CUADC 三项全能",
        description: "三项全能项目在穿越机模拟战场中完成跨越障碍、打击目标与投掷炸弹任务，综合考验飞手的操控能力、穿越机机动性能与团队配合。2026 年国赛（山东烟台）首次参赛即斩获二等奖与三等奖。"
      }
    ],
    about: {
      title: "关于 CUAL",
      content: "CAUC Unmanned Aerial Lab（CUAL）的前身是 2023 年成立的「无人之翼」学生社团，2024 年正式组建实验室，是一个专注于无人飞行器设计、制造与竞技的学生创新实验室。 实验室以 CADC（中国国际飞行器设计挑战赛）和 CUADC（中国大学生飞行器设计创新大赛）为核心竞赛平台， 致力于培养具备飞行器设计、嵌入式系统、飞行控制与项目管理能力的综合型人才。"
    },
    gallery: [
      { src: "assets/images/赛场风采/2024CADC赛场风采1.JPG",          caption: "2024 年 CADC 赛场风采" },
      { src: "assets/images/通用/队旗1.png",                    caption: "CUAL 队旗" },
      { src: "assets/images/赛场风采/2025CADC全体合照.jpg",          caption: "2025 年 CADC 全体成员" },
      { src: "assets/images/赛场风采/2025CADC模拟搜救三校合照.jpg",  caption: "2025 年 CADC 模拟搜救项目组与兄弟院校" },
      { src: "assets/images/赛场风采/2025低空经济产业发展大会合照.jpg", caption: "2025 年低空经济产业发展大会" },
      { src: "assets/images/赛场风采/2025微型折叠飞行器总决赛合照.JPG", caption: "2025 年 CADC 微型折叠飞行器总决赛" },
      { src: "assets/images/赛场风采/2025模拟搜救总决赛合照.jpg",    caption: "2025 年 CADC 模拟搜救总决赛" },
      { src: "assets/images/赛场风采/2025精准打击分站赛合照.JPG",     caption: "2025 年 CUADC 精准打击分站赛" },
      { src: "assets/images/赛场风采/2026三项全能分站赛合照.jpg",     caption: "2026 年 CUADC 三项全能分站赛" }
    ]
  },

  /* ---- 关于我们 about.html ---- */
  about: {
    headerTitle: "关于 CUAL",
    headerSubtitle: "以创新为翼，以蓝天为梦 — 中国民航大学无人飞行器实验室",
    intro: [
      "<strong>CAUC Unmanned Aerial Lab（CUAL）</strong>，全称中国民航大学无人飞行器实验室，前身为 2023 年成立的「无人之翼」学生社团，2024 年正式组建实验室。实验室依托中国民航大学的航空学科优势，专注于无人飞行器系统的设计、研发与竞技实践。",
      "自成立以来，CUAL 以 CADC（中国国际飞行器设计挑战赛）和 CUADC（中国大学生飞行器设计创新大赛）为核心竞技平台，参与了模拟搜救、微型折叠飞行器、精准打击等多个项目，累计获得国家级奖项 26 项。实验室坚持“以赛促学、以赛促研”的理念，通过高水平的学科竞赛驱动技术创新与人才培养。",
      "2025 年，实验室在 CADC 微型折叠飞行器项目中斩获两项单项一等奖及团体第二名，在 CUADC 精准打击项目中获得了国赛团体第三名的佳绩；2026 年 CADC 国赛（安徽合肥）再获微型折叠飞行器两项单项一等奖、模拟搜救单项一等奖，累计国家级奖项达 26 项、团体奖杯 10 座。整体发展趋势稳定向上，人员规模持续扩大，招新结构与培训方案逐步完善。"
    ],
    mission: { icon: "flag", title: "使命", text: "以学科竞赛为驱动，培养具备飞行器设计、嵌入式系统、飞行控制与项目管理能力的复合型创新人才，推动高校无人机技术的实践与发展。" },
    vision:  { icon: "compass", title: "愿景", text: "成为国内一流的无人机学生创新实验室，建立可持续的竞赛-科研-转化运行模式，影响并带动更多同学投身航空科技创新。" },
    history: [
      {
        year: "2023", title: "无人之翼成立",
        items: [
          "“无人之翼”——中国民航大学校级无人机社团成立",
          "聚集校内无人机爱好者，开展飞手培训与技术交流活动",
          "初步探索竞赛方向，积累无人飞行器设计与操控经验"
        ]
      },
      {
        year: "2024", title: "初登赛场",
        items: [
          "CUAL 实验室从“无人之翼”社团中应运而生，专注竞赛与研发",
          "首次参加 CADC 区域赛（杭州），微型折叠飞行器项目斩获单项第一名及团体第二名",
          "CADC 国赛（四川巴中）：微型折叠飞行器获 2 项三等奖；模拟搜救获 2 项三等奖及 2 项团体第三名",
          "初步建立梯队培训体系，形成以赛代练的团队运转模式"
        ]
      },
      {
        year: "2025", title: "全面发展",
        items: [
          "新增 CUADC（中国大学生飞行器设计创新大赛）无人机精准打击对抗赛项目",
          "CADC 国赛（河北崇礼）：微型飞行器获 2 项单项一等奖及团体第二名；模拟搜救获二等奖、三等奖及团体第三名",
          "CUADC 国赛（浙江德清）：精准打击对抗赛获一等奖及团体第三名；区域赛获三等奖",
          "交通运输科技大赛校级一等奖、二等奖；低空经济创新创业大赛优秀奖等多项横向突破",
          "团队成员规模大幅增长，培训与备赛体系日趋成熟"
        ]
      },
      {
        year: "2026", title: "稳步前行",
        items: [
          "CUADC 三项全能首次参赛，国赛（山东烟台）获二等奖与三等奖",
          "CADC 国赛（安徽合肥）：微型折叠飞行器获 2 项单项一等奖及团体二等奖；模拟搜救获单项一等奖、三等奖及团体二等奖",
          "校级大学生创新创业训练计划项目持续推进",
          "团队结构进一步优化，新老梯队衔接顺畅"
        ]
      }
    ]
  },

  /* ---- 研究项目 projects.html ---- */
  projects: {
    headerTitle: "研究项目",
    headerSubtitle: "以竞赛驱动创新，在实践中探索飞行的边界",
    projects: [
      {
        icon: "life-buoy",
        title: "CADC — 模拟搜救",
        description: "CADC（中国国际飞行器设计挑战赛）模拟搜救项目要求参赛飞行器在限定时间内完成搜索与物资精准投放任务。飞行器需具备稳定的悬停性能、精准的定位能力以及高效的载荷投放机构。该项目全面考验飞手的操控技术、飞行器的可靠性与团队配合能力。",
        result: "2026 成绩：单项一等奖 · 单项三等奖 · 团体二等奖"
      },
      {
        icon: "plane",
        title: "CADC — 微型折叠飞行器",
        description: "微型折叠飞行器项目的核心挑战在于如何在紧凑的尺寸限制下设计出具有优异气动性能的飞行器。项目涉及机翼折叠机构设计、轻量化结构优化、气动布局创新等关键技术领域，是工程设计与创新思维的集中体现。",
        result: "2026 成绩：两项单项一等奖 · 团体二等奖"
      },
      {
        icon: "target",
        title: "CUADC — 精准打击",
        description: "CUADC（中国大学生飞行器设计创新大赛）精准打击项目是穿越机模拟战场上无人机的打击任务，选手操控穿越机在模拟战场中对地面目标进行精确识别与打击。项目考验飞手的操控精度、反应速度与穿越机飞行性能。2025 年首次参赛即取得佳绩，展现了实验室快速成长的研发实力。",
        result: "2025 成绩：国赛一等奖 · 国赛团体第三名 · 区域赛三等奖"
      },
      {
        icon: "award",
        title: "CUADC — 三项全能",
        description: "CUADC（中国大学生飞行器设计创新大赛）三项全能项目是在穿越机模拟战场中完成跨越障碍、打击目标与投掷炸弹的综合竞技任务，全面考验飞手的穿越机操控技术、机动能力、任务执行能力与团队配合。2026 年首次参赛即在国赛斩获佳绩。",
        result: "2026 成绩：国赛二等奖 · 国赛三等奖"
      }
    ],
    future: [
      { icon: "rocket",      title: "2026 新项目", description: "计划新增 CUADC 短距起降项目，同时探索多旋翼方向的竞赛项目，以覆盖更广泛的无人机技术领域，吸引更多对无人机感兴趣的同学参与。" },
      { icon: "list-checks", title: "制度完善",   description: "短期内重点完善实验室管理制度，包括考勤制度、外场人员安排、会议进度汇报机制及“老带新”培训模式，建立规范化、可持续的运行体系。" },
      { icon: "lightbulb",   title: "创新孵化",   description: "长期目标包括提升数据量化分析能力，增加大创（大学生创新创业训练计划）等科研项目的参与，为更多同学提供锻炼平台，同时为实验室运行提供资金支持。" }
    ],
    aircraft: {
      total: 34
    }
  },

  /* ---- 成果展示 achievements.html ---- */
  achievements: {
    headerTitle: "成果展示",
    headerSubtitle: "用成绩说话 — CUAL 历年竞赛获奖记录",
    stats: [
      { number: "26", label: "国家级奖项" },
      { number: "10",  label: "团体奖杯" },
      { number: "3",  label: "区域赛奖项" },
      { number: "3",  label: "校级奖项" },
      { number: "2",  label: "大创项目" },
      { number: "2",  label: "其他奖项" }
    ],
    timeline: [
      {
        year: "2026",
        competitions: [
          {
            name: "CADC 中国国际飞行器设计挑战赛（国赛 · 安徽合肥 · 2026.10.09-18）",
            awards: [
              { project: "微型飞行器", detail: "单项第一名 🥇（1 项）", members: "陈熙宇、朱泓骏、王子轩" },
              { project: "微型折叠飞行器", detail: "单项一等奖 🥇（2 项）", members: "陈熙宇、朱泓骏、王子轩 / 周子墨、郑锦睿、刘兴鑫" },
              { project: "微型折叠飞行器", detail: "团体二等奖 🥈（1 项）", members: "陈熙宇、朱泓骏、王子轩 / 周子墨、郑锦睿、刘兴鑫" },
              { project: "模拟搜救", detail: "单项一等奖 🥇（1 项）", members: "陈俊宇、汪远岑、张雨晴、唐大泽" },
              { project: "模拟搜救", detail: "单项三等奖（1 项）", members: "王家乐、朱建州、童贵钦、王建鸿" },
              { project: "模拟搜救", detail: "团体二等奖 🥈（1 项）", members: "陈俊宇、汪远岑、张雨晴、唐大泽 / 王家乐、朱建州、童贵钦、王建鸿" }
            ]
          },
          {
            name: "校级大学生创新创业训练计划项目",
            awards: [
              { project: "项目一（待补充）", detail: "校级大创（2026）" },
              { project: "项目二（待补充）", detail: "校级大创（2026）" }
            ]
          },
          {
            name: "CUADC 中国大学生飞行器设计创新大赛（国赛 · 山东烟台 · 2026.8.5-8.8）",
            awards: [
              { project: "三项全能", detail: "国赛二等奖", members: "杨晨、刘喾颉、冯昊龙" },
              { project: "三项全能", detail: "国赛三等奖", members: "陆涵飞、黄永宁、黄铭扬" }
            ]
          }
        ]
      },
      {
        year: "2025",
        competitions: [
          {
            name: "CADC 中国国际飞行器设计挑战赛（国赛 · 河北崇礼 · 2025.10.20-29）",
            awards: [
              { project: "微型飞行器", detail: "单项一等奖 🥇（2 项）", members: "杨晨、刘喾颉、庞天宁 / 陆涵飞、卓大为、陶雪莲" },
              { project: "微型飞行器", detail: "单项团体第二名 🥈（2 项）", members: "杨晨、刘喾颉、庞天宁 / 陆涵飞、卓大为、陶雪莲" },
              { project: "模拟搜救", detail: "单项二等奖（1 项）", members: "顾祺炜、刘朔岑、李天禹、于博千" },
              { project: "模拟搜救", detail: "单项三等奖（1 项）", members: "黄铭扬、黄永宁、张勇、李圆梦圆" },
              { project: "模拟搜救", detail: "单项团体第三名 🥉（2 项）", members: "黄铭扬、黄永宁、张勇、李圆梦圆 / 顾祺炜、刘朔岑、李天禹、于博千" }
            ]
          },
          {
            name: "CUADC 中国大学生飞行器设计创新大赛（2025.10）",
            awards: [
              { project: "无人机精准打击对抗赛", detail: "国赛一等奖 🥇（浙江德清）", members: "郑暄、庞天宁、程子骞" },
              { project: "无人机精准打击对抗赛", detail: "国赛团体第三名 🥉（浙江德清）", members: "郑暄、庞天宁、程子骞、杨晨、陆涵飞、罗涵" },
              { project: "无人机精准打击对抗赛", detail: "区域赛三等奖（河北保定）", members: "杨晨、陆涵飞、罗涵" }
            ]
          },
          {
            name: "其他比赛",
            awards: [
              { project: "第三届全国技能大赛“无人机系统”项目民航行业选拔赛", detail: "银奖 🥈（2025.5 · 广州）", members: "参赛人员：李文明" },
              { project: "交通运输科技大赛（校级 · 航空运输与工程赛道）", detail: "一等奖 🥇", members: "项目：穹盾智航 —— 绿色 eVTOL 智能消防巡检系统 · 奚羽尘、李承啸、黄永宁、杨晨、黄铭扬" },
              { project: "交通运输科技大赛（校级 · 航空运输与工程赛道）", detail: "二等奖 🥈", members: "项目：天穹安采 —— 基于中型六轴无人机的应急采样平台 · 黄铭扬、黄永宁、杨晨、汪远岑、张瀚元" },
              { project: "中国民航大学首届低空交通创新创业大赛", detail: "二等奖（本科生组）（2025.12 · 天津）", members: "项目：寻迹者—针对采样的双层六轴无人机 · 黄永宁、李圆梦圆、黄铭扬、张勇、李承啸" },
              { project: "2025 低空经济创新创业大赛", detail: "优秀奖（2025.12 · 四川射洪）", members: "项目：寻迹者—针对采样的双层六轴无人机 · 黄永宁、黄铭扬、杨晨、奚羽尘、李承啸" },
              { project: "2025 低空经济创新创业大赛", detail: "优秀奖（2025.12 · 四川射洪）", members: "项目：朱雀智瞳 · 奚羽尘、李承啸、黄永宁、黄铭扬、杨晨" }
            ]
          }
        ]
      },
      {
        year: "2024",
        competitions: [
          {
            name: "CADC 中国国际飞行器设计挑战赛（区域赛 · 浙江杭州 · 2024.8.17-8.18）",
            awards: [
              { project: "微型折叠飞行器", detail: "单项第一名 🥇", members: "薄淏辰、钟志磊、朱书骐" },
              { project: "微型折叠飞行器", detail: "团体第二名 🥈", members: "郑暄、钟亮、程子骞、薄淏辰、钟志磊、朱书骐" }
            ]
          },
          {
            name: "CADC 中国国际飞行器设计挑战赛（国赛 · 四川巴中 · 2024.10.09-19）",
            awards: [
              { project: "微型折叠飞行器", detail: "单项三等奖（2 项）", members: "郑暄、钟亮、程子骞 / 薄淏辰、钟志磊、朱书骐" },
              { project: "模拟搜救", detail: "单项三等奖（2 项）", members: "卢少龙、李泯亨、卢炳领、李文明 / 迪力夏提·阿不拉、袁程昊、任盈盈、彭宇" },
              { project: "模拟搜救", detail: "单项团体第三名 🥉（2 项）", members: "卢少龙、李泯亨、卢炳领、李文明 / 迪力夏提·阿不拉、袁程昊、任盈盈、彭宇" }
            ]
          }
        ]
      }
    ],
    gallery: [
      { src: "assets/images/赛场风采/2025模拟搜救总决赛合照.jpg",      caption: "2025 年 CADC 模拟搜救总决赛现场" },
      { src: "assets/images/赛场风采/2025微型折叠飞行器总决赛合照.JPG", caption: "2025 年 CADC 微型折叠飞行器总决赛合影" },
      { src: "assets/images/赛场风采/2025精准打击分站赛合照.JPG",       caption: "2025 年 CUADC 精准打击分站赛合影" },
      { src: "assets/images/赛场风采/2026三项全能分站赛合照.jpg",       caption: "2026 年 CUADC 三项全能分站赛合影" },
      { src: "assets/images/赛场风采/2024CADC赛场风采1.JPG",           caption: "2024 年 CADC 赛场风采" }
    ]
  },

  /* ---- 联系方式 contact.html ---- */
  contact: {
    headerTitle: "联系我们",
    headerSubtitle: "欢迎对无人机感兴趣的同学加入 CUAL",
    address: "中国民航大学宁河校区交通楼二期103房",
    department: "中国民航大学 · 交通科学与工程学院<br>无人驾驶航空器系统工程",
    email: "241440580@cauc.edu.cn",
    consultation: "招新季请加入招新群或关注校内通知推送<br>如有疑问欢迎发送邮件至负责人邮箱",
    club: "无人之翼 — 中国民航大学校级无人机社团<br>与 CUAL 实验室紧密协作，共同开展活动",
    map: {
      image: "assets/images/通用/map-location.png",
      title: "中国民航大学 · 宁河校区",
      subtitle: "天津市宁河区 · 未来科技城"
    },
    join: {
      heading: "加入我们",
      subheading: "无论你是飞行器爱好者、代码高手还是运营达人，CUAL 都欢迎你",
      roles: [
        { icon: "plane",     title: "飞行器设计",   description: "如果你对飞行器结构设计、气动优化、CAD 建模感兴趣，欢迎加入设计组。我们使用 SolidWorks 等工具进行飞行器设计与仿真。" },
        { icon: "cpu",       title: "嵌入式与飞控", description: "如果你熟悉 C / C++ / Python，对 STM32、Arduino、PX4 等飞控平台有了解，欢迎加入嵌入式与飞控开发组。" },
        { icon: "gamepad",   title: "飞手",         description: "如果你有穿越机或航模飞行经验，欢迎加入飞手组。我们定期组织外场训练与模拟器练习。" },
        { icon: "briefcase", title: "运营管理",     description: "如果你擅长项目管理、文案写作、视觉设计或新媒体运营，运营组需要你！" }
      ]
    }
  },

  /* ---- 指导老师（members.html 顶部） ---- */
  advisor: {
    name: "杨永刚",
    title: "教授 / 博士生导师",
    avatar: "杨",
    background: "哈尔滨工业大学机械电子工程博士，现任中国民航大学交通科学与工程学院教授。长期从事无人机设计、无人机集群及无人机运行风险分析研究。",
    email: "ygyang@cauc.edu.cn",
    phone: "022-24092474",
    department: "交通科学与工程学院",
    research: "无人机设计 · 无人机集群 · 无人机运行风险分析",
    achievements: [
      "获中国航空学会科学技术奖 1 项、中国民用航空运输协会科学技术奖 1 项",
      "主持参与省部级及以上项目 8 项，在研横向项目 2 项",
      "发表学术论文 40 余篇，授权发明专利 5 项",
      "中国航空学会直升机分会委员"
    ]
  },

  /* ---- 招新 recruit.html ---- */
  recruit: {
    headerTitle: "CUAL 招新",
    headerSubtitle: "以创新为翼，以蓝天为梦 — 加入我们，一起造飞机",
    hero: {
      tagline: "CAUC Unmanned Aerial Lab",
      title: "实验室招新",
      subtitle: "中国民航大学无人飞行器实验室<br>诚邀热爱飞行与创新的你，与我们一起把想法飞上天",
      ctaText: "立即报名",
      poster: ""
    },
    intro: [
      "CAUC Unmanned Aerial Lab（CUAL），全称中国民航大学无人飞行器实验室，成立于 2023 年，是中国民航大学一支专注于无人飞行器设计、制造与竞技的学生创新团队。我们依托学校航空学科优势，以 CADC（中国国际飞行器设计挑战赛）和 CUADC（中国大学生飞行器设计创新大赛）为核心竞技平台。",
      "短短三年，我们从最初的几名爱好者，发展到现在覆盖模拟搜救、微型折叠飞行器、精准打击、三项全能四大方向的成熟团队，累计斩获国家级奖项 26 项、团体奖杯 10 座。每一架成功上天的飞行器，都是我们从图纸、结构、电控到操控，一步步亲手做出来的。",
      "在这里，你不只是加入一个社团，而是加入一支真正会造飞机、会飞飞机的队伍。无论你是零基础还是老手，都能找到属于自己的位置。"
    ],
    highlights: [
      { number: "26", label: "国家级奖项" },
      { number: "10", label: "团体奖杯" },
      { number: "40+", label: "团队成员" },
      { number: "4", label: "项目方向" }
    ],
    directions: [
      { icon: "wrench", title: "机械结构", desc: "飞行器结构设计、气动优化、机翼折叠机构、轻量化设计，使用 SolidWorks / CATIA 等工具，把设计变成能上天的实物。", tags: "机械设计, CAD, 3D打印" },
      { icon: "cpu", title: "嵌入式与电控", desc: "飞控系统开发、STM32、PX4 / ArduPilot，负责飞行器的大脑与执行机构，让每一个动作精准可靠。", tags: "C/C++, Python, 单片机" },
      { icon: "eye", title: "视觉与算法", desc: "目标检测与跟踪、图像识别、自主飞行算法，让无人机「看得见、认得出、跟得上」。", tags: "Python, OpenCV, 深度学习" },
      { icon: "gamepad", title: "飞手", desc: "穿越机 / 航模飞行，外场试飞与模拟器训练，用双手操控飞机完成搜索、投放、打击等精准任务。", tags: "穿越机, 模拟器, 外场" },
      { icon: "briefcase", title: "运营管理", desc: "项目管理、文案与新媒体、视觉设计、外场安排，支撑实验室高效运转，让团队走得更远。", tags: "PPT, 文案, 设计" }
    ],
    why: [
      { icon: "rocket", title: "真实项目实践", desc: "不是纸上谈兵。你会亲手参与真实飞行器从设计、制造、调试到试飞的全流程，把课本知识变成能上天的实物。" },
      { icon: "trophy", title: "冲击国家级奖项", desc: "以 CADC / CUADC 为赛场，与全国高校同台竞技。过去三年，我们累计拿下 26 项国家级奖项。" },
      { icon: "users", title: "学长学姐手把手带", desc: "每位新人都有一对一的指导学长学姐，从理论、工具到外场实操，零基础也能快速上手。" },
      { icon: "star", title: "一群志同道合的伙伴", desc: "深夜改图、外场试飞的辛苦，都因为有一群同样热爱飞行的伙伴，而变得值得。" }
    ],
    targets: "面向中国民航大学各年级本科生与研究生，不限专业。只要你对飞行器、无人机、机器人心怀热爱，愿意投入时间学习与实践，CUAL 都欢迎你。零基础也没关系——我们招新不分专业、不设门槛，机械、电控、视觉、飞手、运营，总有一项适合你。",
    timeline: [
      { step: "01", time: "报名", desc: "扫描二维码进招新群，了解更多并报名" },
      { step: "02", time: "面试", desc: "轻松聊一聊你的兴趣与想法，无需专业基础" },
      { step: "03", time: "公布结果", desc: "确定加入方向，为你分配指导学长学姐" },
      { step: "04", time: "正式加入", desc: "进入项目组，开始你的第一架飞行器" }
    ],
    faq: [
      { q: "零基础、没接触过无人机，可以来吗？", a: "完全可以。招新不限专业、不限基础，我们会为每位新人分配指导学长学姐，从飞机构造、电调、飞控到模拟器训练一步步教。现在很多骨干成员当年也是零基础。" },
      { q: "大一新生可以报名吗？", a: "非常欢迎！大一正是加入的最佳时机，有充足时间系统学习。我们不少项目组负责人都是从大一干起来的。" },
      { q: "平时训练、备赛会不会耽误上课？", a: "所有活动都在课余时间进行，外场安排会提前协调通知，兼顾学业与兴趣。我们强调效率，不主张无意义的熬夜。" },
      { q: "报名之后多久会有结果？", a: "一般报名截止后一周内完成初筛与面试，结果会在招新群内公布，请留意群通知。" }
    ],
    apply: {
      qr: "assets/images/通用/2026新生群-qr.png",
      qrHint: "扫码进招新群，了解更多",
      methods: [
        { label: "招新群", value: "扫描二维码进群咨询" }
      ],
      note: "招新季请留意校内通知与招新海报；如有任何问题，欢迎扫码进群咨询。"
    }
  },

  /* ---- 赞助商 sponsors.html ---- */
  sponsors: {
    headerTitle: "赞助商鸣谢",
    headerSubtitle: "感谢以下单位对 CUAL 实验室的支持与帮助",
    items: [
      { name: "IFLIGHT", logo: "assets/images/赞助/sponsor-iflight.png", desc: "", link: "" },
      { name: "CADDX", logo: "assets/images/赞助/sponsor-caddx.jpg", desc: "", link: "" },
      { name: "SUNNYSKY", logo: "assets/images/赞助/sponsor-sunnysky.webp", desc: "", link: "" },
      { name: "HQ", logo: "assets/images/赞助/sponsor-hq.png", desc: "", link: "" },
      { name: "CUAV", logo: "assets/images/赞助/sponsor-cuav.png", desc: "", link: "" }
    ]
  },

  /* ---- 影像集 gallery.html ----
   * 从「飞机 / 合照 / 赛场风采 / 一些日常」目录取材（通用目录除外），分区展示。
   * 各分区 layout 决定展示方式：
   *   coverflow = 3D 环形轮播（飞机，图片由 projects.aircraft.total 自动生成 plane1…N）
   *   marquee   = 横向无限滚动长廊
   *   grid      = 瀑布流网格
   *   flow      = 纵向自动滚动瀑布流长廊（限高窗口，逐列循环滚动）
   *   paged     = 翻页轮播（每页 6 张，左右翻页，备用）
   *   logos     = logo 墙（备用布局，当前未使用）
   * 新增照片：在对应分区 images 里加 { src, caption } 即可（飞机除外，改 aircraft.total）。 */
  showcase: {
    headerTitle: "影像集",
    headerSubtitle: "以镜头记录 CUAL 的飞行器、成员与赛场瞬间",
    sections: [
      {
        id: "planes", icon: "plane", layout: "coverflow",
        title: "飞行器",
        subtitle: "从图纸到蓝天 — CUAL 设计制作的各类无人飞行器",
        images: []
      },
      {
        id: "group", icon: "users", layout: "marquee",
        title: "合照",
        subtitle: "一届又一届 CUALer 的合影",
        images: [
          { src: "assets/images/合照/2024CUAL合照.jpg",        caption: "2024 年 CUAL 全体成员" },
          { src: "assets/images/合照/2025CUAL合照.jpg",        caption: "2025 年 CUAL 成员" },
          { src: "assets/images/合照/2026CUAL合照.jpg",        caption: "2026 年 CUAL 全体成员" },
          { src: "assets/images/合照/2026聚餐.jpg",            caption: "2026 年实验室聚餐" },
          { src: "assets/images/合照/2025聚餐.jpg",            caption: "2025 年实验室聚餐" }
        ]
      },
      {
        id: "field", icon: "trophy", layout: "grid",
        title: "赛场风采",
        subtitle: "赛场上的高光时刻",
        images: [
          { src: "assets/images/赛场风采/2024CADC赛场风采1.JPG",        caption: "2024 年 CADC 赛场风采" },
          { src: "assets/images/赛场风采/2025CADC全体合照.jpg",          caption: "2025 年 CADC 全体成员" },
          { src: "assets/images/赛场风采/2025CADC模拟搜救三校合照.jpg",  caption: "2025 年 CADC 模拟搜救项目组与兄弟院校" },
          { src: "assets/images/赛场风采/2025低空经济产业发展大会合照.jpg", caption: "2025 年低空经济产业发展大会" },
          { src: "assets/images/赛场风采/2025微型折叠飞行器总决赛合照.JPG", caption: "2025 年 CADC 微型折叠飞行器总决赛" },
          { src: "assets/images/赛场风采/2025模拟搜救总决赛合照.jpg",    caption: "2025 年 CADC 模拟搜救总决赛" },
          { src: "assets/images/赛场风采/2025精准打击分站赛合照.JPG",     caption: "2025 年 CUADC 精准打击分站赛" },
          { src: "assets/images/赛场风采/2026三项全能分站赛合照.jpg",     caption: "2026 年 CUADC 三项全能分站赛" }
        ]
      },
      {
        id: "daily", icon: "image", layout: "flow",
        title: "日常",
        subtitle: "这里不只是一个比赛的场所，这里有时候或许更加像一个家",
        images: [
          { src: "assets/images/一些日常/1.jpg",  caption: "实验室日常 · 01" },
          { src: "assets/images/一些日常/2.jpg",  caption: "实验室日常 · 02" },
          { src: "assets/images/一些日常/3.jpg",  caption: "实验室日常 · 03" },
          { src: "assets/images/一些日常/4.jpg",  caption: "实验室日常 · 04" },
          { src: "assets/images/一些日常/5.jpg",  caption: "实验室日常 · 05" },
          { src: "assets/images/一些日常/6.jpg",  caption: "实验室日常 · 06" },
          { src: "assets/images/一些日常/7.jpg",  caption: "实验室日常 · 07" },
          { src: "assets/images/一些日常/8.jpg",  caption: "实验室日常 · 08" },
          { src: "assets/images/一些日常/9.jpg",  caption: "实验室日常 · 09" },
          { src: "assets/images/一些日常/10.jpg", caption: "实验室日常 · 10" },
          { src: "assets/images/一些日常/11.jpg", caption: "实验室日常 · 11" },
          { src: "assets/images/一些日常/12.jpg", caption: "实验室日常 · 12" },
          { src: "assets/images/一些日常/13.jpg", caption: "实验室日常 · 13" },
          { src: "assets/images/一些日常/14.jpg", caption: "实验室日常 · 14" },
          { src: "assets/images/一些日常/15.jpg", caption: "实验室日常 · 15" },
          { src: "assets/images/一些日常/16.jpg", caption: "实验室日常 · 16" },
          { src: "assets/images/一些日常/17.jpg", caption: "实验室日常 · 17" },
          { src: "assets/images/一些日常/18.jpg", caption: "实验室日常 · 18" },
          { src: "assets/images/一些日常/19.jpg", caption: "实验室日常 · 19" },
          { src: "assets/images/一些日常/20.jpg", caption: "实验室日常 · 20" },
          { src: "assets/images/一些日常/21.jpg", caption: "实验室日常 · 21" },
          { src: "assets/images/一些日常/22.jpg", caption: "实验室日常 · 22" },
          { src: "assets/images/一些日常/23.jpg", caption: "实验室日常 · 23" },
          { src: "assets/images/一些日常/24.jpg", caption: "实验室日常 · 24" },
          { src: "assets/images/一些日常/25.jpg", caption: "实验室日常 · 25" },
          { src: "assets/images/一些日常/26.jpg", caption: "实验室日常 · 26" },
          { src: "assets/images/一些日常/27.jpg", caption: "实验室日常 · 27" },
          { src: "assets/images/一些日常/28.jpg", caption: "实验室日常 · 28" },
          { src: "assets/images/一些日常/29.jpg", caption: "实验室日常 · 29" },
          { src: "assets/images/一些日常/30.jpg", caption: "实验室日常 · 30" },
          { src: "assets/images/一些日常/31.jpg", caption: "实验室日常 · 31" },
          { src: "assets/images/一些日常/32.jpg", caption: "实验室日常 · 32" },
          { src: "assets/images/一些日常/33.jpg", caption: "实验室日常 · 33" },
          { src: "assets/images/一些日常/34.jpg", caption: "实验室日常 · 34" }
        ]
      }
    ]
  }
};
