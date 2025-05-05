window.onload = function() {
  const dataUrl = "aggregated_data.csv";  // Path to the data file
  
  // Fetch the data from the CSV file
  fetch(dataUrl)
    .then(response => response.text())  // Convert response to text (CSV)
    .then(csvData => {
      console.log('CSV Data:', csvData);  // Log the CSV data to check if it's loaded
      updateVisualizations(csvData);  // Pass the loaded data to the update function
    })
    .catch(error => {
      console.error('Error loading the data:', error);  // Handle any errors
    });

  // Function to update visualizations based on the selected attribute
  function updateVisualizations(csvData) {
    // Get the selected attribute from the dropdown
    const selectedAttribute = document.getElementById('attributeSelect').value;

    // Chart 1 (Bar Chart)
    const chart1Spec = {
      "mark": "bar",
      "encoding": {
        "x": {"field": "Station Name", "type": "ordinal"},
        "y": {"field": selectedAttribute, "type": "quantitative"}  // Use the selected attribute
      },
      "data": {
        "values": csvToJson(csvData)  // Convert CSV data to JSON format
      }
    };

    // Chart 2 (Scatter Plot)
    const chart2Spec = {
      "mark": "circle",
      "encoding": {
        "x": {"field": "Station Name", "type": "ordinal"},
        "y": {"field": selectedAttribute, "type": "quantitative"}  // Use the selected attribute
      },
      "data": {
        "values": csvToJson(csvData)  // Convert CSV data to JSON format
      }
    };

    // Chart 3 (Line Chart)
    const chart3Spec = {
      "mark": "line",
      "encoding": {
        "x": {"field": "Station Name", "type": "ordinal"},
        "y": {"field": selectedAttribute, "type": "quantitative"}  // Use the selected attribute
      },
      "data": {
        "values": csvToJson(csvData)  // Convert CSV data to JSON format
      }
    };

    const stationSelection = {
      "type": "single",
      "fields": ["Station Name"],
      "empty": "none",
      "on": "click"
    };
    
    const stationMapSpec = {
      "width": 400,
      "height": 300,
      "title": "Bike Station Locations",
      "data": {
        "values": csvToJson(csvData)
      },
      "mark": {
        "type": "circle",
        "size": 100
      },
      "encoding": {
        "x": {"field": "Longitude", "type": "quantitative"},
        "y": {"field": "Latitude", "type": "quantitative"},
        "tooltip": [{"field": "Station Name", "type": "nominal"}],
        "color": {
          "condition": {
            "selection": "station_selection",
            "value": "red"
          },
          "value": "blue"
        }
      },
      "selection": {
        "station_selection": stationSelection
      }
    };
    
    const bikeAvailabilitySpec = {
      "width": 600,
      "height": 300,
      "title": "Bike Availability Over Time",
      "data": {
        "values": csvToJson(csvData)
      },
      "mark": {
        "type": "line",
        "point": true
      },
      "transform": [
        {"filter": {"selection": "station_selection"}}
      ],
      "encoding": {
        "x": {"field": "Timestamp", "type": "temporal", "title": "Time"},
        "y": {"field": "Available Bikes", "type": "quantitative", "title": "Average Available Bikes"},
        "color": {"value": "blue"},
        "tooltip": [
          {"field": "Timestamp", "type": "temporal"},
          {"field": "Available Bikes", "type": "quantitative"}
        ]
      }
    };
    
    const combinedSpec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "hconcat": [stationMapSpec, bikeAvailabilitySpec],
      "selection": {
        "station_selection": stationSelection
      }
    };

    // Embed charts 1–4
    vegaEmbed('#chart1', chart1Spec)
      .then(() => console.log("Chart 1 loaded successfully"))
      .catch(error => console.error("Error loading chart 1: ", error));

    vegaEmbed('#chart2', chart2Spec)
      .then(() => console.log("Chart 2 loaded successfully"))
      .catch(error => console.error("Error loading chart 2: ", error));

    vegaEmbed('#chart3', chart3Spec)
      .then(() => console.log("Chart 3 loaded successfully"))
      .catch(error => console.error("Error loading chart 3: ", error));

    vegaEmbed('#chart4', combinedSpec)
      .then(() => console.log("Chart 4 loaded successfully"))
      .catch(error => console.error("Error loading chart 4: ", error));

    // ─── Chart 5: only embed if the spec exists ─────────────────────────────
    if (typeof availabilityHeatmapAndScatterSpec !== 'undefined') {
      vegaEmbed('#chart5', availabilityHeatmapAndScatterSpec)
        .then(() => console.log("Chart 5 (Heatmap + Scatter) loaded successfully"))
        .catch(error => console.error("Error loading chart 5: ", error));
    } else {
      console.warn("Skipping Chart 5 – availabilityHeatmapAndScatterSpec is undefined");
    }

    // Chart 6
    vegaEmbed('#chart6', 'vis1.json')
      .then(() => console.log("Chart 6 loaded successfully"))
      .catch(error => console.error("Error loading chart 6: ", error));

    // fetch('scatter_spec.json')…
    vegaEmbed('#chart7', 'heatmap_spec.json')
    .then(() => console.log("Chart 7 loaded successfully"))
    .catch(error => console.error("Error loading chart 7: ", error));
  }

  // Function to convert CSV text to JSON format
  function csvToJson(csv) {
    const lines = csv.split("\n");
    const result = [];
    const headers = lines[0].split(",");

    console.log("Headers:", headers);  // Log the headers to ensure proper columns

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(",");

      for (let j = 0; j < headers.length; j++) {
        let value = currentline[j];

        // Handle missing or invalid data for docks
        if (headers[j] === "Docks in Service" ||
            headers[j] === "Docks in Service_start" ||
            headers[j] === "Docks in Service_end") {
          
          if (isNaN(value) || value === "" || value === Infinity || value === -Infinity) {
            value = 0;
          } else {
            value = parseFloat(value);
          }
        }

        obj[headers[j]] = value;
      }

      result.push(obj);
    }

    console.log('Converted JSON:', result);
    return result;
  }

  // Event listener to update the visualizations when the dropdown selection changes
  document.getElementById('attributeSelect').addEventListener('change', function() {
    fetch(dataUrl)
      .then(response => response.text())
      .then(csvData => {
        updateVisualizations(csvData);
      })
      .catch(error => {
        console.error('Error loading the data:', error);
      });
  });
};
