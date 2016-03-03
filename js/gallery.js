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
        this.hide();
        break;
      case keyCode.LEFT:
        if (this.currentPhoto > 0) {
          this.setCurrentPicture(--this.currentPhoto);
        }
        break;
      case keyCode.RIGHT:
        if (this.currentPhoto < this.amountPhotos - 1) {
          this.setCurrentPicture(++this.currentPhoto);
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
    this.setCurrentPicture(++this.currentPhoto);
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
  };

  /**
  * Меняем фотографию
  * @method
  * @param {number}
  */
  Gallery.prototype.setCurrentPicture = function(number) {
    var _photo = this.photos[number];
    document.querySelector('.gallery-overlay-image').src = _photo.url;
    document.querySelector('.gallery-overlay-controls-like .likes-count').innerHTML = _photo.likes;
    document.querySelector('.gallery-overlay-controls-comments .comments-count').innerHTML = _photo.comments;
    this.currentPhoto = number;
  };

  module.exports = Gallery;
