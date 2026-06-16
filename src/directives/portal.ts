import { AsyncDirective, directive, type PartInfo, PartType } from 'lit/async-directive.js';
import { type TemplateResult } from 'lit';

class PortalDirective extends AsyncDirective {
  private container: HTMLElement | null = null;
  private targetEl: HTMLElement | null = null;
  
  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.CHILD) {
      throw new Error('portal directive can only be used in child bindings');
    }
  }

  render(template: TemplateResult | typeof nothing, target: string | HTMLElement | boolean = true) {
    if (target === false) {
      return template;
    }

    if (!this.container) {
      if (typeof target === 'string') {
        this.targetEl = document.querySelector(target) as HTMLElement;
      } else if (target instanceof HTMLElement) {
        this.targetEl = target;
      } else {
        this.targetEl = document.body;
      }

      if (!this.targetEl) {
        console.warn(`Portal target not found.`);
        return nothing;
      }

      this.container = document.createElement('div');
      this.container.style.display = 'contents';
      this.targetEl.appendChild(this.container);
    }

    if (this.container) {
      render(template, this.container);
    }

    return nothing;
  }

  disconnected() {
    if (this.container) {
      render(nothing, this.container);
      this.container.remove();
      this.container = null;
    }
  }
}

export const portal = directive(PortalDirective);
