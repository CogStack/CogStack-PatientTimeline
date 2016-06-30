
const SHORT_SNIPPET_LENGTH = 100;
const LONG_SNIPPET_LENGTH = 1000;

const THUMBNAIL_HEIGHT_SMALL = 75;
const THUMBNAIL_HEIGHT_MEDIUM = 150;
const THUMBNAIL_HEIGHT_LARGE = 250;

var debug = true;


$(document).ready(function() {
	$(".timelineContainer").hide();
	$('#waitMessage').delay(100).fadeOut();

	setFormProperties();
	$('#collapseButton').hide();

	$(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
	    event.preventDefault();
	    $(this).ekkoLightbox();
	}); 
});

function setFormProperties() {
	// Properties for the calendar for "from" date
	$('#datePickerFrom').datetimepicker({
		viewMode: 'years',
		format: 'YYYY-MM-DD',
		useCurrent: false,
		defaultDate : new Date(0),
		maxDate : new Date(),
		allowInputToggle : true
	});

	// Properties for the calendar for "to" date
	$('#datePickerTo').datetimepicker({
		viewMode: 'years',
		format: 'YYYY-MM-DD',
	    defaultDate : new Date(),
	    maxDate: new Date() ,
		allowInputToggle : true
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

	// Ensures you can't put end date smaller than start date
	$("#datePickerFrom").on("dp.change", function (e) {
	    $('#datePickerTo').data("DateTimePicker").minDate(e.date);
	});

	// Ensures you can't put start date bigger than end date
	$("#datePickerTo").on("dp.change", function (e) {
	    $('#datePickerFrom').data("DateTimePicker").maxDate(e.date);
	});
}

function clearTimeline() {
	$("#timelineList").empty();
	$('#collapseButton').hide();
	$(".timelineContainer").hide();
}

function toggleCollapse() {
	var buttonHandle = $('#collapseButton');
	var collapsableHandle = $("[id^=" + "collapsableEntry" + "]");

	var numberOfVisibleEntries = 0;
	
	// calculates current number of expanded entries
	$.each(collapsableHandle, function(index, value){
		if($(value).attr("aria-expanded") == "true")
			numberOfVisibleEntries += 1;  
	});
	
	if(buttonHandle.text() == "Collapse all" && numberOfVisibleEntries > 0) {
		collapsableHandle.collapse("hide");
		buttonHandle.text('Expand all');
	}
	
	else {
		collapsableHandle.collapse("show");
		buttonHandle.text("Collapse all");
	}
}

function showLoading() {
	$('#waitMessage').fadeIn(300);
};

function hideLoading() {
    $("#waitMessage").fadeOut(300);
}