
$(document).ready(function() {
	$(document).keydown(function(e) {
		if(e.which == 38) {
			scrollOneUp();
			e.preventDefault();
		}
		if(e.which == 40) {
			scrollOneDown()
			e.preventDefault();
		}
	});
});

var scrollOneUp = function() {
	var windowYPos = $(window).scrollTop();
	var collapsableHandle = $("[id^=" + "collapsableEntry" + "]");
	var scrollToEntry = null;
	$.each(collapsableHandle, function(index, entry) {
	   var offsetToTop  = $(entry).offset().top;
	    if (windowYPos > offsetToTop && $(entry).attr("aria-expanded") == "true") 
	    	scrollToEntry = entry;
	    else 
	    	return true;    
  });
  if(scrollToEntry != null) {
    scrollTo(scrollToEntry);
  }


}

var scrollOneDown = function() {
	var windowYPos = $(window).scrollTop();
	var collapsableHandle = $("[id^=" + "collapsableEntry" + "]");
	$.each(collapsableHandle, function(index, entry) {
		var offsetToTop = $(entry).offset().top;
		if(windowYPos < offsetToTop) {
			scrollTo(entry);
			return false;
		}
	});
}

var scrollTo = function(entry) {
    $('html, body').stop().animate({
        'scrollTop': $(entry).offset().top
    }, 250, 'swing', function () {
        window.location.hash = entry;
    });
};
