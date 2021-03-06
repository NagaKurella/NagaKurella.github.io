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
          var s1 = column_names[i];
          s1 = s1.replace('-','');
          s1 = s1.replace('SUM','');
          s1 = s1.replace('(',''); //s1 = s1.replace('(','[');
          s1 = s1.replace(')',''); //s1 = s1.replace(')',']');
          //data_col.push({ title: column_names[i], field:column_names[i] }); //,headerVertical:true,headerFilter:true
          data_col.push({ title: s1, field:s1 });
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
            str1 = str1 + " \""+data_col[j].title.toString() + "\" :  \"" + tableData[i][j].toString() + "\" , ";
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
          /*
          var table = new Tabulator("#example-table", {
            height:370, // set height of table to enable virtual DOM
            data:tableData7, //load initial data into table    JSONobj.arPoints   tableData7 JSON.stringify(tableData7)  JSON.parse(jstr)
            autoColumns:true, 
            //columns:data_col,
            layout:"fitColumns", //fit columns to width of table (optional)
            pagination:"local",
            paginationSize:10,
            paginationSizeSelector:[10, 20, 30, 40, 50],                              
          });
          */
          //var table = new Tabulator("#example-table", {});
          //table.setColumns(JSON.parse(data_col.title));
          //table.setColumns(tabledata9);
          //table.updateData(tableData);
          //table.setData(tableData);
          //table.updateData(JSON.parse(jstr));
          //$("#example-table").tabulator("setData", tableData);
            

        }

        /////////// code drill down ////////////////////////////////
        var dimCount, measureCnt ;
        try{
          //alert("In preparing TABLE using ALASQL");
          alasql('DROP TABLE IF EXISTS tblSheetData');
          alasql('CREATE TABLE tblSheetData(Category STRING, Manufacturer STRING, SubCategory STRING, Quantity REAL, Sales REAL)');                
          //alasql('INSERT INTO tblSheetData(Category,Quantity) VALUES("cate1",10) ');
          //alasql('INSERT INTO tblSheetData(Category,Quantity) VALUES("cate1",20) ');
          //var res = alasql('SELECT Category, SUM(Quantity) As Q FROM tblSheetData GROUP BY Category');
          var insertQry = "";
          for(var x=0;x<tableData7.length;x++)
          {            
            insertQry = "";
            insertQry = 'INSERT INTO tblSheetData(Category,Manufacturer,SubCategory,Quantity,Sales) VALUES(';
            insertQry = insertQry + ' "'+tableData7[x].Category+'", "'+tableData7[x].Manufacturer+'", "'+tableData7[x].SubCategory + '", '+tableData7[x].Quantity+', '+tableData7[x].Sales+' )';
            alasql(insertQry);
            //alert(tableData7[x].Category);
          }
          //var res = alasql('SELECT Category, SUM(Quantity) As Q FROM tblSheetData GROUP BY Category');
          alasql('DROP TABLE IF EXISTS tbl_InData');
          alasql('CREATE TABLE tbl_InData(Id INT IDENTITY(1,1), parentID INT, Category STRING, SubCategory STRING, Manufacturer STRING, Quantity REAL, Sales REAL)');
          alasql('DROP TABLE IF EXISTS tbl_InData2');
          alasql('CREATE TABLE tbl_InData2(Id INT IDENTITY(1,1), parentID INT, Category STRING, SubCategory STRING, Manufacturer STRING, Quantity REAL, Sales REAL)');
          alasql('DROP TABLE IF EXISTS tbl_InData3');
          alasql('CREATE TABLE tbl_InData3(Id INT IDENTITY(1,1), parentID INT, Category STRING, SubCategory STRING, Manufacturer STRING, Quantity REAL, Sales REAL)');
          //alasql('INSERT INTO tbl_InData VALUES (1,NULL,"Technology","Tech-1","Tech-2",100.23,200 )');   // insert option 1
          //alasql('INSERT INTO tbl_InData(parentID,Category) VALUES (1,"Technology")');    // insert option 2
          
          alasql('DROP TABLE IF EXISTS tbl_InData4');
          //alasql('CREATE TABLE tbl_InData4(Id INT IDENTITY(1,1), parentID INT, Category STRING, SubCategory STRING, Manufacturer STRING, Quantity REAL, Sales REAL)');
          alasql('CREATE TABLE tbl_InData4(Id INT IDENTITY(1,1), Category STRING, SubCategory STRING, Manufacturer STRING, Quantity REAL, Sales REAL)');

          //insert--1---
          alasql('INSERT INTO tbl_InData(parentID,Category,Quantity,Sales) SELECT NULL, Category, SUM(Quantity) As Quantity, SUM(Sales) As Sales FROM tblSheetData GROUP BY Category')
          //var res = alasql('SELECT Category, SUM(Sales) AS Sales FROM ? GROUP BY Category',[tableData7]);

          //insert--2---
          alasql('INSERT INTO tbl_InData2(Category, SubCategory, Quantity, Sales) \
                     SELECT  Category, SubCategory, SUM(Quantity) As Quantity, SUM(Sales) AS Sales FROM tblSheetData GROUP BY Category, SubCategory ');
          //var res = alasql('SELECT * FROM tbl_InData2');
          var qry2 = 'INSERT INTO tbl_InData(parentID,Category,SubCategory, Quantity,Sales) ';
              qry2 = qry2 + 'SELECT tbl_InData.Id AS parentID, tbl_InData2.SubCategory AS Category, tbl_InData2.SubCategory, tbl_InData2.Quantity, tbl_InData2.Sales FROM ';
              //qry2 = qry2 + '  (SELECT  Category, SubCategory, SUM(Quantity) As Quantity, SUM(Sales) AS Sales FROM tblSheetData GROUP BY Category, SubCategory)  ';
              qry2 = qry2 + ' tbl_InData2 LEFT OUTER JOIN tbl_InData ON tbl_InData2.Category = tbl_InData.Category ';
          alasql(qry2);
          //var p_c_data = alasql("SELECT Id, Category, SubCategory, Manufacturer, parentID, Quantity, Sales FROM tbl_InData")

          //alasql("SELECT Id, ")

          //insert--3--
          alasql('INSERT INTO tbl_InData3(Category, SubCategory, Manufacturer, Quantity, Sales) \
                     SELECT Category, SubCategory, Manufacturer, SUM(Quantity) As Quantity, SUM(Sales) AS Sales FROM tblSheetData GROUP BY Category, SubCategory, Manufacturer ');
          //var qry3 = '';
          var qry3 = 'INSERT INTO tbl_InData(parentID,Category,Quantity,Sales) ';
              qry3 = qry3 + ' SELECT  tbl_InData.Id AS parentID, tbl_InData3.Manufacturer As Category, tbl_InData3.Quantity, tbl_InData3.Sales FROM tbl_InData3 '
              qry3 = qry3 + '  LEFT JOIN tbl_InData ON tbl_InData3.SubCategory = tbl_InData.SubCategory ';    // tbl_InData.Category
          alasql(qry3);    //tbl_InData3.Manufacturer AS Category
          //var p_c_data = alasql(qry3);

          //var p_c_data = alasql("SELECT Id, Category, SubCategory, Manufacturer, Quantity, Sales FROM tbl_InData4")
          //var p_c_data = alasql("SELECT Id, Category, SubCategory, Manufacturer, parentID, Quantity, Sales FROM tbl_InData3") // data is coming 
          var p_c_data = alasql("SELECT Id, Category, SubCategory, parentID, Quantity, Sales FROM tbl_InData")
          document.getElementById("t1").innerHTML = JSON.stringify(p_c_data);
          //document.getElementById("t1").innerHTML = qry3;
          
          //// now, convert parent&child structure data into proper JSON parent child format
          var str1 = JSON.stringify(convert_parent_C(p_c_data));
          str1 = str1.replace('{"_children":',''); 
          str1 = str1.slice(0, -1);  ////// trim last character }
          var str2 = replaceAll(str1,',"_children":[]','');
          //document.getElementById("t1").innerHTML = str2;
          var tableDataNested3 = JSON.parse(str2);

            var table = new Tabulator("#example-table", {
              height:"311px",
              data:tableDataNested3,
              dataTree:true,
              dataTreeStartExpanded:false,   // dataTreeStartExpanded:true,
              columns:[
              //{title:"Id", field:"Id", width:200, responsive:0}, //never hide this column
              {title:"Category", field:"Category", width:150, responsive:0},
              {title:"Quantity", field:"Quantity"},
              {title:"Sales", field:"Sales"},
              ],
            });

          //document.getElementById("t1").innerHTML = JSON.stringify(worksheetData);

          function replaceAll(str, term, replacement) {
            return str.replace(new RegExp(escapeRegExp(term),'g'), replacement);
          }
        
          function escapeRegExp(string){
            return string.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
          }
        
          function convert_parent_C(array){
            var map = {}
            for(var i = 0; i < array.length; i++){
                var obj = array[i]
                if(!(obj.Id in map)){
                    map[obj.Id] = obj
                    map[obj.Id]._children = []
                }
          
                if(typeof map[obj.Id].Category == 'undefined'){
                    map[obj.Id].Id = obj.Id
                    map[obj.Id].Category = obj.Category
                    map[obj.Id].SubCategory = obj.SubCategory
                    map[obj.Id].Manufacturer = obj.Manufacturer
                    map[obj.Id].Quantity = obj.Quantity
                    map[obj.Id].Sales = obj.Sales
                    map[obj.Id].parentID= obj.parentID
                }
          
                var parent = obj.parentID || '-';
                if(!(parent in map)){
                    map[parent] = {}
                    map[parent]._children = []
                }
          
                map[parent]._children.push(map[obj.Id])
            }
            return map['-']
          }


        }
        catch(err) {
          alert(err.message);
          //document.getElementById("error").innerHTML = err.message;
        }
        /////////// code drill down ////////////////////////////////

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