/*global L */

(function() {
  'use strict';

  /*
   * L.MultiOptionsPolyline is a MultiPolyLine which parts can be styled differently.
   * options: {
   *     multiOptions: {
   *         optionIdxFn: function (latLng, prevLatLng, index, allLatlngs),
   *         fnContext: ctx, // the context to call optionIdxFn (optional)
   *         options: [{}, {}, {}] or function, // options for the index returned by optionIdxFn. If supplied with a function then it will be called with the index
   *         copyBaseOptions: true
   *     },
   *     // other options from Polyline
   * }
   */
  L.MultiOptionsPolyline = L.FeatureGroup.extend({
    initialize: function(latlngs, options) {
      this._layers = {};
      this._latlngs = latlngs;

      this._prepareOptions(options);

      this.render();
    },

    _prepareOptions: function(options) {
      this._options = options;
      var copyBaseOptions = options.multiOptions.copyBaseOptions;
      if (copyBaseOptions === undefined || copyBaseOptions) {
        var multiOptions = this._options.multiOptions,
          baseOptions,
          optionsArray = multiOptions.options,
          i, len = optionsArray.length;

        baseOptions = L.extend({}, this._options);
        delete baseOptions.multiOptions;

        for (i = 0; i < len; ++i) {
          optionsArray[i] = L.extend({}, baseOptions, optionsArray[i]);
        }
      }
    },

    setLatLngs: function(latlngs) {
      this._latlngs = latlngs;
      this.render();
    },

    setOptions: function(options) {
      this._prepareOptions(options);

      this.render();
    },

    render: function() {
      var i, len = this._latlngs.length,
        multiOptions = this._options.multiOptions,
        optionIdxFn = multiOptions.optionIdxFn,
        fnContext = multiOptions.fnContext || this,
        prevOptionIdx, optionIdx,
        segmentLatlngs;

      this.eachLayer(function(layer) {
        this.removeLayer(layer);
      }, this);

      for (i = 1; i < len; ++i) {
        optionIdx = optionIdxFn.call(
          fnContext, this._latlngs[i], this._latlngs[i - 1], i, this._latlngs);

        if (i === 1) {
          segmentLatlngs = [this._latlngs[0]];
          prevOptionIdx = optionIdx;
        }

        segmentLatlngs.push(this._latlngs[i]);

        // is there a change in options or is it the last point?
        if (prevOptionIdx !== optionIdx || i === len - 1) {
          //Check if options is a function or an array
          if (typeof multiOptions.options == "function") {
            this.addLayer(new L.Polyline(segmentLatlngs, multiOptions.options(prevOptionIdx)));
          } else {
            this.addLayer(new L.Polyline(segmentLatlngs, multiOptions.options[prevOptionIdx]));
          }

          prevOptionIdx = optionIdx;
          segmentLatlngs = [this._latlngs[i]];
        }
      }

      return this;
    },

    getLatLngs: function() {
      return this._latlngs;
    },

    getLatLngsSegments: function() {
      var latlngs = [];

      this.eachLayer(function(layer) {
        latlngs.push(layer.getLatLngs());
      });

      return latlngs;
    }
  });

  L.multiOptionsPolyline = function(latlngs, options) {
    return new L.MultiOptionsPolyline(latlngs, options);
  };

}());
