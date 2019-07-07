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


      //$("#example-chart").text("");
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
        var x=0;
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
       

        //var tabulator_tbl_type = tableau.extensions.settings.get("tabulator_Type");
        //alert(" Tabulator TYPE :" + tabulator_tbl_type);
		
		    	
				
			  
			  var tabulator_columns_0 = [];
			  for(var n=0;n<dim_Count;n++) { tabulator_columns_0.push({title:col_AltNames_array2[n], field:col_d_m_array2[n]}); }
            
				for(var y=0;y<measure_Cnt;y++) { 
					var m = parseInt(y) + parseInt(dim_Count);
					tabulator_columns_0.push({title:col_AltNames_array2[m], field:col_d_m_array2[m]});              
				}

        document.getElementById("t1").innerHTML = JSON.stringify(tableData7);
    
        //////---------------- script for d-3 sunburst chart  : end --///////////////////////////////
        

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
    //const popupUrl = `${window.location.origin}/dialog.html`;

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
