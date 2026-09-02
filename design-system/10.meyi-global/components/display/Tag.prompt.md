Filter chip — clickable to select (inverts), optional remove ×.

```jsx
<Tag active={sel === "sea"} onClick={() => setSel("sea")}>Sea freight</Tag>
<Tag onRemove={() => remove(id)}>Electronics</Tag>
```
