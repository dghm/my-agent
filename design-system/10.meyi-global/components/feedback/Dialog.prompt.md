Modal dialog — dark scrim, white panel, footer actions right-aligned.

```jsx
<Dialog open={open} title="Remove item?" onClose={close}
  primaryAction={{ label: "Remove", onClick: confirm }}
  secondaryAction={{ label: "Cancel", onClick: close }}>
  This cannot be undone.
</Dialog>
```
