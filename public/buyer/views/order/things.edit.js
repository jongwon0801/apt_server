
// ngGrid is also lazy loaded by $ocLazyLoad thanks to the module dependency injection !
angular.module('inspinia',
[{files:[//'/bower_components/jquery.steps/build/jquery.steps.min.js',
         //'/bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min.js',
  //'/bower_components/bootstrap-daterangepicker/daterangepicker.js',
//'/bower_components/bootstrap-daterangepicker/daterangepicker.css',
  //'/css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
  '/bower_components/magnific-popup/dist/jquery.magnific-popup.min.js',
  '/bower_components/magnific-popup/dist/magnific-popup.css',
  '/css/upload.css',
  '/plugin/dropzone/dropzone.js',
  //'/css/plugins/dropzone/basic.css',
  '/plugin/dropzone/dropzone.css'
  //'http://ajax.aspnetcdn.com/ajax/jquery.validate/1.14.0/jquery.validate.min.js',
  //'//rawgit.com/enyo/dropzone/master/dist/dropzone.js',
//		  '//rawgit.com/enyo/dropzone/master/dist/dropzone.css',
  //'//rawgit.com/enyo/dropzone/master/dist/basic.css',

  ],cache:true,serie: true}])
.controller('OrderThingsEditCtrl', function($scope,$http,$state,$modal,$timeout,$stateParams,MyCache,Things) {



$scope.MyCache=MyCache;
MyCache.loadGCode(['order.status.B','goods.category']);
if($stateParams.thingsSq){
    Things.get($stateParams,function(res){
      console.log(res);
      $scope.item= res;
      //if(!$scope.item.prices)  $scope.item.prices=[];
      //if(!$scope.item.photos)  $scope.item.photos=[];
      $timeout(function(){
        procImage();
    });
      /*CakeGoods.get($stateParams,function(res){
            $scope.item.cakes= res;
            
        });*/
  });
}else{
    $scope.item={category:'',kind:'B',customerYn:'N'}; //쿠폰상품
}
function procImage (){
	//	console.log($('.image-popup-no-margins'));
	  $('.image-popup-no-margins').magnificPopup({
			type: 'image',
			closeOnContentClick: true,
			closeBtnInside: true,
			fixedContentPos: true,
			mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
			image: {
				verticalFit: true
			},
			zoom: {
				enabled: true,
				duration: 300 // don't foget to change the duration also in CSS
			}
		});

  }
  
$scope.dropzoneConfig = {
    options: { // passed into the Dropzone constructor
      url: '/upload',
      paramName: "files[]",
      addRemoveLinks:true,
      dictDefaultMessage:'대표 상품사진 이미지를 선택해주세요.',
      maxFiles:1,
      uploadMultiple:false,
      acceptedFiles: ".jpeg,.jpg,.png,.gif",
      init:function(){
          thisDropzone =this;
          if($scope.item.thumbnail){
              var mockFile = { name: $scope.item.thumbnail.originalname, size: $scope.item.thumbnail.size };
                 
                thisDropzone.options.addedfile.call(thisDropzone, mockFile);
 
                thisDropzone.options.thumbnail.call(thisDropzone, mockFile, $scope.item.thumbnail.url);
          }               
      }
    },
    eventHandlers: {
      sending: function (file, xhr, formData) {
      },
      error:function(err){
        toasr.error(err);  
      },
      success: function (file, response) {
                $scope.item.thumbnail=angular.fromJson(response);
              //$scope.item.thumbnail=response;
      },
      addedfile:function(file){
          
      },
      removedfile:function(file){
          console('removed');
          //delete $scope.item.image;
      }
      
    }
};

//console.log($scope.item);
//if(!$scope.item.descList)	$scope.item.descList=[];	
$scope.deletePrice=function(item){
    var index = $scope.items.prices.indexOf(item);
    $scope.item.prices.splice(index, 1);
    //delete $scope.item.prices[sidx];
};
$scope.newPrice=function(){ // 상품상세 추가 

  
    $modal.open({
        animation:true,
        templateUrl: "views/order/modal.price.html",
        //backdrop: false,
        //windowClass: 'right fade',
        //keyboard: true,
        controller: 'PriceEditCtrl',
        resolve: {
            item: function () {
                return {};
            }
        }
    }).result.then(function (selectedItem) {
        console.log(selectedItem);
        $scope.item.prices.push(selectedItem);
        //$scope.itemLoad();
        //$scope.item.descList.push(selectedItem);
        
    }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
    });

} 

$scope.descUp=function(item){
  var sidx = $scope.item.descList.indexOf(item)
  $scope.item.descList.swap1(sidx,sidx-1);
  //console.log($scope.descList.indexOf(item));
}
$scope.descDown=function(item){
  //console.log($scope.descList.indexOf(item));
  var sidx = $scope.item.descList.indexOf(item)
  $scope.descList.swap1(sidx,sidx+1);
}

$scope.descEdit=function(item){
$modal.open({
    animation:true,
    templateUrl: "views/goods/wizard/modal.desc.html",
    //backdrop: false,
    //windowClass: 'right fade',
    //keyboard: true,
    controller: 'GoodsDescEditCtrl',
    resolve: {
        item: function () {
            return item;
        }
    }
 }).result.then(function (selectedItem) {
     //console.log(selectedItem);
     //$scope.itemLoad();
     var sidx = $scope.item.descList.indexOf(selectedItem)
     //$scope.item.descList[sidx]=selectedItem;
 }, function () {
     //$log.info('Modal dismissed at: ' + new Date());
 });
}
$scope.descTrash=function(item){
swal({
    title: "삭제하시겠습니까?",
    text: "삭제합니다.",
    type: "warning",
    showCancelButton: true,
     cancelButtonText: "취소",
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "네, 삭제할래요!",
    
    closeOnConfirm: false
}, function () {
    var sidx = $scope.item.descList.indexOf(selectedItem)
     delete $scope.item.descList[sidx];
});
}
$scope.goSecond=function(){
//if($scope.title)

$state.go('goods.edit.step_two');
}

$scope.trySave=function(){

//$scope.item.stepList = $scope.stepList;

    if($scope.item.goodsSq){
        Goods.update($scope.item,function(res){
                toastr.success('수정하였습니다.');
            
        },function(err){
            ERROR($state,err);
        });
    }else{
        
        Goods.save($scope.item,function(res){
                toastr.success('입력하였습니다.');
                $state.go('goods.list');
            
        },function(err){
            ERROR($state,err);
        });
    }
    }
}).controller('GoodsDescEditCtrl',function($scope,$stateParams,$modalInstance,item,MyCache,$http) {


//$scope.myCache = MyCache;
$scope.item = item; 
//console.log($scope.item);
$scope.ok = function () {
//if($scope.item.content && $scope.item.image){
    $modalInstance.close($scope.item);

}

$scope.cancel = function () {
$modalInstance.dismiss('cancel');
};

$scope.dropzoneConfig = {
    options: { // passed into the Dropzone constructor
      url: '/upload',
      paramName: "files[]",
      addRemoveLinks:true,
      dictDefaultMessage:'대표 상품사진 이미지를 선택해주세요.',
      maxFiles:1,
      uploadMultiple:false,
      acceptedFiles: ".jpeg,.jpg,.png,.gif",
      
      
    },
    eventHandlers: {
      sending: function (file, xhr, formData) {
      
      },
      success: function (file, response) {
         
              //$scope.item.image=response;
         $scope.item.image=angular.fromJson(response);
      },
      removedfile:function(file){
          delete $scope.item.image;
      }
    }
  };

}).controller('PriceEditCtrl',function($scope,$stateParams,$modalInstance,MyCache,$http,item) {

    //$scope.MyCache=MyCache;
    //MyCache.loadGCode(['order.status.B','goods.category']);
    $scope.item = item; 
    if(!item.washType) item.washType='드라이';
    if(!item.grade) item.grade='일반';
    //console.log($scope.item);
    $scope.ok = function () {
    //if($scope.item.content && $scope.item.image){
        $modalInstance.close($scope.item);
    
    }
    $sceop.onChange=function(sitem){
        var washType =  $scope.item.washType;
        
        var grade = $scope.item.grade;
        if(grade=="일반") {
            if (washType == "드라이") {
                totalPrice = sitem.dryNormal;
            } else if (washType=="물세탁") {
                totalPrice = sitem.washNorma;
            } else if (washType=="다림질") {
                totalPrice = sitem.ironingNormal;
            }
        }else if(grade=="고급") {

            if (washType=="드라이") {
                totalPrice = sitem.dryAdvance;
            } else if (washType=="물세탁") {
                totalPrice = sitem.washAdvance;
            } else if (washType=="다림질") {
                totalPrice = sitem.ironingAdvance;
            }
        }else if(grade=="명품") {

            if (washType=="드라이") {
                totalPrice = sitem.dryLuxury;
            } else if (washType=="물세탁"){
                totalPrice = sitem.washLuxury;
            } else if (washType=="다림질"){
                totalPrice = sitem.ironingLuxury;
            }
        }else if(grade=="아동") {
            if (washType=="드라이") {
                totalPrice = sitem.dryChild;
            } else if (washType=="물세탁") {
                totalPrice = sitem.washChild;
            } else if (washType=="다림질") {
                totalPrice = sitem.ironingChild;
            }
        }
    }
    
    $http.get('/v1/LaundryPriceGroupList/1').then(function(rs){
        $scope.groupNameList = rs.data;
    },function(err){

    });
    
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    $scope.$watch(
        "item.groupName",
        function( newValue, oldValue ){
            //$scope.selectedRegion=[];
            //console.log(newValue,oldValue);
            if(newValue){
                $http.get('/v1/LaundryPriceList/1/'+newValue).then(function(rs){
                    $scope.productNameList = rs.data;
                },function(err){
            
                });
            }
        }
    );


});


