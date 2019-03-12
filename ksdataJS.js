(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        var cols = [{
            id: "report_no",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "age_1",
            alias: "Age",
            dataType: tableau.dataTypeEnum.int
        }, {
            id: "description",
            alias: "title",
            dataType: tableau.dataTypeEnum.string
        }];

        var tableSchema = {
            id: "KansasCityDataFeed",
            alias: "Kansas City Data Feed",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data  //// http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson
    myConnector.getData = function(table, doneCallback) {
        
        $.ajax({
            url: "https://data.kcmo.org/resourse/nsn9-g8a4.json?reported_date=2014-01-01T00:00:00.000",
            type: "GET",
            data: {
                    "$limit" : 5000,
                    "$$app_token" : "ji7LlDtwzlMnFnLmSPitfXVSg"
                  }
        }).done(function(data) {
                alert("Retrieved " + data.length + " records from the dataset!");
                console.log(data);
                var feat = data.features,
                var tableData = [];

                // Iterate over the JSON object
                for (var i = 0, len = feat.length; i < len; i++) {
                    tableData.push({
                        "report_no": feat[i].report_no,
                        "age_1": feat[i].age_1,                    
                        "description": feat[i].description
                    });
                }

                table.appendRows(tableData);
                doneCallback();

            });



    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $("#submitButton").click(function() {
            tableau.connectionName = "Kansas City Data Feed"; // This will be the data source name in Tableau
            tableau.submit(); // This sends the connector object to Tableau
        });
    });


})();
