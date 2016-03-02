  'use strict';

  var getMessage = function (a, b) {

      switch (typeof(a)) {
          case 'boolean':
                  if (a) {
                      return 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';
                  } else {
                      return 'Переданное GIF-изображение не анимировано';
                  }
                  break;
          case 'number':
                  return 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + b * 4 + ' аттрибутов';
                  break;
          case 'object':
                  if ((a instanceof Array) && (b instanceof Array)) {
                      var square = 0;
                      a.forEach(function(item, i) {
                          square += item * b[i];
                      });
                      return 'Общая площадь артефактов сжатия: ' + square + ' пикселей';
                  } else if (a instanceof Array) {
                      var sum = 0;
                      sum = a.reduce(function(val, currentItem) {
                          val += currentItem;
                          return val;
                      });
                      return 'Количество красных точек во всех строчках изображения: ' + sum;
                  };
                  break;
      }
      return "непонятно";
  }

  module.exports = getMessage;
