function photoPicker(opt){
	opt = opt || {};
	opt.success = opt.success || function(media,mediaType){};
	opt.error = opt.error || function(error){};
	
	Titanium.Media.openPhotoGallery({
		success:function(e) {
			Ti.API.info("photo gallery open success! event: " + JSON.stringify(e));
			opt.success && opt.success(e.media,e.mediaType);
		},
		error:function(e){
			Ti.API.info("photo gallery open error! error: " + e.error );
			opt.error && opt.error(e.error);
			
		}
	});
}
/****************************************/
exports.photoPicker = photoPicker;