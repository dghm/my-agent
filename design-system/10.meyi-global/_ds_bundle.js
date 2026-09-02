/* @ds-bundle: {"format":4,"namespace":"MeyiGlobalDesignSystem_830a18","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Tag","sourcePath":"components/display/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"5d795e0166ca","components/actions/IconButton.jsx":"da91c606683c","components/display/Badge.jsx":"d62decb633c7","components/display/Card.jsx":"08496bf6a2b1","components/display/Tag.jsx":"e032fb665cf3","components/feedback/Dialog.jsx":"89e23a1acd36","components/feedback/Toast.jsx":"f7682c501da3","components/feedback/Tooltip.jsx":"8a41edafe36a","components/forms/Checkbox.jsx":"e72a28dec34d","components/forms/Input.jsx":"0e66c1d9716e","components/forms/Radio.jsx":"be5c770f0a40","components/forms/Select.jsx":"be1b087aec2e","components/forms/Switch.jsx":"9488de4aabc5","components/navigation/Tabs.jsx":"6735d3c48941","ui_kits/website/ContactScreen.jsx":"143b4c036d2d","ui_kits/website/HomeScreen.jsx":"2b559a1b41b8","ui_kits/website/ServicesScreen.jsx":"e8598d6148bc","ui_kits/website/SiteChrome.jsx":"d6b495341615"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MeyiGlobalDesignSystem_830a18 = window.MeyiGlobalDesignSystem_830a18 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
const {
  useState
} = React;
const sizes = {
  sm: {
    height: 28,
    padding: "0 12px",
    fontSize: 12
  },
  md: {
    height: 36,
    padding: "0 16px",
    fontSize: 13
  },
  lg: {
    height: 44,
    padding: "0 22px",
    fontSize: 14
  }
};
const variants = {
  primary: {
    base: {
      background: "var(--accent)",
      color: "var(--accent-contrast)",
      border: "1px solid var(--accent)"
    },
    hover: {
      background: "var(--accent-hover)",
      borderColor: "var(--accent-hover)"
    }
  },
  secondary: {
    base: {
      background: "var(--white)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-strong)"
    },
    hover: {
      background: "var(--gray-50)"
    }
  },
  ghost: {
    base: {
      background: "transparent",
      color: "var(--text-primary)",
      border: "1px solid transparent"
    },
    hover: {
      background: "var(--gray-50)"
    }
  },
  inverse: {
    base: {
      background: "var(--white)",
      color: "var(--text-primary)",
      border: "1px solid var(--white)"
    },
    hover: {
      background: "var(--gray-100)",
      borderColor: "var(--gray-100)"
    }
  }
};
function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button"
}) {
  const [hover, setHover] = useState(false);
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      whiteSpace: "nowrap",
      fontFamily: "var(--font-body)",
      fontWeight: 600,
      letterSpacing: "0.01em",
      borderRadius: "var(--radius-sm)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      width: fullWidth ? "100%" : undefined,
      transition: "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)",
      ...s,
      ...v.base,
      ...(hover && !disabled ? v.hover : {})
    }
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
const {
  useState
} = React;
const dims = {
  sm: 28,
  md: 36,
  lg: 44
};
function IconButton({
  children,
  size = "md",
  variant = "ghost",
  disabled = false,
  label,
  onClick
}) {
  const [hover, setHover] = useState(false);
  const d = dims[size] || dims.md;
  const solid = variant === "primary";
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: d,
      height: d,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: solid ? hover && !disabled ? "var(--accent-hover)" : "var(--accent)" : hover && !disabled ? "var(--gray-50)" : "transparent",
      color: solid ? "var(--accent-contrast)" : "var(--text-primary)",
      border: variant === "secondary" ? "1px solid var(--border-strong)" : "1px solid transparent",
      borderRadius: "var(--radius-sm)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: "background var(--duration-fast) var(--ease-standard)"
    }
  }, children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
const tones = {
  neutral: {
    background: "var(--gray-100)",
    color: "var(--text-primary)"
  },
  inverse: {
    background: "var(--ink)",
    color: "var(--white)"
  },
  outline: {
    background: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border-strong)"
  },
  success: {
    background: "var(--status-success)",
    color: "var(--white)"
  },
  warning: {
    background: "var(--status-warning)",
    color: "var(--white)"
  },
  danger: {
    background: "var(--status-danger)",
    color: "var(--white)"
  }
};
function Badge({
  children,
  tone = "neutral"
}) {
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      height: 20,
      padding: "0 8px",
      whiteSpace: "nowrap",
      fontFamily: "var(--font-body)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      borderRadius: "var(--radius-pill)",
      border: "1px solid transparent",
      ...t
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
function Card({
  children,
  padding = "lg",
  inverse = false,
  title,
  eyebrow
}) {
  const pad = {
    sm: 16,
    md: 24,
    lg: 32
  }[padding] || 32;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: inverse ? "var(--surface-inverse)" : "var(--surface-card)",
      color: inverse ? "var(--text-inverse)" : "var(--text-primary)",
      border: inverse ? "1px solid var(--surface-inverse)" : "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      padding: pad,
      fontFamily: "var(--font-body)",
      boxShadow: "var(--shadow-card)"
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "var(--tracking-wide)",
      textTransform: "uppercase",
      color: inverse ? "var(--text-inverse-secondary)" : "var(--text-muted)",
      marginBottom: 10
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: "var(--tracking-tight)",
      marginBottom: 8
    }
  }, title), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/Tag.jsx
try { (() => {
const {
  useState
} = React;
function Tag({
  children,
  onRemove,
  active = false,
  onClick
}) {
  const [hover, setHover] = useState(false);
  const interactive = !!onClick;
  return /*#__PURE__*/React.createElement("span", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: 28,
      padding: "0 10px",
      whiteSpace: "nowrap",
      fontFamily: "var(--font-body)",
      fontSize: 13,
      fontWeight: 500,
      background: active ? "var(--accent)" : hover && interactive ? "var(--gray-50)" : "var(--white)",
      color: active ? "var(--accent-contrast)" : "var(--text-primary)",
      border: `1px solid ${active ? "var(--accent)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-sm)",
      cursor: interactive ? "pointer" : "default",
      transition: "background var(--duration-fast) var(--ease-standard)"
    }
  }, children, onRemove && /*#__PURE__*/React.createElement("svg", {
    onClick: e => {
      e.stopPropagation();
      onRemove();
    },
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    style: {
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  })));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function Dialog({
  open = false,
  title,
  children,
  onClose,
  primaryAction,
  secondaryAction,
  width = 440
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    },
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(10,10,10,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    style: {
      width,
      maxWidth: "calc(100vw - 48px)",
      background: "var(--white)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-overlay)",
      padding: 32,
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: "var(--tracking-tight)"
    }
  }, title), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 4,
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontSize: 14,
      lineHeight: "var(--leading-normal)",
      color: "var(--text-secondary)"
    }
  }, children), (primaryAction || secondaryAction) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      marginTop: 28
    }
  }, secondaryAction && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    onClick: secondaryAction.onClick
  }, secondaryAction.label), primaryAction && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    onClick: primaryAction.onClick
  }, primaryAction.label))));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function Toast({
  message,
  tone = "neutral",
  action,
  visible = true
}) {
  if (!visible) return null;
  const bar = {
    success: "var(--status-success)",
    warning: "var(--status-warning)",
    danger: "var(--status-danger)"
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 16,
      background: "var(--ink)",
      color: "var(--white)",
      padding: "12px 16px",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-overlay)",
      fontFamily: "var(--font-body)",
      fontSize: 14,
      borderLeft: bar ? `3px solid ${bar}` : "3px solid transparent"
    }
  }, /*#__PURE__*/React.createElement("span", null, message), action && /*#__PURE__*/React.createElement("button", {
    onClick: action.onClick,
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      fontFamily: "inherit",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--white)",
      textDecoration: "underline",
      textUnderlineOffset: 3
    }
  }, action.label));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
const {
  useState
} = React;
function Tooltip({
  label,
  children,
  side = "top"
}) {
  const [show, setShow] = useState(false);
  const pos = {
    top: {
      bottom: "100%",
      left: "50%",
      transform: "translate(-50%, -6px)"
    },
    bottom: {
      top: "100%",
      left: "50%",
      transform: "translate(-50%, 6px)"
    },
    left: {
      right: "100%",
      top: "50%",
      transform: "translate(-6px, -50%)"
    },
    right: {
      left: "100%",
      top: "50%",
      transform: "translate(6px, -50%)"
    }
  }[side];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex"
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false)
  }, children, show && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      whiteSpace: "nowrap",
      zIndex: 50,
      ...pos,
      background: "var(--black)",
      color: "var(--white)",
      fontFamily: "var(--font-body)",
      fontSize: 12,
      fontWeight: 500,
      padding: "5px 8px",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--shadow-overlay)",
      pointerEvents: "none"
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "var(--font-body)",
      opacity: disabled ? 0.4 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "checkbox",
    "aria-checked": checked,
    tabIndex: disabled ? -1 : 0,
    onClick: () => !disabled && onChange && onChange(!checked),
    onKeyDown: e => {
      if ((e.key === " " || e.key === "Enter") && !disabled) {
        e.preventDefault();
        onChange && onChange(!checked);
      }
    },
    style: {
      width: 18,
      height: 18,
      flex: "0 0 auto",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: checked ? "var(--accent)" : "var(--white)",
      border: `1px solid ${checked ? "var(--accent)" : "var(--gray-400)"}`,
      borderRadius: "var(--radius-sm)",
      transition: "background var(--duration-fast) var(--ease-standard)"
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "white",
    strokeWidth: "3"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m5 13 4 4L19 7"
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
const {
  useState
} = React;
function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  hint,
  error,
  disabled = false,
  size = "md"
}) {
  const [focus, setFocus] = useState(false);
  const h = size === "sm" ? 32 : 40;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontFamily: "var(--font-body)"
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 13,
      fontWeight: 500,
      marginBottom: 6,
      color: "var(--text-primary)"
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: value,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      boxSizing: "border-box",
      height: h,
      padding: "0 12px",
      fontFamily: "var(--font-body)",
      fontSize: 14,
      color: "var(--text-primary)",
      background: disabled ? "var(--gray-50)" : "var(--white)",
      border: `1px solid ${error ? "var(--status-danger)" : focus ? "var(--border-strong)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-sm)",
      outline: "none",
      boxShadow: focus ? "0 0 0 3px var(--focus-ring)" : "none",
      transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)"
    }
  }), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 12,
      marginTop: 6,
      color: error ? "var(--status-danger)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function Radio({
  label,
  checked = false,
  onChange,
  disabled = false,
  name
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "var(--font-body)",
      opacity: disabled ? 0.4 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "radio",
    "aria-checked": checked,
    "data-name": name,
    tabIndex: disabled ? -1 : 0,
    onClick: () => !disabled && onChange && onChange(true),
    onKeyDown: e => {
      if ((e.key === " " || e.key === "Enter") && !disabled) {
        e.preventDefault();
        onChange && onChange(true);
      }
    },
    style: {
      width: 18,
      height: 18,
      flex: "0 0 auto",
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: `1px solid ${checked ? "var(--accent)" : "var(--gray-400)"}`,
      background: "var(--white)",
      transition: "border-color var(--duration-fast) var(--ease-standard)"
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: "var(--accent)"
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
const {
  useState
} = React;
function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false
}) {
  const [focus, setFocus] = useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontFamily: "var(--font-body)"
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 13,
      fontWeight: 500,
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: value ?? "",
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      height: 40,
      padding: "0 36px 0 12px",
      appearance: "none",
      fontFamily: "var(--font-body)",
      fontSize: 14,
      color: value ? "var(--text-primary)" : "var(--text-muted)",
      background: disabled ? "var(--gray-50)" : "var(--white)",
      border: `1px solid ${focus ? "var(--border-strong)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-sm)",
      outline: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: focus ? "0 0 0 3px var(--focus-ring)" : "none"
    }
  }, placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => {
    const opt = typeof o === "string" ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  label,
  checked = false,
  onChange,
  disabled = false
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "var(--font-body)",
      opacity: disabled ? 0.4 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "switch",
    "aria-checked": checked,
    tabIndex: disabled ? -1 : 0,
    onClick: () => !disabled && onChange && onChange(!checked),
    onKeyDown: e => {
      if ((e.key === " " || e.key === "Enter") && !disabled) {
        e.preventDefault();
        onChange && onChange(!checked);
      }
    },
    style: {
      width: 36,
      height: 20,
      flex: "0 0 auto",
      borderRadius: "var(--radius-pill)",
      position: "relative",
      background: checked ? "var(--accent)" : "var(--gray-300)",
      transition: "background var(--duration-normal) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: checked ? 18 : 2,
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: "var(--white)",
      transition: "left var(--duration-normal) var(--ease-standard)"
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
const {
  useState
} = React;
function Tabs({
  tabs = [],
  value,
  onChange,
  defaultValue
}) {
  const [internal, setInternal] = useState(defaultValue ?? (tabs[0] && (typeof tabs[0] === "string" ? tabs[0] : tabs[0].value)));
  const current = value ?? internal;
  const set = v => {
    setInternal(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "flex",
      gap: 24,
      borderBottom: "1px solid var(--border-default)",
      fontFamily: "var(--font-body)"
    }
  }, tabs.map(t => {
    const tab = typeof t === "string" ? {
      value: t,
      label: t
    } : t;
    const active = tab.value === current;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.value,
      role: "tab",
      "aria-selected": active,
      onClick: () => set(tab.value),
      style: {
        background: "none",
        border: "none",
        padding: "10px 2px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        borderBottom: `2px solid ${active ? "var(--border-strong)" : "transparent"}`,
        marginBottom: -1,
        transition: "color var(--duration-fast) var(--ease-standard)"
      }
    }, tab.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ContactScreen.jsx
try { (() => {
const DSContact = window.MeyiGlobalDesignSystem_830a18;
function ContactScreen() {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    region: "",
    message: "",
    subscribe: false
  });
  const [sent, setSent] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const set = k => v => setForm(f => ({
    ...f,
    [k]: v
  }));
  const submit = () => {
    const e = {};
    if (!form.name) e.name = "Required";
    if (!form.email) e.email = "Required";
    setErrors(e);
    if (Object.keys(e).length === 0) setSent(true);
  };
  return /*#__PURE__*/React.createElement("main", {
    style: {
      background: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "72px 32px 96px",
      display: "grid",
      gridTemplateColumns: "1fr 1.2fr",
      gap: 64
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "var(--tracking-wide)",
      color: "var(--text-muted)"
    }
  }, "CONTACT"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "16px 0 20px",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 700,
      letterSpacing: "var(--tracking-tight)"
    }
  }, "Talk to us."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-body)",
      fontSize: 15,
      lineHeight: "var(--leading-normal)",
      color: "var(--text-secondary)",
      maxWidth: 380
    }
  }, "We reply within two business days. For urgent shipments, mark your message accordingly."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--text-secondary)",
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, "info@meyiglobal.com"), /*#__PURE__*/React.createElement("span", null, "Taipei, Taiwan \xB7 GMT+8"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(DSContact.Input, {
    label: "Name",
    value: form.name,
    onChange: set("name"),
    error: errors.name
  }), /*#__PURE__*/React.createElement(DSContact.Input, {
    label: "Email",
    type: "email",
    value: form.email,
    onChange: set("email"),
    error: errors.email
  })), /*#__PURE__*/React.createElement(DSContact.Select, {
    label: "Region",
    placeholder: "Choose\u2026",
    options: ["Asia Pacific", "Europe", "Americas", "Other"],
    value: form.region,
    onChange: set("region")
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 13,
      fontWeight: 500,
      marginBottom: 6
    }
  }, "Message"), /*#__PURE__*/React.createElement("textarea", {
    rows: "5",
    value: form.message,
    onChange: e => set("message")(e.target.value),
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: 12,
      fontFamily: "var(--font-body)",
      fontSize: 14,
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      outline: "none",
      resize: "vertical"
    }
  })), /*#__PURE__*/React.createElement(DSContact.Checkbox, {
    label: "Subscribe to trade updates",
    checked: form.subscribe,
    onChange: set("subscribe")
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(DSContact.Button, {
    size: "lg",
    onClick: submit
  }, "Send message")))), /*#__PURE__*/React.createElement(DSContact.Dialog, {
    open: sent,
    title: "Message sent",
    onClose: () => setSent(false),
    primaryAction: {
      label: "Done",
      onClick: () => setSent(false)
    }
  }, "Thank you \u2014 we'll be in touch within two business days."));
}
Object.assign(window, {
  ContactScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ContactScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HomeScreen.jsx
try { (() => {
const DSHome = window.MeyiGlobalDesignSystem_830a18;
function HomeScreen({
  onNav
}) {
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--ink)",
      color: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "112px 32px 96px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "var(--tracking-wide)",
      color: "var(--text-inverse-secondary)"
    }
  }, "GLOBAL TRADE \xB7 \u74B0\u7403\u8CBF\u6613"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "20px 0 0",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-4xl)",
      fontWeight: 700,
      letterSpacing: "var(--tracking-tight)",
      lineHeight: "var(--leading-tight)",
      maxWidth: 720
    }
  }, "Precision across borders."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "24px 0 0",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-md)",
      lineHeight: "var(--leading-normal)",
      color: "var(--text-inverse-secondary)",
      maxWidth: 520
    }
  }, "Meyi Global connects manufacturers and markets \u2014 sourcing, logistics and trade services managed end to end."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 40
    }
  }, /*#__PURE__*/React.createElement(DSHome.Button, {
    variant: "inverse",
    size: "lg",
    onClick: () => onNav("Contact")
  }, "Get in touch"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav("Services");
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      height: 44,
      padding: "0 22px",
      whiteSpace: "nowrap",
      fontFamily: "var(--font-body)",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--white)",
      textDecoration: "none",
      border: "1px solid var(--border-inverse)",
      borderRadius: "var(--radius-sm)"
    }
  }, "Our services")))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "96px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "var(--tracking-wide)",
      color: "var(--text-muted)"
    }
  }, "WHAT WE DO"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "14px 0 40px",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-2xl)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-tight)"
    }
  }, "Services"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 16
    }
  }, [["01", "Global sourcing", "Supplier discovery, qualification and negotiation across Asia-Pacific manufacturing hubs."], ["02", "Trade logistics", "Sea and air freight coordination, customs and documentation handled in one thread."], ["03", "Market entry", "Distribution partnerships and compliance groundwork for new territories."]].map(([n, t, d]) => /*#__PURE__*/React.createElement(DSHome.Card, {
    key: n,
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--text-muted)"
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: "var(--tracking-tight)",
      margin: "12px 0 8px"
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-body)",
      fontSize: 14,
      lineHeight: "var(--leading-normal)",
      color: "var(--text-secondary)"
    }
  }, d)))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--gray-50)",
      borderTop: "1px solid var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "72px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 32,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-xl)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-tight)"
    }
  }, "Start a conversation."), /*#__PURE__*/React.createElement(DSHome.Button, {
    size: "lg",
    onClick: () => onNav("Contact")
  }, "Contact us"))));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ServicesScreen.jsx
try { (() => {
const DSServices = window.MeyiGlobalDesignSystem_830a18;
function ServicesScreen({
  onNav
}) {
  const [tab, setTab] = React.useState("Sourcing");
  const content = {
    Sourcing: {
      title: "Global sourcing",
      body: "Supplier discovery, factory qualification and price negotiation across Asia-Pacific manufacturing hubs. We manage sampling, QC checkpoints and production timelines on your behalf.",
      points: ["Supplier audits", "Sample management", "Production QC"]
    },
    Logistics: {
      title: "Trade logistics",
      body: "Sea and air freight coordination with customs clearance and full documentation handled in a single thread — one contact from factory gate to destination port.",
      points: ["Sea & air freight", "Customs & documentation", "Door-to-door tracking"]
    },
    "Market entry": {
      title: "Market entry",
      body: "Distribution partnerships, regulatory compliance and go-to-market groundwork for brands entering new territories.",
      points: ["Distributor matching", "Compliance review", "Localization support"]
    }
  };
  const c = content[tab];
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--white)",
      borderBottom: "1px solid var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "72px 32px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "var(--tracking-wide)",
      color: "var(--text-muted)"
    }
  }, "SERVICES"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "16px 0 32px",
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 700,
      letterSpacing: "var(--tracking-tight)"
    }
  }, "What we do"), /*#__PURE__*/React.createElement(DSServices.Tabs, {
    tabs: Object.keys(content),
    value: tab,
    onChange: setTab
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "56px 32px 96px",
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr",
      gap: 48
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-xl)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-tight)"
    }
  }, c.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "16px 0 24px",
      fontFamily: "var(--font-body)",
      fontSize: 15,
      lineHeight: "var(--leading-normal)",
      color: "var(--text-secondary)",
      maxWidth: 560
    }
  }, c.body), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, c.points.map(p => /*#__PURE__*/React.createElement(DSServices.Tag, {
    key: p
  }, p)))), /*#__PURE__*/React.createElement(DSServices.Card, {
    inverse: true,
    padding: "lg",
    eyebrow: "Next step",
    title: "Scope your project"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 20px",
      fontFamily: "var(--font-body)",
      fontSize: 14,
      lineHeight: "var(--leading-normal)",
      color: "var(--text-inverse-secondary)"
    }
  }, "Tell us what you're sourcing or shipping and we'll reply within two business days."), /*#__PURE__*/React.createElement(DSServices.Button, {
    variant: "inverse",
    onClick: () => onNav("Contact")
  }, "Contact us")))));
}
Object.assign(window, {
  ServicesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ServicesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/SiteChrome.jsx
try { (() => {
const DS = window.MeyiGlobalDesignSystem_830a18;
function SiteHeader({
  page,
  onNav
}) {
  const items = ["Home", "Services", "Contact"];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 40,
      background: "var(--white)",
      borderBottom: "1px solid var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "0 32px",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav("Home");
    },
    style: {
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/meyi-logo-black.svg",
    alt: "Meyi Global",
    style: {
      height: 22
    }
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 32
    }
  }, items.map(it => /*#__PURE__*/React.createElement("a", {
    key: it,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav(it);
    },
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12,
      fontWeight: page === it ? 600 : 500,
      letterSpacing: "var(--tracking-wide)",
      textTransform: "uppercase",
      textDecoration: "none",
      color: page === it ? "var(--text-primary)" : "var(--text-secondary)",
      borderBottom: `2px solid ${page === it ? "var(--border-strong)" : "transparent"}`,
      paddingBottom: 2
    }
  }, it)), /*#__PURE__*/React.createElement(DS.Button, {
    size: "sm",
    onClick: () => onNav("Contact")
  }, "Get in touch"))));
}
function SiteFooter({
  onNav
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--black)",
      color: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "64px 32px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 48,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/meyi-logo-white.svg",
    alt: "Meyi Global",
    style: {
      height: 26
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 64
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: "var(--tracking-wide)",
      color: "rgba(255,255,255,.5)",
      fontFamily: "var(--font-body)"
    }
  }, "COMPANY"), ["Home", "Services", "Contact"].map(it => /*#__PURE__*/React.createElement("a", {
    key: it,
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav(it);
    },
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 13,
      color: "rgba(255,255,255,.72)",
      textDecoration: "none"
    }
  }, it))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      fontFamily: "var(--font-body)",
      fontSize: 13,
      color: "rgba(255,255,255,.72)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: "var(--tracking-wide)",
      color: "rgba(255,255,255,.5)"
    }
  }, "CONTACT"), /*#__PURE__*/React.createElement("span", null, "info@meyiglobal.com"), /*#__PURE__*/React.createElement("span", null, "Taipei, Taiwan")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 48,
      paddingTop: 20,
      borderTop: "1px solid var(--border-inverse)",
      fontFamily: "var(--font-body)",
      fontSize: 12,
      color: "rgba(255,255,255,.45)"
    }
  }, "\xA9 2026 Meyi Global Co., Ltd \u2014 MEYI GLOBAL COMPANY LIMITED")));
}
Object.assign(window, {
  SiteHeader,
  SiteFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/SiteChrome.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
