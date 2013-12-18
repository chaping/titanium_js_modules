/**
**********************************************
*版本管理模块
* 
* var version = require('/lib/version');
* version.check(url,opt);
* 
* url必须返回一个json数据，其键值包括:
* {
* 	version:版本号,
*   url:新版本下载的url
*   msg:新版本的描述
* }
* 
* 
* 1、支持设置检测的间隔时间
* 2、当前的版本号的确定以tiapp.xml中的为准
* 
* 
* 
* 
***********************************************
*/
var currentVersion = Ti.App.version; //当前版本
var defaultMsg = '当前有一个新版本，赶快去下载升级吧！';
var lastCheckTime = parseInt(Ti.App.Properties.getString('lastCheckTime'));//上次检测的时间
lastCheckTime = lastCheckTime ? lastCheckTime : 0;
var frequency = 1000*60*60*24;//检测频率

function notify(version,url,msg){//通知有新的版本
	 var dialog = Ti.UI.createAlertDialog({
		cancel: 1,
		buttonNames: ['立即下载', '暂不升级'],
		message: msg,
		title: '发现新版本'
	 });
	 dialog.addEventListener('click', function(e){
		if (e.index === e.source.cancel){
			Ti.API.info('已取消');
		} else if(e.index == 0){
			if(url) Ti.Platform.openURL(url);  		
		}
	 });
	 dialog.show();
}

function check(version_url,opt){
	if(!version_url) return;
	var opt = opt || {};
	if(typeof opt.frequency == 'undefined' || !parseInt(opt.frequency)) opt.frequency = frequency;
	var now = new Date;
	if(now.getTime()-lastCheckTime < opt.frequency){
		Ti.API.info('未到检测时间');
		return;
	}
	try{
		var http = require('/lib/http');
	}catch(e){
		////////
	}
	if(!http) return;
	http.getJSON(version_url,{platform:Ti.Platform.osname},function(data){//url必须返回一个json数据，此数据包含version,url,msg三个键
		if(!data.version || !data.url) return;
		lastCheckTime = now.getTime();
		Ti.App.Properties.setString('lastCheckTime',lastCheckTime);
		var latestVersion = data.version;
		var downUrl = data.url;
		var msg = data.msg;
		if(!msg) msg = defaultMsg;
		if(currentVersion < + latestVersion){
			notify(latestVersion,downUrl,msg);
		}
	},function(){
	
	});
}

if(OS_IOS){
	Ti.App.addEventListener('resumed',function(e){
		check();
	});
}

/***************************************************/
exports.check = check;