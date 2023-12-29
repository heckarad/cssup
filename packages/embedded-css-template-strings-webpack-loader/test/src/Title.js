/**
 * @module
 * Test case for CSS modules usage pattern, where the style declaration should
 * be locally scoped to the component
 */

import { css } from "cssup";
import { layoutStyles } from "./shared";

const styles = css`
  .title {
    font-size: 3rem;
    color: hotpink;
  }
`;

export function Title() {
  return (
    <div className={layoutStyles.container}>
      <h1 className={styles.title}>CSS🆙</h1>
    </div>
  );
}
