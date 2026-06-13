import {
  CheckCircle2,
  ClockAlert,
  CloudCheck,
  ListTodo,
  MessageCircleQuestion,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert
} from "lucide-react";

export const STATUS_PILL_MATRIX = {
  idle: {
    label: "待输入",
    tone: "neutral",
    icon: ListTodo
  },
  loading: {
    label: "生成中",
    tone: "active",
    icon: Sparkles
  },
  ready: {
    label: "可执行",
    tone: "primary",
    icon: Play
  },
  executing: {
    label: "执行中",
    tone: "primaryStrong",
    icon: Play
  },
  clarifying: {
    label: "待补充",
    tone: "info",
    icon: MessageCircleQuestion
  },
  completionConfirmation: {
    label: "待确认",
    tone: "warning",
    icon: CheckCircle2
  },
  closingChecklist: {
    label: "待检查",
    tone: "warning",
    icon: CheckCircle2
  },
  fallback: {
    label: "低阻力版本",
    tone: "recovery",
    icon: RefreshCw
  },
  reEntry: {
    label: "入口已保留",
    tone: "warning",
    icon: RefreshCw
  },
  completed: {
    label: "已完成",
    tone: "success",
    icon: CheckCircle2
  },
  exited: {
    label: "已退出",
    tone: "neutral",
    icon: ListTodo
  },
  error: {
    label: "生成失败",
    tone: "error",
    icon: TriangleAlert
  },
  timeout: {
    label: "响应超时",
    tone: "warning",
    icon: ClockAlert
  },
  localFallback: {
    label: "本地 fallback",
    tone: "recovery",
    icon: ShieldCheck
  },
  aiGenerated: {
    label: "AI 返回",
    tone: "active",
    icon: Sparkles
  },
  autosaved: {
    label: "自动保存",
    tone: "neutral",
    icon: CloudCheck
  }
};

const STATUS_PILL_ALIASES = {
  paused: "reEntry"
};

export function getStatusPillMeta(status, overrides = {}) {
  const normalizedStatus = String(status || "idle");
  const matrixKey = STATUS_PILL_ALIASES[normalizedStatus] || normalizedStatus;
  const meta = STATUS_PILL_MATRIX[matrixKey] || STATUS_PILL_MATRIX.idle;
  const cleanOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value !== undefined)
  );

  return {
    key: matrixKey,
    ...meta,
    ...cleanOverrides
  };
}

function StatusPill({
  as: Component = "span",
  className = "",
  label,
  showIcon = true,
  size = "md",
  status,
  tone
}) {
  const meta = getStatusPillMeta(status, {
    label: label || undefined,
    tone: tone || undefined
  });
  const Icon = meta.icon;
  const classNames = [
    "status-pill",
    `status-pill--${meta.tone}`,
    `status-pill--${size}`,
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classNames}>
      {showIcon && Icon && (
        <Icon aria-hidden="true" className="pill-icon" size={14} />
      )}
      {meta.label}
    </Component>
  );
}

export default StatusPill;
