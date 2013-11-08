var apns = function(success,receive,error){//success为注册成功回调；receive为收到信息的回调；error为注册出现错误的回调，他们的都是原始事件的参数
  Titanium.Network.registerForPushNotifications({
	    types: [
	        Titanium.Network.NOTIFICATION_TYPE_BADGE,
	        Titanium.Network.NOTIFICATION_TYPE_ALERT
	    ],
	    success:function(e)
	    {
	        Ti.API.info("Push notification device token is: "+deviceToken);
	        Ti.API.info("Push notification types: "+Titanium.Network.remoteNotificationTypes);
	        Ti.API.info("Push notification enabled: "+Titanium.Network.remoteNotificationsEnabled);
	        success && success(e);
	    },
	    error:function(e)
	    {
	        Ti.API.info("Error during registration: "+e.error);
	        error && error(e);
	    },
	    callback:function(e)
	    {
	        // called when a push notification is received.
	        receive && receive(e);
	    }
  }); 
};


/*************************************************/
exports.register = apns;
