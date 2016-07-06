/**
 * @file Script file responsible for controlling main behaviour of the application
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev 
 */

/**Constant specifying length of the initial text snippet*/
const SHORT_SNIPPET_LENGTH = 100;

/**Constant specifying length of the expanded text snippet*/
const LONG_SNIPPET_LENGTH = 1000;

/**Constant specifying height(in px) of medium thumbnail/icon*/
const DEFAULT_THUMBNAIL_HEIGHT = 250;

/**Variable responsible for toggling debug mode for printing debug messages to the console*/
var debug = true;


/**
 * Checks if user is using Internet Explorer
 * @returns {Boolean} determines if user is using Internet Explorer
 */
var checkBrowser = function() {
    var ms_ie = false;
    var ua = window.navigator.userAgent;
    var old_ie = ua.indexOf('MSIE ');
    var new_ie = ua.indexOf('Trident/');

    if ((old_ie > -1) || (new_ie > -1)) {
        ms_ie = true;
    }
    if ( ms_ie ) {
		$(".pwmodal-container").text("Sorry, this application does not support Microsoft Internet Explorer 11 or below. This application is best viewed on Chrome, Firefox, MS Edge or Safari.");
		$(".uil-default-css").remove();
		showLoading();
		return true;
    }
}


/**
* Fired when the document is finished loading.
* Responsible for settng initial components, such as hiding the timeline, collapse button, etc.
* @function "$(document).ready"
*/
$(document).ready(function() {
	var checkIE = checkBrowser();
	if(checkIE)
		return;

	$("#waitMessage").delay(100).fadeOut();

	setFormProperties();
	$(".paginationContainer").hide();

	/**Listener required by the lightbox library*/
	$(document).delegate("*[data-toggle='lightbox']", "click", function(event) {
	    event.preventDefault();
	    $(this).ekkoLightbox();
	}); 

	$("#thumbnailSizeSlider").on("change", function(){
		var thumbIconHandles = $("[id^=" + "thumbIcon" + "]"); 
		$.each(thumbIconHandles, function(index, img) {
			$(img).load();
		});
	});

	/**Listener for the next-page button*/
	$("#nextPage").on("click", function(e){
		e.preventDefault();
		if(!($(this).hasClass("disabled")))
			changePage.nextPage();
	});

	/**Listener for the next-page button*/
	$("#prevPage").on("click", function(e){
		e.preventDefault();
		if(!($(this).hasClass("disabled")))
			changePage.previousPage();
	});
	
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

/**
 * Function called by $(document).ready. It is responsible for setting properties of the form,
 * such as formatting of the input calendars as well as listeners for changes in them or return key press.
 * @listens event:"keydown" on patientID (listens for return key press)
 * @listens event:"keydown" on containingKeywords (listens for return key press)
 * @listens event:"dp.change" on datePickerFrom (listens for changes in datePickerTo)
 * @listens event:"dp.change" on datePickerTo (listens for changes in datePickerFrom)
*/
var setFormProperties = function() {
	// Properties for the calendar for "from" date
	$('#datePickerFrom').datetimepicker({
		viewMode: 'years',
		format: 'YYYY-MM-DD',
		useCurrent: false,
		defaultDate : new Date(0), // default displayed date: 1-1-1970 (user can still manually choose date before that)
		maxDate : new Date(), // default maximum date: todays date
		allowInputToggle : true // allows for displaying the calendar when the text box is clicked
	});

	// Properties for the calendar for "to" date
	$('#datePickerTo').datetimepicker({
		viewMode: 'years',
		format: 'YYYY-MM-DD',
	    defaultDate : new Date(), // default displayed date: todays date
	    maxDate: new Date(), // default maximum date: todays date
		allowInputToggle : true // allows for displaying the calendar when the text box is clicked
	});

	// When return key is pressed in the "containing" box, initialise search
	$("#containingKeywords").on("keydown", function(e){
		if (e.keyCode == 13) {
			e.preventDefault();
			$("#searchButton").click();
		}
	});

	// When return key is pressed in the "patient ID" box, initialise search
	$("#patientID").on("keydown", function(e){
		if (e.keyCode == 13) {
			e.preventDefault();
			$("#searchButton").click();
		}
	});

	// Ensures you can't set end date which is before the start date
	$("#datePickerFrom").on("dp.change", function (e) {
	    $('#datePickerTo').data("DateTimePicker").minDate(e.date);
	});

	// Ensures you can't set start date which is after the end date
	$("#datePickerTo").on("dp.change", function (e) {
	    $('#datePickerFrom').data("DateTimePicker").maxDate(e.date);
	});

	// Properties of the thumbnail size selector slider
	$("#thumbnailSizeSlider").slider({
	    ticks: [0.05, 0.5, 1.0, 1.5],
	    ticks_labels: ["Tiny", "Small", "Medium", "Big"],
	    ticks_snap_bounds: 0.05,
	    step: 0.025,
	    value: 0.5
	});
}

/**
 * Cleans up the timeline before the search is initialiased; empties its content (if it contained any data) and hides unnecessary elements
 */
var clearTimeline = function() {
	$("#timelineList").empty();
	$(".paginationContainer").hide();
}

/**
 * Collapses or expands all populated timeline entries
 */
var toggleCollapse = function() {
	var buttonHandle = $("#collapseButton");
	var collapsableHandle = $("[id^=" + "collapsableEntry" + "]"); // looks for all elements with id beginning with "collapsableEntry"
	var numberOfVisibleEntries = 0;

	// calculates current number of expanded entries
	$.each(collapsableHandle, function(index, value){
		if($(value).attr("aria-expanded") == "true")
			numberOfVisibleEntries += 1;  
	});
	
	if(buttonHandle.text() == "Collapse all" && numberOfVisibleEntries > 0) { // numberOfVisibleEntries ensures it won't try to collapse entries while there are no entries to collapse
		collapsableHandle.collapse("hide");
		buttonHandle.text('Expand all');
	}
	else {
		collapsableHandle.collapse("show");
		buttonHandle.text("Collapse all");
	}
}

/**
 * Displays the loading message when the results are being fetched
 */
var showLoading = function() {
	$('#waitMessage').fadeIn(300);
};

/**
 * Hides the loading messages after results are fetched
 */
var hideLoading = function() {
    $("#waitMessage").fadeOut(300);
}

