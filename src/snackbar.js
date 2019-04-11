import { MDCSnackbar } from "@material/snackbar/index";

class MdcSnackbar extends HTMLElement {

  static get observedAttributes() {
    return [ "message", "timeout" ];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.snackbar_ = new MDCSnackbar(this);
  }

  disconnectedCallback() {
    this.snackbar_.destroy();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.snackbar_) return;
    if (name === "message") {
      if (this.hasAttribute("message")) {
        this.snackbar_.open();
      }
    } else if (name === "timeout") {
      this.snackbar_.timeoutMs = parseInt(this.getAttribute("timeout"));
    }
  }
};

customElements.define("mdc-snackbar", MdcSnackbar);