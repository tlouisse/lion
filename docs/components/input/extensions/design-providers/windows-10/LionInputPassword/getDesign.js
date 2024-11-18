import { html, css } from 'lit';

const styles = [
  css`
    [data-part='root'] {
      flex-direction: column;
      display: flex;
      gap: 1rem;
    }

    [data-part='label'] {
      text-align: center;
      font-size: 2rem;
      margin-bottom: var(--space-2);
    }

    [data-part='input'] {
      background-color: white;
      backdrop-filter: blur(0.5rem);
      padding: 0.5rem 1rem;
      outline: none;
      border: 1px solid #999;
      width: 18rem;
    }

    [data-part='input']::placeholder {
      color: #aaa;
    }

    [data-part='input-group'] {
      display: flex;
    }

    [data-part='proceed-btn'] {
      background-color: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(1.25rem);
      border: 1px solid lightblue;
      justify-content: center;
      align-items: center;
      position: relative;
      display: block;
      display: flex;
      width: 2rem;
      padding: 0;
    }

    [data-part='proceed-icon'] {
      height: 80%;
      width: 80%;
      fill: white;
    }

    [data-part='proceed-icon'] svg {
      height: 100%;
      width: 100%;
    }

    [data-part='input-wrapper'] {
      position: relative;
      display: flex;
    }
  `,
];

export function getDesignForLionInputPassword() {
  return {
    styles: () => styles,

    templates: existingTemplates => ({
      ...existingTemplates,
      root(context) {
        const { part } = context;

        return html`
          <div ${part('root')}>
            <label ${part('label')}></label>
            <div data-part="input-wrapper">
              <input ${part('input')} />
              <button aria-label="Login" data-part="proceed-btn">
                <div data-part="proceed-icon">
                  <svg
                    height="512px"
                    id="Layer_1"
                    style="enable-background:new 0 0 512 512;"
                    version="1.1"
                    viewBox="0 0 512 512"
                    width="512px"
                    xml:space="preserve"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                  >
                    <polygon points="160,115.4 180.7,96 352,256 180.7,416 160,396.7 310.5,256 " />
                  </svg>
                </div>
              </button>
            </div>
            <div ${part('feedback')} role="region"></div>
          </div>
        `;
      },
    }),
  };
}
