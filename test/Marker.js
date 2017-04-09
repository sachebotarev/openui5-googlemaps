sap.ui.define(
    [
        "openui5/googlemaps/Marker", "openui5/googlemaps/Map", "openui5/googlemaps/MapUtils", "sap/ui/model/json/JSONModel", "sap/ui/thirdparty/sinon",
        "sap/ui/thirdparty/sinon-qunit"
    ],
    function(Marker, Map, MapUtils, JSONModel) {
        "use strict";

        var MAP_ID = 'MAP_TEST';
        var oModel = new JSONModel(jQuery.sap.getModulePath("test.unit.data", "/Data.json"));
        var oModel2 = new JSONModel(jQuery.sap.getModulePath("test.unit.data","/FitToMarkers.json"));

        sap.ui.getCore().setModel(oModel);

        var oMarkersTemp = new Marker({
            lat: '{lat}',
            lng: '{lng}',
            info: '{name}',
            icon: '{icon}',
            visible: '{visible}'
        });

        var oMap;

        var fnMarkerInBounds = function(oMarker) {
            return oMarker.getMap().getBounds().contains(oMarker.marker.getPosition());
        };

        QUnit.module("Marker - defaults test", {
            beforeEach: function() {
                oMap = new Map({
                    lat: "{/Pyrmont/lat}",
                    lng: "{/Pyrmont/lng}",
                    markers: {
                        path: "/Beaches",
                        template: oMarkersTemp
                    }
                });
                oMap.setModel(oModel);
                oMap.placeAt("qunit-fixture");
                sap.ui.getCore().applyChanges();
            },
            afterEach: function() {
                oMap.destroy(); //Cleanup
            }
        });

        QUnit.test("a basic test example", function(assert) {

            // Arrange
            var done = assert.async();
            var delay = 100;

            var aMarkers = oMap.getMarkers();
            var oMarker = aMarkers[0];
            var oContext = oMarker.getBindingContext();
            assert.equal(aMarkers.length, 5, "markers were rendered");
            assert.ok(oMarker.getMap(), "map set on marker");
            assert.ok(oMarker.getVisible(), "marker is visible");
            assert.ok(oMarker.getIcon(), "makrer has icon");

            // Act
            // set new values via model
            oModel.setProperty("lat", -33.890542, oContext);
            oModel.setProperty("lng", 151.274856, oContext);
            oModel.setProperty("visible", false, oContext);
            oModel.setProperty("icon", undefined, oContext);

            setTimeout(function() {
                // Assert
                assert.ok(!oMarker.getVisible(), "marker is not visible");
                assert.ok(!oMarker.getIcon(), "marker has no icon");

                done();
            }, delay);
        });


        QUnit.test("info window", function(assert) {
            // Arrange
            var done = assert.async();
            var delay = 1000;

            var aMarkers = oMap.getMarkers();
            var oMarker = aMarkers[0];

            // Act
            // open info window
            MapUtils.trigger(oMarker.marker, "click");

            // Assert
            assert.ok(oMarker.infoWindow.getMap(), "info window is open");
            MapUtils.trigger(oMarker.infoWindow, "closeclick");
            setTimeout(function() {
                assert.equal(oMarker.infoWindow.getMap(), null, "info window is closed");
                done();
            }, delay);
        });

        QUnit.module("Marker - fit to markers");

        QUnit.test("markers not all on bounds of page", function(assert) {
            //Arange 
            var done = assert.async();
            var delay = 1000;

            oMap = new Map({
                lat: "{/Pyrmont/lat}",
                lng: "{/Pyrmont/lng}",
                markers: {
                    path: "/Beaches",
                    template: oMarkersTemp
                }
            });
            oMap.setModel(oModel2);
            oMap.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();

            // Act
            var aMarkers = oMap.getMarkers();

            // Assert
            setTimeout(function() {
                assert.equal(aMarkers.length, 6, "6 markers created");
                assert.equal(aMarkers.filter(fnMarkerInBounds).length, 5, "5 markers visible on screen");
                oMap.setFitToMarkers(true);
                assert.equal(aMarkers.filter(fnMarkerInBounds).length, 6, "6 markers visible on screen");
                done();
                oMap.destroy(); //Cleanup
            }, delay);
        });


        QUnit.test("markers all fit on page", function(assert) {
            //Arange 
            var done = assert.async();
            var delay = 1000;

            oMap = new Map({
                lat: "{/Pyrmont/lat}",
                lng: "{/Pyrmont/lng}",
                fitToMarkers: true,
                markers: {
                    path: "/Beaches",
                    template: oMarkersTemp
                }
            });
            oMap.setModel(oModel2);
            oMap.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();

            // Act
            var aMarkers = oMap.getMarkers();

            // Assert
            setTimeout(function() {
                assert.equal(aMarkers.length, 6, "6 markers created");
                assert.equal(aMarkers.filter(fnMarkerInBounds).length, 6, "6 markers visible on screen");
                done();
                oMap.destroy(); //Cleanup
            }, delay);
        });


        QUnit.module("Marker - draggable");
        QUnit.test("dragEnd event handling", function(assert) {
            // Arrange
            var done = assert.async();
            var delay = 1000;
            var dragEndSpy = this.spy();
            var oMarkersTemp = new Marker({
                lat: '{lat}',
                lng: '{lng}',
                info: '{name}',
                icon: '{icon}',
                visible: '{visible}',
                draggable: true,
                dragEnd: dragEndSpy
            });

            oMap = new Map({
                lat: "{/Pyrmont/lat}",
                lng: "{/Pyrmont/lng}",
                markers: {
                    path: "/Beaches",
                    template: oMarkersTemp
                }
            });
            oMap.setModel(oModel);
            oMap.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();

            var aMarkers = oMap.getMarkers();
            var oMarker = aMarkers[0];

            // Act
            // trigger dragend
            MapUtils.trigger(oMarker.marker, "dragend");

            // Assert
            setTimeout(function() {
                assert.strictEqual(dragEndSpy.callCount, 1, "DragEnd event called");
                done();
                oMap.destroy(); //Cleanup
            }, delay);
        });


    });
