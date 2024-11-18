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
      font-weight: bold;
    }

    [data-part='input'] {
      background-color: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(1.25rem);
      padding: 0.5rem 1rem;
      border-radius: 1rem;
      outline: none;
      color: white;
      border: none;
      width: 12rem;
    }

    [data-part='input']::placeholder {
      color: rgba(255, 255, 255, 0.25);
      font-weight: bold;
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
            <input ${part('input')} />
            <div ${part('feedback')} role="region"></div>
          </div>
        `;
      },
    }),
  };
}
