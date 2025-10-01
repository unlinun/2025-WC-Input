/*
鐵人賽示範的 Web Component: input（表單元件）
希望是一個可以提供外部進行大多數表單使用的元件。
 */
export default class CustomInput extends HTMLElement {
  // 宣告與表單產生關聯
  static formAssociated = true;

  // 要監聽的屬性
  static get observedAttributes() {
    return [
      'value',
      'disabled',
      'required',
      'max-length',
      'min-length',
      'type',
      'pattern', // 提供自訂的 regex
      'pattern-message' // 不符合 regex 時的錯誤訊息
    ];
  }

  private readonly internals!: ElementInternals;
  private readonly input: HTMLDivElement | null = null;
  private value: string = '';
  private defaultValue: string = '';
  private placeholder: string = '請輸入文字...';
  private required: boolean = false;
  private allowMulti: boolean = false;
  private maxLength: number = 0;
  private minLength: number = 0;
  private inputType: 'text' | 'password' = 'text';
  private customPattern: RegExp | null = null;
  private patternMessage: string = '格式不符合要求';
  private dirty = false;

  constructor() {
    super();
    this.internals = this.attachInternals();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const cloneNode = this.render().cloneNode(true);
    shadowRoot.appendChild(cloneNode);

    this.input = this.shadowRoot!.querySelector('.custom-input');
  }

  connectedCallback() {
    // 使用 getAttribute 取得預設值
    this.defaultValue = this.getAttribute('value') || '';
    this.placeholder = this.getAttribute('placeholder') || '請輸入文字...';
    this.allowMulti = this.getAttribute('multiline') ? !!this.getAttribute('multiline') : false;
    this.inputType = (this.getAttribute('type') as 'text' | 'password') || 'text';
    this.patternMessage = this.getAttribute('pattern-message') || '格式不符合要求';

    // 可以接受自定義的 regex
    const pattern = this.getAttribute('pattern');

    if (pattern) {
      try {
        this.customPattern = new RegExp(pattern);
      } catch (e) {
        this.customPattern = null;
      }
    }

    if (!this.input) {
      return;
    }

    // 初始化 input value
    this.initInputValue();
    // 加入 input 事件
    this.setInputEvent();
  }

  // 監聽 value, disabled 屬性變更
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (!this.input) {
      return;
    }

    if (oldValue === newValue) {
      return;
    }

    if (name === 'value') {
      this.value = newValue; // 透過 setter 同步
    }

    if (name === 'disabled') {
      this.input.setAttribute('contenteditable', newValue === null ? 'true' : 'false');
    }

    if (name === 'required') {
      // 只要屬性存在就設為 true，不存在就是 false
      this.required = newValue !== null;
    }

    // 監聽外部最大長度限制
    if (name === 'max-length') {
      // 試試先轉成數字（要確保填入的是數字）
      const parsed = parseInt(newValue, 10);
      this.maxLength = !isNaN(parsed) && parsed > 0 ? parsed : 0;
    }

    // 監聽外部最小長度限制
    if (name === 'min-length') {
      // 試試先轉成數字（要確保填入的是數字）
      const parsed = parseInt(newValue, 10);
      this.minLength = !isNaN(parsed) && parsed > 0 ? parsed : 0;
    }

    // 監聽 type 變更
    if (name === 'type') {
      this.inputType = (newValue as 'text' | 'password') || 'text';
      this.setPasswordStyle();
    }

    // 監聽 pattern 變更
    if (name === 'pattern') {
      try {
        this.customPattern = newValue ? new RegExp(newValue) : null;
      } catch (e) {
        console.error('Invalid pattern:', e);
        this.customPattern = null;
      }
    }

