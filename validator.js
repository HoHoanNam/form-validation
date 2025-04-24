// Đối tượng Validator
function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      // Kiểm tra xem cái element này có match với CSS selector hay không
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};

  // Hàm thực hiện validate
  function validate(inputElement, rule) {
    var errorMessage;
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);

    // Lấy ra các rules của selector
    // Nếu có lỗi thì dừng việc kiểm tra
    var rules = selectorRules[rule.selector];

    // Lặp qua các rules & kiểm tra
    for (var i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case 'radio':
        case 'checkbox':
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ':checked')
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    // Đứng từ thẻ <input> đang báo:
    // 1. Lấy ra thẻ cha của nó
    // 2. Từ thẻ cha của nó, tìm thẻ con có class="form-message"
    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add(
        'invalid'
      );
    } else {
      errorElement.innerText = '';
      getParent(inputElement, options.formGroupSelector).classList.remove(
        'invalid'
      );
    }

    // Covert sang kiểu boolean
    return !!errorMessage;
  }

  // Lấy element của form cần validate
  var formElement = document.querySelector(options.form);

  if (formElement) {
    // Khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      // Thực hiện lặp qua từng rule và validate
      options.rules.forEach((rule) => {
        var inputElement = formElement.querySelector(rule.selector);

        var isInvalid = validate(inputElement, rule);

        if (isInvalid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Trường hợp submit với javascript
        if (typeof options.onSubmit === 'function') {
          const enableInputs = formElement.querySelectorAll(
            '[name]:not([disabled])'
          );
          const formValues = {};

          enableInputs.forEach((input) => {
            switch (input.type) {
              case 'radio':
                formValues[input.name] = formElement.querySelector(
                  `input[name="${input.name}"]:checked`
                ).value;
                break;

              case 'checkbox':
                if (!input.matches(':checked')) {
                  formValues[input.name] = '';
                  return formValues;
                }
                if (!Array.isArray(formValues[input.name])) {
                  formValues[input.name] = [];
                }
                formValues[input.name].push(input.value);
                break;

              case 'file':
                formValues[input.name] = input.files;

              default:
                formValues[input.name] = input.value;
            }
          });

          options.onSubmit(formValues);
        }
        // Trường hợp submit với hành vi mặc định của trình duyệt
        else {
          formElement.submit();
        }
      }
    };

    // Lặp qua mỗi rule & xử lý (lắng nghe sự kiện blur, input, ...)
    options.rules.forEach((rule) => {
      // Lưu lại các rules cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach((inputElement) => {
        var parentElemnt = getParent(inputElement, options.formGroupSelector);
        var errorElement = parentElemnt.querySelector(options.errorSelector);

        // Xử lý trường hợp blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };

        // Xử lý mỗi khi người dùng nhập vào input
        // oninput: nó sẽ lọt vào sự kiện này mỗi khi người dùng gõ
        inputElement.oninput = function () {
          errorElement.innerText = '';
          parentElemnt.classList.remove('invalid');
        };
      });
    });
  }
}

// Định nghĩa các rules
// Nguyên tắc của các :
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, message) {
  return {
    selector,
    test(value) {
      return value ? undefined : message || 'Vui lòng nhập trường này';
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector,
    test(value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || 'Trường này phải là email';
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector,
    test(value) {
      return value.length >= min
        ? undefined
        : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmedValue, message) {
  return {
    selector,
    test(value) {
      return value === getConfirmedValue()
        ? undefined
        : message || 'Giá trị nhập vào không chính xác';
    },
  };
};
