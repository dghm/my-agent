Modal dialog on a navy-tinted scrim; pair footer actions with Button.

```jsx
<Dialog open={open} onClose={close} title="預約諮詢"
  footer={<><Button variant="ghost" onClick={close}>取消</Button><Button variant="primary">送出</Button></>}>
  我們將於一個工作天內與您聯繫。
</Dialog>
```
