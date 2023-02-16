import { css } from "cssup";

import { Title } from "./Title";

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
      <Title />
    </div>
  );
}
