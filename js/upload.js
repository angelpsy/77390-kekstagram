  /*global docCookies*/
  /**
  * @fileoverview
  * @author Igor Alexeenko (o0)
  */
  'use strict';

  var Resizer = require('resizer');

  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  /**
   * Выбранный фильтр
   * @type {string}
   */
  var selectedFilter = 'none';

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var resizeXVal = +resizeForm['resize-x'].value,
      resizeYVal = +resizeForm['resize-y'].value,
      resizeSizeVal = +resizeForm['resize-size'].value,
      formValid = false,
      errorText = '';
    if (isNaN(resizeXVal) || isNaN(resizeYVal) || isNaN(resizeSizeVal)) {
      errorText = 'Значения полей должны содержать только цифры';
    } else if (resizeXVal < 0 || resizeYVal < 0 || resizeSizeVal < 0) {
      errorText = 'Значения могут быть только положительными';
    } else if ((resizeXVal + resizeSizeVal) > currentResizer._image.naturalWidth) {
      errorText = 'Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения: ' + currentResizer._image.naturalWidth;
    } else if ((resizeYVal + resizeSizeVal) > currentResizer._image.naturalHeight) {
      errorText = 'Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения: ' + currentResizer._image.naturalHeight;
    } else {
      formValid = true;
    }

    resizeForm['resize-fwd'].setAttribute('data-alert', errorText + '. Исправьте');
    return formValid;
  }

  /**
   * валидация формы кадрирования
   */
  function enableResizeFwd() {
    var formIsValid = resizeFormIsValid();
    if (currentResizer.getConstraint() && formIsValid) {
      currentResizer.setConstraint(+resizeForm['resize-x'].value, +resizeForm['resize-y'].value, +resizeForm['resize-size'].value);
    }
    resizeForm['resize-fwd'].disabled = !formIsValid;
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);

          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();

          enableResizeFwd();
          // Изначальные значения для полей формы кадрирования
          setTimeout(resizerChangeInForm, 1);
        });

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    [].forEach.call(resizeForm.querySelectorAll('input[type="number"]'), function(item) {
      item.value = '';
    });

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка изменения формы кадрирования. Если форма валидна, активирует
   * кнопку отправки формы, иначе деактивирует
   */
  resizeForm.addEventListener('change', function() {
    enableResizeFwd();
  });

  resizeForm.addEventListener('input', function() {
    enableResizeFwd();
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    setCookie();

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработчик изменения фильтра.
   */
  filterForm.addEventListener('change', function() {
    changeFilter();
  });

  //

  window.addEventListener('resizerchange', resizerChangeInForm);

  function resizerChangeInForm() {
    resizeForm['resize-x'].value = currentResizer.getConstraint().x;
    resizeForm['resize-y'].value = currentResizer.getConstraint().y;
    resizeForm['resize-size'].value = currentResizer.getConstraint().side;
  }

  /**
   * Функция изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  function changeFilter() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  }

  /**
   * Сохраняем значение выбранного фильтра в cookie.
   */
  function setCookie() {
    document.cookie = 'filter=' + selectedFilter + ';expires=' + getDateToExpire();
  }

   /**
    * Возвращаем дату истечения cookie, учитывая, что срок жизни cookie
    * — количество дней, прошедшее с вашего ближайшего дня рождения.
    */
  function getDateToExpire() {
    var birthDay = 4,
      birthMonth = 10, //Январь = 0
      currentDate = new Date(),
      currentYear = currentDate.getFullYear(),
      birthInCurrentYear = +(new Date(currentYear, birthMonth, birthDay)),
      timeWithBirth = currentDate - birthInCurrentYear;
    currentDate = +currentDate;
    if (timeWithBirth < 0) {
      timeWithBirth = currentDate - new Date(currentYear - 1, birthMonth, birthDay);
    }

    var dateToExpire = Date.now() + timeWithBirth,
      formatedDateToExpire = new Date(dateToExpire).toUTCString();

    return formatedDateToExpire;
  }

  /**
   * Устанавливаем фильтр, записанный в cookies, выбранным по умолчанию.
   *
   */
  function selectedFilterDefault() {
    var filterDefault = docCookies.getItem('filter');
    if (!filterDefault) {
      return;
    }
    filterForm['upload-filter-' + filterDefault].checked = true;
    changeFilter();
  }

  selectedFilterDefault();

  cleanupResizer();
  updateBackground();
