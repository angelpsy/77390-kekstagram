'use strict';

(function() {
  var listFoto = {},
    currentTime = Date.now();

  var filtersHidden = function() {
    listFoto.filtersContainer.classList.add('hidden');
  };

  var filtersShow = function() {
    listFoto.filtersContainer.classList.remove('hidden');
  };

  var throttle = function(func, ms) {
    var isThrottled = false,
      savedArgs,
      savedThis;

    function wrapper() {
      if (isThrottled) {
        savedArgs = arguments;
        savedThis = this;
        return;
      }
      func.apply(this, arguments);
      isThrottled = true;

      setTimeout(function() {
        isThrottled = false;
        if (savedArgs) {
          wrapper.apply(savedThis, savedArgs);
          savedArgs = savedThis = null;
        }
      }, ms);
    }

    return wrapper;
  };


  // на основе шаблона для каждого элемента создаем DOM-элемент
  listFoto.getElementFromTemplate = function(data) {
    var element = listFoto.pictureTemplatSelector.cloneNode(true);
    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;
    element.href = data.url;

    var newImage = new Image();
    newImage.onload = function() {
      clearTimeout(imgLoadTimeout);
      element.replaceChild(newImage, element.querySelector('img'));
    };
    newImage.onerror = function() {
      element.classList.add('picture-load-failure');
    };
    newImage.src = data.url;

    listFoto.IMG_SIZE = 182;
    newImage.width = listFoto.IMG_SIZE;
    newImage.height = listFoto.IMG_SIZE;


    var IMG_TIMEOUT = 10000,
      imgLoadTimeout = setTimeout(function() {
        newImage.src = '';
        element.classList.add('picture-load-failure');
      }, IMG_TIMEOUT);

    return element;
  };

  // Для всех элементов массива с изображенями создаем элемент и вставляем его в "фрагмент",
  // который потом вставляем в контейнер для изображений
  listFoto.renderFotos = function(pictures, pageNumber, replace) {
    pictures = pictures || listFoto.pictures;

    var fragment = document.createDocumentFragment(),
      from = pageNumber * listFoto.PAGE_SIZE,
      to = from + listFoto.PAGE_SIZE,
      pagePictures = pictures.slice(from, to);
    if (replace) {
      listFoto.picturesContainer.innerHTML = '';
    }

    pagePictures.forEach(function(foto) {
      var element = listFoto.getElementFromTemplate(foto);
      fragment.appendChild(element);
    });
    listFoto.picturesContainer.appendChild(fragment);
  };

  listFoto.getPictures = function() {
    var xhr = new XMLHttpRequest(),
      XHR_TIMEOUT = 10000;
    xhr.open('GET', '//o0.github.io/assets/json/pictures.json');
    xhr.timeout = XHR_TIMEOUT;
    listFoto.picturesContainer.classList.add('pictures-loading');

    xhr.onload = function(evt) {
      listFoto.pictures = JSON.parse(evt.srcElement.response);
      listFoto.picturesLength = listFoto.pictures.length;
      listFoto.renderFotos(false, 0, true);
      listFoto.renderFotosFullPage();
    };

    xhr.onerror = function() {
      console.log('onerror');
      listFoto.picturesContainer.classList.add('pictures-failure');
    };
    xhr.ontimeout = function() {
      console.log('timeout');
      listFoto.picturesContainer.classList.add('pictures-failure');
    };
    xhr.onloadend = function() {
      listFoto.picturesContainer.classList.remove('pictures-loading');
    };

    xhr.send();
  };

  listFoto.setActiveFilter = function(e) {
    if (e.target.nodeName !== 'INPUT' || e.target.id === listFoto.activeFilter) {
      return;
    }
    var id = e.target.id;

    window.addEventListener('scroll', listFoto.renderFotosFullPage);
    listFoto.currentPage = 0;

    document.getElementById(listFoto.activeFilter).classList.remove('filter-selector');
    document.getElementById(id).classList.add('filter-selector');
    listFoto.activeFilter = id;

    listFoto.FilteredPictures = listFoto.pictures.slice(0);

    switch (id) {
      case 'filter-new':
        listFoto.FilteredPictures = listFoto.FilteredPictures
          .filter(function(item) {
            return (Date.parse(item.date) >= listFoto.msFilterNewFoto) && (Date.parse(item.date) <= currentTime);
          })
          .sort(function(a, b) {
            return Date.parse(b.date) - Date.parse(a.date);
          });
        break;
      case 'filter-discussed':
        listFoto.FilteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }

    listFoto.renderFotos(listFoto.FilteredPictures, 0, true);
    listFoto.renderFotosFullPage();
  };


  listFoto.renderFotosFullPage = function() {
    var picturesCoordinates = listFoto.picturesContainer.getBoundingClientRect(),
      viewportHeight = window.innerHeight;
    if (picturesCoordinates.bottom - listFoto.IMG_SIZE < viewportHeight) {
      listFoto.renderFotos(listFoto.FilteredPictures, ++listFoto.currentPage, false);
      if (listFoto.currentPage >= listFoto.picturesLength / listFoto.PAGE_SIZE) {
        window.removeEventListener('scroll', listFoto.renderFotosFullPage);
      } else {
        listFoto.renderFotosFullPage();
      }
    }
  };

  listFoto.renderFotosFullPage = throttle(listFoto.renderFotosFullPage, 100);

  listFoto.init = function() {

    listFoto.pictureTemplate = document.getElementById('picture-template');
    listFoto.picturesContainer = document.querySelector('.pictures');
    listFoto.filtersContainer = document.querySelector('.filters');
    listFoto.activeFilter = listFoto.filtersContainer.querySelector('.filters-radio:checked').id;
    listFoto.msFilterNewFoto = currentTime - 14 * 24 * 60 * 60 * 1000; // При фильтре Новые показываем фотографии только за последние 2 недели
    listFoto.pictures = []; //Массив данных о фотографиях
    listFoto.picturesLength = 0;
    listFoto.currentPage = 0;
    listFoto.PAGE_SIZE = 12;

    // Для кроссбраузерности
    if (!('content' in listFoto.pictureTemplate)) {
      listFoto.pictureTemplate.content = listFoto.pictureTemplate;
    }

    listFoto.pictureTemplatSelector = listFoto.pictureTemplate.content.querySelector('.picture');

    listFoto.filtersContainer.addEventListener('click', listFoto.setActiveFilter);
    window.addEventListener('scroll', listFoto.renderFotosFullPage);

    filtersHidden();
    listFoto.getPictures();
    filtersShow();
  };

  listFoto.init();

}());
