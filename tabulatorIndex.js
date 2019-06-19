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
      $("#datatable").text("");
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

    // Retrieve values the other two values from the settings dialogue window.
    //var underlying = tableau.extensions.settings.get("underlying");
    var underlying = 2;
    //var max_no_records = tableau.extensions.settings.get("max_no_records");

    var table_themeName = tableau.extensions.settings.get("optradio_theme");
    if(table_themeName == "theme1"){
      $('head').append('<link rel="stylesheet" href="tabulator.min.css" type="text/css" />');
    }else if(table_themeName == "theme2"){
      $('head').append('<link rel="stylesheet" href="tabulator_simple.min.css" type="text/css" />');
    }
    else  if(table_themeName == "theme3"){
      $('head').append('<link rel="stylesheet" href="tabulator_midnight.min.css" type="text/css" />');
    }

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
        for (i = 0; i < column_names.length; i++) {
          data_col.push({ title: column_names[i], field:column_names[i] }); //,headerVertical:true,headerFilter:true
          //data_col.push({ title: column_names[i] });
          //alert(column_names[i]); // ok
          //data_col.push(column_names[i]);
          //alert(column_names[i]);
        }
        

        // We have created an array to match the underlying data source and then
        // looped through to populate our array with the value data set. We also added
        // logic to read from the column names and column order from our configiration.
        const worksheetData = sumdata.data;
        var column_order = tableau.extensions.settings.get("column_order").split("|");
        
        
        
        var jstr = ""; var jstr2 = ""; var tableData7 ; var tableData8 = [];
        var tableData = makeArray(sumdata.columns.length, (sumdata.totalRowCount));
        for (var i = 0; i < (tableData.length); i++) {
          var str1 = "";
          for (var j = 0; j < tableData[i].length; j++) {
            tableData[i][j] = worksheetData[i][column_order[j]-1].formattedValue;
            //alert(tableData[i][j]);          
           
            str1 = str1 + " \""+column_names[j].toString() + "\" :  \"" + tableData[i][j].toString() + "\" , ";
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
            alert(JSON.stringify(tableData7));
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
          $("#example-table").text("");
        }

        // Read the Settings and get the single string for UI settings.
        var tableClass = tableau.extensions.settings.get("table-classes");
        //$("#datatable").attr('class', '')
        $("#example-table").attr('class', '')
        //$("#datatable").addClass(tableClass);

        // Read the Settings and create an array for the Buttons.
        var buttons = [];
        
        // If there are 1 or more Export options ticked, then we will add the dom: 'Bfrtip'
        // Else leave this out.
        if (buttons.length > 0) {
        } 
        else 
        {
          //alert(" --- buttons.length < zero ; tabulator assignment");
          //alert(JSON.stringify(tableData7));
          var table = new Tabulator("#example-table", {
            height:400, // set height of table to enable virtual DOM
            data:tableData7, //load initial data into table    JSONobj.arPoints   tableData7 JSON.stringify(tableData7)  JSON.parse(jstr)
            autoColumns:true, 
            //columns:data_col,
            layout:"fitColumns", //fit columns to width of table (optional)
            pagination:"local",
            paginationSize:10,
            paginationSizeSelector:[10, 20, 30, 40, 50],                              
          });
          //var table = new Tabulator("#example-table", {});
          //table.setColumns(JSON.parse(data_col.title));
          //table.setColumns(tabledata9);
          //table.updateData(tableData);
          //table.setData(tableData);
          //table.updateData(JSON.parse(jstr));
          //$("#example-table").tabulator("setData", tableData);
            

        }


      })
    }

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

    //const popupUrl = `${window.location.origin}/datatable/dialog.html`;
    const popupUrl = `${window.location.origin}/dialog.html`;

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
