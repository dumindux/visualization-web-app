/**
 * Created by nuwan on 12/22/15.
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
    this._heightScale = 70
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
        for (var i = 0; i < coordinates.length; i += 5) {
            var city = coordinates[i];
            var latitude = coordinates[i + 1];
            var longitude = coordinates[i + 2];
            var height = coordinates[i + 3];
            var radious = coordinates[i + 4];

            //Ignore lines of zero height.
            if(height === 0) {
                continue;
            }

            var color = Cesium.Color.fromHsl((0.6 - (height * 0.5)), 1.0, 0.5);



            if(seriesName=="CO"){
                if(height<35){
                    color=Cesium.Color.GREEN.withAlpha(0.5)
                }else if(height<100){
                    color=Cesium.Color.YELLOW.withAlpha(0.5)
                }else {
                    color=Cesium.Color.RED.withAlpha(0.5)
                }
            }else if(seriesName=="SO2"){
                if(height<5){
                    color=Cesium.Color.GREEN.withAlpha(0.5)
                }else if(height<50){
                    color=Cesium.Color.YELLOW.withAlpha(0.5)
                }else {
                    color=Cesium.Color.RED.withAlpha(0.5)
                }
            }

            //The polyline instance itself needs to be on an entity.
            var entity = new Cesium.Entity({
                name: city + " " + seriesName + " average: " + height + ' PPM',
                show : show,
                position :Cesium.Cartesian3.fromDegrees(longitude, latitude),
                seriesName : seriesName, //Custom property to indicate series name
                ellipse : {
                    semiMinorAxis: radious * 1000,
                    semiMajorAxis: radious * 1000,
                    extrudedHeight : height*heightScale,
                    //rotation : Cesium.Math.toRadians(45),
                    material : color,
                    outline : false
                }
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
    animation : false,
    timeline : false,
    sceneMode : Cesium.SceneMode.COLUMBUS_VIEW,
    //imageryProvider:new BingMapsImageryProvider(),
    imageryProvider:  new Cesium.ArcGisMapServerImageryProvider({
        url : 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
        //mapStyle : Cesium.BingMapsStyle.ROAD
    }),

    baseLayerPicker:false
});
viewer.clock.shouldAnimate = false;
viewer.dataSources.add(dataSource);
//viewer.selectedImageryProviderViewModel =new Cesium.ProviderViewModel(options);

//viewer.imageryLayers.pickImageryLayerFeatures();


//var start = Cesium.JulianDate.fromDate(new Date("Thu Dec 17 2015 00:00:00"));
//var stop = Cesium.JulianDate.fromDate(new Cesium.JulianDate());
////Make sure viewer is at the desired time.
//viewer.clock.startTime = start.clone();
//viewer.clock.stopTime = stop.clone();
//viewer.clock.currentTime = start.clone();
//viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
//viewer.clock.multiplier = 10;
//viewer.timeline.zoomTo(start, stop);
//viewer.clock.shouldAnimate = true;


//After the initial load, create buttons to let the user switch among series.
function createSeriesSetter(seriesName) {
    return function() {
        dataSource.seriesToDisplay = seriesName;
    };
}

var options = [{text : 'Gas Type'}];
for (var i = 0; i < dataSource.seriesNames.length; i++) {
    var seriesName = dataSource.seriesNames[i];
    options.push({text: seriesName, onselect: createSeriesSetter(seriesName)});
}

Manager.addToolbarMenu(options);



document.getElementById('toolbar').style.width = '10%';

/*
var greenCircle = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(-111.0, 40.0, 150000.0),
    name : 'Green circle at height',
    ellipse : {
        semiMinorAxis : 300000.0,
        semiMajorAxis : 300000.0,
        height: 200000.0,
        material : Cesium.Color.YELLOW.withAlpha(0.5)
    }
});

var redEllipse = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(-103.0, 40.0),
    name : 'Red ellipse on surface with outline',
    ellipse : {
        semiMinorAxis : 250000.0,
        semiMajorAxis : 250000.0,
        material : Cesium.Color.GREEN.withAlpha(0.5),
        outline : false,
        outlineColor : Cesium.Color.GREEN
    }
});

var blueEllipse = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 100000.0),
    name : 'Blue translucent, rotated, and extruded ellipse with outline',
    ellipse : {
        semiMinorAxis : 150000.0,
        semiMajorAxis : 150000.0,
        extrudedHeight : 0,
        //rotation : Cesium.Math.toRadians(45),
        material : Cesium.Color.RED.withAlpha(0.5),
        outline : false
    }
});
*/
viewer.zoomTo(viewer.entities);
