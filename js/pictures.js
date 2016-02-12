/*global pictures*/
'use strict';

(function() {
  var listFoto = {};

  function filtersHidden() {
    document.querySelector('.filters').classList.add('hidden');
  }

  function filtersShow() {
    document.querySelector('.filters').classList.remove('hidden');
  }


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
  listFoto.renderFotos = function() {
    listFoto.pictureTemplate = document.getElementById('picture-template');
    listFoto.picturesContainer = document.querySelector('.pictures');

    // Для кроссбраузерности
    if (!('content' in listFoto.pictureTemplate)) {
      listFoto.pictureTemplate.content = listFoto.pictureTemplate;
    }

    listFoto.pictureTemplatSelector = listFoto.pictureTemplate.content.querySelector('.picture');

    var fragment = document.createDocumentFragment();

    listFoto.picturesContainer.innerHTML = '';

    pictures.forEach(function(foto) {
      var element = listFoto.getElementFromTemplate(foto);
      fragment.appendChild(element);
    });
    listFoto.picturesContainer.appendChild(fragment);
  };

  listFoto.init = function() {
    listFoto.renderFotos();
    filtersShow();
  };

  filtersHidden();
  if (pictures.length > 0) {
    listFoto.init();
  }

}());
