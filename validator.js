// Đối tượng Validator
function Validator(options) {
  // Hàm thực hiện validate
  function validate(inputElement, formGroupElement, errorElement, rule) {
    var errorMessage = rule.test(inputElement.value);
    var errorElement = formGroupElement.querySelector(options.errorSelector);

    // Đứng từ thẻ <input> đang báo:
    // 1. Lấy ra thẻ cha của nó
    // 2. Từ thẻ cha của nó, tìm thẻ con có class="form-message"
    if (errorMessage) {
      errorElement.innerText = errorMessage;
      formGroupElement.classList.add('invalid');
    } else {
      errorElement.innerText = '';
      formGroupElement.classList.remove('invalid');
    }
  }

  // Lấy element của form cần validate
  var formElement = document.querySelector(options.form);

  if (formElement) {
    options.rules.forEach((rule) => {
      var inputElement = formElement.querySelector(rule.selector);

      if (inputElement) {
        var formGroupElement = inputElement.parentElement;
        var errorElement = formGroupElement.querySelector(
          options.errorSelector
        );

        // Xử lý trường hợp blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, formGroupElement, errorElement, rule);
        };

        // Xử lý mỗi khi người dùng nhập vào input
        // oninput: nó sẽ lọt vào sự kiện này mỗi khi người dùng gõ
        inputElement.oninput = function () {
          errorElement.innerText = '';
          formGroupElement.classList.remove('invalid');
        };
      }
    });
  }
}

// Định nghĩa các rules
// Nguyên tắc của các :
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector) {
  return {
    selector,
    test(value) {
      return value.trim() ? undefined : 'Vui lòng nhập trường này';
    },
  };
};

Validator.isEmail = function (selector) {
  return {
    selector,
    test(value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : 'Trường này phải là email';
    },
  };
};

Validator.minLength = function (selector, min) {
  return {
    selector,
    test(value) {
      return value.length >= min
        ? undefined
        : `Vui lòng nhập tối thiểu ${min} ký tự`;
    },
  };
};
