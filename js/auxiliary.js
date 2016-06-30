

function getThumbnailWidth(targetHeight, naturalHeight, naturalWidth) {
	return targetHeight*naturalWidth/naturalHeight;
}

function getThumbnailHeight() {
	var thumbnailSize = $("input:radio[name ='thumbnailSize']:checked").val();
	if(thumbnailSize == "small")
		return THUMBNAIL_HEIGHT_SMALL
	else if(thumbnailSize == "medium")
		return THUMBNAIL_HEIGHT_MEDIUM;
	else
		return THUMBNAIL_HEIGHT_LARGE;
}

function getShortMonth(num) {
	switch(num) {
		case 0: return 'Jan';
		case 1: return 'Feb';
		case 2: return 'Mar';
		case 3: return 'Apr';
		case 4: return 'May';
		case 5: return 'Jun';
		case 6: return 'Jul';
		case 7: return 'Aug';
		case 8: return 'Sep';
		case 9: return 'Oct';
		case 10: return 'Nov';
		case 11: return 'Dec';																				
	}
}

function getSnippet(text, length) {
	if (text.length < length)
		return text;
    var rx = new RegExp("^.{" + length + "}[^ ]*");
    return rx.exec(text)[0]+"...";
}