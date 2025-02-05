import { html, css } from 'lit';

// @ts-expect-error
const windowsBg = import.meta.resolve('../assets/windows_vista_login.webp');
// @ts-expect-error
const avatarImg = import.meta.resolve('../assets/avatar.png');

const styles = [
  css`
    :host {
      --space-1: 1.7vh;
      --space-2: calc(var(--space-1) * 2);
      --space-4: calc(var(--space-1) * 4);
      --space-8: calc(var(--space-1) * 8);
      --space-16: calc(var(--space-1) * 16);
    }

    [data-part='root'] {
      font-family: Arial, Helvetica, sans-serif;
      position: fixed;
      gap: 1rem;
      inset: 0;
    }

    [data-part='background'] {
      /* pull us out of the page flow, so that the container is painted on top */
      position: absolute;
      inset: 0;
    }

    [data-part='background-asset'] {
      object-fit: cover;
      height: 100%;
      width: 100%;
    }

    [data-part='layout'] {
      margin-top: var(--space-8);
      flex-direction: column;
      gap: var(--space-1);
      align-items: center;
      position: relative;
      display: flex;
      color: white;
    }

    [data-part='date-and-time'] {
      display: none;
    }

    [data-part='date'] {
      font-size: 1.5rem;
    }

    [data-part='time'] {
      font-size: var(--space-8);
    }

    [data-part='login'] {
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);
      max-width: 50vh;
      display: flex;
    }

    [data-part='disclaimer'] {
      margin-bottom: var(--space-2);
      flex-direction: column;
      align-items: center;
      text-align: center;
      display: flex;
    }

    [data-part='avatar-wrapper'] {
      border-radius: 0.5rem;
      overflow: hidden;
      position: relative;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-2);
      border: 1px solid rgba(255, 255, 255, 0.7);
      filter: drop-shadow(0px 2px 10px #000000);
    }

    [data-part='avatar-wrapper']::before {
      display: block;
      content: '';
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
      background-image: linear-gradient(
        to bottom,
        #bfdbf7 0%,
        #6986be 40%,
        #032768 50%,
        #032768 70%,
        #89e8fc 100%
      );
    }

    [data-part='proceed-btn']::after {
      content: '';
      display: block;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: calc(100% + 4px);
      height: calc(100% + 4px);
      box-sizing: content-box;
      background-image: linear-gradient(to top, cyan, #fff);
      z-index: 0;
      border: 1px solid #222;
      border-radius: 5px;
    }

    [data-part='avatar'] {
      height: calc(var(--space-8) * 1.5);
      width: calc(var(--space-8) * 1.5);
      z-index: 1;
    }
  `,
];

export function getDesignForLionLoginScreen() {
  return {
    styles: () => styles,

    templateContextProcessor: context => ({
      ...context,
      labels: {
        ...context.labels,
        loginPlaceholder: 'Password',
      },
    }),

    templates: existingTemplates => ({
      ...existingTemplates,
      backgroundAsset() {
        return html`<img data-part="background-asset" alt="" src="${windowsBg}" /> `;
      },
      avatarAsset() {
        return html` <!-- -->
          <div data-part="avatar-wrapper">
            <img data-part="avatar" alt="avatar" src="${avatarImg}" />
          </div>`;
      },
    }),
  };
}
