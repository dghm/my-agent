/* @ds-bundle: {"format":4,"namespace":"DGHMDesignSystem_fd04b1","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Tag","sourcePath":"components/display/Card.jsx"},{"name":"Stat","sourcePath":"components/display/Card.jsx"},{"name":"SectionHeader","sourcePath":"components/display/SectionHeader.jsx"},{"name":"PhaseStep","sourcePath":"components/display/SectionHeader.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Select.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"635b85bf8cb8","components/display/Card.jsx":"d03378a4d768","components/display/SectionHeader.jsx":"c005d5fec9be","components/forms/Input.jsx":"5d58581913df","components/forms/Select.jsx":"8afd5cc26083"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DGHMDesignSystem_fd04b1 = window.DGHMDesignSystem_fd04b1 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
/** DGHM Button — primary CTA is always orange bg + white text. */
function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  style
}) {
  const sizes = {
    sm: {
      padding: '6px 14px',
      fontSize: 13
    },
    md: {
      padding: '10px 20px',
      fontSize: 15
    },
    lg: {
      padding: '14px 28px',
      fontSize: 17
    }
  };
  const variants = {
    primary: {
      background: 'var(--cta-bg)',
      color: 'var(--cta-text)',
      border: '1px solid transparent'
    },
    secondary: {
      background: 'var(--dghm-navy)',
      color: '#fff',
      border: '1px solid transparent'
    },
    outline: {
      background: 'transparent',
      color: 'var(--dghm-navy)',
      border: '1px solid var(--dghm-navy)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--dghm-navy-light)',
      border: '1px solid transparent'
    }
  };
  const [hover, setHover] = React.useState(false);
  const hoverBg = {
    primary: 'var(--cta-bg-hover)',
    secondary: 'var(--dghm-navy-light)',
    outline: 'var(--dghm-pale)',
    ghost: 'var(--dghm-pale)'
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      fontFamily: 'var(--font-brand)',
      fontWeight: 600,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      lineHeight: 1.2,
      transition: 'background var(--duration-fast) var(--ease-standard)',
      ...sizes[size],
      ...variants[variant],
      ...(hover && !disabled ? {
        background: hoverBg[variant]
      } : {}),
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/display/Card.jsx
try { (() => {
/** DGHM Card — white surface, subtle cool shadow, 10px radius. tone="brand" = navy, tone="section" = pale. */
function Card({
  tone = 'default',
  children,
  style
}) {
  const tones = {
    default: {
      background: 'var(--surface-card)',
      color: 'var(--text-body)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-card)'
    },
    section: {
      background: 'var(--surface-section)',
      color: 'var(--text-body)',
      border: '1px solid transparent'
    },
    brand: {
      background: 'var(--surface-brand)',
      color: 'var(--text-on-brand)',
      border: '1px solid transparent'
    },
    accent: {
      background: 'var(--surface-accent)',
      color: 'var(--text-on-accent)',
      border: '1px solid transparent'
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-5)',
      fontFamily: 'var(--font-body)',
      ...tones[tone],
      ...style
    }
  }, children);
}

/** Small pill/label — eyebrow tags like service keywords. */
function Tag({
  tone = 'neutral',
  children,
  style
}) {
  const tones = {
    neutral: {
      background: 'var(--dghm-pale)',
      color: 'var(--dghm-navy)'
    },
    brand: {
      background: 'var(--dghm-navy)',
      color: '#fff'
    },
    accent: {
      background: 'var(--dghm-orange)',
      color: '#fff'
    },
    outline: {
      background: 'transparent',
      color: 'var(--dghm-slate)',
      border: '1px solid var(--border-default)'
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: 'var(--radius-pill)',
      padding: '4px 12px',
      fontSize: 12,
      fontWeight: 600,
      fontFamily: 'var(--font-body)',
      letterSpacing: '0.02em',
      ...tones[tone],
      ...style
    }
  }, children);
}

/** Data highlight — big number + caption, e.g. "+38% 流程效率提升". */
function Stat({
  value,
  label,
  tone = 'default',
  style
}) {
  const dark = tone === 'accent' || tone === 'brand';
  const bg = {
    default: 'transparent',
    accent: 'var(--dghm-orange)',
    brand: 'var(--dghm-navy)'
  }[tone];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      color: dark ? '#fff' : 'var(--dghm-navy)',
      borderRadius: 'var(--radius-md)',
      padding: tone === 'default' ? 0 : 'var(--space-5)',
      fontFamily: 'var(--font-brand)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      fontWeight: 800,
      lineHeight: 1.1
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: dark ? 0.9 : 1,
      color: dark ? undefined : 'var(--text-secondary)',
      marginTop: 4
    }
  }, label));
}
Object.assign(__ds_scope, { Card, Tag, Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/SectionHeader.jsx
try { (() => {
/** Section heading block — orange eyebrow, navy title, slate lede. Matches dghm.tw section pattern. */
function SectionHeader({
  eyebrow,
  title,
  lede,
  align = 'left',
  onDark = false,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-brand)',
      textAlign: align,
      maxWidth: 640,
      margin: align === 'center' ? '0 auto' : undefined,
      ...style
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      color: 'var(--dghm-orange)',
      marginBottom: 8
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--text-h2)',
      fontWeight: 700,
      lineHeight: 'var(--leading-tight)',
      color: onDark ? '#fff' : 'var(--text-heading)',
      margin: 0
    }
  }, title), lede && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      lineHeight: 'var(--leading-normal)',
      color: onDark ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)',
      marginTop: 12,
      marginBottom: 0
    }
  }, lede));
}

