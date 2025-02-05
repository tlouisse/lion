import { html, css } from 'lit';

const styles = [
  css`
    [data-part='root'] {
      flex-direction: column;
      display: flex;
      gap: 1rem;
    }

    [data-part='label'] {
      margin-bottom: var(--space-2);
      text-align: center;
      font-size: 2rem;
    }

    [data-part='input-wrapper'] {
      align-items: center;
      position: relative;
      display: flex;
      margin-right: -2.5rem;
    }

    [data-part='input'] {
      backdrop-filter: blur(0.5rem);
      border: 1px solid #999;
      border-radius: 0.25rem;
      background-color: white;
      padding: 0.5rem 1rem;
      outline: none;
      width: 18rem;
      height: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.7);
      filter: drop-shadow(0px 0px 2px #333);
    }

    [data-part='input']::placeholder {
      color: #aaa;
    }

    [data-part='proceed-btn'] {
      position: relative;
      border-radius: 50%;
      background: none;
      overflow: hidden;
      cursor: pointer;
      color: #fff;
      border: none;
      outline: none;

      display: block;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 0.5rem;

      height: 2.5rem;
      width: 2.5rem;
      filter: drop-shadow(0px 1px 4px #000000);
    }

    [data-part='proceed-btn']::before {
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

    [data-part='proceed-icon'] {
      height: 80%;
      width: 80%;
      fill: white;
    }

    [data-part='proceed-icon'] svg {
      height: 100%;
      width: 100%;
      z-index: 1;
      position: relative;
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
                    baseProfile="tiny"
                    height="24px"
                    id="Layer_1"
                    version="1.2"
                    viewBox="0 0 24 24"
                    width="24px"
                    xml:space="preserve"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                  >
                    <path
                      d="M10.586,6.586c-0.781,0.779-0.781,2.047,0,2.828L12.172,11H4.928c-1.104,0-2,0.895-2,2c0,1.104,0.896,2,2,2h7.244  l-1.586,1.586c-0.781,0.779-0.781,2.047,0,2.828C10.977,19.805,11.488,20,12,20s1.023-0.195,1.414-0.586L19.828,13l-6.414-6.414  C12.633,5.805,11.367,5.805,10.586,6.586z"
                    />
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
