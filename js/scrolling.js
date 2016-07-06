
$(document).ready(function() {
	$(document).keyup(function(e) {
		if(e.which == 38) {
			e.preventDefault();
			scrollOneUp();
		}
		if(e.which == 40) {
			e.preventDefault();
			scrollOneDown()
		}
	});
});

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

var scrollTo = function(entry, offsetToTop) {
	$("html, body").stop().animate({
		"scrollTop": offsetToTop
	}, 250, "swing", function () {
		window.location.hash = entry;
	});
};
