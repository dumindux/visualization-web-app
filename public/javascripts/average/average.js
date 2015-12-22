/**
 * Created by nuwan on 12/22/15.
 */


var viewer = new Cesium.Viewer('cesiumContainer');

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

viewer.zoomTo(viewer.entities);
