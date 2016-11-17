angular.module('starter.controllers', [])
.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

//  var tableau = require("tableau");

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  $scope.data = "data";
  angular.element(document).ready(function initViz() {
    var containerDiv = document.getElementById("vizContainer"),
      url = "https://public.tableau.com/views/hierarchy_demo/demo",
      //this url shows how it works with a dashboard. Comment the above and uncomment below to switch.
      //url = "https://public.tableau.com/views/hierarchy_demo/hierarchy_demo",
      options = {
        hideTabs: true,
        hideToolbar: true,
        onFirstInteractive: function() {
          workbook = viz.getWorkbook();
          getVizData();
        }
      };
    viz = new tableau.Viz(containerDiv, url, options);
  });

  //when viz is loaded (onFirstInteractive), request data
  function getVizData() {
    options = {
      maxRows: 0, // Max rows to return. Use 0 to return all rows
      ignoreAliases: false,
      ignoreSelection: true,
      includeAllColumns: false
    };

    sheet = viz.getWorkbook().getActiveSheet();

    //if active tab is a worksheet, get data from that sheet
    if (sheet.getSheetType() === 'worksheet') {
      sheet.getUnderlyingDataAsync(options).then(function(t) {
        buildMenu(t);
      });

      //if active sheet is a dashboard get data from a specified sheet
    } else {
      worksheetArray = viz.getWorkbook().getActiveSheet().getWorksheets();
      for (var i = 0; i < worksheetArray.length; i++) {
        worksheet = worksheetArray[i];
        sheetName = worksheet.getName();
        if (sheetName == 'levels') {
          worksheetArray[i].getSummaryDataAsync(options).then(function(t) {
            buildMenu(t);
          });
        }
      }
    }
  }

  //restructure the data and build something with it
  function buildMenu(table) {

    //the data returned from the tableau API
    var columns = table.getColumns();
    var data = table.getData();
    var niceData = $scope.reduceToObjects(columns, data);
    var place = "with you";
    //create nested tree structure
    var menuTree = d3.nest()
      .key(function(d) {
        return d.Level1;
      }).sortKeys(d3.ascending)
      .key(function(d) {
        return d.Level2;
      }).sortKeys(d3.ascending)
      .key(function(d) {
        return d.Level3;
      }).sortKeys(d3.ascending)
      .rollup(function(leaves) {
        return leaves.length;
      })
      .entries(niceData);

    //D3 layout menu list
    var menu = d3.select('#menuTree').selectAll('ul')
      .data(menuTree)
      .enter()
      .append('ul')

    //append list items
    function writeMenu(parentList) {

      var item = parentList
        .filter(function(d) {
          return d.key != "%null%";
        })
        .append('li')
        .text(function(d) {
          return d.key;
        })
        .classed("collapsed", true);

      var children = parentList.selectAll('ul')
        .data(function(d) {
          return d.values
        })
        .enter().append('ul');

      if (!children.empty()) {
        writeMenu(children);
      }
    }
    writeMenu(menu);

    //init collapible functions
    $('ul>li').siblings("ul").toggle();
    $('ul').not(':has(li)').remove(); //removes empty children with Null values. not a perfect approach, but easier for this demo
    $('ul>li').click(function() {

      //expand if it has children
      if ($(this).siblings('ul').length) {
        $(this).toggleClass("collapsed");
        $(this).siblings("ul").slideToggle(300);
      }

      //apply parameter to change the viz
      var depth = $(this).parents("ul").length;
      if ($(this).text() == "Show Top Level") {
        workbook.changeParameterValueAsync("nameInput", "");
        workbook.changeParameterValueAsync("levelInput", 0);
      } else {
        workbook.changeParameterValueAsync("nameInput", $(this).text());
        workbook.changeParameterValueAsync("levelInput", depth);
      }
    });
  }

  /////////////////////////////

  //convert to field:values convention
  $scope.reduceToObjects = function(cols, data) {
    var fieldNameMap = $.map(cols, function(col) {
      return col.getFieldName();
    });
    var dataToReturn = $.map(data, function(d) {
      return d.reduce(function(memo, value, idx) {
        memo[fieldNameMap[idx]] = value.value;
        return memo;
      }, {});
    });
    return dataToReturn;
  }
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [{
    title: 'Reggae',
    id: 1
  }, {
    title: 'Chill',
    id: 2
  }, {
    title: 'Dubstep',
    id: 3
  }, {
    title: 'Indie',
    id: 4
  }, {
    title: 'Rap',
    id: 5
  }, {
    title: 'Cowbell',
    id: 6
  }];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {});
