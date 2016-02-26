'use strict';

(function() {
  var _onDocumentKeyDown = function(evt) {
    if (evt.keyCode === 27) {
      this.hide();
    }
  };

  var _onPhotoClick = function(evt) {
    if (evt.target.className !== 'gallery-overlay-image') {
      return;
    }
    console.log('clik Photo');
  };

  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this.onDocumentKeyDown = _onDocumentKeyDown.bind(this);
    this.onPhotoClick = _onPhotoClick.bind(this);
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

  window.Gallery = Gallery;
}());
