'use strict';

(function() {
  var listFoto = {};

  var filtersHidden = function() {
    listFoto.filtersContainer.classList.add('hidden');
  };

  var filtersShow = function() {
    listFoto.filtersContainer.classList.remove('hidden');
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

    var IMG_SIZE = 182;
    newImage.width = IMG_SIZE;
    newImage.height = IMG_SIZE;


    var IMG_TIMEOUT = 10000,
      imgLoadTimeout = setTimeout(function() {
        newImage.src = '';
        element.classList.add('picture-load-failure');
      }, IMG_TIMEOUT);

    return element;
  };

  // Для всех элементов массива с изображенями создаем элемент и вставляем его в "фрагмент",
  // который потом вставляем в контейнер для изображений
  listFoto.renderFotos = function(pictures) {
    pictures = pictures || listFoto.pictures;

    var fragment = document.createDocumentFragment();

    listFoto.picturesContainer.innerHTML = '';

    pictures.forEach(function(foto) {
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
      listFoto.renderFotos();
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

  var setActiveFilter = function(id) {
    if (listFoto.activeFilter === id) {
      return;
    }

    document.getElementById(listFoto.activeFilter).classList.remove('filter-selector');
    document.getElementById(id).classList.add('filter-selector');
    listFoto.activeFilter = id;

    listFoto.FilteredPictures = listFoto.pictures.slice(0);

    switch (id) {
      case 'filter-new':
        listFoto.FilteredPictures = listFoto.FilteredPictures
          .filter(function(item) {
            return (Date.parse(item.date) >= listFoto.msFilterNewFoto) && (Date.parse(item.date) <= listFoto.currentTime);
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

    listFoto.renderFotos(listFoto.FilteredPictures);
  };

  listFoto.init = function() {
    listFoto.pictureTemplate = document.getElementById('picture-template');
    listFoto.picturesContainer = document.querySelector('.pictures');
    listFoto.filtersContainer = document.querySelector('.filters');
    listFoto.activeFilter = listFoto.filtersContainer.querySelector('.filters-radio:checked').id;
    listFoto.currentTime = Date.now();
    listFoto.msFilterNewFoto = listFoto.currentTime - 14 * 24 * 60 * 60 * 1000; // При фильтре Новые показываем фотографии только за последние 2 недели
    listFoto.pictures = []; //Массив данных о фотографиях

    // Для кроссбраузерности
    if (!('content' in listFoto.pictureTemplate)) {
      listFoto.pictureTemplate.content = listFoto.pictureTemplate;
    }

    listFoto.pictureTemplatSelector = listFoto.pictureTemplate.content.querySelector('.picture');

    filtersHidden();

    listFoto.filtersContainer.onclick = function(e) {
      if (e.target.nodeName === 'INPUT') {
        var clickedElementID = e.target.id;

        setActiveFilter(clickedElementID);
      }
    };

    listFoto.getPictures();
    filtersShow();
  };

  listFoto.init();

}());
