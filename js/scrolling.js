/**
 * @file Script file responsible for controlling scrolling between timeline entries on arrow up/down buttons
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev 
 */
 
 /**
 * Scrolls one entry up
 */
var scrollOneUp = function() {
	var windowYPos = $(window).scrollTop();
	var collapsableHandle = $("[id^=" + "collapsableEntry" + "]");
	var scrollToEntry = null;
	var offsetToTop = 0;
	$.each(collapsableHandle, function(index, entry) {
		offsetToTop  = $(entry).offset().top;
		if (windowYPos > offsetToTop && $(entry).attr("aria-expanded") == "true") 
			scrollToEntry = entry;
		else 
			return false;    
	});
	if(scrollToEntry != null) {
		offsetToTop = $(scrollToEntry).offset().top;
		scrollTo(scrollToEntry, offsetToTop);
	}
	else
		scrollTo('#',0);

}

/**
 * Scrolls one entry down
 */
var scrollOneDown = function() {
	var windowYPos = $(window).scrollTop();
	var collapsableHandle = $("[id^=" + "collapsableEntry" + "]");
	$.each(collapsableHandle, function(index, entry) {
		var offsetToTop = $(entry).offset().top;
		if(windowYPos < offsetToTop) {
			scrollTo(entry, offsetToTop);
			return false;
		}
	});
}

/**
 * Handles scrolling to specific position with animation
 * @param {Object} entry single timeline entry
 * @param {Number} offsetToTop Y position of the element
 */
var scrollTo = function(entry, offsetToTop) {
	$("html, body").stop().animate({
		"scrollTop": offsetToTop
	}, 250, "swing", function () {
		window.location.hash = entry;
	});
};
