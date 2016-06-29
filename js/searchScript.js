/*
TODO:
- code cleanup + refactor
- code documentation
- divide this js into seperate ones with different functionalities
*/

const SHORT_SNIPPET_LENGTH = 100;
const LONG_SNIPPET_LENGTH = 1000;

const THUMBNAIL_HEIGHT_SMALL = 75;
const THUMBNAIL_HEIGHT_MEDIUM = 150;
const THUMBNAIL_HEIGHT_LARGE = 250;

var debug = true;

var url = "http://timeline-silverash.rhcloud.com";

var client = new $.es.Client({
	host: url,
	log: "info"
});


$(document).ready(function() {
	$(".timelineContainer").hide();
	$('#waitMessage').delay(100).fadeOut();

	$('#datePickerFrom').datetimepicker({
		viewMode: 'years',
		format: 'YYYY-MM-DD',
		useCurrent: false,
		defaultDate : new Date(0),
		// minDate : new Date("1-1-1970"),
		maxDate : new Date(),
		allowInputToggle : true
	});

	$('#datePickerTo').datetimepicker({
		viewMode: 'years',
		format: 'YYYY-MM-DD',
	    defaultDate : new Date(),
		// minDate : new Date("1-1-1970"),
	    maxDate: new Date() ,
		allowInputToggle : true
	});


	$("#containingKeywords").on("keydown", function(e){
		if (e.keyCode == 13) {
			e.preventDefault();
			$("#searchButton").click();
		}
	});

	$("#patientID").on("keydown", function(e){
		if (e.keyCode == 13) {
			e.preventDefault();
			$("#searchButton").click();
		}
	});

	$("#datePickerFrom").on("dp.change", function (e) {
	    $('#datePickerTo').data("DateTimePicker").minDate(e.date);
	});

	$("#datePickerTo").on("dp.change", function (e) {
	    $('#datePickerFrom').data("DateTimePicker").maxDate(e.date);
	});

	$('#collapseButton').hide();

	$(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
	    event.preventDefault();
	    $(this).ekkoLightbox();
	}); 
});


function getThumbnailHeight() {
	var thumbnailSize = $("input:radio[name ='thumbnailSize']:checked").val();
	if(thumbnailSize == "small")
		return THUMBNAIL_HEIGHT_SMALL
	else if(thumbnailSize == "medium")
		return THUMBNAIL_HEIGHT_MEDIUM;
	else
		return THUMBNAIL_HEIGHT_LARGE;
}


function startSearch() {
	clearTimeline()
	if(prepareSearchData())
		$(".timelineContainer").show();
}

