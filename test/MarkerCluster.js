sap.ui.define(
    [
        "openui5/googlemaps/MarkerCluster", "openui5/googlemaps/Marker", "openui5/googlemaps/Map", "openui5/googlemaps/MapUtils",
        "sap/ui/model/json/JSONModel", "sap/ui/thirdparty/sinon",
        "sap/ui/thirdparty/sinon-qunit"
    ],
    function(MarkerCluster, Marker, Map, MapUtils, JSONModel) {
        "use strict";

        var MAP_ID = 'MAP_TEST';
        var oModel = new JSONModel(jQuery.sap.getModulePath("test.unit.data", "/ClusterData.json"));

        var oMap;
        var oMarkerCluster;

        sap.ui.getCore().setModel(oModel);

        QUnit.module("Marker ClusTer ");
        QUnit.test("default rendering and event handling", function(assert) {
            // Arrange
            var done = assert.async();
            var delay = 1000;

            var clickSpy = this.spy();
            var mouseoverSpy = this.spy();
            var mouseoutSpy = this.spy();

            var bCalled = false;

            var fnClusterEnd = function(oEvent) {
                if (bCalled) {
                    return;
                }
                var aClusters = oMarkerCluster.markerClusterer.getClusters();
                var oCluster = aClusters[0];
                assert.strictEqual(aClusters.length, 1, "Clusters created");
                // Act
                // trigger events
                MapUtils.trigger(oCluster.getMarkerClusterer(), "mouseover");
                MapUtils.trigger(oCluster.getMarkerClusterer(), "mouseout");
                MapUtils.trigger(oCluster.getMarkerClusterer(), "click");

                setTimeout(function() {
                    // Assert
                    assert.strictEqual(mouseoverSpy.callCount, 1, "mouseover event called");
                    assert.strictEqual(mouseoutSpy.callCount, 1, "mouseout event called");
                    assert.strictEqual(clickSpy.callCount, 1, "click event called");

                    done();
                    oMap.destroy(); //Cleanup
                }, delay);

                bCalled = true;
            };

            var oMarkersTemp = new Marker({
                lat: '{lat}',
                lng: '{lng}',
                info: '{location}',
                icon: jQuery.sap.getModulePath("openui5.googlemaps.themes." + "base") + "/img/pinkball.png"
            });

            oMap = new Map({
                lat: "{/Pyrmont/lat}",
                lng: "{/Pyrmont/lng}",
                markerCluster: new MarkerCluster({
                    markers: {
                        path: "/Places",
                        template: oMarkersTemp
                    },
                    clusteringend: fnClusterEnd,
                    click: clickSpy,
                    mouseover: mouseoverSpy,
                    mouseout: mouseoutSpy
                })
            });

            oMap.setModel(oModel);
            oMap.placeAt("qunit-fixture");
            sap.ui.getCore().applyChanges();

            oMarkerCluster = oMap.getMarkerCluster();
            var aMarkers = oMarkerCluster.getMarkers();

            assert.ok(oMarkerCluster, "Marker Cluster Rendered");
            assert.strictEqual(aMarkers.length, 15, "Markers created");

        });
    });
