import { css } from "cssup";

const styles = css`
  .header {
    font-size: 3rem;

    .subheader {
      color: hotpink;
    }
  }

  .subtitle {
    font-size: 2rem;
  }
`;

console.log("RUNTIME STYLES VALUE: ", styles);

export default function App() {
  return (
    <div className="App">
      <h1 className={styles.header}>
        Huzzah <span className={styles.subheader}>!!!</span>{" "}
      </h1>
      <h2 className={styles.subtitle}>Embedded CSS!</h2>
    </div>
  );
}
