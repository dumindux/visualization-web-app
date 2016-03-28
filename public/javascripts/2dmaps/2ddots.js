/**
 * This class is an example of a custom DataSource.  It loads JSON data as
 * defined by Google's WebGL Globe, https://github.com/dataarts/webgl-globe.
 * @alias WebGLGlobeDataSource
 * @constructor
 *
 * @param {String} [name] The name of this data source.  If undefined, a name
 *                        will be derived from the url.
 *
 * @example
 * var dataSource = new Cesium.WebGLGlobeDataSource();
 * dataSource.loadUrl('sample.json');
 * viewer.dataSources.add(dataSource);
 */
var WebGLGlobeDataSource = function(name) {
    //All public configuration is defined as ES5 properties
    //These are just the "private" variables and their defaults.
    this._name = name;
    this._changed = new Cesium.Event();
    this._error = new Cesium.Event();
    this._isLoading = false;
    this._loading = new Cesium.Event();
    this._entityCollection = new Cesium.EntityCollection();
    this._seriesNames = [];
    this._seriesToDisplay = undefined;
};

Object.defineProperties(WebGLGlobeDataSource.prototype, {
    //The below properties must be implemented by all DataSource instances

    /**
     * Gets a human-readable name for this instance.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {String}
     */
    name : {
        get : function() {
            return this._name;
        }
    },
    /**
     * Since WebGL Globe JSON is not time-dynamic, this property is always undefined.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {DataSourceClock}
     */
    clock : {
        value : undefined,
        writable : false
    },
    /**
     * Gets the collection of Entity instances.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {EntityCollection}
     */
    entities : {
        get : function() {
            return this._entityCollection;
        }
    },
    /**
     * Gets a value indicating if the data source is currently loading data.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Boolean}
     */
    isLoading : {
        get : function() {
            return this._isLoading;
        }
    },
    /**
     * Gets an event that will be raised when the underlying data changes.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Event}
     */
    changedEvent : {
        get : function() {
            return this._changed;
        }
    },
    /**
     * Gets an event that will be raised if an error is encountered during
     * processing.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Event}
     */
    errorEvent : {
        get : function() {
            return this._error;
        }
    },
    /**
     * Gets an event that will be raised when the data source either starts or
     * stops loading.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Event}
     */
    loadingEvent : {
        get : function() {
            return this._loading;
        }
    },

    //These properties are specific to this DataSource.

    /**
     * Gets the array of series names.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {String[]}
     */
    seriesNames : {
        get : function() {
            return this._seriesNames;
        }
    },
    /**
     * Gets or sets the name of the series to display.  WebGL JSON is designed
     * so that only one series is viewed at a time.  Valid values are defined
     * in the seriesNames property.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {String}
     */
    seriesToDisplay : {
        get : function() {
            return this._seriesToDisplay;
        },
        set : function(value) {
            this._seriesToDisplay = value;

            //Iterate over all entities and set their show property
            //to true only if they are part of the current series.
            var collection = this._entityCollection;
            var entities = collection.values;
            collection.suspendEvents();
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                entity.show = value === entity.seriesName;
            }
            collection.resumeEvents();
        }
    },
    /**
     * Gets or sets the scale factor applied to the height of each line.
     * @memberof WebGLGlobeDataSource.prototype
     * @type {Number}
     */
    heightScale : {
        get : function() {
            return this._heightScale;
        },
        set : function(value) {
            if (value > 0) {
                throw new Cesium.DeveloperError('value must be greater than 0');
            }
            this._heightScale = value;
        }
    }
});

/**
 * Asynchronously loads the GeoJSON at the provided url, replacing any existing data.
 * @param {Object} url The url to be processed.
 * @returns {Promise} a promise that will resolve when the GeoJSON is loaded.
 */
WebGLGlobeDataSource.prototype.loadUrl = function(url) {
    if (!Cesium.defined(url)) {
        throw new Cesium.DeveloperError('url is required.');
    }

    //Create a name based on the url
    var name = Cesium.getFilenameFromUri(url);

    //Set the name if it is different than the current name.
    if (this._name !== name) {
        this._name = name;
        this._changed.raiseEvent(this);
    }

    //Use 'when' to load the URL into a json object
    //and then process is with the `load` function.
    var that = this;
    return Cesium.when(Cesium.loadJson(url), function(json) {
        return that.load(json, url);
    }).otherwise(function(error) {
        //Otherwise will catch any errors or exceptions that occur
        //during the promise processing. When this happens,
        //we raise the error event and reject the promise.
        this._setLoading(false);
        that._error.raiseEvent(that, error);
        return Cesium.when.reject(error);
    });
};

/**
 * Loads the provided data, replacing any existing data.
 * @param {Object} data The object to be processed.
 */
