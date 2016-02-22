'use strict';

(function() {
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

  };

  Photo.prototype.getImgSize = function() {
    return _IMG_SIZE;
  };

  window.Photo = Photo;
})();
