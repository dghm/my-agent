/* @ds-bundle: {"format":4,"namespace":"DesignSystem_c03e6e","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Tabs","sourcePath":"components/feedback/Tabs.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"70e8121d2e1c","components/core/Button.jsx":"bbb3800c1d09","components/core/Card.jsx":"92174bb24812","components/core/IconButton.jsx":"c71fe4ee8b6f","components/core/Tag.jsx":"2411660f7b1f","components/feedback/Dialog.jsx":"657d4cb451ce","components/feedback/Tabs.jsx":"b87f1488617f","components/feedback/Toast.jsx":"b985578b9885","components/feedback/Tooltip.jsx":"a266dd608868","components/forms/Checkbox.jsx":"47a33cb5e11c","components/forms/Input.jsx":"87176053533a","components/forms/Radio.jsx":"69cd9b06dafa","components/forms/Select.jsx":"4e61e0c6a16c","components/forms/Switch.jsx":"58e409065165","ui_kits/website/ContactScreen.jsx":"ba3e879f19d5","ui_kits/website/HomeScreen.jsx":"30c81f63b6ac","ui_kits/website/PortfolioScreen.jsx":"8bbdf978b45b","ui_kits/website/SiteChrome.jsx":"14c613014852"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_c03e6e = window.DesignSystem_c03e6e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
// 鴻築 FP Decoration — Badge
function Badge({
  tone = "neutral",
  children,
  style = {}
}) {
  const tones = {
    neutral: {
      background: "var(--surface-tint)",
      color: "var(--fp-primary)"
    },
    brand: {
      background: "var(--fp-primary)",
      color: "#fff"
    },
    accent: {
      background: "var(--fp-accent)",
      color: "var(--fp-dark)"
    },
    success: {
      background: "rgba(46,125,91,0.12)",
      color: "var(--status-success)"
    },
    warning: {
      background: "rgba(168,118,42,0.12)",
      color: "var(--status-warning)"
    },
    danger: {
      background: "rgba(168,58,58,0.12)",
      color: "var(--status-danger)"
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 10px",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "var(--tracking-wide)",
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-sans)",
      ...tones[tone],
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// 鴻築 FP Decoration — Button
function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  icon = null,
  children,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: "6px 14px",
      fontSize: 13
    },
    md: {
      padding: "10px 22px",
      fontSize: 15
    },
    lg: {
      padding: "14px 30px",
      fontSize: 16
    }
  };
  const variants = {
    primary: {
      background: "var(--btn-primary-bg)",
      color: "#fff",
      border: "1px solid transparent"
    },
    secondary: {
      background: "var(--btn-secondary-bg)",
      color: "#fff",
      border: "1px solid transparent"
    },
    outline: {
      background: "transparent",
      color: "var(--fp-primary)",
      border: "1px solid var(--fp-primary)"
    },
    ghost: {
      background: "transparent",
      color: "var(--fp-secondary)",
      border: "1px solid transparent"
    }
  };
  const [hover, setHover] = React.useState(false);
  const hoverBg = {
    primary: "var(--btn-primary-bg-hover)",
    secondary: "var(--btn-secondary-bg-hover)",
    outline: "var(--surface-tint)",
    ghost: "var(--surface-tint)"
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      justifyContent: "center",
      whiteSpace: "nowrap",
      fontFamily: "var(--font-sans)",
      fontWeight: 500,
      letterSpacing: "var(--tracking-wide)",
      borderRadius: "var(--radius-sm)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)",
      ...sizes[size],
      ...variants[variant],
      ...(hover && !disabled ? {
        background: hoverBg[variant]
      } : {}),
      ...style
    }
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// 鴻築 FP Decoration — Card
function Card({
  elevated = false,
  dark = false,
  padding = 24,
  children,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: dark ? "var(--surface-dark)" : "var(--surface-card)",
      color: dark ? "var(--text-on-dark)" : "var(--text-body)",
      border: elevated ? "none" : "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      boxShadow: elevated ? hover ? "var(--shadow-lg)" : "var(--shadow-md)" : "none",
      transition: "box-shadow var(--duration-base) var(--ease-out)",
      padding,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// 鴻築 FP Decoration — IconButton
function IconButton({
  label,
  size = "md",
  variant = "ghost",
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  const px = {
    sm: 28,
    md: 36,
    lg: 44
  }[size];
  const variants = {
    ghost: {
      background: "transparent",
      color: "var(--fp-primary)",
      border: "1px solid transparent"
    },
    outline: {
      background: "var(--surface-card)",
      color: "var(--fp-primary)",
      border: "1px solid var(--border-subtle)"
    },
    solid: {
      background: "var(--btn-primary-bg)",
      color: "#fff",
      border: "1px solid transparent"
    }
  };
  const [hover, setHover] = React.useState(false);
  const hoverStyle = {
    ghost: {
      background: "var(--surface-tint)"
    },
    outline: {
      borderColor: "var(--border-strong)"
    },
    solid: {
      background: "var(--btn-primary-bg-hover)"
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: px,
      height: px,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-sm)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "background var(--duration-fast) var(--ease-out)",
      ...variants[variant],
      ...(hover && !disabled ? hoverStyle[variant] : {}),
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
// 鴻築 FP Decoration — Tag (pill, optionally removable)
function Tag({
  onRemove,
  children,
  style = {}
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "3px 12px",
      fontSize: 13,
      fontFamily: "var(--font-sans)",
      color: "var(--fp-primary)",
      background: "var(--surface-card)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-pill)",
      ...style
    }
  }, children, onRemove && /*#__PURE__*/React.createElement("button", {
    "aria-label": "\u79FB\u9664",
    onClick: onRemove,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      border: "none",
      background: "none",
      cursor: "pointer",
      padding: 0,
      display: "inline-flex",
      color: hover ? "var(--fp-primary)" : "var(--fp-gray)",
      fontSize: 14,
      lineHeight: 1
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
// 鴻築 FP Decoration — Dialog
function Dialog({
  open,
  onClose,
  title,
  footer,
  width = 480,
  children
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(29,31,56,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation(),
    style: {
      width,
      maxWidth: "calc(100vw - 48px)",
      background: "var(--surface-card)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      fontFamily: "var(--font-sans)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 24px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 500,
      color: "var(--text-heading)"
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    "aria-label": "\u95DC\u9589",
    onClick: onClose,
    style: {
      border: "none",
      background: "none",
      cursor: "pointer",
      color: "var(--fp-gray)",
      display: "inline-flex",
      padding: 4
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
      padding: 24,
      fontSize: 15,
      color: "var(--text-body)",
      lineHeight: "var(--leading-normal)"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 12,
      padding: "16px 24px",
      borderTop: "1px solid var(--border-subtle)",
      background: "var(--surface-page)"
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tabs.jsx
try { (() => {
// 鴻築 FP Decoration — Tabs
function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange,
  style = {}
}) {
  const items = tabs.map(t => typeof t === "string" ? {
    value: t,
    label: t
  } : t);
  const isControlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue ?? (items[0] && items[0].value));
  const current = isControlled ? value : inner;
  const pick = v => {
    if (!isControlled) setInner(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "flex",
      gap: 4,
      borderBottom: "1px solid var(--border-subtle)",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, items.map(t => {
    const on = current === t.value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      role: "tab",
      "aria-selected": on,
      onClick: () => pick(t.value),
      style: {
        padding: "10px 18px",
        fontSize: 15,
        cursor: "pointer",
        background: "none",
        border: "none",
        borderBottom: `2px solid ${on ? "var(--fp-primary)" : "transparent"}`,
        marginBottom: -1,
        color: on ? "var(--fp-primary)" : "var(--text-muted)",
        fontWeight: on ? 500 : 400,
        letterSpacing: "var(--tracking-wide)",
        transition: "color var(--duration-fast) var(--ease-out)"
      }
    }, t.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
// 鴻築 FP Decoration — Toast (static element; position via wrapper)
function Toast({
  tone = "info",
  title,
  children,
  onClose,
  style = {}
}) {
  const colors = {
    info: "var(--status-info)",
    success: "var(--status-success)",
    warning: "var(--status-warning)",
    danger: "var(--status-danger)"
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      width: 340,
      padding: "14px 16px",
      boxSizing: "border-box",
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-lg)",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      alignSelf: "stretch",
      background: colors[tone],
      borderRadius: 2,
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, title && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 14,
      fontWeight: 500,
      color: "var(--text-heading)"
    }
  }, title), children && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 13,
      color: "var(--text-muted)",
      marginTop: title ? 3 : 0
    }
  }, children)), onClose && /*#__PURE__*/React.createElement("button", {
    "aria-label": "\u95DC\u9589",
    onClick: onClose,
    style: {
      border: "none",
      background: "none",
      cursor: "pointer",
      color: "var(--fp-gray)",
      display: "inline-flex",
      padding: 2,
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
// 鴻築 FP Decoration — Tooltip (hover)
function Tooltip({
  content,
  side = "top",
  children
}) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: {
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    bottom: {
      top: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    left: {
      right: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    },
    right: {
      left: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex"
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false)
  }, children, show && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      zIndex: 50,
      whiteSpace: "nowrap",
      padding: "6px 10px",
      fontSize: 12,
      fontFamily: "var(--font-sans)",
      background: "var(--fp-dark)",
      color: "var(--text-on-dark)",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--shadow-md)",
      pointerEvents: "none",
      ...pos[side]
    }
  }, content));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
// 鴻築 FP Decoration — Checkbox
function Checkbox({
  label,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  style = {}
}) {
  const isControlled = checked !== undefined;
  const [inner, setInner] = React.useState(defaultChecked);
  const value = isControlled ? checked : inner;
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInner(!value);
    onChange && onChange(!value);
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      fontFamily: "var(--font-sans)",
      fontSize: 15,
      color: "var(--text-body)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "checkbox",
    "aria-checked": value,
    tabIndex: disabled ? -1 : 0,
    onClick: toggle,
    onKeyDown: e => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    },
    style: {
      width: 18,
      height: 18,
      flex: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: `1px solid ${value ? "var(--fp-primary)" : "var(--border-strong)"}`,
      background: value ? "var(--fp-primary)" : "var(--surface-card)",
      borderRadius: "var(--radius-sm)",
      transition: "background var(--duration-fast) var(--ease-out)"
    }
  }, value && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }))), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// 鴻築 FP Decoration — Input
