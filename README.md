### Introduction:
```
This is a form input web component that supports multiple types and content validation.
You can add your own validation settings and style types.
```

### Install:
You can install `un-custom-input` with `npm`, or just get started quickly with `CDN`.

- npm
```bash=
npm i un-custom-input
```

After the package is installed, then you can import the input web component into you code:
```javascript
// import element in your JS file
import 'un-custom-input';
```

```html
<!-- use element in HTML -->
<un-custom-input></un-custom-input>
```

- CDN
```html
<script type="module" src="https://unpkg.com/un-custom-input/dist/custom-input.mjs"></script>
```

```html
<!-- use element in HTML -->
<un-custom-input></un-custom-input>
```

### Basic Usage:

- basic text input with `defaultVlaue` & `min/max length`
```html
<un-custom-input
  name="basicInput"
  value="default value"
  max-length="5"
  min-length="2"
>
</un-custom-input>
```

- password input with `required` attribute
```html
<un-custom-input
  name="password"
  placeholder="請輸入密碼"
  required
  type="password"
>
</un-custom-input>
```

- email input with `pattern` and `pattern message`
```html
<un-custom-input
  name="email"
  placeholder="your@email.com"
  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
  pattern-message="invalid email pattern"
  required>
</un-custom-input>
```

### Attribute
| Attribute       | Description                                                  | Default Value        |
|-----------------|--------------------------------------------------------------|----------------------|
| value           | Initial value of the input.                              | `""`                 |
| placeholder     | when the input is empty, will show placeholder.              | `"請輸入文字..."`    |
| disabled        | Disables the input.                             | `false`              |
| required        | Must fill with value.                    | `false`             |
| type            | Input type: `text ｜ password`                               | `"text"`             |
| multiline       | Allows multiline input.                         | `false`              |
| max-length      | Maximum number of input value.                        | `0` (no limit)       |
| min-length      | Minimum number of input value.                       | `0` (no limit)       |
| pattern         | A regex pattern for input validation (e.g., `[A-Za-z]+`).    | `""`              |
| pattern-message | Custom error message, when the pattern validation fails.| `"格式不符合要求"`   |

### Methods
| Method            | Description                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| checkValidity()   | Checks if the input passes validation. Returns `true` if valid, `false` otherwise. |
| reportValidity()  | Checks validity and displays the error message if invalid. Returns `true` if valid. |
| touchAndValidate()| Marks the input as dirty and triggers validation.                           |
| setCustomError(msg)| Sets a custom error message and marks the input as invalid.                |
| getErrorMsg()     | Returns the current validation error message, if any.                       |
| reset()           | Resets the input to its default value and clears errors.                     |

### Properties
| Property     | Description                                      |
|--------------|--------------------------------------------------|
| currentValue | Getter/setter for the input's current value.     |
| inputDirty   | Returns `true` if the user has interacted with the input. |

### Events
| Event         | Description                         | Details             |
|---------------|-------------------------------------|---------------------|
| value-changed | Fired when the input value changes. | `{ value: string }` |
| input-focus   | Fired when the input gains focus.   | `{ value: string }` |
| input-blur    | Fired when the input loses focus.   | `{ value: string }` |
| input-reset   | Fired when the input is reset.      | None                |

### Styling
Three parts that can be styled using the `::part()` pseudo-element:

| name         | Description                         | 
|---------------|-------------------------------------|
|::part(container) | The outer wrapper `<div>` that contains the input and error message. | 
|::part(custom-input)  | The `<div>` element acting as the editable input field.   | 
| ::part(error-msg)   | The `<span>` element that displays validation error messages.   | 

example:
In your style.css overwrite style.
```css=
custom-input::part(container) {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 8px;
}
```

### Change Log
### [1.0.0] - 2025-10-02
- Initial and release un-custom-input v1.0.0.

### License:
MIT License.