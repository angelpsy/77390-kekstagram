'use strict';

(function() {
  var _onDocumentKeyDown = function(evt) {
    switch (evt.keyCode) {
      case 27:
        this.hide();
        break;
      case 37:
        if (this.currentPhoto > 0) {
          this.setCurrentPicture(--this.currentPhoto);
        }
        break;
      case 39:
        if (this.currentPhoto < this.amountPhotos - 1) {
          this.setCurrentPicture(++this.currentPhoto);
        }
        break;
    }

  };

  var _onPhotoClick = function(evt) {
    if (evt.target.className !== 'gallery-overlay-image' || this.currentPhoto >= this.amountPhotos - 1) {
      return;
    }
    this.setCurrentPicture(++this.currentPhoto);
  };

  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this.onDocumentKeyDown = _onDocumentKeyDown.bind(this);
    this.onPhotoClick = _onPhotoClick.bind(this);
    this.currentPhoto = 0;
    this.amountPhotos = 0;
  };

  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');
    this.element.addEventListener('click', this.onPhotoClick);
    document.addEventListener('keydown', this.onDocumentKeyDown);
  };

  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this.element.removeEventListener('click', this.onPhotoClick);
    document.removeEventListener('keydown', this.onDocumentKeyDown);
  };

  Gallery.prototype.setPictures = function(photos) {
    this.photos = photos;
    this.amountPhotos = this.photos.length;
  };

  Gallery.prototype.setCurrentPicture = function(number) {
    var _photo = this.photos[number];
    document.querySelector('.gallery-overlay-image').src = _photo.url;
    document.querySelector('.gallery-overlay-controls-like .likes-count').innerHTML = _photo.likes;
    document.querySelector('.gallery-overlay-controls-comments .comments-count').innerHTML = _photo.comments;
    this.currentPhoto = number;
  };

  window.Gallery = Gallery;
}());
