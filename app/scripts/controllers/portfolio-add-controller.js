angular.module('app.controllers')
	.controller('portfolioAddController', ['$scope','portfolioService',
		'$ionicPopup','companyService','$state','$ionicModal','$http', 'settingsService', function($scope, portfolioService,
			$ionicPopup,companyService,$state, $ionicModal,$http, settingsService) {

		$scope.form = {
			breakeven_average: 0,
			buy_average: 0,
		};

		var broker = settingsService.getBroker();
		if(broker == null) {
			$ionicPopup.alert({
				title: 'Broker not found',
				template: 'You Need to set your broker in settings screen.'
			}).then(function(r){
				$state.go("app.settings.broker");
			});
			return;
		}
		
		$scope.commision = broker.comission;

		$scope.openSelectModal = function() {
			$ionicModal.fromTemplateUrl('templates/modals/company-selector.html', {
			    scope: $scope,
			    animation: 'slide-in-up',
			  }).then(function(modal) {
		    	$scope.modal = modal;
		    	$scope.modal.show();
		  	});
		}

		$scope.selectCompany = function(company) {
			$scope.company = company;
			$scope.modal.hide();
		}

		$scope.$watch('form',function(newVal,oldVal){
			$scope.form.buy_value = $scope.form.quantity * $scope.form.buy_average;
			$scope.form.breakeven_average = ($scope.form.buy_average * $scope.commision) * $scope.commision;
			$scope.form.buy_value = $scope.form.quantity * $scope.form.buy_average;
			$scope.form.market_value = $scope.form.quantity * $scope.form.ycp;
			$scope.form.gain_loss = ($scope.form.ycp  * $scope.form.quantity) - ($scope.form.breakeven_average *  $scope.form.quantity);
		},true);

		//adding for datas to portfolio
		$scope.addToPortfolio = function() {
			var message = '';
			if($scope.company == undefined) {
				message = 'please select a company';
			}
			
			if($scope.form.quantity == undefined || $scope.form.quantity == null || $scope.form.quantity <= 0) {
				message = 'Please provide appropriate quantity';
			}
			
			if($scope.form.buy_average == undefined || $scope.form.buy_average == null || $scope.form.buy_average <= 0) {
				message = 'Please provide appropriate Buy Unit Price';
			}

			if($scope.form.ycp == undefined || $scope.form.ycp == null || $scope.form.ycp <= 0) {
				console.log($scope.form.ycp, _.isEmpty($scope.form.ycp));
				message = 'Please provide appropriate YCP';
			}

			if(message) {
				var alertPopup = $ionicPopup.alert({
					title: 'Invalid Form',
					template: message
				});
			}
			$scope.form.company = $scope.company.company;
			
			portfolioService.addPortfolio($scope.form).then(function(data){	
				var alertPopup = $ionicPopup.alert({
					title: 'Portfolio added successfully',
					template: 'You have added portfolio successfully.'
				});

				alertPopup.then(function() {
					$state.go("app.portfolio.statuses")
				});

			}).catch(function(data){
				
				var alertPopup = $ionicPopup.alert({
					title: 'Failed to add portfolio',
					template: 'Your request was invalid'
				});
				
				alertPopup.then(function() {
					$state.go("app.portfolio.statuses")
				});
			});
		}

		$scope.companyName = function() {			
			if(_.isEmpty($scope.company)) {
				return "No company (Touch To select)";
			}
			return $scope.company.company + " (Touch to change)";
		}

	}]);