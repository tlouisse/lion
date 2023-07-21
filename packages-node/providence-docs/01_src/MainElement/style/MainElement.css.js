import { css } from 'lit-element';

export default css`
  iframe,
  textarea {
    border-radius: 3px;
  }

  iframe {
    height: 20rem;
    width: 100%;
    border: solid 2px #ccc;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    height: 100%;
    width: 100%;
    position: relative;

    grid-template-areas:
      'header  header  header'
      'sidebar editor preview'
      'terminal  terminal  terminal';
  }

  .main-grid__header {
    grid-area: header;
  }

  .main-grid__sidebar {
    width: 30vw;
    height: 50vh;
    overflow: scroll;
    grid-area: sidebar;
  }

  .main-grid__editor {
    width: 60vw;
    height: 50vh;
    grid-area: editor;
  }

  .main-grid__preview {
    grid-area: preview;
  }

  .main-grid__terminal {
    grid-area: terminal;
  }
`;