/** Numbered process phase — "01 Process Audit · 2–4 WEEKS · description". */
function PhaseStep({
  number,
  title,
  duration,
  description,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-brand)',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-5)',
      boxShadow: 'var(--shadow-card)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      color: 'var(--dghm-orange)',
      lineHeight: 1
    }
  }, number), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      marginTop: 12,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: 'var(--dghm-navy)'
    }
  }, title), duration && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--dghm-slate)'
    }
  }, duration)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      lineHeight: 'var(--leading-normal)',
      color: 'var(--text-secondary)',
      margin: '8px 0 0'
    }
  }, description));
}
Object.assign(__ds_scope, { SectionHeader, PhaseStep });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
/** DGHM text input with label — pale border, navy focus ring. */
function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  disabled = false,
  error,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-body)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--dghm-navy)'
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      padding: '10px 12px',
      borderRadius: 'var(--radius-sm)',
      outline: 'none',
      border: `1.5px solid ${error ? 'var(--dghm-orange-deep)' : focus ? 'var(--focus-ring)' : 'var(--border-default)'}`,
      background: disabled ? 'var(--dghm-pale)' : '#fff',
      color: 'var(--text-body)',
      transition: 'border-color var(--duration-fast) var(--ease-standard)'
    }
  }), error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--dghm-orange-deep)'
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
/** DGHM select dropdown, styled to match Input. */
function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-body)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--dghm-navy)'
    }
  }, label), /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      padding: '10px 12px',
      appearance: 'auto',
      borderRadius: 'var(--radius-sm)',
      outline: 'none',
      border: `1.5px solid ${focus ? 'var(--focus-ring)' : 'var(--border-default)'}`,
      background: disabled ? 'var(--dghm-pale)' : '#fff',
      color: 'var(--text-body)'
    }
  }, placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value ?? o,
    value: o.value ?? o
  }, o.label ?? o))));
}

/** DGHM checkbox with label. */
function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text-body)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      width: 16,
      height: 16,
      accentColor: 'var(--dghm-navy)'
    }
  }), label);
}
Object.assign(__ds_scope, { Select, Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.PhaseStep = __ds_scope.PhaseStep;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Checkbox = __ds_scope.Checkbox;

})();
