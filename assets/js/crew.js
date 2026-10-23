/* ============================================================================
 * CUAL 成员数据（单一数据源）—— 由后台 members 管理，网站与后台共同读取。
 * ----------------------------------------------------------------------------
 * 结构：projectMeta 项目元信息；departments 部门；founders 创始人；
 *       people[].projects[] 一人可属多个项目/多届（cohort 届别、departments 多部门、
 *       leader 是否负责人）。
 *
 * 【维护规范】（完整版见 README.md 与 config.js 头部注释）
 *  1. 只改数据、不改结构；格式同 config.js：JS 对象字面量、双引号、逗号只加在
 *     中间项后（最后一项后不加）；不要重排字段、不要用自动格式化工具。
 *  2. 成员按届数分页；跨多年的成员取最早一届填 entry_year。
 *  3. 一人可属多项目/多部门：在 projects[] 里各加一条，不要新建重复成员。
 *  4. leader: true 自动带负责人徽章，并同时出现在负责人区与部门区。
 *  5. 改完与 config.js 一并发布；改动前先询问是否新开版本，并在「更新说明.txt」
 *     追加条目；发布前经确认后只上传变更文件。
 *  6. 安全：绝不把 API key / 密码写进本文件。
 * ========================================================================== */
window.CUAL_MEMBERS = {
  "projectMeta": {
    "模拟搜救": {
      "title": "CADC 模拟搜救",
      "file": "members-cadc-rescue.html",
      "icon": "life-buoy"
    },
    "微型折叠飞行器": {
      "title": "CADC 微型折叠飞行器",
      "file": "members-cadc-fold.html",
      "icon": "plane",
      "image": "assets/images/项目/fold-plane.png"
    },
    "精准打击": {
      "title": "CUADC 精准打击",
      "file": "members-cuadc-strike.html",
      "icon": "target"
    },
    "三项全能": {
      "title": "CUADC 三项全能",
      "file": "members-cuadc-triathlon.html",
      "icon": "award"
    }
  },
  "departments": [
    "机械",
    "电控",
    "视觉",
    "飞手"
  ],
  "founders": [
    {
      "name": "薄淏辰",
      "role": "创始人"
    },
    {
      "name": "秦俪耘",
      "role": "创始人"
    },
    {
      "name": "刘顺礼",
      "role": "创始人"
    }
  ],
  "people": [
    {
      "name": "于博千",
      "entry_year": "2025",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "电控"
          ]
        }
      ]
    },
    {
      "name": "任盈盈",
      "entry_year": "2024",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "冯昊龙",
      "entry_year": "2026",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "刘兴鑫",
      "entry_year": "2026",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "刘喾颉",
      "entry_year": "2025",
      "projects": [
        {
          "project": "三项全能",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "机械"
          ]
        },
        {
          "project": "微型折叠飞行器",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "刘朔岑",
      "entry_year": "2025",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "电控"
          ]
        }
      ]
    },
    {
      "name": "卓大为",
      "entry_year": "2025",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "卢少龙",
      "entry_year": "2024",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "卢炳领",
      "entry_year": "2024",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "视觉"
          ]
        }
      ]
    },
    {
      "name": "周子墨",
      "entry_year": "2026",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "飞手",
            "机械"
          ]
        }
      ]
    },
    {
      "name": "唐大泽",
      "entry_year": "2026",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "视觉"
          ]
        }
      ]
    },
    {
      "name": "庞天宁",
      "entry_year": "2025",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "机械"
          ]
        },
        {
          "project": "精准打击",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "飞手"
          ]
        }
      ]
    },
    {
      "name": "张勇",
      "entry_year": "2025",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "飞手",
            "视觉"
          ]
        }
      ]
    },
    {
      "name": "张雨晴",
      "entry_year": "2026",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "彭宇",
      "entry_year": "2024",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "飞手",
            "机械"
          ]
        }
      ]
    },
    {
      "name": "朱书骐",
      "entry_year": "2024",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "电控"
          ]
        }
      ]
    },
    {
      "name": "朱建州",
      "entry_year": "2026",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "电控"
          ]
        }
      ]
    },
    {
      "name": "朱泓骏",
      "entry_year": "2026",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "李圆梦圆",
      "entry_year": "2025",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "李天禹",
      "entry_year": "2025",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "视觉"
          ]
        }
      ]
    },
    {
      "name": "李文明",
      "entry_year": "2024",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2024",
          "leader": true,
          "departments": [
            "机械",
            "飞手"
          ]
        }
      ]
    },
    {
      "name": "李泯亨",
      "entry_year": "2024",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "电控"
          ]
        }
      ]
    },
    {
      "name": "杨晨",
      "entry_year": "2025",
      "projects": [
        {
          "project": "三项全能",
          "cohort": "2026",
          "leader": true,
          "departments": [
            "飞手"
          ]
        },
        {
          "project": "微型折叠飞行器",
          "cohort": "2025",
          "leader": true,
          "departments": [
            "机械",
            "飞手"
          ]
        },
        {
          "project": "精准打击",
          "cohort": "2025",
          "leader": true,
          "departments": [
            "机械",
            "飞手"
          ]
        }
      ]
    },
    {
      "name": "汪远岑",
      "entry_year": "2026",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "电控"
          ]
        }
      ]
    },
    {
      "name": "王子轩",
      "entry_year": "2026",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "王家乐",
      "entry_year": "2026",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2026",
          "leader": true,
          "departments": [
            "机械",
            "飞手"
          ]
        }
      ]
    },
    {
      "name": "王建鸿",
      "entry_year": "2026",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "飞手",
            "视觉"
          ]
        }
      ]
    },
    {
      "name": "程子骞",
      "entry_year": "2024",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "机械"
          ]
        },
        {
          "project": "精准打击",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "童贵钦",
      "entry_year": "2026",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "电控"
          ]
        }
      ]
    },
    {
      "name": "罗涵",
      "entry_year": "2025",
      "projects": [
        {
          "project": "精准打击",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "薄淏辰",
      "entry_year": "2024",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2024",
          "leader": true,
          "departments": [
            "飞手",
            "机械"
          ]
        }
      ]
    },
    {
      "name": "袁程昊",
      "entry_year": "2024",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "电控"
          ]
        }
      ]
    },
    {
      "name": "迪力夏提·阿不拉",
      "entry_year": "2024",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "视觉"
          ]
        }
      ]
    },
    {
      "name": "郑暄",
      "entry_year": "2024",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "飞手"
          ]
        },
        {
          "project": "精准打击",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "飞手"
          ]
        }
      ]
    },
    {
      "name": "郑锦睿",
      "entry_year": "2026",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "钟亮",
      "entry_year": "2024",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "钟志磊",
      "entry_year": "2024",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2024",
          "leader": false,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "陆涵飞",
      "entry_year": "2025",
      "projects": [
        {
          "project": "三项全能",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "飞手"
          ]
        },
        {
          "project": "微型折叠飞行器",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "飞手",
            "机械"
          ]
        },
        {
          "project": "精准打击",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "飞手"
          ]
        }
      ]
    },
    {
      "name": "陈俊宇",
      "entry_year": "2026",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "机械",
            "飞手"
          ]
        }
      ]
    },
    {
      "name": "陈熙宇",
      "avatar": "assets/images/成员/chenxiyu.jpg",
      "entry_year": "2026",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2026",
          "leader": true,
          "departments": [
            "电控",
            "飞手"
          ]
        }
      ]
    },
    {
      "name": "陶雪莲",
      "entry_year": "2025",
      "projects": [
        {
          "project": "微型折叠飞行器",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "电控"
          ]
        }
      ]
    },
    {
      "name": "顾祺炜",
      "entry_year": "2025",
      "projects": [
        {
          "project": "模拟搜救",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "机械",
            "飞手"
          ]
        }
      ]
    },
    {
      "name": "黄永宁",
      "entry_year": "2025",
      "projects": [
        {
          "project": "三项全能",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "机械"
          ]
        },
        {
          "project": "模拟搜救",
          "cohort": "2025",
          "leader": true,
          "departments": [
            "机械"
          ]
        }
      ]
    },
    {
      "name": "黄铭扬",
      "entry_year": "2025",
      "projects": [
        {
          "project": "三项全能",
          "cohort": "2026",
          "leader": false,
          "departments": [
            "电控"
          ]
        },
        {
          "project": "模拟搜救",
          "cohort": "2025",
          "leader": false,
          "departments": [
            "电控"
          ]
        }
      ]
    }
  ]
};
