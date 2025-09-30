class MockInternals {
  private currentValue = '';

  public setFormValue(value: any) {
    this.currentValue = value;
  }
  public getFormValue() {
    return this.currentValue;
  }

  public setValidity() {}
}

Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
  value: function () {
    return new MockInternals();
  },
});