function Input({
  label,
  hint,
  error,
  disabled = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 14,
      fontWeight: 500,
      color: "var(--text-heading)",
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      fontSize: 15,
      fontFamily: "var(--font-sans)",
      color: "var(--text-body)",
      background: disabled ? "var(--surface-tint)" : "var(--surface-card)",
      border: `1px solid ${error ? "var(--status-danger)" : focus ? "var(--fp-secondary)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-sm)",
      outline: "none",
      boxShadow: focus ? "0 0 0 3px var(--focus-ring)" : "none",
      transition: "border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)",
      cursor: disabled ? "not-allowed" : "text"
    }
  }, rest)), (error || hint) && /*#__PURE__*/React.createElement("span", {
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
// 鴻築 FP Decoration — Radio group
function Radio({
  name,
  options = [],
  value,
  defaultValue,
  onChange,
  disabled = false,
  direction = "row",
  style = {}
}) {
  const isControlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue);
  const current = isControlled ? value : inner;
  const pick = v => {
    if (disabled) return;
    if (!isControlled) setInner(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    style: {
      display: "flex",
      flexDirection: direction === "column" ? "column" : "row",
      gap: direction === "column" ? 10 : 20,
      opacity: disabled ? 0.45 : 1,
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, options.map(o => {
    const opt = typeof o === "string" ? {
      value: o,
      label: o
    } : o;
    const on = current === opt.value;
    return /*#__PURE__*/React.createElement("label", {
      key: opt.value,
      onClick: () => pick(opt.value),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 15,
        color: "var(--text-body)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      role: "radio",
      "aria-checked": on,
      tabIndex: disabled ? -1 : 0,
      onKeyDown: e => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          pick(opt.value);
        }
      },
      style: {
        width: 18,
        height: 18,
        flex: "none",
        borderRadius: "50%",
        border: `1px solid ${on ? "var(--fp-primary)" : "var(--border-strong)"}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-card)"
      }
    }, on && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "var(--fp-primary)"
      }
    })), opt.label);
  }));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// 鴻築 FP Decoration — Select
