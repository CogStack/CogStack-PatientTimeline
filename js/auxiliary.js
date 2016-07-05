/**
 * @file Script file providing auxiliary functionalities for the search and processing
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev 
 */

/** 
 * Get width of thumbnail/icon 
 * @param {Number} targetHeight provided constant height value
 * @param {Number} naturalHeight original height of thumbnail/icon
 * @param {Number} naturalWidth original width of thumbnail/icon
 * @return {Number} desired width
 */
var getThumbnailWidth = function(targetHeight, naturalHeight, naturalWidth) {
	return targetHeight*naturalWidth/naturalHeight;
}

/** 
 * Get height of thumbnail/icon from the user selection
 * @return {Number} The desired height
*/
var getThumbnailHeight = function() {
	var scalingFactor = $("#thumbnailSizeSlider").slider('getValue');
	return scalingFactor * DEFAULT_THUMBNAIL_HEIGHT;


	//OLD IMPLEMENTATION WITH RADIO BUTTONS: (LEAVE HERE IF WE DECIDE TO REVERT)
	/*
	var thumbnailSize = $("input:radio[name ='thumbnailSize']:checked").val();
	if(thumbnailSize == "small")
		return THUMBNAIL_HEIGHT_SMALL
	else if(thumbnailSize == "medium")
		return THUMBNAIL_HEIGHT_MEDIUM;
	else
		return THUMBNAIL_HEIGHT_LARGE;
	*/
}

/** 
 * Provides shortened names of months 
 * @param {Number} num number between 0-11
 * @return {String} desired motnh name
 */
var getShortMonth = function(num) {
	switch(num) {
		case 0: return "Jan";
		case 1: return "Feb";
		case 2: return "Mar";
		case 3: return "Apr";
		case 4: return "May";
		case 5: return "Jun";
		case 6: return "Jul";
		case 7: return "Aug";
		case 8: return "Sep";
		case 9: return "Oct";
		case 10: return "Nov";
		case 11: return "Dec";																				
	}
}

/** 
 * Get snippet of input text of specified length. It ensures words are not cut in the middle.
 * @example 
 * // returns "Lorem ipsum..."
 * getSnippet("Lorem ipsum dolor sit amet", 8);
 * @param {String} text source text
 * @param {Number} length desired length of the text
 * @return {String} shortened text
 */
var getSnippet = function(text, length) {
	if (text.length < length)
		return text;
    var rx = new RegExp("^.{" + length + "}[^ ]*");
    return rx.exec(text)[0]+"...";
}