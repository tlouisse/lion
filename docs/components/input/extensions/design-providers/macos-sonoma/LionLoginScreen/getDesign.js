import { html, css } from 'lit';

// @ts-expect-error
const sonoma1080Mp4 = import.meta.resolve('../assets/sonoma_wallpaper_1080.mp4');
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
    }

    [data-part='background-asset'] {
      height: 100%;
    }

    [data-part='layout'] {
      flex-direction: column;
      align-items: center;
      position: relative;
      margin-top: var(--space-8);
      display: flex;
      color: white;
      gap: var(--space-1);
    }

    [data-part='date-and-time'] {
      color: rgba(255, 255, 255, 0.7);
      /* backdrop-filter: blur(1.25rem); */
      flex-direction: column;
      margin-bottom: var(--space-16);
      align-items: center;
      font-weight: bold;
      display: flex;
    }

    [data-part='date'] {
      font-size: 1.5rem;
    }

    [data-part='time'] {
      font-size: var(--space-8);
      /* mix-blend-mode: difference; */
    }

    [data-part='login'] {
      flex-direction: column;
      align-items: center;
      max-width: 50vh;
      display: flex;
      gap: var(--space-1);
    }

    [data-part='disclaimer'] {
      flex-direction: column;
      align-items: center;
      margin-bottom: var(--space-2);
      text-align: center;
      display: flex;
    }

    [data-part='avatar'] {
      border-radius: 50%;
      height: var(--space-4);
      width: var(--space-4);
    }
  `,
];

export function getDesignForLionLoginScreen() {
  return {
    styles: () => styles,

    templates: existingTemplates => ({
      ...existingTemplates,
      backgroundAsset() {
        // This is usually a decorative background image. It can also be a video
        return html` <!-- -->
          <video autoplay loop data-part="background-asset">
            >
            <source src="${sonoma1080Mp4}" type="video/mp4" />
          </video>`;
      },
      avatarAsset() {
        return html`<img data-part="avatar" alt="avatar" src="${avatarImg}" />`;
      },
    }),
  };
}
