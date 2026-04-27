export const RESISTANCE_TEMPLATE_LIBRARY = [
  {
    id: "communication.reply_authority.safe_draft",
    task_patterns: ["回老师", "回复老师", "老师", "导师", "领导", "老板", "客户"],
    step_patterns: ["回复", "消息", "聊天", "同步", "联系"],
    recovery_mode: "safe_draft",
    root_causes: ["emotional_pressure", "social_pressure"],
    forbidden_actions: ["open_chat", "send_message", "contact_person"],
    priority: 92,
    step: {
      step_text: "先不要打开聊天框，在备忘录里写一句：您好，我想和您同步一下目前进度。",
      action_type: "write",
      completion_criteria: "只要写出这一句话即可，不需要发送。",
      stage: "start",
      risk_flags: ["social_pressure", "emotional_pressure"]
    }
  },
  {
    id: "communication.apology.safe_draft",
    task_patterns: ["道歉", "抱歉", "对不起"],
    step_patterns: ["道歉", "解释"],
    utterance_patterns: ["尴尬", "怕", "不敢", "被骂"],
    recovery_mode: "safe_draft",
    root_causes: ["emotional_pressure", "social_pressure"],
    forbidden_actions: ["open_chat", "send_message", "contact_person"],
    priority: 96,
    step: {
      step_text: "先不要发送，在备忘录里写一句：我想先承认这件事给你带来的影响。",
      action_type: "write",
      completion_criteria: "只要写出这一句私密草稿即可，不需要发送。",
      stage: "start",
      risk_flags: ["social_pressure", "emotional_pressure"]
    }
  },
  {
    id: "communication.leave_request.safe_draft",
    task_patterns: ["请假", "无法按时", "来不了"],
    step_patterns: ["请假", "说明原因", "联系领导"],
    recovery_mode: "safe_draft",
    root_causes: ["emotional_pressure", "social_pressure"],
    forbidden_actions: ["open_chat", "send_message", "contact_person"],
    priority: 96,
    step: {
      step_text: "先不要打开微信，在备忘录里写一句：我想说明一下今天无法按时处理的原因。",
      action_type: "write",
      completion_criteria: "只要写出这一句私密草稿即可，不需要发送。",
      stage: "start",
      risk_flags: ["social_pressure", "emotional_pressure"]
    }
  },
  {
    id: "communication.refusal.safe_draft",
    task_patterns: ["拒绝", "不答应", "没法答应"],
    step_patterns: ["拒绝", "回复", "消息"],
    recovery_mode: "safe_draft",
    root_causes: ["emotional_pressure", "social_pressure"],
    forbidden_actions: ["open_chat", "send_message", "contact_person"],
    priority: 96,
    step: {
      step_text: "先不要联系对方，在备忘录里写一句：这件事我可能没法答应，但我想认真回复你。",
      action_type: "write",
      completion_criteria: "只要写出这一句私密草稿即可，不需要发送。",
      stage: "start",
      risk_flags: ["social_pressure", "emotional_pressure"]
    }
  },
  {
    id: "communication.payment_or_materials.safe_draft",
    task_patterns: ["催款", "还钱", "催材料", "催进度", "催朋友"],
    step_patterns: ["催", "确认", "推进"],
    utterance_patterns: ["小气", "尴尬", "怕"],
    recovery_mode: "safe_draft",
    root_causes: ["emotional_pressure", "social_pressure"],
    forbidden_actions: ["open_chat", "send_message", "contact_person"],
    priority: 95,
    step: {
      step_text: "先不要发消息，在备忘录里写一句：我想确认一下这件事现在方便推进到哪一步。",
      action_type: "write",
      completion_criteria: "只要写出这一句私密草稿即可，不需要发送。",
      stage: "start",
      risk_flags: ["social_pressure", "emotional_pressure"]
    }
  },
  {
    id: "cognitive.paper_discussion.clarify_standard",
    task_patterns: ["论文", "开题", "综述", "论文讨论"],
    step_patterns: ["数据", "讨论", "分析", "结果"],
    utterance_patterns: ["不知道", "说明什么", "没思路"],
    recovery_mode: "clarify_standard",
    root_causes: ["unclear_output"],
    forbidden_actions: ["open_more_materials"],
    priority: 92,
    step: {
      step_text: "先写下一个小问题：这组数据最可能支持或反驳哪一个判断？",
      action_type: "write",
      completion_criteria: "只要写出这一个判断问题即可，不继续写正文。",
      stage: "clarify",
      risk_flags: ["unclear_output"]
    }
  },
  {
    id: "cognitive.graduation_project.clarify_standard",
    task_patterns: ["毕业设计", "毕业项目", "毕设"],
    step_patterns: ["规划", "下手", "方案", "项目"],
    recovery_mode: "clarify_standard",
    root_causes: ["unclear_output", "too_large"],
    forbidden_actions: ["open_more_materials"],
    priority: 90,
    step: {
      step_text: "先写下一个判断入口：这个毕业项目最先需要证明哪一个功能能跑通？",
      action_type: "write",
      completion_criteria: "只要写出 1 个最先验证的功能即可，不开始做实现。",
      stage: "clarify",
      risk_flags: ["unclear_output", "too_large"]
    }
  },
  {
    id: "cognitive.internship_filter.clarify_standard",
    task_patterns: ["找实习", "岗位", "实习", "投递"],
    step_patterns: ["岗位", "投递", "筛选", "浏览"],
    utterance_patterns: ["越看越乱", "能投什么", "不知道"],
    recovery_mode: "clarify_standard",
    root_causes: ["unclear_output"],
    forbidden_actions: ["open_more_materials", "submit_application"],
    priority: 92,
    step: {
      step_text: "先写下一个筛选条件：这个岗位是否要求我已经具备的一个能力？",
      action_type: "write",
      completion_criteria: "只要写出这 1 个筛选条件即可，不继续浏览岗位。",
      stage: "clarify",
      risk_flags: ["unclear_output", "value_uncertainty"]
    }
  },
  {
    id: "cognitive.interview_prep.clarify_standard",
    task_patterns: ["面试", "准备面试"],
    step_patterns: ["项目", "回答", "准备"],
    utterance_patterns: ["想听什么", "不知道"],
    recovery_mode: "clarify_standard",
    root_causes: ["unclear_output"],
    forbidden_actions: ["open_more_materials"],
    priority: 92,
    step: {
      step_text: "先写下一个判断标准：面试官听这个项目时最想确认哪一种能力？",
      action_type: "write",
      completion_criteria: "只要写出 1 种能力即可，不继续准备完整回答。",
      stage: "clarify",
      risk_flags: ["unclear_output", "social_pressure"]
    }
  },
  {
    id: "cognitive.portfolio_project_select.clarify_standard",
    task_patterns: ["作品集", "项目选择", "做作品集"],
    step_patterns: ["项目", "选择", "拿得出手"],
    utterance_patterns: ["拿得出手", "不知道哪个", "不知道"],
    recovery_mode: "clarify_standard",
    root_causes: ["unclear_output", "perfectionism"],
    forbidden_actions: ["open_more_materials"],
    priority: 92,
    step: {
      step_text: "先写下一个选择标准：这个项目最能证明我的哪一种能力？",
      action_type: "write",
      completion_criteria: "只要写出 1 种能力即可，不继续筛项目。",
      stage: "clarify",
      risk_flags: ["unclear_output", "perfectionism"]
    }
  },
  {
    id: "exposure.resume.low_quality_draft",
    task_patterns: ["简历", "项目经历"],
    step_patterns: ["简历", "经历", "项目"],
    utterance_patterns: ["普通", "不够好", "拿不出手"],
    recovery_mode: "low_quality_draft",
    root_causes: ["perfectionism"],
    forbidden_actions: ["optimize", "check_quality"],
    priority: 94,
    step: {
      step_text: "先写一版 60 分项目经历，只写“我做了什么”，不改措辞。",
      action_type: "write",
      completion_criteria: "只要写出 1 句 60 分版本即可，不优化、不检查。",
      stage: "execute",
      risk_flags: ["perfectionism"]
    }
  },
  {
    id: "exposure.presentation.low_quality_draft",
    task_patterns: ["PPT", "ppt", "汇报", "幻灯片"],
    step_patterns: ["结构", "页面", "标题", "汇报"],
    utterance_patterns: ["完美", "做了也白做", "不够好"],
    recovery_mode: "low_quality_draft",
    root_causes: ["perfectionism"],
    forbidden_actions: ["optimize", "check_quality", "polish"],
    priority: 94,
    step: {
      step_text: "先做一个粗糙占位页，只写标题，不排版。",
      action_type: "write",
      completion_criteria: "只要留下 1 个占位标题即可，不优化、不检查。",
      stage: "execute",
      risk_flags: ["perfectionism"]
    }
  },
  {
    id: "exposure.public_post.safe_draft",
    task_patterns: ["发作品", "发朋友圈", "公开发布", "发布", "朋友圈"],
    step_patterns: ["发布", "发送", "发朋友圈"],
    utterance_patterns: ["别人觉得", "装", "被评价", "怕"],
    recovery_mode: "safe_draft",
    root_causes: ["emotional_pressure", "social_pressure", "perfectionism"],
    forbidden_actions: ["publish", "send_message"],
    priority: 95,
    step: {
      step_text: "先把内容放进草稿区或备忘录，不发布，只保留一个 60 分版本。",
      action_type: "write",
      completion_criteria: "只要保留草稿即可，不发布、不发送。",
      stage: "start",
      risk_flags: ["social_pressure", "perfectionism"]
    }
  },
  {
    id: "state.physical_low_energy.pause_and_resume",
    task_patterns: ["健身", "学习", "整理", "运动", "打扫", "写"],
    utterance_patterns: ["累", "困", "头疼", "胃不舒服", "没电", "站不起来", "崩溃", "难受"],
    recovery_mode: "pause_and_resume",
    root_causes: ["physical_low_energy"],
    forbidden_actions: ["stand_up", "go_out", "exercise", "continue_screen"],
    priority: 98,
    step: {
      step_text: "先暂停这一步，把当前入口保留下来；等状态恢复后，再回到原来的入口。",
      action_type: "decide",
      completion_criteria: "只要允许自己暂停即可，不站起来、不看屏幕、不继续任务。",
      stage: "start",
      risk_flags: ["physical_low_energy"]
    }
  },
  {
    id: "value.long_term_goal.value_check",
    task_patterns: ["考研", "找实习", "学习编程", "长期学习", "长期项目", "减脂", "减脂计划"],
    utterance_patterns: ["没希望", "骗自己", "白费", "值不值得", "继续有什么用", "没天赋"],
    recovery_mode: "value_check",
    root_causes: ["value_uncertainty"],
    forbidden_actions: ["continue_execution", "practice_more", "submit_application", "contact_user", "record_data"],
    priority: 98,
    step: {
      step_text: "先不推进任务，写下：继续这件事还值得的 1 个理由，以及暂停 24 小时也可以接受的 1 个理由。",
      action_type: "write",
      completion_criteria: "各写 1 句即可，不刷题、不投递、不继续执行。",
      stage: "clarify",
      risk_flags: ["value_uncertainty"]
    }
  }
];
