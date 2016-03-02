  'use strict';

  var Photo = require('photo');
  var Gallery = require('gallery');

  var listFoto = {},
    currentTime = Date.now(),
    gallery = new Gallery(),
    renderedPhotos = [];

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

  // Для всех элементов массива с изображенями создаем элемент и вставляем его в "фрагмент",
  // который потом вставляем в контейнер для изображений
  listFoto.renderFotos = function(pictures, pageNumber, replace) {
    pictures = pictures || listFoto.pictures;

    var fragment = document.createDocumentFragment(),
      from = pageNumber * listFoto.PAGE_SIZE,
      to = from + listFoto.PAGE_SIZE,
      pagePictures = pictures.slice(from, to);
    if (replace) {
      Array.prototype.forEach.call(renderedPhotos, function(el) {
        el.remove();
      });
      renderedPhotos.length = 0;
      listFoto.picturesContainer.innerHTML = '';
    }

    renderedPhotos = renderedPhotos.concat(pagePictures.map(function(foto, index) {
      var photo = new Photo(foto);
      photo.render();
      fragment.appendChild(photo.element);
      photo.onClick = function() {
        gallery.setCurrentPicture(index + from);
        gallery.show();
      };

      return photo;
    }));
    listFoto.picturesContainer.appendChild(fragment);
    gallery.setPictures(pictures);
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
    if (picturesCoordinates.bottom - Photo.prototype.getImgSize() < viewportHeight) {
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

    listFoto.picturesContainer = document.querySelector('.pictures');
    listFoto.filtersContainer = document.querySelector('.filters');
    listFoto.activeFilter = listFoto.filtersContainer.querySelector('.filters-radio:checked').id;
    listFoto.msFilterNewFoto = currentTime - 14 * 24 * 60 * 60 * 1000; // При фильтре Новые показываем фотографии только за последние 2 недели
    listFoto.pictures = []; //Массив данных о фотографиях
    listFoto.picturesLength = 0;
    listFoto.currentPage = 0;
    listFoto.PAGE_SIZE = 12;

    listFoto.filtersContainer.addEventListener('click', listFoto.setActiveFilter);
    window.addEventListener('scroll', listFoto.renderFotosFullPage);

    filtersHidden();
    listFoto.getPictures();
    filtersShow();
  };

  listFoto.init();
