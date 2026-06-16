import { adoptStyles, type LitElement, unsafeCSS } from "lit";
import style from "../styles/main.css?inline";
 
declare global {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  export type LitMixin<T = unknown> = new (...args: any[]) => T & LitElement;
}
 
const stylesheet = unsafeCSS(style);
 
export const TW = <T extends LitMixin>(superClass: T): T =>
  class extends superClass {
    connectedCallback() {
      super.connectedCallback();
      if (this.shadowRoot) {
        const elementStyles = (this.constructor as typeof LitElement).elementStyles || [];
        adoptStyles(this.shadowRoot, [...elementStyles, stylesheet]);
      }
    }
  };