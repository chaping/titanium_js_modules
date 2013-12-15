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
	data.platform = Ti.Platform.osname; //平台类型 android 或  iphone 或 ipad
	data.app_version = Ti.App.version;//软件版本
	data.os_version = Ti.Platform.version; //操作系统版本
	data.os_name = Ti.Platform.name; //操作系统名称 android 或 iPhone os
	if(data.os_name.indexOf('iPhone')>-1) data.os_name = 'ios';
	data.network = Ti.Network.networkTypeName;// 网络类型 NONE, WIFI, LAN, MOBILE, or UNKNOWN
	
	var width = Ti.Platform.displayCaps.platformWidth;
	var height = Ti.Platform.displayCaps.platformHeight;
	if(OS_IOS){
		var dpi_x = Ti.Platform.displayCaps.dpi/160;
		width = width*dpi_x;
		height = height*dpi_x;
	}
	width = width<height?width:height;
	height = height>width?height:width;
	data.resolution = width + '×' + height; //分辨率
	
	data.manufacturer = Ti.Platform.manufacturer; //厂商
	data.architecture = Ti.Platform.architecture; //处理器架构
	data.cores = Ti.Platform.processorCount; //处理器核心数量
	
	
	http.get(url,data,function(r){},function(){});
}

function init(url){//统计初始化
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
