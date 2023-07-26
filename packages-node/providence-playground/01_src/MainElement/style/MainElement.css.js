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

  .editor {
    height: 100%;
    position: relative;
    display: block;
    outline: 1px solid var(--surface-4);
    overflow: scroll;
  }

  .accordion-heading {
    background: none;
    border: none;
    padding: 10px;
    display: block;
    width: 100%;
    outline: 1px solid var(--surface-4);
    position: relative;
    display: flex;
    text-transform: uppercase;
    font-size: var(--font-size-0);
    font-weight: bold;
    padding-left: 0;
  }

  .accordion-heading[aria-expanded='true'] .accordion-heading__icon svg {
    transform: rotate(90deg);
  }

  .fieldset {
    display: flex;
    flex-direction: column;
    border: none;
    font-size: var(--font-size-0);
    gap: var(--size-0);
  }

  .fieldset label {
    display: flex;
    align-items: end;
  }
`;
