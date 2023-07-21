import { css } from 'lit';

// TODO: add inverted lightness variables with LCH
// https://lea.verou.me/2021/03/inverted-lightness-variables/

export default css`
  /** normalize */

  * {
    box-sizing: border-box;
  }

  [hidden] {
    display: none;
  }

  ol,
  ol li,
  ol ol li,
  ul,
  ul li,
  ul ul li {
    margin: 0;
    padding: 0;
    text-indent: 0;
    list-style-type: 0;
  }

  /** theme */

  .brand {
    background-color: var(--brand);
    color: var(--brand);
    fill: var(--brand);
  }

  .surface-1 {
    background-color: var(--surface-1);
    color: var(--text-2);
    fill: var(--text-2);
  }

  .surface-2 {
    background-color: var(--surface-2);
    color: var(--text-2);
    fill: var(--text-2);
  }

  .surface-3 {
    background-color: var(--surface-3);
    color: var(--text-1);
    fill: var(--text-1);
  }

  .surface-4 {
    background-color: var(--surface-4);
    color: var(--text-1);
    fill: var(--text-1);
  }

  .text-1 {
    color: var(--text-1);
  }

  .text-1 p {
    font-weight: var(--font-weight-2);
  }

  .text-2 {
    color: var(--text-2);
  }

  /** css utils */
  .--icon-wrapper {
    height: 1em;
    width: 1em;
  }

  .--icon-wrapper svg {
    height: 100%;
    width: 100%;
  }

  .--super-text {
    font-size: 0.4em;
    translate: 0 -100%;
    position: absolute;
    right: 0;
    top: 4px;
  }

  .--highlight-text {
    -webkit-text-fill-color: #0000;
    background-clip: text;
    -webkit-background-clip: text;
    background-image: linear-gradient(to right, #761fac 0, #8a19a9 20%, #d900a5 70%, #d917a3 100%);
    filter: drop-shadow(0 1px 0 #fff);
    font-weight: 800;
    color: var(--brand);
    text-decoration: underline;

    /** fix themed gradients later */
    background: none;
    filter: none;
    -webkit-text-fill-color: unset;
  }

  .--flex {
    display: flex;
    align-items: center;
    gap: var(--size-2);
  }

  .--relative {
    position: relative;
  }
`;
