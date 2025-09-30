import { fixture, html } from '@open-wc/testing';
import { describe, beforeEach, it, expect } from "vitest";

import CustomInput from "../src/custom-input"

describe('Day 21: Test CustomInput', () => {
  // 為了避免取不到自訂元件，在測試文件的一開始先重新定義元件
  customElements.define('un-custom-input', CustomInput);
  let customInput: CustomInput;

  beforeEach(async () => {
    customInput = await fixture(html`<un-custom-input></un-custom-input>`) as CustomInput;
  });

  // 測試元件是否正確被建立
  it('should create customInput', () => {
    const customInputElement = customInput.shadowRoot;

    expect(customInputElement).to.exist;
  });

  // 測試元件是否能取得預設值
  it('with default value: should get default value', () => {
    customInput.setAttribute('value', 'su su su supernova');

    expect(customInput.currentValue).to.equal('su su su supernova');
  });

  // 測試元件是否可以正確顯示 placeholder
  it('without default value: should get placeholder', () => {
    const customInputElement = customInput.shadowRoot!.querySelector('.custom-input');

    expect(customInput.currentValue).to.equal('');
    expect(customInputElement?.classList.contains('placeholder')).to.be.true;
  });

  // 測試輸入時是否正確更新值
  it('updates value when typing', () => {
    const customInputElement = customInput.shadowRoot!.querySelector('.custom-input')! as HTMLInputElement;

    customInputElement.innerText = 'hello, value changed!';
    const event = new Event('input', { bubbles: true, cancelable: true });
    customInputElement.dispatchEvent(event);

    expect(customInput.currentValue).to.equal('hello, value changed!');
  });
});