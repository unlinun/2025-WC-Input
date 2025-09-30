import CustomInput from "./custom-input";

customElements.define("un-custom-input", CustomInput);

export default CustomInput;

export interface CustomInputElement extends HTMLElement {
  currentValue: string;           // 可讀寫的值
  checkValidity(): boolean;       // 確認驗證內容
  reportValidity(): boolean;      // 回報驗證結果
}

declare global {
  // 全域擴展 HTMLElementEventMap 介面，加入我們自定義的事件
  interface HTMLElementEventMap {
    "value-changed": CustomEvent<{ value: string }>;
  }
}