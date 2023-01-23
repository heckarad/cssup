import { css } from "cssup";

const styles = css`
  .app {
    max-width: 800px;
    margin: auto;
  }

  .title {
    font-size: 3rem;
    color: hotpink;
  }
`;

export default function App() {
  return (
    <div className={styles.app}>
      <h1 className={styles.title}>CSS🆙</h1>
      <h2>Write component styles as embedded CSS template strings.</h2>
    </div>
  );
}
