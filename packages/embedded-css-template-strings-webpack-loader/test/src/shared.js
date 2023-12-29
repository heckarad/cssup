/**
 * @module
 * Test case for exporting style declaration for use in other files
 */

import { css } from "cssup";

export const layoutStyles = css`
  .container {
    max-width: 700px;
    margin: auto;
  }
`;

console.log("SHARED FILE CODE PRESERVED ✔️");
