import { css } from "cssup";

css`
  :global {
    .fancy-title {
      color: teal;
    }
  }
`;

export function Title() {
  return (
    <h2 className="fancy-title">
      Write component styles as embedded CSS template strings.
    </h2>
  );
}
