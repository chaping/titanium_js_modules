/**
**********************************************
*版本管理模块
***********************************************
*/
var currentVersion = Ti.App.version; //当前版本
var latestVersion = '';//最新版本
var msg = '当前有一个新版本，赶快去下载升级吧！';
var downUrl = '';

function notify(){//通知有新的版本
	 var dialog = Ti.UI.createAlertDialog({
		cancel: 1,
		buttonNames: ['立即下载', '暂不升级'],
		message: msg,
		title: '发现新版本' + latestVersion
	 });
	 dialog.addEventListener('click', function(e){
		if (e.index === e.source.cancel){
			Ti.API.info('已取消');
		} else if(e.index == 0){
			if(downUrl) Ti.Platform.openUrl(downUrl);  		
		}
	 });
	 dialog.show();
}

function init(version_url,opt){
	if(!version_url) return;
	try{
		var http = require('/lib/http');
	}catch(e){
		////////
	}
	if(!http) return;
	http.getJSON(version_url,{},function(data){
		if(!data.version || !data.url) return;
		latestVersion = data.version;
		downUrl = data.url;
		if(data.msg) msg = data.msg;
		if(currentVersion < +version){
			notify();
		}
	},function(){
	
	});
}


/***************************************************/
exports.init = init;