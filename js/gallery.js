  'use strict';

  /**
  *Отслеживаемые клавиши
  * @enum {number}
  */
  var keyCode = {
    ESC: 27,
    LEFT: 37,
    RIGHT: 39
  };

  /**
  * Отслеживаем нажатия клавиши
  * @param {event}
  */
  var _onDocumentKeyDown = function(evt) {
    switch (evt.keyCode) {
      case keyCode.ESC:
        location.hash = '';
        break;
      case keyCode.LEFT:
        if (this.currentPhoto > 0) {
          this._changePicture(--this.currentPhoto);
        }
        break;
      case keyCode.RIGHT:
        if (this.currentPhoto < this.amountPhotos - 1) {
          this._changePicture(++this.currentPhoto);
        }
        break;
    }
  };

  /**
  * Отслеживаем нажатия на фотографию в галерее
  * @param {event}
  */
  var _onPhotoClick = function(evt) {
    if (evt.target.className !== 'gallery-overlay-image' || this.currentPhoto >= this.amountPhotos - 1) {
      return;
    }
    this._changePicture(++this.currentPhoto);
  };



  /**
  * @constructor
  */
  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this.onDocumentKeyDown = _onDocumentKeyDown.bind(this);
    this.onPhotoClick = _onPhotoClick.bind(this);
    this.currentPhoto = 0;
    this.amountPhotos = 0;
    this.addEventHaschange = false;
  };

  /**
  *Показываем галерею
  * @method
  */
  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');
    this.element.addEventListener('click', this.onPhotoClick);
    document.addEventListener('keydown', this.onDocumentKeyDown);
  };

  /**
  *Скрываем галерею
  * @method
  */
  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this.element.removeEventListener('click', this.onPhotoClick);
    document.removeEventListener('keydown', this.onDocumentKeyDown);
  };

  /**
  * Получаем данные о фотографиях
  * @method
  * @param {Array}
  */
  Gallery.prototype.setPictures = function(photos) {
    this.photos = photos;
    this.amountPhotos = this.photos.length;

    if (!this.addEventHaschange) {
      this._toggleShowGallery();
      this.addEventHaschange = true;
      window.addEventListener('hashchange', this._toggleShowGallery.bind(this));
    }
  };

  /**
  * Меняем фотографию
  * @method
  * @param {number||string}
  */
  Gallery.prototype.setCurrentPicture = function(currentPicture) {
    var typeArg = typeof (currentPicture);
    if (typeArg === 'string') {
      var dataFound = false,
        i = 0;
      for (; i < this.amountPhotos; i++) {
        dataFound = (this.photos[i].url === currentPicture);
        if (dataFound) {
          currentPicture = i;
          break;
        }
      }
    }
    var _photo = this.photos[currentPicture];
    document.querySelector('.gallery-overlay-image').src = _photo.url;
    document.querySelector('.gallery-overlay-controls-like .likes-count').innerHTML = _photo.likes;
    document.querySelector('.gallery-overlay-controls-comments .comments-count').innerHTML = _photo.comments;
    this.currentPhoto = currentPicture;
  };

  /**
  * Изменяем видимость галереи
  * @method
  */

  Gallery.prototype._toggleShowGallery = function() {
    var hash = location.hash.match(/#photo\/(\S+)/);
    if (hash === null ) {
      this.hide();
    } else {
      this.setCurrentPicture(hash[0].replace('#photo/', ''));
      this.show();
    }
  };

  /**
  * Переключаем фото
  * @method
  */
  Gallery.prototype._changePicture = function(number) {
    location.hash = '#photo/' + this.photos[number].url;
  };

  module.exports = Gallery;
