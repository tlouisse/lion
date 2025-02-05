import { html, css } from 'lit';

// @ts-expect-error
const windowsBg = import.meta.resolve('../assets/win10_login_bg.jpg');
// @ts-expect-error
const avatarImg = import.meta.resolve('../assets/win10_avatar.png');

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

    [data-part='avatar'] {
      border-radius: 50%;
      height: calc(var(--space-8) * 1.5);
      width: calc(var(--space-8) * 1.5);
      margin-bottom: var(--space-2);
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
        return html`<img data-part="avatar" alt="avatar" src="${avatarImg}" />`;
      },
    }),
  };
}
