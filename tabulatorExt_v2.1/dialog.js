'use strict';

(function () {

  $(document).ready(function () {

      $('.table-sortable tbody').sortable({
        handle: 'span'
      });

      $("#tblFieldInfo").sortable({
        handle: 'span'
      });

    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      buildDialog();
    });
  });

  // We bulid the dialogue box and ensure that settings are read from the
  // UI Namespace and the UI is updated.
  function buildDialog() {

    var worksheetName = tableau.extensions.settings.get("worksheet");
    if (worksheetName != undefined) {
      // We restore the look and feel settings.
      

      // We restore the plugin settings.
      
    }

    // Populate the worksheet drop down with a list of worksheets.
    // Generated at the time of opening the dialogue.
    let dashboard = tableau.extensions.dashboardContent.dashboard;

    $("#tableau_db_name").html("<strong>"+dashboard.name+"</strong>");

    dashboard.worksheets.forEach(function (worksheet) {
      $("#selectWorksheet").append("<option value='" + worksheet.name + "'>" + worksheet.name + "</option>");
    });

    // Add the column orders it exists
    var column_order = tableau.extensions.settings.get("column_order");
    if (column_order != undefined && column_order.length > 0) {
      var column_names_array = tableau.extensions.settings.get("column_names").split("|");
      var column_order_array = tableau.extensions.settings.get("column_order").split("|");
      var col_AltNames_array = tableau.extensions.settings.get("col_AltNames").split("|");
      var col_d_m_array = tableau.extensions.settings.get("col_Dim_Measures").split("|");

      //for (var i = 0; i < column_names_array.length; i++) { alert(col_d_m_array[i]); }
      //alert("Dim x Mea : " + tableau.extensions.settings.get("Dimensions_Count") + " x " + tableau.extensions.settings.get("Measures_Count"));
          
      //$("#sort-it ol").text("");
      //for (var i = 0; i < column_names_array.length; i++) {
      //  //alert(column_names_array[i] + " : " + column_order_array[i]);
      //  $("#sort-it ol").append("<li><div class='input-field'><input id='" + column_names_array[i] + "' type='text' col_num=" + column_order_array[i] + "><label for=" + column_names_array[i] + "'>" + column_names_array[i] + "</label></div></li>");
      //}
      
      //alert("before binding table to DIV");  
      $("#sort-it2").text("");
      var table_tag = '<table id="tblFieldInfo" class="table table-sortable table-condensed table-bordered table-hover" >';
      table_tag = table_tag + '<thead> <tr> <th># </th> <th> Field Name </th> <th> Alternate Name </th> <th>Field Type </th> </tr> </thead>';
      table_tag = table_tag + '<tbody>';
      var tr_tag = ''; // "badge badge-secondary"
      for (var i = 0; i < column_names_array.length; i++) {
        //alert(column_names_array[i] + " : " + column_order_array[i]);   class="glyphicon glyphicon-move"
        //$("#sort-it2").append("<li><div class='input-field'><input id='" + column_names_array[i] + "' type='text' col_num=" + column_order_array[i] + "><label for=" + column_names_array[i] + "'>" + column_names_array[i] + "</label></div></li>");
        tr_tag = '<tr>';
        tr_tag = tr_tag + '<td> <span>::::</span> '+i+' </td> ';
        tr_tag = tr_tag + '<td> <h5><label class= class="'+fieldType_dim_Measure(column_names_array[i]).badgeCSSClassName+'"  >'+column_names_array[i]+'</label></h5> </td>';
        tr_tag = tr_tag + '<td> <input type="text" id="alt_fldName_'+i+'" col_num="' + (i+1) + '" class="form-control" value="'+ col_AltNames_array[i] +'" data-fieldname= "'+column_names_array[i]+'" data-fieldtype= "'+col_d_m_array[i]+'" /> </td>';
        tr_tag = tr_tag + '<td> <select id="fldType_'+i+'" > <option value="dimension">Dimension</option> <option value="Measure">Measure</option> </select> </td>';
        tr_tag = tr_tag + '</tr>';
        //alert(tr_tag);
        table_tag = table_tag + tr_tag;
      }
      table_tag = table_tag + '</tbody>';
      table_tag = table_tag + '</table>';      
      $("#sort-it2").append(table_tag);

      $('.table-sortable tbody').sortable({
        placeholder: "ui-state-highlight"
      });

      $("#tblFieldInfo").sortable({
        handle: 'span'
      });

      /*$('#sort-it ol').sortable({
        onDrop: function (item) {
          $(item).removeClass("dragged").removeAttr("style");
          $("body").removeClass("dragging");
        }
      });*/

    }

    // Initialise the tabs, select and attach functions to buttons.
    $("#selectWorksheet").val(tableau.extensions.settings.get("worksheet"));
    $('#selectWorksheet').on('change', '', function (e) {
      columnsUpdate();
    });

    //$("#underlying").val(tableau.extensions.settings.get("underlying"));
    //$('#underlying').on('change', '', function (e) {
    //  columnsUpdate();
    //});

    $("input[name='tabulatorType']").val(tableau.extensions.settings.get("tabulator_Type"));

    

    //$("#max_no_records").val(tableau.extensions.settings.get("max_no_records"));
    $("#optradio_theme").val(tableau.extensions.settings.get("optradio_theme"));

    //$('select').formSelect();
    //$('.tabs').tabs();

    $('#closeButton').click(closeDialog);
    $('#saveButton').click(saveButton);
    $('#resetButton').click(resetButton);
    // Initialise the tabs, select and attach functions to buttons.

  }

  function columnsUpdate() {
    var worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
    var worksheetName = $("#selectWorksheet").val();
    //var underlying = $("#underlying").val();
    var underlying = 2; //// Summary Datas

    // Get the worksheet object for the specified names.
    var worksheet = worksheets.find(function (sheet) {
      return sheet.name === worksheetName;
    });

    // If underlying is 1 then get Underlying, else get Summary. Note that the columns will
    // look different if you have summary or underlying.
    if (underlying == 1) {
      // Note that for our purposes and to speed things up we only want 1 record.
      worksheet.getUnderlyingDataAsync({ maxRows: 1 }).then(function (sumdata) {
        var worksheetColumns = sumdata.columns;
        // This blanks out the column list
        $("#sort-it ol").text("");
        var counter = 1;
        worksheetColumns.forEach(function (current_value) {
          // For each column we add a list item with an input box and label.
          // Note that this is based on materialisecss.          
          $("#sort-it ol").append("<li><div class='input-field'><input id='" + current_value.fieldName + "' type='text' col_num=" + counter + "><label for=" + current_value.fieldName + "'>" + current_value.fieldName + "</label></div></li>");
          counter++;
        });
      });
    } else {
      // Note that for our purposes and to speed things up we only want 1 record.
      worksheet.getSummaryDataAsync({ maxRows: 1 }).then(function (sumdata) {
        var worksheetColumns = sumdata.columns;
        // This blanks out the column list
        $("#sort-it ol").text("");
        var counter = 1;
	      
	      $("#sort-it2").text("");      
       var table_tag = '<table id="tblFieldInfo" class="table table-sortable table-condensed table-bordered table-hover" >';
       table_tag = table_tag + '<thead> <tr> <th># </th> <th> Field Name </th> <th> Alternate Name </th> <th>Field Type </th> </tr> </thead>';
       table_tag = table_tag + '<tbody>';
       var tr_tag = '';
	      
        worksheetColumns.forEach(function (current_value) {
          // For each column we add a list item with an input box and label.
          // Note that this is based on materialisecss.
		var fieldInfo2 = fieldType_dim_Measure(current_value.dataType);
          var fieldInfo = " Name : " + current_value.fieldName + "; DataType: " + fieldInfo2.fieldType +" ";
          //alert(fieldInfo);
          //$("#sort-it ol").append("<li><div class='input-field'><input id='" + current_value.fieldName + "' type='text' col_num=" + counter + "><label for=" + current_value.fieldName + "'>" + current_value.fieldName + "</label></div></li>");
          //counter++;
	
	  tr_tag = '<tr>';
          tr_tag = tr_tag + '<td> <span>::::</span> '+counter+' </td> ';
          tr_tag = tr_tag + '<td> <h5><label class="'+fieldInfo2.badgeCSSClassName+'" >'+current_value.fieldName+'</label></h5> </td>';
          tr_tag = tr_tag + '<td> <input type="text" id="alt_fldName_'+counter+'" col_num="' + (counter) + '" class="form-control" value="'+ current_value.fieldName +'" data-fieldname= "'+current_value.fieldName+'" data-fieldtype= "'+fieldInfo2.fieldType+'"  /> </td>';
          tr_tag = tr_tag + '<td> <select id="fldType_'+counter+'" > <option value="dimension">Dimension</option> <option value="Measure">Measure</option> </select> </td>';
          tr_tag = tr_tag + '</tr>';
          //alert(tr_tag);
          table_tag = table_tag + tr_tag;
		
	  counter++;	
	  
        });
	  table_tag = table_tag + '</tbody>';
          table_tag = table_tag + '</table>';      
          $("#sort-it2").append(table_tag); 
	  
	  $('.table-sortable tbody').sortable({
        	placeholder: "ui-state-highlight"
      	    });

          $("#tblFieldInfo").sortable({
            handle: 'span'
          });
	  
      });
    }

    // Sets up the sortable elements for the columns list.
    // https://jqueryui.com/sortable/
    /* $('#sort-it ol').sortable({
      onDrop: function (item) {
        $(item).removeClass("dragged").removeAttr("style");
        $("body").removeClass("dragging");
      }
    }); */
    // Sets up the sortable elements for the columns list.

    $('.table-sortable tbody').sortable({
      handle: 'span'
    });

    $("#tblFieldInfo").sortable({
      handle: 'span'
    });

  }
  
  function fieldType_dim_Measure(fldType){
	  
    var fieldType = "";
    var badgeCSSClassName = "";	  
    if(fldType.toLowerCase() == "string"){
      fieldType = "dimension";
      badgeCSSClassName = "badge badge-primary";	    
    }
    else if(fldType.toLowerCase() == "int" || fldType.toLowerCase() == "float" ){
      fieldType = "measure"; badgeCSSClassName = "badge badge-success";
    }
    else { fieldType = "dimension"; badgeCSSClassName = "badge badge-primary"; }
    
    var obj = {  fieldType: fieldType, badgeCSSClassName: badgeCSSClassName  };

    return obj;
  }

  // This function closes the dialog box without.
  function closeDialog() {
    //alert("in closeDialog - definition ");
    tableau.extensions.ui.closeDialog("10");
  } // end of close button

  // This function saves then settings and then closes then closes the dialogue
  // window.
  function saveButton() {

    //alert("in saveButton - definition ");
    // Data settings
    tableau.extensions.settings.set("worksheet", $("#selectWorksheet").val());
    //tableau.extensions.settings.set("max_no_records", $("#max_no_records").val());
    //tableau.extensions.settings.set("underlying", $("#underlying").val());

    tableau.extensions.settings.set("optradio_theme", $("#optradio_theme").val());

    var tabulator_GRID_type = '';
    var radioButtons = document.getElementsByName("tabulatorType");
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
          tabulator_GRID_type = radioButtons[i].value;
      }
    }
    alert(tabulator_GRID_type);

    alert(" In saving .... " + $('input[name=tabulatorType]:checked').val());
    //alert(" In saving .... " + $("#tabulatorType").val());
    tableau.extensions.settings.set("tabulator_Type", $("input[name=tabulatorType]:checked").val());

    // Create a string which will hold the datatable.net css options called tableClass.
    // Also saves the individual Y and N so that we can restore the settings when you
    // open the configuration dialogue.
    // https://datatables.net/examples/styling/
    var tableClass = "";
     /* if ($("#compact").is(":checked")) {
      tableClass += " compact";
      tableau.extensions.settings.set("compact", "Y");
    } else {
      tableau.extensions.settings.set("compact", "N");
    }
    if ($("#hover").is(":checked")) {
      tableClass += " hover";
      tableau.extensions.settings.set("hover", "Y");
    } else {
      tableau.extensions.settings.set("hover", "N");
    }
    if ($("#nowrap").is(":checked")) {
      tableau.extensions.settings.set("nowrap", "Y");
    } else {
      tableClass += " nowrap";
      tableau.extensions.settings.set("nowrap", "N");
    }
    if ($("#order-column").is(":checked")) {
      tableClass += " order-column";
      tableau.extensions.settings.set("order-column", "Y");
    } else {
      tableau.extensions.settings.set("order-column", "N");
    }
    if ($("#row-border").is(":checked")) {
      tableClass += " row-border";
      tableau.extensions.settings.set("row-border", "Y");
    } else {
      tableau.extensions.settings.set("row-border", "N");
    }
    if ($("#stripe").is(":checked")) {
      tableClass += " stripe";
      tableau.extensions.settings.set("stripe", "Y");
    } else {
      tableau.extensions.settings.set("stripe", "N");
    }  */

    //tableau.extensions.settings.set("table-classes", tableClass);

    // Saves the individual Y and N for the plugin settings so that we can restore this
    // when you open the configuration dialogue.
    // https://datatables.net/extensions/buttons/examples/html5/simple.html
    /* if ($("#export-clipboard").is(":checked")) {
      tableau.extensions.settings.set("export-clipboard", "Y");
    } else {
      tableau.extensions.settings.set("export-clipboard", "N");
    }
    if ($("#export-excel").is(":checked")) {
      tableau.extensions.settings.set("export-excel", "Y");
    } else {
      tableau.extensions.settings.set("export-excel", "N");
    }
    if ($("#export-csv").is(":checked")) {
      tableau.extensions.settings.set("export-csv", "Y");
    } else {
      tableau.extensions.settings.set("export-csv", "N");
    }
    if ($("#export-pdf").is(":checked")) {
      tableau.extensions.settings.set("export-pdf", "Y");
    } else {
      tableau.extensions.settings.set("export-pdf", "N");
    }
    if ($("#export-print").is(":checked")) {
      tableau.extensions.settings.set("export-print", "Y");
    } else {
      tableau.extensions.settings.set("export-print", "N");
    } */

    // This gets the column information and saves the column order and column name.
    // For example, if you have a data source with three columns and then reorder
    // there so that you get the third, first and then second column, you would get: 
    // --- column_order will look like: 3|1|2
    // --- column_name will look like: SUM(Sales)|Country|Region
    var column_order = "";
    var column_name = ""; 
    var col_AltNames = "";
    var col_Types = "";
    var col_Dim_Measures = "";
	  
    var counter = 0; //tblFieldInfo  $("#sort-it")  #sort-it2
    var dCnt = 1; var mCnt = 1;
    if($("#tblFieldInfo").length)
    { 
    
    $("#tblFieldInfo").find("input").each(function (column) { 
	    
      // This handles the columns as dimension or measure
      // col_Dim_Measures : dimension1|dimension2|...measure1|measure2 ...
      	    
      if (counter == 0) {
	   if($(this).attr("data-fieldtype").toLowerCase().indexOf("dimension") != -1 ) {   
             col_Dim_Measures = "dimension" + dCnt.toString(); dCnt++;
	   } else { col_Dim_Measures = "measure" + mCnt.toString();  mCnt++; }
	      
      } else {
	   if($(this).attr("data-fieldtype").toLowerCase().indexOf("dimension") != -1) {   
             col_Dim_Measures = col_Dim_Measures + "|" + "dimension" + dCnt.toString(); 
             dCnt++;
	   } else { 
		   col_Dim_Measures = col_Dim_Measures + "|" + "measure" + mCnt.toString();  
		   mCnt++; 
	   }   
        //col_Dim_Measures = col_Dim_Measures + "|" + $(this).attr("data-fieldtype");
      }
	    
      // This handles the column order
      if (counter == 0) {
        column_order = $(this).attr("col_num");
      } else {
        column_order = column_order + "|" + $(this).attr("col_num");
      }
      // This handles the column name.
      if (counter == 0) {
        if ($(this).val().length > 0) {
          //column_name = $(this).val();
	  column_name = $(this).attr("data-fieldname");	
        } //else {
          //column_name = $(this).attr("id");
        //}
      } else {
        if ($(this).val().length > 0) {
          //column_name = column_name + "|" + $(this).val();
	  column_name = column_name + "|" + $(this).attr("data-fieldname");
        } //else {
          //column_name = column_name + "|" + $(this).attr("id");	    
        //}
      }
      
      // This handles the column ALTERNATE name.
      if (counter == 0) {
        if ($(this).val().length > 0) {
          col_AltNames = $(this).val();
        } //else {
          //column_name = $(this).attr("id");
        //}
      } else {
        if ($(this).val().length > 0) {
          col_AltNames = col_AltNames + "|" + $(this).val();
        } //else {
          //column_name = column_name + "|" + $(this).attr("id");
        //}
      }	    
      counter++;
    });
    }
    dCnt = dCnt -1; mCnt = mCnt -1;
    // We save the column order and column name variables in the UI Namespace.
    tableau.extensions.settings.set("column_order", column_order);
    tableau.extensions.settings.set("column_names", column_name);
    tableau.extensions.settings.set("col_AltNames", col_AltNames);
	  //alert("before saving... " + col_Dim_Measures);
    tableau.extensions.settings.set("col_Dim_Measures", col_Dim_Measures);
    tableau.extensions.settings.set("Dimensions_Count", dCnt);
    tableau.extensions.settings.set("Measures_Count", mCnt);	  

    // Call saveAsync to save the settings before calling closeDialog.
    tableau.extensions.settings.saveAsync().then((currentSettings) => {
      //alert("in saveButton() --> tableau.extensions.settings.saveAsync() ");
      tableau.extensions.ui.closeDialog("10");
    });



  } // end of save button


})();