    // 監聽 pattern-message 變更
    if (name === 'pattern-message') {
      this.patternMessage = newValue || '格式不符合要求';
    }
  }

  // 提供外部可取值/設值
  get currentValue() {
    return this.value;
  }

  set currentValue(value) {
    if (!this.input) {
      return;
    }

    this.value = value.trim() || '';
    this.input.textContent = this.value;
    this.internals!.setFormValue(this.value);
  }

  // 提供外部可以獲取欄位狀態
  get inputDirty() {
    return this.dirty;
  }

  // public method: 驗證欄位是否無誤
  public checkValidity() {
    return this.internals.checkValidity();
  }

  // public method: 驗證欄位是否無誤，並顯示錯誤訊息
  public reportValidity() {
    return this.internals.reportValidity();
  }

  // public method: 外部觸發驗證
  public touchAndValidate() {
    this.dirty = true;
    this.inputValidator(); // 直接執行內部驗證
  }

  // public method: 提供外部設定自訂錯誤訊息
  public setCustomError(msg: string) {
    this.internals.setValidity(
      { customError: true },
      msg,
      this.input!
    );

    this.input!.classList.add('error');
    this.updateErrorDisplay();
  }

  // public method: 提供外部錯誤訊息
  public getErrorMsg() {
    return this.internals.validationMessage;
  }

  // public method: 提供外部 reset 欄位值, 錯誤
  public reset() {
    if (!this.input) {
      return;
    }

    // 重置為預設值
    this.value = this.defaultValue;

    if (this.defaultValue) {
      this.input.innerText = this.defaultValue;
      this.internals.setFormValue(this.defaultValue);
    } else {
      this.input.innerText = this.placeholder;
      this.input.classList.add('placeholder');
      this.internals.setFormValue('');
    }

    // 清除驗證狀態
    this.internals.setValidity({});
    this.input.classList.remove('error');
    this.updateErrorDisplay();

    // 發送 reset 事件
    this.dispatchEvent(new CustomEvent('input-reset', {
      bubbles: true,
      composed: true
    }));
  }

  private render() {
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
       :host {
          --ci-border-color: #6139af;
          --ci-bg-color: #ffffff;
          --ci-radius: 4px;
          --ci-padding: 4px 12px;
          --ci-error: #d24343;
          --ci-font-size: 16px;
          --ci-line-height: 1.5;
          --ci-placeholder-color: #999;
        }
        
        .container {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
      
        .custom-input {
          border: 1px solid var(--ci-border-color);
          border-radius: var(--ci-radius);
          padding: var(--ci-padding);
          background-color: var(--ci-bg-color);
          font-size: var(--ci-font-size);
          line-height: var(--ci-line-height);
          outline: none;
        }
      
        .custom-input.error {
          border: 1px solid var(--ci-error);
        }
        
        .custom-input.placeholder {
          color: var(--ci-placeholder-color);
        }
        
        .custom-input.password {
          -webkit-text-security: disc;
          text-security: disc;
          font-family: text-security-disc;
        }
        
         .custom-input.password.placeholder {
          -webkit-text-security: none; /* 移除遮罩 */
          text-security: none;
          font-family: inherit;        /* 回到正常字型 */
          color: var(--ci-placeholder-color);
        }
        
        .error-msg {
          color: var(--ci-error);
          font-size: calc(var(--ci-font-size) - 2px);
          padding: 0 4px;
        }
      </style>

      <div class="container" part="container">
        <!--  使用 contenteditable 來做一個假的 input   -->
        <div class="custom-input" contenteditable="true" part="custom-input"></div>
        <span class="error-msg" part="error-msg"></span>
      </div>
    `

    return template.content;
  }

  // 初始化欄位的值
  private initInputValue() {
    if (this.defaultValue) {
      this.value = this.defaultValue;
      this.input!.innerText = this.value;
      this.internals.setFormValue(this.value); // 記得呼叫，不然無法寫入 formData
    } else {
      this.input!.innerText = this.placeholder;
      this.input!.classList.add('placeholder');
    }
  }

  // 設定密碼樣式
  private setPasswordStyle() {
    if (this.inputType === 'password') {
      this.input!.classList.add('password');
    } else {
      this.input!.classList.remove('password');
    }
  }

  // 初始化欄位的事件
  private setInputEvent() {
    // 加入 input 事件
    this.input!.addEventListener('input', this.handleInputEvent.bind(this));
    this.input!.addEventListener('focus', this.handleFocusEvent.bind(this));
    this.input!.addEventListener('blur', this.handleBlurEvent.bind(this));
    this.input!.addEventListener('keydown', this.handleKeydownEvent.bind(this));
  }

  private handleInputEvent(e: Event) {
    // 利用表單方法 `setFormValue` 寫入欄位的值，將值同步到 form internals
    const value = (e.target as HTMLElement).innerText.trim() || '';
    this.value = value;
    this.internals.setFormValue(value);

    // 加入驗證方法
    this.inputValidator();

    // 發送事件給外部
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  private handleFocusEvent() {
    // 當 focus 時，清空 placeholder
    if (this.input!.classList.contains('placeholder')) {
      this.input!.innerText = '';
      this.input!.classList.remove('placeholder');
    }

    this.dirty = true; // 一旦 focus 就是為使用者已經開始跟元件互動

    // 發送 focus 事件給外部
    this.dispatchEvent(new CustomEvent('input-focus', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  private handleBlurEvent() {
    // 當 blur 時，如果沒有輸入，回填 placeholder
    if (!this.value) {
      this.input!.innerText = this.placeholder;
      this.input!.classList.add('placeholder');
    }

    // 發送 blur 事件給外部
    this.dispatchEvent(new CustomEvent('input-blur', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  private handleKeydownEvent(e: KeyboardEvent) {
    if (e.key === 'Enter' && !this.allowMulti) {
      e.preventDefault();
    }
  }

  // 驗證方法
  private inputValidator() {
    // required 必填檢查
    if (this.required && !this.value) {
      this.internals.setValidity(
        { valueMissing: true },
        '此欄位為必填！',
        this.input!
      );

      this.input!.classList.add('error');
      this.updateErrorDisplay();
      return false;
    }

    // max-length 最大長度檢查
    if (this.maxLength && this.value.length > this.maxLength) {
      this.internals.setValidity(
        { tooLong: true },
        `此欄位不能超過 ${ this.maxLength } 個字！`,
        this.input!
      );

      this.input!.classList.add('error');
      this.updateErrorDisplay();
      return false;
    }

    // max-length 最大長度檢查
    if (this.minLength && this.value.length < this.minLength) {
      this.internals.setValidity(
        { tooShort: true },
        `此欄位不能小於 ${ this.minLength } 個字！`,
        this.input!
      );

      this.input!.classList.add('error');
      this.updateErrorDisplay();
      return false;
    }

    // pattern 格式檢查
    if (this.customPattern && this.value && !this.customPattern.test(this.value)) {
      this.internals.setValidity(
        { patternMismatch: true },
        this.patternMessage,
        this.input!
      );

      this.input!.classList.add('error');
      this.updateErrorDisplay();
      return false;
    }

    // 通過驗證
    this.internals.setValidity({});
    this.input!.classList.remove('error');
    this.updateErrorDisplay();
    return true;
  }

  // 更新錯誤訊息顯示
  private updateErrorDisplay() {
    const errorMsg = this.shadowRoot!.querySelector('.error-msg');

    if (errorMsg) {
      errorMsg.textContent = this.internals.validationMessage || '';
    }
  }
}