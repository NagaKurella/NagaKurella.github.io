'use strict';

(function () {

  // Creates a global table reference for future use.
  let tableReference = null;

  // These variables will hold a reference to the unregister Event Listener functions.
  // https://tableau.github.io/extensions-api/docs/interfaces/dashboard.html#addeventlistener
  let unregisterSettingsEventListener = null;
  let unregisterFilterEventListener = null;
  let unregisterMarkSelectionEventListener = null;
  let unregisterParameterEventListener = null;

  $(document).ready(function () {
    // Add the configure option in the initialiseAsync to call the configure function
    // when we invoke this action on the user interface.
    tableau.extensions.initializeAsync({ 'configure': configure }).then(function () {
      // calls a function to show the table. There will be plenty of logic in this one.
      renderDataTable();
      
      // We add our Settings and Parameter listeners here  listener here.
      unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
        renderDataTable();
      });
      tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
        parameters.forEach(function (p) {
          p.addEventListener(tableau.TableauEventType.ParameterChanged, (filterEvent) => {
            renderDataTable();
          });
        });
      });

    }, function () { console.log('Error while Initializing: ' + err.toString()); });

  });  //// end of $(document).ready()

  // Here is where the meat of the Extension is.
  // In a nut shell, we will try to read values from Settings and have several
  // if statements to retrieve values and populate as appropriate. This will end
  // with a call to a datatable function.
  function renderDataTable() {

    const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
    
    // Unregister Event Listeners for old Worksheet, if exists.
    if (unregisterFilterEventListener != null) {
      unregisterFilterEventListener();
    }
    if (unregisterMarkSelectionEventListener != null) {
      unregisterMarkSelectionEventListener();
    }

    // We will try to read the worksheet from the settings, if this exists we will show
    // the configuration screen, otherwise we will clear the table and destroy the
    // reference.
    var sheetName = tableau.extensions.settings.get("worksheet");
    if (sheetName == undefined || sheetName =="" || sheetName == null) {
      $("#configure").show();


      $("#example-chart").text("");
      if( tableReference !== null) {
        tableReference.destroy();
      }
      // Exit the function if no worksheet name is present !!!
      return;
    } else {
      // If a worksheet is selected, then we hide the configuration screen.
      $("#configure").hide();
    }

    // Use the worksheet name saved in the Settings to find and return
    // the worksheet object.
    var worksheet = worksheets.find(function (sheet) {
      return sheet.name === sheetName;
    });
    
    var underlying = 2;      

    // Add an event listener to the worksheet.
    unregisterFilterEventListener = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, (filterEvent) => {
      renderDataTable();
    });
    unregisterMarkSelectionEventListener = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, (markSelectionEvent) => {
      renderDataTable();
    });

    // If underlying is 1 then get Underlying, else get Summary.
    if (underlying == 1) {
      

    } else {
      worksheet.getSummaryDataAsync({ maxRows: 0 }).then(function (sumdata) {
        // We will loop through our column names from our settings and save these into an array
        // We will use this later in our datatable function.   ;; maxRows: max_no_records
        // https://tableau.github.io/extensions-api/docs/interfaces/datatable.html#columns
        var data_col = [];
        var column_names = tableau.extensions.settings.get("column_names").split("|");
        var col_d_m_array1 = tableau.extensions.settings.get("col_Dim_Measures").split("|"); 
        for (i = 0; i < column_names.length; i++) {          
          var s1 = column_names[i];
          s1 = s1.replace('-','');
          s1 = s1.replace('SUM','');
          s1 = s1.replace('(',''); //s1 = s1.replace('(','[');
          s1 = s1.replace(')',''); //s1 = s1.replace(')',']');
          //data_col.push({ title: column_names[i], field:column_names[i] }); //,headerVertical:true,headerFilter:true
          data_col.push({ title: s1, field:s1, genericname: col_d_m_array1[i] });
          //data_col.push({ title: column_names[i] });
          //alert(column_names[i]); // ok
          //data_col.push(column_names[i]);
          //alert(column_names[i]);
          //alert(s1);
        }
        

        // We have created an array to match the underlying data source and then
        // looped through to populate our array with the value data set. We also added
        // logic to read from the column names and column order from our configiration.
        const worksheetData = sumdata.data;
        var column_order = tableau.extensions.settings.get("column_order").split("|");
        
        ////////////////////////////////////////////////////////////////////////////
        /* // Create an empty arrays for our labels and data set.
        var labels = [];
        var data = [];
        for (var i = 0; i < worksheetData.length; i++) {
          labels.push(worksheetData[i][0].formattedValue);
          data.push(worksheetData[i][1].value);
          //alert(worksheetData[i][0].formattedValue);
       } */
       ////////////////////////////////////////////////////////////////////////////
        
        var jstr = ""; var jstr2 = ""; var tableData7 ; var tableData8 = [];
        var tableData = makeArray(sumdata.columns.length, (sumdata.totalRowCount));
        for (var i = 0; i < (tableData.length); i++) {
          var str1 = "";
          for (var j = 0; j < tableData[i].length; j++) {
            //tableData[i][j] = worksheetData[i][column_order[j]-1].formattedValue; // for formatted value
            tableData[i][j] = worksheetData[i][column_order[j]-1].value;
            //alert(tableData[i][j]);          
           
            //str1 = str1 + " \""+column_names[j].toString() + "\" :  \"" + tableData[i][j].toString() + "\" , "; //// working fine
            //str1 = str1 + " \""+data_col[j].title.toString() + "\" :  \"" + tableData[i][j].toString() + "\" , "; /// working fine
            str1 = str1 + " \""+data_col[j].genericname.toString() + "\" :  \"" + tableData[i][j].toString() + "\" , ";
            //str1 = str1 + "Col_"+j.toString() +": " + tableData[i][j].toString() + "  , "; 
          }
          jstr = jstr + " { " + str1.trim().slice(0, -1) + " }, ";
          jstr2 =  ' { ' + str1.trim().slice(0, -1) + ' } ';
          //alert(jstr2);
          //JSONobj.arPoints.push( " { " + str1.trim().slice(0, -1) + " } ");
          //var Obj1 = JSON.parse(jstr2);
          //alert(" Column 0 value :" + Obj1.Col_0);
          //tableData8.push( JSON.parse(jstr2) );
        }

        //alert(jstr);
        //tableData7 = JSON.stringify(" [ " + jstr +  "] ");
        try{
            //alert("In try block - begin");
            tableData7 = JSON.parse("["+jstr.trim().slice(0, -1)+"]");
            //alert((tableData7));
            //alert(JSON.stringify(tableData7));
            //document.getElementById("t1").innerHTML = JSON.stringify(tableData7);
          //var obj999 = $.parseJSON("[" + jstr.trim().slice(0, -1) + "]");
          var obj9999 = JSON.parse("[" + jstr.trim().slice(0, -1) + "]");
          //alert("In try block - end");
        }
        catch(err) {
          //alert("catch");
          document.getElementById("error").innerHTML = err.message;
        }
        
        //for(var m=0;m<3;m++)
        //  { alert(tableData[0][m]); }

        // Destroy the old table.
        if (tableReference !== null) {
          tableReference.destroy();
          //$("#datatable").text("");
          $("#example-chart").text("");
        }  
       

        var tabulator_tbl_type = tableau.extensions.settings.get("tabulator_Type");
        //alert(" Tabulator TYPE :" + tabulator_tbl_type);
		
		    var column_names_array2 = tableau.extensions.settings.get("column_names").split("|");
        var column_order_array2 = tableau.extensions.settings.get("column_order").split("|");
        var col_AltNames_array2 = tableau.extensions.settings.get("col_AltNames").split("|");
        var col_d_m_array2 = tableau.extensions.settings.get("col_Dim_Measures").split("|"); 

        var dim_Count = 0, measure_Cnt = 0;
				dim_Count = tableau.extensions.settings.get("Dimensions_Count");
				measure_Cnt = tableau.extensions.settings.get("Measures_Count");
				
				///////// ------- prepare dataset --------------------------------------////////
				const worksheetData_grid = sumdata.data;
				var column_order_grid = tableau.extensions.settings.get("column_order").split("|");
				//for(var x=0; x<column_order_grid.length; x++) {alert(column_order_grid[x]); }

				var jstr_grid = ""; var tableData7_grid ; 
						var tableData_grid = makeArray(sumdata.columns.length, (sumdata.totalRowCount));
						for (var i = 0; i < (tableData_grid.length); i++) {
						  var str1 = "";
						  for (var j = 0; j < tableData_grid[i].length; j++) {
							//tableData[i][j] = worksheetData[i][column_order[j]-1].formattedValue; // for formatted value
							  tableData_grid[i][j] = worksheetData_grid[i][column_order_grid[j]-1].value;
							//alert(tableData[i][j]);          
						   
							//str1 = str1 + " \""+column_names[j].toString() + "\" :  \"" + tableData[i][j].toString() + "\" , "; //// working fine
							//str1 = str1 + " \""+data_col[j].title.toString() + "\" :  \"" + tableData[i][j].toString() + "\" , "; /// working fine
							str1 = str1 + " \""+data_col[j].genericname.toString() + "\" :  \"" + tableData_grid[i][j].toString() + "\" , ";
							//str1 = str1 + "Col_"+j.toString() +": " + tableData[i][j].toString() + "  , "; 
						  }
						  jstr_grid = jstr_grid + " { " + str1.trim().slice(0, -1) + " }, ";
						  
						}
					tableData7_grid = JSON.parse("["+jstr_grid.trim().slice(0, -1)+"]");
				///////// ------- prepare dataset --------------------------------------////////	
				
			  
			  var tabulator_columns_0 = [];
			  for(var n=0;n<dim_Count;n++) { tabulator_columns_0.push({title:col_AltNames_array2[n], field:col_d_m_array2[n]}); }
            
				for(var y=0;y<measure_Cnt;y++) { 
					var m = parseInt(y) + parseInt(dim_Count);
					tabulator_columns_0.push({title:col_AltNames_array2[m], field:col_d_m_array2[m]});              
				}

        document.getElementById("t1").innerHTML = JSON.stringify(tableData7_grid);
    
        //////---------------- script for d-3 sunburst chart  : end --///////////////////////////////
        const width = (window.innerWidth * 1.00),
            height = (window.innerHeight * 1.00),
            maxRadius = (Math.min(width, height) / 2.0) - 5;
			
			//const width = 500,
            //height = 700,
            //maxRadius = (Math.min(width, height) / 2.0) - 5;

        const formatNumber = d3.format(',d');

        const x = d3.scaleLinear()
            .range([0, 2 * Math.PI])
            .clamp(true);

        const y = d3.scaleSqrt()
            .range([maxRadius*.1, maxRadius]);

        const color = d3.scaleOrdinal(d3.schemeCategory20);

        const partition = d3.partition();

        const arc = d3.arc()
            .startAngle(d => x(d.x0))
            .endAngle(d => x(d.x1))
            .innerRadius(d => Math.max(0, y(d.y0)))
            .outerRadius(d => Math.max(0, y(d.y1)));

        const middleArcLine = d => {
            const halfPi = Math.PI/2;
            const angles = [x(d.x0) - halfPi, x(d.x1) - halfPi];
            const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);

            const middleAngle = (angles[1] + angles[0]) / 2;
            const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
            if (invertDirection) { angles.reverse(); }

            const path = d3.path();
            path.arc(0, 0, r, angles[0], angles[1], invertDirection);
            return path.toString();
        };

        const textFits = d => {
            const CHAR_SPACE = 6;

            const deltaAngle = x(d.x1) - x(d.x0);
            const r = Math.max(0, (y(d.y0) + y(d.y1)) / 2);
            const perimeter = r * deltaAngle;

            return d.data.name.length * CHAR_SPACE < perimeter;
        };

        const svg = d3.select('body').select('#example-chart').append('svg')
            .style('width', '90vw')
            .style('height', '90vh')
            .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
            .on('click', () => focusOn()); // Reset zoom on canvas click	

			

var data11 = [
 { "category": "furniture", "sub-category": "Bookcases", "prductName": "Bookcases1", "quantity":100  }, 
 { "category": "furniture", "sub-category": "Bookcases", "prductName": "Bookcases2", "quantity":100  },
 { "category": "furniture", "sub-category": "Chairs", "prductName": "Chairs1", "quantity":2356 },
 { "category": "furniture", "sub-category": "Furnishings", "prductName": "Furnishings1",  "quantity":3563 },
 { "category": "Technology", "sub-category": "phones", "prductName": "phones 1", "quantity":1200 }
];

//"prductName": "Furnishings1",

var nestedData = d3.nest()
  .key(function(d) { return d.world; })
  .key(function(d) { return d.country; })
  .entries(data11);
  
  //alert(JSON.stringify(nestedData));
  
  
  var newData = { name :"root", children : [] },
    levels = ["category","sub-category"];    //,"name"];

// For each data row, loop through the expected levels traversing the output tree
data11.forEach(function(d){
    // Keep this as a reference to the current level
    var depthCursor = newData.children;
    // Go down one level at a time
    levels.forEach(function( property, depth ){

        // Look to see if a branch has already been created
        var index;
        depthCursor.forEach(function(child,i){
            if ( d[property] == child.name ) index = i;
        });
        // Add a branch if it isn't there
        if ( isNaN(index) ) {
            depthCursor.push({ name : d[property], children : []});
            index = depthCursor.length - 1;
        }
        // Now reference the new child array as we go deeper into the tree
        depthCursor = depthCursor[index].children;
		
        // This is a leaf, so add the last element to the specified branch
        if ( depth === levels.length - 1 ){ 
			depthCursor.push({ name : d.prductName, size : d.quantity });
		}
		
    });
});

//alert(JSON.stringify(newData));
  

			
			//root = d3.hierarchy(nestedData);
			
			//root = d3.hierarchy(ddata6);
			root = d3.hierarchy(newData);
            root.sum(d => d.size);

            const slice = svg.selectAll('g.slice')
                .data(partition(root).descendants());

            slice.exit().remove();

            const newSlice = slice.enter()
                .append('g').attr('class', 'slice')
                .on('click', d => {
                    d3.event.stopPropagation();
                    focusOn(d);
                });

            newSlice.append('title')
                .text(d => d.data.name + '\n' + formatNumber(d.value));

            newSlice.append('path')
                .attr('class', 'main-arc')
                .style('fill', d => color((d.children ? d : d.parent).data.name))
                .attr('d', arc);

            newSlice.append('path')
                .attr('class', 'hidden-arc')
                .attr('id', (_, i) => `hiddenArc${i}`)
                .attr('d', middleArcLine);

            const text = newSlice.append('text')
                .attr('display', d => textFits(d) ? null : 'none');

            // Add white contour
            text.append('textPath')
                .attr('startOffset','50%')
                .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
                .text(d => d.data.name)
                .style('fill', 'none')
                .style('stroke', '#fff')
                .style('stroke-width', 5)
                .style('stroke-linejoin', 'round');

            text.append('textPath')
                .attr('startOffset','50%')
                .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
                .text(d => d.data.name);
			

        function focusOn(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {
            // Reset to top-level if no data point specified

            const transition = svg.transition()
                .duration(750)
                .tween('scale', () => {
                    const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(y.domain(), [d.y0, 1]);
                    return t => { x.domain(xd(t)); y.domain(yd(t)); };
                });

            transition.selectAll('path.main-arc')
                .attrTween('d', d => () => arc(d));

            transition.selectAll('path.hidden-arc')
                .attrTween('d', d => () => middleArcLine(d));

            transition.selectAll('text')
                .attrTween('display', d => () => textFits(d) ? null : 'none');

            moveStackToFront(d);

            //

            function moveStackToFront(elD) {
                svg.selectAll('.slice').filter(d => d === elD)
                    .each(function(d) {
                        this.parentNode.appendChild(this);
                        if (d.parent) { moveStackToFront(d.parent); }
                    })
            }
        }

        //////---------------- script for d-3 sunburst chart  : end --///////////////////////////////
        


      })
    } ///////////// end of [else block] of Summary data 

  }  ////////// ------------------- end of renderDataTable()

  // Creates an empty 2D array. we will use this to match the the data set returned
  // by Tableau and repopulate this with the values we want.
  function makeArray(d1, d2) {
    var arr = new Array(d1), i, l;
    for(i = 0, l = d2; i < l; i++) {
        arr[i] = new Array(d1);
    }
    return arr;
  }

  



  // This is called when you click on the Configure button.
  function configure() {
    
    const popupUrl = `${window.location.origin}/tableau-extension-sunburst/dialog.html`;

    let input = "";

    tableau.extensions.ui.displayDialogAsync(popupUrl, input, { height: 540, width: 800 }).then((closePayload) => {
      // The close payload is returned from the popup extension via the closeDialog method.
      $('#interval').text(closePayload);
    }).catch((error) => {
      // One expected error condition is when the popup is closed by the user (meaning the user
      // clicks the 'X' in the top right of the dialog).  This can be checked for like so:
      switch (error.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log("Dialog was closed by user");
          break;
        default:
          console.error(error.message);
      }
    });
  } // end of configure() --- opening configuration page i.e. dialog.html


})();
