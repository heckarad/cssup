/**
 * @module
 * Test case for global styles usage pattern, where the template string isn't
 * assigned to a variable.
 */

import { css } from "cssup";
import { layoutStyles } from "./shared";

css`
  :global {
    .fancy-title {
      color: teal;
    }
  }
`;

export function Subtitle() {
  return (
    <div className={layoutStyles.container}>
      <h2 className="fancy-title">
        Write component styles as embedded CSS template strings.
      </h2>
    </div>
  );
}
