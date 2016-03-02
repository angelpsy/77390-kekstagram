  'use strict';

  var _IMG_SIZE = 182;
  var _pictureTemplate = document.getElementById('picture-template');

  if (!('content' in _pictureTemplate)) {
    _pictureTemplate.content = _pictureTemplate;
  }

  var _pictureTemplatSelector = _pictureTemplate.content.querySelector('.picture');
  var Photo = function(data) {
    this._data = data;
  };

  Photo.prototype.render = function() {
    this.element = _pictureTemplatSelector.cloneNode(true);
    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;
    this.element.href = this._data.url;

    var newImage = new Image();
    newImage.onload = function() {
      clearTimeout(imgLoadTimeout);
      this.element.replaceChild(newImage, this.element.querySelector('img'));
    }.bind(this);
    newImage.onerror = function() {
      this.element.classList.add('picture-load-failure');
    }.bind(this);
    newImage.src = this._data.url;

    newImage.width = _IMG_SIZE;
    newImage.height = _IMG_SIZE;


    var IMG_TIMEOUT = 10000,
      imgLoadTimeout = setTimeout(function() {
        newImage.src = '';
        this.element.classList.add('picture-load-failure');
      }.bind(this), IMG_TIMEOUT);

    this.element.addEventListener('click', function(evt) {
      event.preventDefault();
      if (event.target.tagName === 'IMG' &&
          !evt.target.parentNode.classList.contains('picture-load-failure') &&
          typeof this.onClick === 'function') {
        this.onClick();
      }
    }.bind(this));
  };

  Photo.prototype.getImgSize = function() {
    return _IMG_SIZE;
  };

  Photo.prototype.onClick = null;

  Photo.prototype.remove = function() {
    this.onClick = null;
    this.element.removeEventListener('click', this._onClick);
    this.element.parentNode.removeChild(this.element);
  };

  module.exports = Photo;
