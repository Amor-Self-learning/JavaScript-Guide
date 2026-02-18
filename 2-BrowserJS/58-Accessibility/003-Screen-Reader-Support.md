# 58.3 Screen Reader Support

Screen readers vocalize page content for visually impaired users.

---

## 58.3.1 Accessible Names

### Provide Labels

```html
<!-- Visible label -->
<label for="email">Email</label>
<input id="email" type="email">

<!-- aria-label (invisible) -->
<button aria-label="Close dialog">×</button>

<!-- aria-labelledby -->
<h2 id="section-title">Settings</h2>
<section aria-labelledby="section-title">...</section>
```

---

## 58.3.2 Alternative Text

### Images

```html
<!-- Informative image -->
<img src="chart.png" alt="Sales increased 25% in Q4">

<!-- Decorative image -->
<img src="decoration.png" alt="" role="presentation">

<!-- Complex image -->
<figure>
  <img src="diagram.png" alt="System architecture diagram">
  <figcaption>Detailed description...</figcaption>
</figure>
```

---

## 58.3.3 Hidden Content

### Visually Hidden

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

```html
<button>
  <span class="visually-hidden">Close</span>
  <span aria-hidden="true">×</span>
</button>
```

### Hide from Screen Readers

```html
<!-- Hide decorative content -->
<span aria-hidden="true">★★★★☆</span>
<span class="visually-hidden">4 out of 5 stars</span>
```

---

## 58.3.4 Descriptions

### Additional Context

```html
<input 
  type="password"
  aria-describedby="password-requirements"
>
<p id="password-requirements">
  Must be 8+ characters with a number
</p>
```

---

## 58.3.5 Summary

| Technique | Use Case |
|-----------|----------|
| `aria-label` | Invisible label |
| `aria-labelledby` | Reference existing text |
| `aria-describedby` | Additional context |
| `aria-hidden` | Hide from screen readers |
| `alt=""` | Decorative images |
| `.visually-hidden` | Screen reader only text |

---

**End of Chapter 58.3: Screen Reader Support**

Next: **58.4 Accessible Forms**.
