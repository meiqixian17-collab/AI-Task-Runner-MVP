# AI Task Runner dynamic cover

This folder contains a 16:9 animated project-card cover for the AI Task Runner portfolio case.

Files:

- `ai-task-runner-cover.html`: standalone preview. Open it directly in a browser.
- `AiTaskRunnerCover.jsx`: React component for the portfolio website.
- `AiTaskRunnerCover.css`: component styles and animation.

Integration notes:

1. Copy `AiTaskRunnerCover.jsx` and `AiTaskRunnerCover.css` into the personal website component folder.
2. Import and render the component inside the project card media area.
3. Keep the project card wrapper at `aspect-ratio: 16 / 9`; the component fills its parent width.
4. Do not replace the UI with generic AI imagery. The cover intentionally uses the real project story: current step, execution, completion, and next step.

Example:

```jsx
import AiTaskRunnerCover from "../components/AiTaskRunnerCover.jsx";

export default function ProjectCard() {
  return (
    <article className="project-card">
      <div className="project-card__media">
        <AiTaskRunnerCover />
      </div>
      <h3>AI Task Runner</h3>
      <p>把“不知道怎么开始”转成当前可执行的一步</p>
    </article>
  );
}
```

```css
.project-card__media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 24px;
}
```

If the personal website is Astro, the component can be wrapped as a React island only when animation pause or later interactivity is needed. For this version, plain HTML/CSS is enough, so the website agent can also copy the markup from `ai-task-runner-cover.html` into an Astro component and move the CSS into the site's stylesheet.

Suggested card text outside the cover:

- Title: `AI Task Runner`
- Subtitle: `把“不知道怎么开始”转成当前可执行的一步`
