/**
 ************************************************************
 * 统计模块
 * var s = require('/lib/statistic');
 * s.init('http://192.168.1.100/test.php');
 ************************************************************  
 */
var http;

function send(url){//发送统计数据
	if(!url) return;
	
	var data = {};

	data.udid = Ti.Platform.id; //设备标识号
	data.ip = Ti.Platform.address; //ip
	data.platform = Ti.Platform.osname; //平台类型 android 或  iphone
	data.app_version = Ti.App.version;//软件版本
	data.os_version = Ti.Platform.version; //操作系统版本
	
	data.manufacturer = Ti.Platform.manufacturer; //厂商
	data.architecture = Ti.Platform.architecture; //处理器架构
	data.cores = Ti.Platform.processorCount; //处理器核心数量
	
	
	http.get(url,data,function(){},function(){});
}

function init(url){
	if(!url) return;
	try{
		http = require('/lib/http');
	}catch(e){
		Ti.API.info('无法载入http模块');
	}
	if(!http) return;
	
	send(url);
	
	if(OS_IOS){
		Ti.App.addEventListener('resume',function(e){//在 ios中,把这个事件当做程序的一次启动
			send(url);
		});
	}
}


/*************************************************/
exports.init = init;
