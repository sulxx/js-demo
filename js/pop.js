 	/* Alert是提示框，只有一个按钮。Dialog是对话框，两个按钮。
  * 他们两个大部分的css都在Pop.css里面
  * 2017.9.16
  */

(function() {

  //对外的接口。创建一个提示框并添加事件。
  function alert(param) {
    var alert = new Alert(param);
  }

  //提示框
  function Alert(param) {
		this.hasMask = param.hasMask || 'true',
		this.title 	 = param.title || 'alert',
		this.content = param.content || 'content',
		this.conVal  = param.conVal || 'ok',
		this.callback = param.callback || function(){},
		this.width   = param.width || '250px',

		this.alert;

		this.init();
    this.setStyle();
    this.addEvent();
  }

	Alert.prototype = {
    //初始化
		init: function() {
			var html = [];

			html.push('<div class="alert-container slideToDown"><div class="alert-title">'
            + '<h3>' + this.title + '</h3><span class="alert-close">×</span>'
            + '</div><div class="alert-content">' + this.content + '</div>'
            + '<div class="alert-btn"><span class="alert-btn-confirm">' + this.conVal + '</span>'
            + '</div></div>');

			if(this.hasMask)
			html.push('<div class="alert-mask"></div>'+html.pop());

		  this.alert = $(html.pop());
      $('body').append(this.alert);
    }, //init

    //样式（大部分在dialog.css里）
    setStyle: function() {
      //内容英文自动换行
      this.alert.find('.alert-content')
                .css({
                  'word-wrap': 'break-word',
                });
    }, //setStyle

    //事件
    addEvent: function() {
      var _this = this;

      //点击确定后的回调函数
      this.alert.find('.alert-btn-confirm')
            .click(function() { 
              //整个提示框remove   
              _this.alert.remove();

            if(_this.callback instanceof Array ) {
                _this.callback.forEach(function(func) {
                  func();
                });
              }
              else {
                _this.callback();
              }
      });        
    },	//addEvent	
  } //Alert.prototype

  //dialog对外接口
  function dialog(param) {
    var dialog = new Dialog(param);
  }

  //对话框
  function Dialog(param) {
    this.hasMask = param.hasMask || 'true',
    this.title   = param.title || '对话框', //左上角题目
    this.content = param.content || '内容', //内容部分
    this.conVal  = param.conVal || '确定', //确定按钮的值
    this.canVal  = param.canVal || '取消',  //取消按钮的值
    this.conCallback = param.conCallback || function(){}, //点击确定后的回调
    this.canCallback = param.canCallback || function(){}, //点击取消后的回调
    this.width   = param.width || '250px',

    this.dialog;

    this.init();  
    this.setStyle();
    this.addEvent(); 
  }

  Dialog.prototype = {

    init: function() {
      var html = [];

        html.push('<div class="dialog-container slideToDown"><div class="dialog-title">'
              + '<h3>' + this.title + '</h3><span class="dialog-close">×</span>'
              + '</div><div class="dialog-content">' + this.content + '</div>'
              + '<div class="dialog-btn"><span class="dialog-btn-confirm">' + this.conVal + '</span>'
              + '<span class="dialog-btn-cancle">' + this.canVal + '</span></div></div>');

        if(this.hasMask)
        html.push('<div class="dialog-mask"></div>'+html.pop());

        this.dialog = $(html.pop());
        $('body').append(this.dialog);
    },

    //样式（大部分在dialog.css里）
    setStyle: function() {
      //内容英文自动换行
      this.dialog.find('.dialog-content')
                .css({
                  'word-wrap': 'break-word',
                });
    }, //setStyle

    //事件
    addEvent: function() {
      var _this = this;

      //点击确定后的回调函数
      this.dialog.find('.dialog-btn-confirm')
            .click(function() { 
              //整个提示框remove   
              _this.dialog.remove();

            if(_this.conCallback instanceof Array ) {
                _this.conCallback.forEach(function(func) {
                  func();
                });
              }
              else {
                _this.conCallback();
              }
      }); 

      //点击取消后的回调函数 
      this.dialog.find('.dialog-btn-cancle')
            .click(function() { 
              //整个提示框remove   
              _this.dialog.remove();

            if(_this.canCallback instanceof Array ) {
                _this.canCallback.forEach(function(func) {
                  func();
                });
              }
              else {
                _this.canCallback();
              }
      }); 

    },  //addEvent  

  } //Dialog.ptototype

  //保存在全局变量Pop里

  window.Pop = {
    alert: alert,
    dialog: dialog,
  };

})();