function ajax(url,opt){
	if(!url) return;
	opt = opt || {};
	var dataType = opt.dataType || 'text';
	var client = Ti.Network.createHTTPClient({
	     onload : function(e) {
	     	 var data = this.responseText;
	     	 if(dataType == 'json'){
	     	     try{
                     data = JSON.parse(data);
                 }catch(e){
                     data = [];
                 };  
                 if(!data) data = [];
	     	 }
	         opt.success && opt.success(data);
	     },
	     onerror : function(e) {
	         opt.error && opt.error();
	     },
	     timeout : 1000*60*3  // in milliseconds
	 });
	 var type = opt.type || 'GET';
	 var data = opt.data; //要发送的数据
	 if(data){
	 	if(type == 'GET'){
	 		var query_string = '';
	 		for(var p in data){
	 			query_string += (query_string?'&':'') + p + '=' + encodeURIComponent(data[p]); 
	 		}
	 		if(query_string) url += (/\?/.test(url)?'&':'?') + query_string;
	 	}
	 }
	 client.open(type, url);
	 client.setRequestHeader("Connection", "close");//不使用长连接
	 if(data && type=='POST'){
	 	client.send(data);	
	 }else{
	 	client.send();
	 }
}

function get(url,data,success,error,returntype){
	if(data.apply){
		if(success.apply){
			returntype = error;
			error = success;
			success = data;
			data = null;
		}else{
			returntype = success;
			success = data;
			error = data = null;
		}
	}else{
		if(!error.apply){
			returntype = error;
			error = null;
		}
	}
	return ajax(url,{
		type:'GET',
		success:success,
		error:error,
		data:data,
		dataType:returntype
	});
	
}

function post(url,data,success,error,returntype){
	if(data.apply){
		if(success.apply){
			returntype = error;
			error = success;
			success = data;
			data = null;
		}else{
			returntype = success;
			success = data;
			error = data = null;
		}
	}else{
		if(!error.apply){
			returntype = error;
			error = null;
		}
	}
	return ajax(url,{
		type:'POST',
		success:success,
		error:error,
		data:data,
		dataType:returntype
	});
	
}

function getJSON(url,data,success,error){
	if(data.apply){
		if(success&&success.apply){
			error = success;
			success = data;
			data = null;
		}else{
			success = data;
			error = data = null;
		}
	}else{
		if(error&&!error.apply){
			error = null;
		}
	}
	return ajax(url,{
		type:'GET',
		success:success,
		error:error,
		data:data,
		dataType:'json'
	});
}
/**
 * ******************************************************************************
 * upload('http://www.foo.com',{file:photo_blob, username:'foo' },{
 * 		success:
 * 		error:
 * 		progress:		
 * });
 * 
 * *******************************************************************************
 */
function upload(url,data,opt){//上传函数,data是一个js对象,里面既包括了要上传的二进制文件数据，也包含了普通数据
	if(!url || !data) return;
	opt = opt || {};
	opt.success = opt.success || function(responseText){};
	opt.error = opt.error || function(error){};
	opt.progress = opt.progress || function(progress){}; //progress 取值为 0 到 1
	
	var xhr = Titanium.Network.createHTTPClient({
	    timeout : 1000*60*10  // in milliseconds
	});
	xhr.onload = function(e) {
		Ti.API.info('IN ONLOAD ' + this.status + ' readyState ' + this.readyState);
		opt.success && opt.success(this.responseText);
	};
	xhr.onerror = function(e){
		Ti.API.info('IN ERROR ' + e.error);
		opt.error && opt.error(e.error);
	};
	xhr.onsendstream = function(e){
        Ti.API.info('ONSENDSTREAM - PROGRESS: ' + e.progress+' '+this.status+' '+this.readyState);
        opt.progress && opt.progress(e.progress);
    };
	xhr.open('POST',url);
	xhr.setRequestHeader("Connection", "close");//不使用长连接
	xhr.send(data);
}

/****************************************************/
exports.ajax = ajax;
exports.get = get;
exports.post = post;
exports.getJSON = getJSON;
exports.upload = upload;