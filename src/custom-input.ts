export default class CustomInput extends HTMLElement {
  // 宣告與表單產生關聯
  static formAssociated = true;

  // 監聽的屬性
  static get observedAttributes() {
    return ['value', 'disabled', 'required', 'max-length', 'min-length'];
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

      if (newValue !== oldValue) {
        this.inputValidator(); // 加上時馬上驗證
      }
    }

    // 監聽外部最大長度限制
    if (name === 'max-length') {
      // 試試先轉成數字（要確保填入的是數字）
      const parsed = parseInt(newValue, 10);
      this.maxLength = !isNaN(parsed) && parsed > 0 ? parsed : 0;

      if (newValue !== oldValue) {
        this.inputValidator(); // 加上時馬上驗證
      }
    }

    // 監聽外部最小長度限制
    if (name === 'min-length') {
      // 試試先轉成數字（要確保填入的是數字）
      const parsed = parseInt(newValue, 10);
      this.minLength = !isNaN(parsed) && parsed > 0 ? parsed : 0;

      if (newValue !== oldValue) {
        this.inputValidator(); // 加上時馬上驗證
      }
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

  // 對外公開 checkValidity()
  public checkValidity() {
    return this.internals.checkValidity();
  }

  // 對外公開 reportValidity()
  public reportValidity() {
    return this.internals.reportValidity();
  }

  // 對外公開 errorMessage
  public getErrorMsg() {
    return this.internals.validationMessage;
  }

  private render() {
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
       :host {
          --ci-border-color: #734dc0;
          --ci-bg-color: #ffffff;
          --ci-radius: 4px;
          --ci-padding: 4px 12px;
          --ci-error-border: #772121;
        }
        
       .custom-input {
           border: 2px dashed var(--ci-border-color);
           border-radius: var(--ci-radius);
           padding: var(--ci-padding);
        }
      </style>
      <!--  使用 contenteditable 來做一個假的 input   -->
      <div class="custom-input" contenteditable="true"></div>
    `

    return template.content;
  }

  // 初始化欄位的值
  private initInputValue() {
    if (!this.input) {
      return;
    }

    if (this.defaultValue) {
      this.value = this.defaultValue;
      this.input.innerText = this.value;
      this.internals.setFormValue(this.value); // 記得呼叫，不然無法寫入 formData
    } else {
      this.input.innerText = this.placeholder;
      this.input.classList.add('placeholder');
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
  }

  private handleBlurEvent() {
    // 當 blur 時，如果沒有輸入，回填 placeholder
    if (!this.value) {
      this.input!.innerText = this.placeholder;
      this.input!.classList.add('placeholder');
    }
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

      return false;
    }

    // max-length 最大長度檢查
    if (this.maxLength && this.value.length > this.maxLength) {
      this.internals.setValidity(
        { tooLong: true },
        `此欄位不能超過 ${ this.maxLength } 個字！`,
        this.input!
      );

      return false;
    }

    // max-length 最大長度檢查
    if (this.minLength && this.value.length < this.minLength) {
      this.internals.setValidity(
        { tooShort: true },
        `此欄位不能小於 ${ this.minLength } 個字！`,
        this.input!
      );

      return false;
    }

    // 通過驗證
    this.internals.setValidity({});
    return true;
  }
}