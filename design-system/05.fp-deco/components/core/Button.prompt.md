Brand button for all primary/secondary actions; use `primary` (navy) once per view, `outline`/`ghost` for the rest.

```jsx
<Button variant="primary" size="md" onClick={submit}>預約諮詢</Button>
<Button variant="outline">瞭解更多</Button>
```

Variants: `primary` `secondary` `outline` `ghost`. Sizes: `sm` `md` `lg`. Hover darkens one step; no shrink on press. Corners are 2px — do not round further.
