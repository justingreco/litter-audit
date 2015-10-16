'use strict';

/**
 * @ngdoc function
 * @name litterApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the litterApp
 */
angular.module('litterAuditApp')
  .controller('MainCtrl', function ($scope, litter, $timeout) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    var map = L.map('map').setView([35.777, -78.64], 15);

	  L.esri.basemapLayer('Streets').addTo(map);
	  L.esri.clusteredFeatureLayer({
	    url: 'http://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Litter_WFL/FeatureServer/0'
	  }).addTo(map);
var toggleCarousel = function (hide) {
	if (hide) {
		$(".sk-three-bounce").show();
		$(".carousel").hide();
	} else {
		$(".sk-three-bounce").hide();
		$(".carousel").show();		
	}
};
toggleCarousel(true);
$scope.onSlideChanged = function (nextSlide, direction) {
    console.log(direction, nextSlide.$element.index());
    if (direction === 'next' && nextSlide.$element.index() === 0) {
    	$scope.currentPage += 1;
    	$scope.images = [];
    	$scope.start = ($scope.currentPage + 1) * 20;
    	$scope.end = ($scope.currentPage + 2) * 20;
    	getPhotos();    	
    } else if (direction === 'prev' && nextSlide.$element.index() === $scope.images.length - 1) {
    	$scope.currentPage -= 1;
    	$scope.images = [];
    	$scope.start = ($scope.currentPage - 1) * 20;
    	$scope.end = ($scope.currentPage) * 20;
    	getPhotos();    	
    }
};

	$scope.currentPage = 1;
    $scope.images = [];
    $scope.start = 0;
    $scope.end = 20;
    var cnt = 0;
    var getPhotos = function () {
    	toggleCarousel(true);
	    litter.getIds().then(function (data) {
	    	$scope.totalItems = data.objectIds.length;
	    	for (var i = $scope.start;i >= $scope.start && i <= $scope.end;i++) {
	    		var id = data.objectIds[i];
	    		litter.getAttachments(id).then(function (data) {
	    			if (data.attachmentInfos.length > 0) {
		    			var image = data.attachmentInfos[0];
		    			var url = 'http://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Litter_WFL/FeatureServer/0/' + image.parentID + '/attachments/' + image.id + '/' + image.name;
		    			$scope.images.push({image: url, text: '', id: image.parentID});
		    			cnt += 0;	
	    			}
	    		});    
	    		if (i === $scope.end) {
	    			$timeout(function () {
	    				toggleCarousel(false);
	    			}, 3000)
	    			
	    		}		
	    	}

	    });
    };
    getPhotos();
    $scope.pageChanged = function () {
    	$scope.images = [];
    	console.log(this);
    	$scope.start = (this.currentPage - 1) * 20;
    	$scope.end = (this.currentPage) * 20;
    	getPhotos();
    };



  })
   .factory('litter', ['$http', '$q', function($http, $q){
   	var service = {getIds:getIds, getAttachments:getAttachments};
   	return service;
   	function getIds() {
   		var deferred = $q.defer();
   		$http({
   			method: 'GET',
   			url: 'http://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Litter_WFL/FeatureServer/0/query?where=1%3D1&returnGeometry=false&returnIdsOnly=true&f=json'
   		}).success(deferred.resolve);
   		return deferred.promise;
   	};
   	function getAttachments(id) {
   		var deferred = $q.defer();
   		$http({
   			method: 'GET',
   			url: 'http://services.arcgis.com/v400IkDOw1ad7Yad/arcgis/rest/services/Litter_WFL/FeatureServer/0/' + id + '/attachments?f=json'
   		}).success(deferred.resolve);
   		return deferred.promise;
   	};   	
  }])
   .directive('onCarouselChange', function ($parse) {
  return {
    require: 'uibCarousel',
    link: function (scope, element, attrs, carouselCtrl) {
      var fn = $parse(attrs.onCarouselChange);
      var origSelect = carouselCtrl.select;
      carouselCtrl.select = function (nextSlide, direction) {
        if (nextSlide !== this.currentSlide) {
          fn(scope, {
            nextSlide: nextSlide,
            direction: direction,
          });
        }
        return origSelect.apply(this, arguments);
      };
    }
  };
});