WebGLGlobeDataSource.prototype.load = function(data) {
    //>>includeStart('debug', pragmas.debug);
    if (!Cesium.defined(data)) {
        throw new Cesium.DeveloperError('data is required.');
    }
    //>>includeEnd('debug');

    //Clear out any data that might already exist.
    this._setLoading(true);
    this._seriesNames.length = 0;
    this._seriesToDisplay = undefined;

    var heightScale = this.heightScale;
    var entities = this._entityCollection;


    entities.suspendEvents();
    entities.removeAll();

    // Loop over each series
    for (var x = 0; x < data.length; x++) {
        var series = data[x];
        var seriesName = series[0];
        var coordinates = series[1];

        //Add the name of the series to our list of possible values.
        this._seriesNames.push(seriesName);

        //Make the first series the visible one by default
        var show = x === 0;
        if (show) {
            this._seriesToDisplay = seriesName;
        }

        //Now loop over each coordinate in the series and create
        // our entities from the data.
        for (var i = 0; i < coordinates.length; i += 3) {
            var latitude = coordinates[i];
            var longitude = coordinates[i + 1];
            var height = coordinates[i + 2];
            //var time = coordinates[i+3];

            //Ignore lines of zero height.
            if(height === 0) {
                continue;
            }

            //var start = Cesium.JulianDate.fromDate(new Date(time));
            //var stop = Cesium.JulianDate.addSeconds(start, 60, new Cesium.JulianDate());

            if(height < constants[seriesName][1]) {
                color = "#65C68A";
            } else if (height < constants[seriesName][2]) {
                color = "#FEE665";
            } else if (height < constants[seriesName][3]) {
                color = "#FEB065";
            } else {
                color = "#FE6465";
            }

            var color = Cesium.Color.fromCssColorString(color);
            //The polyline instance itself needs to be on an entity.
            var entity = new Cesium.Entity({
                //id : seriesName + ' PPM: '+height + " ID: "+i.toString(),
                show : show,
                name: seriesName + ": " + height + ' PPM ',
                position :Cesium.Cartesian3.fromDegrees(longitude, latitude),
                seriesName : seriesName, //Custom property to indicate series name
                point : {
                    pixelSize : 10,
                    color : color
                },
                //availability:new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                //    start : start,
                //    stop : stop
                //})]),

            });


            entities.add(entity);
        }
    }

    //Once all data is processed, call resumeEvents and raise the changed event.
    entities.resumeEvents();
    this._changed.raiseEvent(this);
    this._setLoading(false);
};

WebGLGlobeDataSource.prototype._setLoading = function(isLoading) {
    if (this._isLoading !== isLoading) {
        this._isLoading = isLoading;
        this._loading.raiseEvent(this, isLoading);
    }
};

//Now that we've defined our own DataSource, we can use it to load
//any JSON data formatted for WebGL Globe.
var dataSource = new WebGLGlobeDataSource();

jsondata = JSON.parse(jsondata);
dataSource.load(jsondata);
console.log("loaded");

//Create a Viewer instances and add the DataSource.
var viewer = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    timeline: false,
    sceneMode : Cesium.SceneMode.SCENE2D,
    //imageryProvider:new BingMapsImageryProvider(),
    imageryProvider:  new Cesium.ArcGisMapServerImageryProvider({
        url : 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
        //mapStyle : Cesium.BingMapsStyle.ROAD
    }),

    baseLayerPicker:false
});
viewer.clock.shouldAnimate = false;
viewer.dataSources.add(dataSource);

var options = [];
for (var i = 0; i < dataSource.seriesNames.length; i++) {
    var seriesName = dataSource.seriesNames[i];
    options.push({text: seriesName, onselect: createSeriesSetter(seriesName)});
}

Manager.addToolbarMenu(options, "combo1");

var start = Cesium.JulianDate.fromDate(new Date("Thu Dec 17 2015 00:00:00"));
var stop = Cesium.JulianDate.fromDate(new Date());
////Make sure viewer is at the desired time.
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
viewer.clock.multiplier = 10;
viewer.timeline.zoomTo(start, stop);
viewer.clock.shouldAnimate = true;


//After the initial load, create buttons to let the user switch among series.
function createSeriesSetter(seriesName) {
    return function() {
        dataSource.seriesToDisplay = seriesName;
        updateLegend(constants[seriesName]);
    };
}

function updateLegend(values) {
    $("#text1").text(values[0] + " ppm");
    $("#text2").text(values[1] + " ppm");
    $("#text3").text(values[2] + " ppm");
    $("#text4").text(values[3] + " ppm");
}

document.getElementById('toolbar').style.width = '10%';
selectedText = $("#combo1 option:selected").html(); //updates the legend after the initial load
updateLegend(constants[selectedText])