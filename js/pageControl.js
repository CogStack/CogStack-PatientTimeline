/**
 * @file Script file responsible for controlling main behaviour of the application
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev 
 */

/**Constant specifying length of the initial text snippet*/
const SHORT_SNIPPET_LENGTH = 100;

/**Constant specifying length of the expanded text snippet*/
const LONG_SNIPPET_LENGTH = 1000;

/**Constant specifying height(in px) of small thumbnail/icon*/
const THUMBNAIL_HEIGHT_SMALL = 75;

/**Constant specifying height(in px) of medium thumbnail/icon*/
const THUMBNAIL_HEIGHT_MEDIUM = 150;

/**Constant specifying height(in px) of large thumbnail/icon*/
const THUMBNAIL_HEIGHT_LARGE = 250;

/**Variable responsible for toggling debug mode for printing debug messages to the console*/
var debug = true;


/**
* Fired when the document is finished loading.
* Responsible for settng initial components, such as hiding the timeline, collapse button, etc.
* @function "$(document).ready"
*/
$(document).ready(function() {
	$("#waitMessage").delay(100).fadeOut();
	$(".paginationContainer").hide();
	setFormProperties();

	/**Listener required by the lightbox library*/
	$(document).delegate("*[data-toggle='lightbox']", "click", function(event) {
	    event.preventDefault();
	    $(this).ekkoLightbox();
	}); 

	$(function(){
		$("input:radio[name ='thumbnailSize']").change(function(){
			var thumbIconHandles = $("[id^=" + "thumbIcon" + "]"); 
			$.each(thumbIconHandles, function(index, img) {
				$(img).load();
			});
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

});

/**
 * Function called by $(document).ready. It is responsible for setting properties of the form,
 * such as formatting of the input calendars as well as listeners for changes in them or return key press.
 * @listens event:"keydown" on patientID (listens for return key press)
 * @listens event:"keydown" on containingKeywords (listens for return key press)
 * @listens event:"dp.change" on datePickerFrom (listens for changes in datePickerTo)
 * @listens event:"dp.change" on datePickerTo (listens for changes in datePickerFrom)
*/
function setFormProperties() {
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
}

/**
 * Cleans up the timeline before the search is initialiased; empties its content (if it contained any data) and hides unnecessary elements
 */
function clearTimeline() {
	$("#timelineList").empty();
	$(".paginationContainer").hide();
}

/**
 * Collapses or expands all populated timeline entries
 */
function toggleCollapse() {
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
function showLoading() {
	$('#waitMessage').fadeIn(300);
};

/**
 * Hides the loading messages after results are fetched
 */
function hideLoading() {
    $("#waitMessage").fadeOut(300);
}