function Select({
  label,
  options = [],
  disabled = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "block",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 14,
      fontWeight: 500,
      color: "var(--text-heading)",
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 36px 10px 12px",
      fontSize: 15,
      fontFamily: "var(--font-sans)",
      color: "var(--text-body)",
      background: disabled ? "var(--surface-tint)" : "var(--surface-card)",
      border: `1px solid ${focus ? "var(--fp-secondary)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-sm)",
      outline: "none",
      appearance: "none",
      boxShadow: focus ? "0 0 0 3px var(--focus-ring)" : "none",
      cursor: disabled ? "not-allowed" : "pointer"
    }
  }, rest), options.map(o => {
    const opt = typeof o === "string" ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--fp-gray)",
    strokeWidth: "1.5",
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
// 鴻築 FP Decoration — Switch
function Switch({
  label,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  style = {}
}) {
  const isControlled = checked !== undefined;
  const [inner, setInner] = React.useState(defaultChecked);
  const value = isControlled ? checked : inner;
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInner(!value);
    onChange && onChange(!value);
  };
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      fontFamily: "var(--font-sans)",
      fontSize: 15,
      color: "var(--text-body)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    role: "switch",
    "aria-checked": value,
    tabIndex: disabled ? -1 : 0,
    onClick: toggle,
    onKeyDown: e => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    },
    style: {
      width: 38,
      height: 22,
      flex: "none",
      borderRadius: "var(--radius-pill)",
      background: value ? "var(--fp-primary)" : "var(--fp-accent)",
      position: "relative",
      transition: "background var(--duration-base) var(--ease-out)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 3,
      left: value ? 19 : 3,
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "var(--shadow-sm)",
      transition: "left var(--duration-base) var(--ease-out)"
    }
  })), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ContactScreen.jsx
try { (() => {
// 鴻築 FP Decoration — contact screen
const {
  Button: CButton,
  Input: CInput,
  Select: CSelect,
  Checkbox: CCheckbox,
  Card: CCard,
  Toast: CToast
} = window.DesignSystem_c03e6e;
function ContactScreen() {
  const [sent, setSent] = React.useState(false);
  const [agree, setAgree] = React.useState(false);
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 1120,
      margin: "0 auto",
      padding: "72px 32px 96px",
      display: "grid",
      gridTemplateColumns: "1fr 1.2fr",
      gap: 64
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "CONTACT US"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-serif-display)",
      fontWeight: 900,
      fontSize: 40,
      letterSpacing: "var(--tracking-display)",
      margin: "16px 0 0"
    }
  }, "\u806F\u7D61\u6211\u5011"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      color: "var(--text-muted)",
      lineHeight: 1.9,
      margin: "18px 0 0",
      maxWidth: "30ch"
    }
  }, "\u7559\u4E0B\u60A8\u7684\u9700\u6C42\uFF0C\u6211\u5011\u5C07\u65BC\u4E00\u500B\u5DE5\u4F5C\u5929\u5167\u56DE\u8986\uFF0C\u4E26\u5B89\u6392\u5230\u5E9C\u4E08\u91CF\u8207\u521D\u6B65\u8AEE\u8A62\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 36,
      fontSize: 15,
      lineHeight: 2.4,
      color: "var(--text-body)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-heading)"
    }
  }, "\u96FB\u8A71"), "\u300002-0000-0000"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-heading)"
    }
  }, "\u4FE1\u7BB1"), "\u3000service@fpdeco.tw"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-heading)"
    }
  }, "\u6642\u9593"), "\u3000\u9031\u4E00\u81F3\u9031\u4E94 9:00\u201318:00"))), /*#__PURE__*/React.createElement(CCard, {
    elevated: true,
    padding: 36
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(CInput, {
    label: "\u59D3\u540D",
    placeholder: "\u8ACB\u8F38\u5165\u60A8\u7684\u59D3\u540D"
  }), /*#__PURE__*/React.createElement(CInput, {
    label: "\u96FB\u8A71",
    placeholder: "09xx-xxx-xxx"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(CInput, {
    label: "Email",
    placeholder: "name@example.com"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18,
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(CSelect, {
    label: "\u7A7A\u9593\u985E\u578B",
    options: ["住宅", "商業空間", "辦公室", "其他"]
  }), /*#__PURE__*/React.createElement(CSelect, {
    label: "\u9810\u7B97\u7BC4\u570D",
    options: ["100 萬以下", "100–300 萬", "300 萬以上", "尚未確定"]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, /*#__PURE__*/React.createElement(CCheckbox, {
    label: "\u6211\u540C\u610F\u500B\u8CC7\u4F7F\u7528\u8072\u660E",
    checked: agree,
    onChange: setAgree
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 26
    }
  }, /*#__PURE__*/React.createElement(CButton, {
    variant: "primary",
    size: "lg",
    disabled: !agree,
    onClick: () => setSent(true),
    style: {
      width: "100%"
    }
  }, "\u9001\u51FA\u9700\u6C42"))), sent && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      right: 24,
      bottom: 24,
      zIndex: 60
    }
  }, /*#__PURE__*/React.createElement(CToast, {
    tone: "success",
    title: "\u5DF2\u9001\u51FA",
    onClose: () => setSent(false)
  }, "\u6211\u5011\u5C07\u76E1\u5FEB\u8207\u60A8\u806F\u7E6B\u3002")));
}
window.ContactScreen = ContactScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ContactScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HomeScreen.jsx
try { (() => {
// 鴻築 FP Decoration — home screen
const {
  Button: FPButton,
  Card: FPCard,
  Badge: FPBadge
} = window.DesignSystem_c03e6e;
function HomeScreen({
  onNav
}) {
  const services = [["住宅設計", "全屋規劃、格局重整與工程統包，打造貼近生活的空間。"], ["商業空間", "門店、辦公與餐飲空間，兼顧品牌形象與營運動線。"], ["老屋翻新", "結構補強、管線更新到風格再造，讓老屋重獲新生。"]];
  const stats = [["20+", "年施工經驗"], ["300+", "完工案場"], ["100%", "合約保固"]];
  return /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1120,
      margin: "0 auto",
      padding: "96px 32px 80px",
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      gap: 64,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "FP DECORATION \xB7 \u9D3B\u7BC9\u5BA4\u5167\u88DD\u4FEE"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-serif-display)",
      fontWeight: 900,
      fontSize: 52,
      letterSpacing: "var(--tracking-display)",
      lineHeight: 1.25,
      margin: "18px 0 0"
    }
  }, "\u7BC9\u9020\u7406\u60F3\u7A7A\u9593"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 18,
      color: "var(--text-muted)",
      maxWidth: "34ch",
      margin: "20px 0 0",
      lineHeight: 1.9
    }
  }, "\u5F9E\u8A2D\u8A08\u3001\u65BD\u5DE5\u5230\u4EA4\u5C4B\uFF0C\u6211\u5011\u4EE5\u56B4\u8B39\u7684\u5DE5\u6CD5\u8207\u8AA0\u5BE6\u7684\u6E9D\u901A\uFF0C\u966A\u60A8\u5B8C\u6210\u6BCF\u4E00\u500B\u5BB6\u7684\u60F3\u50CF\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      marginTop: 36
    }
  }, /*#__PURE__*/React.createElement(FPButton, {
    variant: "primary",
    size: "lg",
    onClick: () => onNav("contact")
  }, "\u9810\u7D04\u8AEE\u8A62"), /*#__PURE__*/React.createElement(FPButton, {
    variant: "outline",
    size: "lg",
    onClick: () => onNav("portfolio")
  }, "\u67E5\u770B\u4F5C\u54C1"))), /*#__PURE__*/React.createElement(PhotoPlaceholder, {
    label: "HERO \u2014 \u5B8C\u5DE5\u5BE6\u666F\u7167\u7247",
    ratio: "4 / 5"
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--surface-card)",
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: "0 auto",
      padding: "80px 32px"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "OUR SERVICES"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-serif-display)",
      fontWeight: 700,
      fontSize: 32,
      letterSpacing: "var(--tracking-wide)",
      margin: "14px 0 36px"
    }
  }, "\u670D\u52D9\u9805\u76EE"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 24
    }
  }, services.map(([t, d]) => /*#__PURE__*/React.createElement(FPCard, {
    key: t,
    elevated: true,
    padding: 28
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 20,
      fontWeight: 500,
      margin: 0
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      color: "var(--text-muted)",
      lineHeight: 1.9,
      margin: "10px 0 0"
    }
  }, d)))))), /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--surface-dark)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: "0 auto",
      padding: "72px 32px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 24,
      textAlign: "center"
    }
  }, stats.map(([n, l]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-serif-display)",
      fontWeight: 700,
      fontSize: 44,
      color: "var(--text-on-dark)"
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      letterSpacing: "var(--tracking-wide)",
      color: "var(--text-on-dark-muted)",
      marginTop: 6
    }
  }, l))))), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: 1120,
      margin: "0 auto",
      padding: "80px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 36
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "PORTFOLIO"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-serif-display)",
      fontWeight: 700,
      fontSize: 32,
      letterSpacing: "var(--tracking-wide)",
      margin: "14px 0 0"
    }
  }, "\u7CBE\u9078\u4F5C\u54C1")), /*#__PURE__*/React.createElement(FPButton, {
    variant: "ghost",
    onClick: () => onNav("portfolio")
  }, "\u67E5\u770B\u5168\u90E8 \u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 24
    }
  }, [["信義區 L 宅", "住宅設計"], ["大安區咖啡廳", "商業空間"], ["中山區 40 年老宅", "老屋翻新"]].map(([t, c]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      cursor: "pointer"
    },
    onClick: () => onNav("portfolio")
  }, /*#__PURE__*/React.createElement(PhotoPlaceholder, {
    label: "\u4F5C\u54C1\u7167\u7247"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 500,
      color: "var(--text-heading)",
      flex: 1
    }
  }, t), /*#__PURE__*/React.createElement(FPBadge, {
    tone: "neutral"
  }, c)))))));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/PortfolioScreen.jsx
try { (() => {
// 鴻築 FP Decoration — portfolio screen
const {
  Tabs: FPTabs,
  Badge: PBadge,
  Tag: PTag
} = window.DesignSystem_c03e6e;
function PortfolioScreen() {
  const [cat, setCat] = React.useState("全部");
  const works = [["信義區 L 宅", "住宅", "現代簡約"], ["大安區咖啡廳", "商業空間", "工業風"], ["中山區 40 年老宅", "老屋翻新", "北歐風"], ["內湖 T 宅", "住宅", "日式無印"], ["松山辦公室", "商業空間", "現代簡約"], ["永和公寓翻新", "老屋翻新", "混搭"]];
  const shown = works.filter(([, c]) => cat === "全部" || c === cat);
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 1120,
      margin: "0 auto",
      padding: "72px 32px 96px"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "PORTFOLIO \u4F5C\u54C1\u5BE6\u7E3E"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-serif-display)",
      fontWeight: 900,
      fontSize: 40,
      letterSpacing: "var(--tracking-display)",
      margin: "16px 0 32px"
    }
  }, "\u4F5C\u54C1\u5BE6\u7E3E"), /*#__PURE__*/React.createElement(FPTabs, {
    tabs: ["全部", "住宅", "商業空間", "老屋翻新"],
    value: cat,
    onChange: setCat
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "32px 24px",
      marginTop: 36
    }
  }, shown.map(([t, c, s]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(PhotoPlaceholder, {
    label: "\u4F5C\u54C1\u7167\u7247"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 500,
      color: "var(--text-heading)",
      flex: 1
    }
  }, t), /*#__PURE__*/React.createElement(PBadge, {
    tone: "neutral"
  }, c)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(PTag, null, s)))))));
}
window.PortfolioScreen = PortfolioScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/PortfolioScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/SiteChrome.jsx
try { (() => {
// 鴻築 FP Decoration — site chrome (header, footer, shared bits)
const {
  Button
} = window.DesignSystem_c03e6e;
function Eyebrow({
  children,
  onDark
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.22em",
      color: onDark ? "var(--fp-accent)" : "var(--fp-secondary)"
    }
  }, children);
}
function SiteHeader({
  page,
  onNav
}) {
  const items = [["home", "首頁"], ["portfolio", "作品實績"], ["contact", "聯絡我們"]];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: "rgba(252,252,252,0.95)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: "0 auto",
      padding: "0 32px",
      height: 72,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => onNav("home"),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-normal.svg",
    alt: "FP Decoration",
    style: {
      height: 44
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-serif-display)",
      fontWeight: 700,
      fontSize: 19,
      letterSpacing: "var(--tracking-wide)",
      color: "var(--fp-primary)"
    }
  }, "\u9D3B\u7BC9\u5BA4\u5167\u88DD\u4FEE")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 28
    }
  }, items.map(([key, label]) => /*#__PURE__*/React.createElement("a", {
    key: key,
    onClick: () => onNav(key),
    style: {
      fontSize: 15,
      cursor: "pointer",
      letterSpacing: "var(--tracking-wide)",
      color: page === key ? "var(--fp-primary)" : "var(--text-muted)",
      fontWeight: page === key ? 500 : 400,
      borderBottom: page === key ? "2px solid var(--fp-primary)" : "2px solid transparent",
      paddingBottom: 2
    }
  }, label)), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    onClick: () => onNav("contact")
  }, "\u9810\u7D04\u8AEE\u8A62"))));
}
function SiteFooter({
  onNav
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--surface-darker)",
      color: "var(--text-on-dark-muted)",
      marginTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: "0 auto",
      padding: "56px 32px 40px",
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr",
      gap: 48
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-colorbg.svg",
    alt: "FP Decoration",
    style: {
      height: 72,
      borderRadius: 4
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      lineHeight: 1.9,
      marginTop: 16,
      maxWidth: 320
    }
  }, "\u9D3B\u7BC9\u5BA4\u5167\u88DD\u4FEE\u5C08\u6CE8\u65BC\u4F4F\u5B85\u8207\u5546\u696D\u7A7A\u9593\u7684\u6574\u9AD4\u898F\u5283\uFF0C\u5F9E\u8A2D\u8A08\u3001\u65BD\u5DE5\u5230\u4EA4\u5C4B\uFF0C\u8207\u60A8\u540C\u884C\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      lineHeight: 2.2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.22em",
      color: "var(--fp-accent)",
      marginBottom: 10
    }
  }, "SITEMAP"), /*#__PURE__*/React.createElement("a", {
    onClick: () => onNav("home"),
    style: {
      display: "block",
      color: "var(--text-on-dark-muted)",
      cursor: "pointer"
    }
  }, "\u9996\u9801"), /*#__PURE__*/React.createElement("a", {
    onClick: () => onNav("portfolio"),
    style: {
      display: "block",
      color: "var(--text-on-dark-muted)",
      cursor: "pointer"
    }
  }, "\u4F5C\u54C1\u5BE6\u7E3E"), /*#__PURE__*/React.createElement("a", {
    onClick: () => onNav("contact"),
    style: {
      display: "block",
      color: "var(--text-on-dark-muted)",
      cursor: "pointer"
    }
  }, "\u806F\u7D61\u6211\u5011")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      lineHeight: 2.2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.22em",
      color: "var(--fp-accent)",
      marginBottom: 10
    }
  }, "CONTACT"), /*#__PURE__*/React.createElement("div", null, "service@fpdeco.tw"), /*#__PURE__*/React.createElement("div", null, "02-0000-0000"), /*#__PURE__*/React.createElement("div", null, "\u53F0\u5317\u5E02"))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--divider-on-dark)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1120,
      margin: "0 auto",
      padding: "18px 32px",
      fontSize: 12,
      color: "var(--fp-lite)"
    }
  }, "\xA9 \u9D3B\u7BC9\u5BA4\u5167\u88DD\u4FEE FP Decoration")));
}

// Labeled placeholder for interior photography (none provided — do not generate imagery)
function PhotoPlaceholder({
  label,
  ratio = "4 / 3",
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: ratio,
      background: "var(--surface-tint)",
      border: "1px solid var(--border-subtle)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      letterSpacing: "0.16em",
      color: "var(--fp-lite)"
    }
  }, label));
}
Object.assign(window, {
  Eyebrow,
  SiteHeader,
  SiteFooter,
  PhotoPlaceholder
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/SiteChrome.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

})();
