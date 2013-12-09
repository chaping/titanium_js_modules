/*
 * **************************************************************************************************************
 * 缩放平移类,适用于目标元素的初始位置位于容器元素中心的情况
 * var zoom = new Zoom({
 * 		container:$.win,
 * 		elem : $.img,
 * 		minScale : 1,
 * 		maxScale : 4,
 * 		unit : 'dp'
 * });
 * **************************************************************************************************************
 */
function Zoom(opt){
	opt = opt || {}; //配置参数
	
	var lastScale = 1, //上次缩放操作的scale值  
		currentScale = 1, //当前的scale值
		canPinch = true, //是否能够缩放
		canMove = true, //是否能够平移
		newPinch = true; //是否是一次新的缩放操作，即当两手都放开了后，再去缩放会被认为是一次新的缩放操作
	
	var initX = 0, //touchstart时事件的x
		initY = 0, //touchstart时事件的y
		lastX = 0, //上次平移操作的translate x
		lastY = 0, //上次平移操作的translate y
		currentX = 0, //当前的的translate x
		currentY = 0; //当前的translate y
		
	var containerWidth, //容器的宽度
		containerHeight, //容器的高度
		width, //要进行平移缩放的元素的初始宽度
		height, //要进行平移缩放元素的初始高度
		currentWidth, //要进行平移缩放元素的当前宽度
		currentHeight; //要进行平移缩放元素的当前高度
		
	var minX = minY = maxX = maxY = 0; // translate取值的四个范围，translate的值只能在这个范围内
	
	var minScale = opt.mianScale || 1, //允许的最小缩放倍数
		maxScale = opt.maxScale || 4; //允许的最大缩放倍数
		
	var container = opt.container || null, //容器元素
		elem = opt.elem || null; //目标元素
		
	
	var unit = opt.unit || 'dp'; //使用的单位
	
	if(unit=='dp'){
		var dpi_x = Ti.Platform.displayCaps.dpi/160; //rect属性得到的值要乘以的系数
	}else if(unit=='px'){
		var dpi_x = 1; //rect属性得到的值要乘以的系数
	}else{//其他单位暂不考虑支持
		var dpi_x = 1; //todo
	}
	if(!container || !elem) return;
	/********************************************************************************************************/
	function onPinch(e){
		//var _currentScale = e.scale*lastScale;
		//if(_currentScale<minScale || _currentScale>maxScale) return;//已经是最大或最小缩放了
		
		if(newPinch){//是一次新的缩放，双手都放开了
			canPinch = true;
			lastScale = currentScale;
		}else if(e.scale>0.9 && e.scale<1.2){//在这个方位内，不能触发缩放操作，因为要用这种方法来识别当缩放操作后，只有一个手离开了，然后离开的手又回来了，再次进行缩放
			canPinch = false;
		}else if(e.scale>=1.2 && !canPinch){
			canPinch = true;
			lastScale = currentScale;
		}else if(e.scale<=0.9 && !canPinch){
			canPinch = true;
			lastScale = currentScale;
		}
		if(canPinch){
			newPinch = false;
			canMove = false; //缩放时不能同时平移
			
			currentScale = e.scale*lastScale;
			
			if(currentScale<minScale){ //最小倍数
				currentScale = minScale;
				//return;
			}else if(currentScale>maxScale){ //最大倍数
				currentScale = maxScale;
				//return;
			}
			
			/*****缩放时进行位移限制**********/
			calculateLimitXY();
			if(maxX<=0 || maxY<=0){
				if(maxX<=0) currentX = 0;
				if(maxY<=0) currentY = 0;	
			}else{
				if(lastX>=maxX) currentX = maxX;
				else if(lastX<=minX) currentX = minX;
				if(lastY>=maxY) currentY = maxY;
				else if(lastY<=minY) currentY = minY;
			}
			
			//opt.txt.text ='move\n' + containerHeight+'\n'+currentHeight+'\n'+currentScale+'\n'+lastX+'\n'+lastY+'\n'+currentX+'\n'+currentY;
			
			var m = Ti.UI.create2DMatrix();
			m = m.scale(currentScale);//注意，要先把scale方法放在translate方法前面，不然会影响到translate操作
			m = m.translate(currentX,currentY);
			elem.transform = m;
		}
		
		opt.onPinch && opt.onPinch();
	}
		
	function onTouchend(e){
		newPinch = true;
		lastScale = currentScale;
		lastX = currentX;
		lastY = currentY;
		/******检查是否能移动****************/
		calculateLimitXY();
		if(maxX<=0 && maxY<=0) canMove = false; //
		else canMove = true;
		
		opt.onTouchend && opt.onTouchend();
	}
	
	function onTouchstart(e){
		if(!containerWidth) containerWidth = container.rect.width * dpi_x;
		if(!containerHeight) containerHeight = container.rect.height * dpi_x;
		if(!width) width = elem.rect.width * dpi_x;
		if(!height) height = elem.rect.height * dpi_x;
		
		initX = e.x;
		initY = e.y;
		/******检查是否能移动****************/
		calculateLimitXY();
		if(maxX<=0 && maxY<=0) canMove = false;
		else canMove = true;
		
		opt.onTouchstart && opt.onTouchstart();	
	}
	
	function onTouchmove(e){
		if(!canMove){
			return;
		}	
		
		if(maxX<=0){
			currentX = 0;
		}else{
			currentX = (e.x-initX)/currentScale + lastX;
			currentX = Math.round(currentX);
			if(currentX<=minX) currentX = minX;	
			else if(currentX>=maxX) currentX = maxX;
		}
		if(maxY<=0){
			currentY = 0;
		}else{
			currentY = (e.y-initY)/currentScale + lastY;
			currentY = Math.round(currentY);
			if(currentY<=minY) currentY = minY;
			else if(currentY>=maxY) currentY = maxY;
		}
		
		//opt.txt.text ='move\n' + containerHeight+'\n'+currentHeight+'\n'+currentScale+'\n'+lastX+'\n'+lastY+'\n'+currentX+'\n'+currentY;
		
		var m = Ti.UI.create2DMatrix();
		m = m.scale(currentScale);//注意，要先把scale方法放在translate方法前面，不然会影响到translate操作
		m = m.translate(currentX,currentY);
		elem.transform = m;
		
		opt.onTouchmove && opt.onTouchmove();
	}
	
	function calculateLimitXY(){ //实时计算translate的取值范围
		
		currentWidth = width*currentScale; //目标元素当前宽度
		currentHeight = height*currentScale; //目标元素当前高度
		
		var exceedWidth = currentWidth - containerWidth; //目标元素超出容器部分的宽度
		var exceedHeight = currentHeight - containerHeight; //目标元素超出容器部分的高度
		
		maxX = (exceedWidth/2)/currentScale; //translate x 的最大取值 , 假设元素初始位置在容器的中心
		maxX = Math.floor(maxX);
		minX = -maxX; //translate x 的最小取值 ,   假设元素初始位置在容器的中心
		maxY = (exceedHeight/2)/currentScale; //translate y 的最大取值 ,     假设元素初始位置在容器的中心
		maxY = Math.floor(maxY);
		minY = -maxY; //translate y 的最小取值  ,   假设元素初始位置在容器的中心
	}
	
	/*******外部 api**************************************************************************************************/
	var funcEnable = false;
	this.enable = function(){ //开启缩放平移功能
		if(!container || funcEnable) return;
		container.addEventListener('touchstart',onTouchstart);
		container.addEventListener('touchmove',onTouchmove);
		container.addEventListener('pinch',onPinch);
		container.addEventListener('touchend',onTouchend);
		funcEnable = true;
	};
	this.disable = function(){//关闭缩放平移功能
		if(!container || !funcEnable) return;
		container.addEventListener('touchstart',onTouchstart);
		container.addEventListener('touchmove',onTouchmove);
		container.addEventListener('pinch',onPinch);
		container.addEventListener('touchend',onTouchend);
		funcEnable = false;
	}; 
	
	this.getCurrentScale = function(){//获取当前的缩放值
		return currentScale;
	};
	this.getCurrentX = function(){//
		return currentX;
	};
	this.getCurrentY = function(){//
		return currentX;
	};
	this.getMinX = function(){//
		return minX;
	};
	this.getMaxX = function(){//
		return maxX;
	};

	/**************************************************************/
	this.enable(); //默认开启
}

/*********************************************************/
module.exports = Zoom;