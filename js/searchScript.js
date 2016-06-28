/*
TODO:
- display thumbnails/icon for text
- choose patient at the beginning, then search for same bcoid in the docs
- code cleanup + refactor
- code documentation
- divide this js into seperate ones with different functionalities
- manage image resize
*/
const SHORT_SNIPPET_LENGTH = 100;

const LONG_SNIPPET_LENGTH = 1000;
const MAX_PREVIEW_HEIGHT = 75;
const MAX_PREVIEW_WIDTH = 75;

var debug = true;

var url = "http://timeline-silverash.rhcloud.com";

var client = new $.es.Client({
	host: url,
	log: "info"
});

$(document).ready(function() {
	doSetup();
});

function doSetup() {

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


	$("#datePickerFrom").on("dp.change", function (e) {
	    $('#datePickerTo').data("DateTimePicker").minDate(e.date);
	});

	$("#datePickerTo").on("dp.change", function (e) {
	    $('#datePickerFrom').data("DateTimePicker").maxDate(e.date);
	});




	$('#collapseButton').hide();
	$('#secondCollapseButton').hide();

	$(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
	    event.preventDefault();
	    $(this).ekkoLightbox();
	}); 

}

function startSearch() {
	// testCollapse();
	clearTimeline()
	prepareSearchData();
}

function toggleCollapse() {
	var buttonHandle = $('#collapseButton');
	var secondButtonHandle = $('#secondCollapseButton');
	var collapsableHandle = $("[id^=" + "collapsableEntry" + "]");
	var numberOfVisibleEntries = 0;
	$.each(collapsableHandle, function(index, value){
		if($(value).attr("aria-expanded"))
			numberOfVisibleEntries += 1;  //TODO: FINISH THAT
	});
	
	if(buttonHandle.text() == "Collapse all") {
		collapsableHandle.collapse("hide");
		buttonHandle.text('Expand all');
		secondButtonHandle.text('Expand all');
	}
	
	else {
		collapsableHandle.collapse("show");
		buttonHandle.text("Collapse all");
		secondButtonHandle.text("Collapse all");
	}
}

function clearTimeline() {
	$("#timelineList").empty();
}


function prepareSearchData()
{
	var startDate = $('#datePickerFrom').data('date');
	var endDate = $('#datePickerTo').data('date');
	var resultsPerPage = $('#numberResults').val();

	var containingKeywords = "";

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
	prepareSearchJSON(resultsPerPage, startDate, endDate, containingKeywords)
}


function prepareSearchJSON(resultsPerPage, startDate, endDate, containingKeywords) {
	startDate = new Date(startDate).getTime();
	endDate = new Date(endDate).getTime();
	if(debug) {
		console.log(startDate);
		console.log(endDate);
		console.log(containingKeywords);
	}
	var searchParams = {
		size : resultsPerPage, // temp
		//from : startingIndex, // TODO
		index : "mock", // temp
		type : "doc", //temp
		body : {
			query : {
				bool : {
					must : [{
						//{term : {gender : "male"} },
						range:	{
							created : {
								"gte" : startDate,
								"lte" : endDate
							}
						 }	
					}],
					should : [
						{ match: {"_all" : containingKeywords}}
					]
				}
			}
		}
	}

	searchData(searchParams);
}

function resultsCompararison(a,b) {
	if(a._source.created > b._source.created)
		return -1;
	if(a._source.created == b._source.created)
		return 0;
	else
		return 1;
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

function createPDF(timestamp, source) {
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
	        pdf.save(timestamp+".pdf");
	      },
		  {
			top : 70,
			bottom : 70
		  }
	)		
}

function processResults(searchResult) {
	
	$('#secondCollapseButton').hide();
	$('#collapseButton').text("Collapse all");
	$('#secondCollapseButton').text("Collapse all");
	
	if(debug) 
		console.log(searchResult);

	if(!searchResult)
		return

	searchResult = searchResult.sort(resultsCompararison)

	var presentMonths = {};
	$.each(searchResult, function(index, value){
		var exactDate = new Date(value._source.created);
		var monthYear = getShortMonth(exactDate.getMonth())+" "+exactDate.getFullYear();
		var monthYearNoSpaces = monthYear.replace(/ /g,'');
		var timelineEntry = "";
		var shortTextSnippet = getSnippet(value._source.text,SHORT_SNIPPET_LENGTH);

		var pdfTimestamp = exactDate.getDate()+monthYearNoSpaces;
		if(!(presentMonths[monthYearNoSpaces])) {
			timelineEntry += "<dt id="+monthYearNoSpaces+">"+monthYear+"</dt>"; // Month-Year Tag
			presentMonths[monthYearNoSpaces] = true;
		}

		var imageSource = "img/Icon-Placeholder.png";

		timelineEntry += '<div class="collapse in" id=collapsableEntry'+value._id+'>';   //TODO: INSERT id=something
		timelineEntry += '<dd class="pos-right clearfix"><div class="circ"></div><div class="time">'+getShortMonth(exactDate.getMonth())+' '+exactDate.getDate()+'</div><div class="events">'; // circle with exact date on the side
		timelineEntry += '<div class="pull-left"><a href='+imageSource+' data-toggle="lightbox"><img class="events-object img-rounded" "myImage" src='+imageSource+'></a></div>'; // TODO: REPLACE PLACEHOLDER IMAGE
		

		// timelineEntry += '<div class="pull-left"><img class="events-object img-rounded" src='+imageSource+'></div>'; // TODO: REPLACE PLACEHOLDER IMAGE


		timelineEntry += '<div class="events-body"><h4 class="events-heading">Sample Document</h4>'; // heading
		timelineEntry += '<p id=text'+value._id+'>'+shortTextSnippet+'</p>'; // BODY

		timelineEntry += '<a href="#" id=PDF'+value._id+'>Download Full PDF</a>'; //TODO
		timelineEntry += '</div></div></div></dd>'; // closing tags

		$("#timelineList").append(timelineEntry);

		$("#"+monthYearNoSpaces).on("click", function() {
			var collapsableEntryHandle = $("#collapsableEntry"+value._id);
			collapsableEntryHandle.collapse("toggle");
		});

		$("#text"+value._id).on("click",function() {
			if($(this).text().length > shortTextSnippet.length)
				$(this).text(shortTextSnippet);
			else
				$(this).text(getSnippet(value._source.text,LONG_SNIPPET_LENGTH));
		});

		// TODO:
		// UPDATE WHEN THUMBNAIL AND FINAL PDFs AVAILABLE!
		$("#PDF"+value._id).on("click",function(e) {
			e.preventDefault();
			createPDF(pdfTimestamp, value._source.text);
			return false; 
		});

	});
	if(debug)
		console.log(presentMonths)
	$('#collapseButton').show();
	
	if($('#numberResults').val()>2)
	$('#secondCollapseButton').show();
	
}

function getSnippet(text, length) {
	if (text.length < length)
		return text;
    var rx = new RegExp("^.{" + length + "}[^ ]*");
    return rx.exec(text)[0]+"...";
}

function searchData(searchParams) {
	client.search(searchParams).then(function(response) {
		processResults(response.hits.hits);
	}, function(jqXHR, textStatus, errorThrown) {
		if(debug) {
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
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