/**********************************************************************************************
<ScrollView id="scroll" class="bd_wraper" layout="vertical">
    <View id="refresh_view" backgroundColor="#fefee4" height="600">
        <View id="refresh" height="80" bottom="0">
            <View id="r_arrow" width="20" height="65" backgroundColor="#f00" left="30"></View>
            <View id="r_loading" visible="false"></View>
            <Label id="r_text" top="10">下拉刷新</Label>
            <Label id="r_time" bottom="10">最后更新</Label>
        </View>
    </View>
    <View id="favScroll" layout="vertical"></View>
</ScrollView>

var refresh = require('/lib/pull_refresh');
var r = new refresh($.scroll,$.refresh_view,{
    height:600,
    refresh_height:100,
    arrow_view:$.r_arrow,
    loading_view:$.r_loading,
    text_view:$.r_text,
    time_view:$.r_time,
    on_refresh:function(){
        alert(111);
        r.done();
    }
}); 
*************************************************************************************** */

if(Ti.Platform.name==='android'){
	
	var pullRefresh_android = function(scroll_view,pull_view,opt){
	        
	    var scrollView,pullView;
	    
	    var pullViewHeight = 1000; //下拉元素高度
	    var pullViewTop = -pullViewHeight; //下拉元素的初始top值
	    var hasRegisterTouchmove = false; //是否已注册事件
	    var initY = false; //开始下拉时的y值
	    var refreshHeight = 500; //执行刷新的高度，超过该高度就刷新
	    var arrowView, loadingView, textView, timeView, timeText, pullText, releaseText, loadingText;
	    
	    var arrowDirect = 'down'; //默认箭头方向向下，提示下拉刷新
	    
	    var refresh = false; //是否要刷新
	    var onRefresh = null; //刷新回调函数
	    var scrollEnabled = true; //是否能滚动
	    
	    function onTouchmove(e){
	        if(e.source != scrollView) return; //防止其它元素触发的事件的干扰
	        if(initY===false){
	            initY = e.y;
	        }    
	        if(e.y-initY<0 && pullViewTop<=-pullViewHeight){
	            if(hasRegisterTouchmove){
	                scrollView.removeEventListener('touchmove',onTouchmove);
	                scrollView.removeEventListener('touchend',onTouchend);
	                hasRegisterTouchmove = false;
	                initY = false;
	            }
	        }else if(e.y-initY>0){
	            if(scrollEnabled!==false) scrollView.scrollingEnabled = scrollEnabled = false;
	            pullViewTop = -(pullViewHeight - Math.floor((e.y - initY)/2.9));
	            if(pullViewTop<=-pullViewHeight) pullViewTop = -pullViewHeight;
	            else if(pullViewTop>=0) pullViewTop = 0;
	            pullView.top = pullViewTop + 'px';
	            if(pullViewHeight+pullViewTop>=refreshHeight){
	                refresh = true;
	                if(arrowView && arrowDirect!='up'){//旋转箭头动画
	                   textView.text = releaseText; 
	                   arrowDirect = 'up'; 
	                   var matrix2d = Ti.UI.create2DMatrix();
	                   var roate = matrix2d.rotate(179); // in degrees
	                   var a = Ti.UI.createAnimation({
	                        transform: roate,
	                        duration: 200
	                   });
	                   arrowView.animate(a);                   
	                }
	            }else{
	                refresh = false;
	                if(arrowView && arrowDirect!='down'){//旋转箭头动画
	                   textView.text = pullText; 
	                   arrowDirect = 'down'; 
	                   var matrix2d = Ti.UI.create2DMatrix();
	                   var roate = matrix2d.rotate(0); // in degrees
	                   var a = Ti.UI.createAnimation({
	                        transform: roate,
	                        duration: 200
	                   });
	                   arrowView.animate(a);                          
	                }
	            }
	        }
	        
	    }
	    
	    function onTouchend(e){
	        if(scrollEnabled!==true) scrollView.scrollingEnabled = scrollEnabled = true; 
	        if(refresh){
	            pullViewTop = -(pullViewHeight - refreshHeight);
	            if(textView) textView.text = loadingText;
	            if(loadingView){
	                if(arrowView) arrowView.opacity = 0;
	                loadingView.show();
	            }
	            onRefresh && onRefresh();
	        }else{
	            pullViewTop = -pullViewHeight;
	        }
	        pullView.top = pullViewTop + 'px';    
	        
	        if(hasRegisterTouchmove){
	            scrollView.removeEventListener('touchmove',onTouchmove);
	            scrollView.removeEventListener('touchend',onTouchend);
	            hasRegisterTouchmove = false;
	        }
	        
	    }
	    
	    function onTouchstart(){
	    	if(scrollEnabled!==true) scrollView.scrollingEnabled = scrollEnabled = true;//防止滚动被禁用了
	    }
	    
	    function onScroll(e){//监测区域是否已到顶
	        if(e.source != scrollView) return;
	        if(e.y<=0 && !hasRegisterTouchmove &&!refresh){
	            initY = false;
	            scrollView.addEventListener('touchmove',onTouchmove);
	            scrollView.addEventListener('touchend',onTouchend);
	            hasRegisterTouchmove = true;
	        }else if(e.y>0 && pullViewTop<=-pullViewHeight){
	            if(hasRegisterTouchmove){
	                scrollView.removeEventListener('touchmove',onTouchmove);
	                scrollView.removeEventListener('touchend',onTouchend);
	                hasRegisterTouchmove = false;
	            }    
	        }
	    }
	    
	    function dpToPixel(dp) {//dp转化为px
	        if(!dp) return 0;
	        return ( parseInt(dp) * (Titanium.Platform.displayCaps.dpi / 160));
	    }
	    /** 
	     * @param {Object} scroll_view 滚动元素
	     * @param {Object} pull_view 下拉元素
	     * @param {Object} opt 
	     */
	    function init(scroll_view,pull_view,opt){//opt里的单位一般为dp
	        opt = opt || {};
	        scrollView = scroll_view;
	        pullView = pull_view;
	        if(!scrollView || !pullView) return;
	        
	        pullViewHeight = dpToPixel(opt.height) || 1000;
	        refreshHeight = dpToPixel(opt.refresh_height) || 500;
	        
	        arrowView = opt.arrow_view; //箭头元素
	        loadingView = opt.loading_view; //loading图片元素
	        textView = opt.text_view; //文字元素
	        timeView = opt.time_view; //更新时间元素
	        pullText = opt.pull_text || '下拉刷新';
	        releaseText = opt.release_text || '松手刷新';
	        loadingText = opt.loading_text || '正在刷新';
	        timeText = opt.time_text || ''; //更新时间文字
	        if(textView) textView.text = pullText;
	        if(timeView) timeView.text = timeText;
	        onRefresh = opt.on_refresh; //刷新回调函数
	        
	        pullViewTop = -pullViewHeight;
	        pullView.height = pullViewHeight + 'px';
	        pullView.top = pullViewTop + 'px';
	        scrollView.addEventListener('scroll',onScroll);
	        scrollView.addEventListener('touchstart',onTouchstart); //防止滚动被禁用了
	    }
	    
	    init(scroll_view,pull_view,opt); //初始化
	    
	    
	    this.done = function(timeText){//完成一次刷新任务后必须调用该函数来收尾,timeText为赋值给时间标签的文字
	        pullViewTop = -pullViewHeight;
	        pullView.top = pullViewTop + 'px';
	        refresh = false;
	        arrowDirect = 'down';
	        if(arrowView){
	            var matrix2d = Ti.UI.create2DMatrix();
	            var roate = matrix2d.rotate(0); // in degrees
	            var a = Ti.UI.createAnimation({
	                transform: roate,
	                duration: 50
	            });
	            arrowView.animate(a);       
	            
	        }
	        if(scrollEnabled!==true) scrollView.scrollingEnabled = scrollEnabled = true;
	        if(loadingView) loadingView.hide();
	        if(arrowView) arrowView.opacity = 1;
	        if(textView) textView.text = pullText;
	        if(timeView && timeText) timeView.text = timeText; //更新时间
	    };
	
	};
	
}else{
	
	var pullRefresh_ios = function (scroll_view,pull_view,opt){
	        
	    var scrollView,pullView;
	    
	    var pullViewHeight = 1000; //下拉元素高度
	    var pullViewTop = -pullViewHeight; //下拉元素的初始top值
	    var refreshHeight = 500; //执行刷新的高度，超过该高度就刷新
	    var arrowView, loadingView, textView, timeView, timeText, pullText, releaseText, loadingText;
	    
	    var arrowDirect = 'down'; //默认箭头方向向下，提示下拉刷新
	    
	    var refresh = false; //是否要刷新
	    var onRefresh = null; //刷新回调函数
	    var refreshing = false; //是否正在刷新
	    
	    var dpi_x = Titanium.Platform.displayCaps.dpi / 160; //dp转化为px的系数
	    
	    function onScroll(e){
	    	if(refreshing) return;
	    	if(e.y*dpi_x<-refreshHeight && !refreshing){ //注意，与安卓不同，ios的滚动事件的滚动条偏移值的单位是dp,而不是px
	    		refresh = true;
	    		if(arrowView && arrowDirect!='up'){//旋转箭头动画
                   textView.text = releaseText; 
                   arrowDirect = 'up'; 
                   var matrix2d = Ti.UI.create2DMatrix();
                   var roate = matrix2d.rotate(179); // in degrees
                   var a = Ti.UI.createAnimation({
                        transform: roate,
                        duration: 200
                   });
                   arrowView.animate(a);                   
                }
	    		
	    	}else{
	    		refresh = false;
	    		if(arrowView && arrowDirect!='down'){//旋转箭头动画
                   textView.text = pullText; 
                   arrowDirect = 'down'; 
                   var matrix2d = Ti.UI.create2DMatrix();
                   var roate = matrix2d.rotate(0); // in degrees
                   var a = Ti.UI.createAnimation({
                        transform: roate,
                        duration: 200
                   });
                   arrowView.animate(a);                          
                }
	    	}
	    }
	    
	   
	    function onDragend(e){
	    	if(refresh && !refreshing){
	            pullViewTop = -(pullViewHeight - refreshHeight);
	            pullView.top = pullViewTop + 'px';
	            if(textView) textView.text = loadingText;
	            if(loadingView){
	                if(arrowView) arrowView.opacity = 0;
	                loadingView.show();
	            }
	            refreshing = true;
	            onRefresh && onRefresh();
	        }
	    }
	    
	    
	    
	    function dpToPixel(dp) {//dp转化为px
	        if(!dp) return 0;
	        return ( parseInt(dp) * (Titanium.Platform.displayCaps.dpi / 160));
	    }
	    /** 
	     * @param {Object} scroll_view 滚动元素
	     * @param {Object} pull_view 下拉元素
	     * @param {Object} opt 
	     */
	    function init(scroll_view,pull_view,opt){//opt里的单位一般为dp
	        opt = opt || {};
	        scrollView = scroll_view;
	        pullView = pull_view;
	        if(!scrollView || !pullView) return;
	        
	        pullViewHeight = dpToPixel(opt.height) || 1000;
	        refreshHeight = dpToPixel(opt.refresh_height) || 500;
	        
	        arrowView = opt.arrow_view; //箭头元素
	        loadingView = opt.loading_view; //loading图片元素
	        textView = opt.text_view; //文字元素
	        timeView = opt.time_view; //更新时间元素
	        pullText = opt.pull_text || '下拉刷新';
	        releaseText = opt.release_text || '松手刷新';
	        loadingText = opt.loading_text || '正在刷新';
	        timeText = opt.time_text || ''; //更新时间文字
	        if(textView) textView.text = pullText;
	        if(timeView) timeView.text = timeText;
	        onRefresh = opt.on_refresh; //刷新回调函数
	        
	        pullViewTop = -pullViewHeight;
	        pullView.height = pullViewHeight + 'px';
	        pullView.top = pullViewTop + 'px';
	        
	        scrollView.addEventListener('scroll',onScroll);
	        scrollView.addEventListener('dragend',onDragend);
	    }
	    
	    init(scroll_view,pull_view,opt); //初始化
	    
	    
	    this.done = function(timeText){//完成一次刷新任务后必须调用该函数来收尾,timeText为赋值给时间标签的文字
	        pullViewTop = -pullViewHeight;
	        pullView.top = pullViewTop + 'px';
	        refresh = false;
	        refreshing = false;
	        arrowDirect = 'down';
	        if(arrowView){
	            var matrix2d = Ti.UI.create2DMatrix();
	            var roate = matrix2d.rotate(0); // in degrees
	            var a = Ti.UI.createAnimation({
	                transform: roate,
	                duration: 50
	            });
	            arrowView.animate(a);       
	            
	        }
	        if(loadingView) loadingView.hide();
	        if(arrowView) arrowView.opacity = 1;
	        if(textView) textView.text = pullText;
	        if(timeView && timeText) timeView.text = timeText; //更新时间
	    };
	
	};

}
/************************************************/
module.exports = Ti.Platform.name==='android' ? pullRefresh_android : pullRefresh_ios;
