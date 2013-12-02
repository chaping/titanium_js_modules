/**************************************************************************
 *  日期选择器
 *  datePicker(function(dateStr,dateObj){},{
 *     value :  默认值，可以为日期字符串比如 2011-11-11,也可以为date对象
 *     minDate : 最小日期，可以为日期字符串比如 2011-11-11,也可以为date对象
 *     maxDate : 最大日期，可以为日期字符串比如 2011-11-11,也可以为date对象
 * },win);  win为window对象,ios中必须传入该参数 
 * 
 * *****************************************************************************
 */
var datePickerWraper = null;
var datePickerObj = null;
var datePickerDialog = null;
function datePicker(onpicked,opt,win){//日期选择器 ,controller 为调用环境的窗口实例
    onpicked = onpicked || function(dateStr,dateObj){}; //选取了时间后的回调,dateStr为日期字符串,dateObj为Date对象
    opt = opt || {};
    
    if(!datePickerObj){
	    var pickerOpts = {
	        type:Ti.UI.PICKER_TYPE_DATE,
	        top:0
	    };
	    datePickerObj = Ti.UI.createPicker(pickerOpts);
    }
    if(opt.value){//默认日期
        if(typeof opt.value == 'string'){
            var d = str2date(opt.value);
            if(d) datePickerObj.value = d;
        }else if(opt.value.getTime){
            datePickerObj.value = opt.value;
        }
    }else{
    	datePickerObj.value = new Date;
    }
    if(opt.minDate){//最小日期
        if(typeof opt.minDate == 'string'){
            var d = str2date(opt.minDate);
            if(d) datePickerObj.minDate = d;
        }else if(opt.minDate.getTime){
            datePickerObj.minDate = opt.minDate;
        }
    }
    if(opt.maxDate){//最大日期
        if(typeof opt.maxDate == 'string'){
            var d = str2date(opt.maxDate);
            if(d) datePickerObj.maxDate = d;
        }else if(opt.maxDate.getTime){
            datePickerObj.maxDate = opt.maxDate;
        }
    }
    
    if(OS_ANDROID){// for android      
        
        if(!datePickerDialog){
            var dialog = Ti.UI.createOptionDialog({
                buttonNames:['确定','取消'],
                title:'请选择日期',
                androidView:datePickerObj
            });
            
            datePickerDialog = dialog;
            
            dialog.addEventListener('click',function(e){
                if(e.button){
                    if(e.index===0){
                        var dateObj = datePickerObj.value;
                        var dateStr = dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dateObj.getDate();
                        onpicked(dateStr,dateObj);
                    }
                }
            });
        }
        
        datePickerDialog.show();
    
    }else{//for ios
    	
        if(!datePickerWraper){//不重复创建
	        var wraper = Ti.UI.createView({
	            width:'300dp',
	            height:Ti.UI.SIZE,
	            layout:'vertical',
	            backgroundColor:'#333',
	            borderWidth:'1px',
	            borderColor:'#333',
	            opacity:0.95 
	        });
	        datePickerWraper = wraper;
	        var dateView = Ti.UI.createView({
	           width:Ti.UI.FILL,
	           height:Ti.UI.SIZE,
	           top:0 
	        });
	        var buttonView = Ti.UI.createView({
	            height:'50dp'
	        });
	        var okBtn = Ti.UI.createButton({//确定按钮
	        	width:'130dp',
	        	height:'40dp',
	        	title:'确定',
	        	left:'15dp'
	        });
	        
	        var cancelBtn = Ti.UI.createButton({//取消按钮
	        	width:'130dp',
	        	height:'40dp',
	        	title:'取消',
	        	right:'15dp'
	        });
	        okBtn.addEventListener('click',function(){//确定事件
	        	datePickerWraper.hide();
	        	var dateObj = datePickerObj.value;
                var dateStr = dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dateObj.getDate();
                onpicked(dateStr,dateObj);
	        });
	        cancelBtn.addEventListener('click',function(){//取消事件
	        	datePickerWraper.hide();
	        });
	        
	        buttonView.add(okBtn);
	        buttonView.add(cancelBtn);
	        dateView.add(datePickerObj);
	        wraper.add(dateView);
	        wraper.add(buttonView);
	        
	        if(win) win.add(wraper);
        }else{
        	
        }
        
        datePickerWraper.show();
    }
}

function str2date(str){//将2011-11-11这样的字符串转化为date对象
    var arr = str.split('-');
    if(arr.length!=3) return false;
    var d = new Date(arr[0],arr[1]-1,arr[2]);
    return d;
}

/************************************************/
exports.datePicker = datePicker;