function toggleCollapse() {
	var buttonHandle = $('#collapseButton');
	var collapsableHandle = $("[id^=" + "collapsableEntry" + "]");

	var numberOfVisibleEntries = 0;
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

function clearTimeline() {
	$("#timelineList").empty();
	$('#collapseButton').hide();
	$(".timelineContainer").hide();
}

function prepareSearchData()
{
	var startDate = $('#datePickerFrom').data('date');
	var endDate = $('#datePickerTo').data('date');
	var resultsPerPage = $('#numberResults').val();

	var containingKeywords = "";
	var patientID = $('#patientID').val();
	if(!patientID){
		$("#patientIDBox").removeClass("form-group").addClass("form-group has-error has-feedback");
    	$("#patientIDSpan").addClass("glyphicon glyphicon-remove form-control-feedback");
		return false;
	}
	else {
		$("#patientIDBox").removeClass("form-group has-error has-feedback").addClass("form-group");
		$('#patientIDSpan').removeClass("glyphicon glyphicon-remove form-control-feedback");
    }

    // below was converting DD/MM/YYYY into YYYY-MM-DD
    //
	// if(startDate) {
	// 	var splitStartDate = startDate.split("/");
	// 	startDate = splitStartDate[2]+"-"+splitStartDate[1]+"-"+splitStartDate[0];
	// }
	// else
	// 	return;

	// if(endDate) {
	// 	var splitEndDate = endDate.split("/");
	// 	endDate = splitEndDate[2]+"-"+splitEndDate[1]+"-"+splitEndDate[0];
	// }
	// else
	// 	return;

	if($('#containingKeywords').val())
		containingKeywords = $('#containingKeywords').val();

	if(debug) {
		console.log(startDate);
		console.log(endDate);
		console.log(containingKeywords);
	}
	prepareSearchJSON(patientID, resultsPerPage, startDate, endDate, containingKeywords)
	return true;
}


function prepareSearchJSON(patientID, resultsPerPage, startDate, endDate, containingKeywords) {
	startDate = new Date(startDate).getTime();
	endDate = new Date(endDate).getTime();
	if(debug) {
		console.log(startDate);
		console.log(endDate);
		console.log(containingKeywords);
	}
	//todo: introduce patientID
	var searchParams = {
		size : resultsPerPage, // temp
		//from : startingIndex, // TODO
		index : "mock", // temp
		type : "doc", //temp
		body : {
			sort : {"created" : {order : "desc"}},
			query : {
				bool : {
					must : [
						{term : {brcid : patientID} },
						{range:	{
							created : {
								"gte" : startDate,
								"lte" : endDate
							}
						 }	
					   },
					],/*
					should : [
						{ match: {"_all" : containingKeywords}}
					]*/
				}
			}
		}
	}

	if(containingKeywords)
		searchParams.body.query.bool.must.push({ match: {"_all" : containingKeywords}})

	searchData(searchParams);
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

function createPDF(patientID, timestamp, source) {
	var pdf = new jsPDF('p', 'pt', 'a4');
	//source = $('#pdf2htmldiv')[0];
	specialElementHandlers = {
		'#bypassme': function(element, renderer) {
			return true
		}
	}
	margins = {
	    top: 50,
	    left: 60,
	    width: 480
	  };
	pdf.fromHTML(
	  	source // HTML string or DOM elem ref.
	  	, margins.left // x coord
	  	, margins.top // y coord
	  	, {
	  		"width": margins.width // max width of content on PDF 
	  		, "elementHandlers": specialElementHandlers
	  	},
	  	function (dispose) {
	  	  // dispose: object with X, Y of the last line add to the PDF
	  	  //          this allow the insertion of new lines after html
	        pdf.save(timestamp+"_"+patientID+".pdf");
	      },
		  {
			top : 70,
			bottom : 70
		  }
	)		
}

//TODO: move into commons.js (once created)
function getThumbnailWidth(targetHeight, naturalHeight, naturalWidth) {
	return targetHeight*naturalWidth/naturalHeight;
}

function processResults(searchResult) {
	
	$('#collapseButton').text("Collapse all");
	
	if(debug) 
		console.log(searchResult);

	if(!searchResult)
		return

	var presentMonths = {};
	$.each(searchResult, function(index, value){
		var exactDate = new Date(value._source.created);
		var monthYear = getShortMonth(exactDate.getMonth())+" "+exactDate.getFullYear();
		var monthYearNoSpaces = monthYear.replace(/ /g,'');
		var timelineEntry = "";
		var shortTextSnippet = getSnippet(value._source.text,SHORT_SNIPPET_LENGTH);

		var pdfTimestamp = exactDate.getDate()+monthYearNoSpaces;

		var targetHeight = getThumbnailHeight();

		if(!(presentMonths[monthYearNoSpaces])) {
			timelineEntry += "<dt id="+monthYearNoSpaces+">"+monthYear+"</dt>"; // Month-Year Tag
			presentMonths[monthYearNoSpaces] = true;
		}

		var imageSource =""

		if(value._source.thumbnail) 
			imageSource = "img/thumbnail_placeholder.png"; // todo: replace with actual thumbnail when available
		else
			imageSource = "img/Icon-Placeholder.png";

		timelineEntry += '<div class="collapse in" aria-expanded=true id=collapsableEntry'+value._id+'>';   
		timelineEntry += '<dd class="pos-right clearfix"><div class="circ"></div><div class="time">'+getShortMonth(exactDate.getMonth())+' '+exactDate.getDate()+'</div><div class="events">'; // circle with exact date on the side
		timelineEntry += '<div class="pull-left"><a href='+imageSource+' data-toggle="lightbox"><img class="events-object img-rounded" id=img'+value._id+' src='+imageSource+'></a></div><div class="events-body" id="entry'+value._id+'">'; // TODO: REPLACE PLACEHOLDER IMAGE
		timelineEntry += '<div class="help-tip"> <p>Double click to expand/minimize the text</p></div>';   


		// timelineEntry += '<div class="pull-left"><img class="events-object img-rounded" src='+imageSource+'></div>'; // TODO: REPLACE PLACEHOLDER IMAGE


	   //  timelineEntry += '<h4 class="events-heading">Sample Document</h4>'; // heading
		timelineEntry += '<p style="width:90%" id=text'+value._id+'>'+shortTextSnippet+'</p>'; // BODY

		timelineEntry += '<a href="#" id=PDF'+value._id+'>Download Full PDF</a>'; //TODO
		timelineEntry += '</div></div></div></dd>'; // closing tags

		$("#timelineList").append(timelineEntry);

		$("#"+monthYearNoSpaces).on("click", function() {
			var collapsableEntryHandle = $("#collapsableEntry"+value._id);
			collapsableEntryHandle.collapse("toggle");
		});

		$("#entry"+value._id).on("dblclick",function() {
			var textHandle = "#text"+value._id;
			if($(textHandle).text().length > shortTextSnippet.length)
				$(textHandle).text(shortTextSnippet);
			else
				$(textHandle).text(getSnippet(value._source.text,LONG_SNIPPET_LENGTH));
		});

		// TODO:
		// UPDATE WHEN THUMBNAIL AND FINAL PDFs AVAILABLE!
		$("#PDF"+value._id).on("click",function(e) {
			e.preventDefault();
			createPDF(value._source.brcid, pdfTimestamp, value._source.text);
			return false; 
		});


		$("#img"+value._id).load(function(){
			var imageHeight = $(this).height();
			var imageWidth = $(this).width();
			var finalWidth = getThumbnailWidth(targetHeight, imageHeight, imageWidth);
			$(this).attr('style','width:'+finalWidth+'px;height:'+targetHeight+'px');
		});



	});
	if(debug)
		console.log(presentMonths)

	if(!($.isEmptyObject(searchResult)))
		$('#collapseButton').show();
}

function getSnippet(text, length) {
	if (text.length < length)
		return text;
    var rx = new RegExp("^.{" + length + "}[^ ]*");
    return rx.exec(text)[0]+"...";
}

function searchData(searchParams) {
	showLoading();
	client.search(searchParams).then(function(response) {
		processResults(response.hits.hits);
		hideLoading();
	}, function(jqXHR, textStatus, errorThrown) {
		if(debug) {
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

function showLoading() {
	$('#waitMessage').fadeIn(300);
};

function hideLoading() {
    $("#waitMessage").fadeOut(300);
}


/*
FOR POSSIBLE FUTURE REFERENCE IF WE NEED TO USE AJAX:

function getDummyData() {
	$.ajax({
		dataType: "json",
		url: url+"_search",
		type: "GET",
        contentType: 'application/json',
        crossDomain: true,
        data: searchParams,

		success: function(data){
    		console.log(data.hits.hits);
    	},
	    error: function(jqXHR, textStatus, errorThrown) {
	        console.log(textStatus);
	        console.log(errorThrown);
	    },
	});

}
*/