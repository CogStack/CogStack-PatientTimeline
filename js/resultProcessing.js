/**
 * @file Script file responsible for processing the search results
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev 
 */

/** 
 * Create PDF of given text/document 
 * @param {String} patientID associated with the source ID of patient
 * @param {String} timestamp associated with the source timestamp
 * @param {String} source text to create the PDF from
 */
function createPDF(patientID, timestamp, source) {
	var pdf = new jsPDF("p", "pt", "a4");  // create new jsPDF object
	specialElementHandlers = {
		"#bypassme": function(element, renderer) {
			return true
		}
	}
	margins = {
	    top: 50,
	    left: 60,
	    width: 480
	};
	pdf.fromHTML(
	  	source,
	  	margins.left,
	  	margins.top,
	  	{
	  		"width": margins.width, // max width of content on PDF 
	  		"elementHandlers": specialElementHandlers
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

/**
 * Creates entry for on the timeline for given parameter object
 * @param {Object} value given object that needs to be put on the timeline
 * @param {Object} presentMonths very simple HashMap-like structure to check if given month-year is already present
 * @returns {Object} returns presentMonths to be used in the next call
 */
function createTimelineEntry(value, presentMonths) {
	var timelineEntry = "";

	var exactDate = new Date(value._source.created);
	var monthYear = getShortMonth(exactDate.getMonth())+" "+exactDate.getFullYear();
	var monthYearNoSpaces = monthYear.replace(/ /g,"");
	var pdfTimestamp = exactDate.getDate()+monthYearNoSpaces;

	var shortTextSnippet = getSnippet(value._source.text,SHORT_SNIPPET_LENGTH);
	var longTextSnippet = getSnippet(value._source.text,LONG_SNIPPET_LENGTH);

	if(!(presentMonths[monthYearNoSpaces])) {
		timelineEntry += "<dt id=" + monthYearNoSpaces + ">" + monthYear + "</dt>"; // Month-Year Tag
		presentMonths[monthYearNoSpaces] = true;
	}

	var imageSource = "";

	if(value._source.thumbnail) 
		imageSource = "img/thumbnail_placeholder.png"; // todo: replace with actual thumbnail when available
	else
		imageSource = "img/Icon-Placeholder.png";

	timelineEntry += "<div class='collapse in' aria-expanded=true id=collapsableEntry" + value._id + ">";   
	timelineEntry += "<dd class='pos-right clearfix'><div class='circ'></div><div class='time'>" + getShortMonth(exactDate.getMonth()) + " " + exactDate.getDate() + "</div><div class='events'>"; // circle with exact date on the side
	timelineEntry += "<div class='pull-left'><a href=" + imageSource + " data-toggle='lightbox'><img class='events-object img-rounded' id=thumbIcon" + value._id + " src=" + imageSource + "></a></div><div class='events-body' id='entry" + value._id + "''>"; // TODO: REPLACE PLACEHOLDER IMAGE
	timelineEntry += "<div class='help-tip'><p>Double click to expand/minimize the text</p></div>";   
    //timelineEntry += '<h4 class="events-heading">Sample Document</h4>'; // heading
	timelineEntry += "<p style='width:90%' id=text" + value._id + ">" + shortTextSnippet + "</p>"; // BODY
	timelineEntry += "<a href='#' id=PDF" + value._id + ">Download Full PDF</a>";
	timelineEntry += "</div></div></div></dd>"; // closing tags

	$("#timelineList").append(timelineEntry);

	createTimelineListeners(value, shortTextSnippet, longTextSnippet, pdfTimestamp, monthYearNoSpaces);
	return presentMonths
}

/** 
 * Creates listeners for appropriate elements for each created entry
 * @param {Object} value given object that needs to be put on the timeline
 * @param {String} shortTextSnippet short snippet of the text that is going to be put on the timeline
 * @param {String} longTextSnippet longer version of the snippet of the text that is going to be put on the timeline
 * @param {String} pdfTimestamp month-year timestamp for the PDF
 * @param {String} monthYearNoSpaces representation of given month and year
 * @listens event:"click" on month-Year element
 * @listens event:"dbclick" on entry
 * @listens event:"click" on 'Download PDF'
 */
function createTimelineListeners(value, shortTextSnippet, longTextSnippet, pdfTimestamp, monthYearNoSpaces) {
	
	// when month-year element is clicked, given set of entries are collapsed/expanded
	$("#"+monthYearNoSpaces).on("click", function() {
		var collapsableEntryHandle = $("#collapsableEntry"+value._id);
		collapsableEntryHandle.collapse("toggle");
	});

	// when the text of the entry is double clicked, it is changed between short and longer version
	$("#entry"+value._id).on("dblclick",function() {
		var textHandle = "#text"+value._id;
		if($(textHandle).text().length > shortTextSnippet.length)
			$(textHandle).text(shortTextSnippet);
		else
			$(textHandle).text(longTextSnippet);
	});

	// TODO:
	// UPDATE WHEN THUMBNAIL AND FINAL PDFs AVAILABLE!
	// download pdf when the link is clicked
	$("#PDF"+value._id).on("click",function(e) {
		e.preventDefault();
		createPDF(value._source.brcid, pdfTimestamp, value._source.text);
		return false; 
	});

	// when thumbnails are loaded, they are resized to target size
	$("#thumbIcon"+value._id).load(function(){
		var imageHeight = $(this).height();
		var imageWidth = $(this).width();
		var targetThumbnailHeight = getThumbnailHeight();
		var finalWidth = getThumbnailWidth(targetThumbnailHeight, imageHeight, imageWidth);
		$(this).attr("style","width:" + finalWidth + "px;height:" + targetThumbnailHeight + "px");
	});
}


/** 
 * Using the search results it generates and populates timeline entries
 * @param {Object} searchResult results of the ElasticSearch query
 */
function processResults(searchResult, size) {
	$("#collapseButton").text("Collapse all");
	
	if(debug) 
		console.log(searchResult);

	// do not continue of the searchResult is empty
	if($.isEmptyObject(searchResult))
		return

	// very simple HashMap-like structure to check if given month-year is already present
	var presentMonths = {};

	$.each(searchResult, function(index, value) {
		if((index == searchResult.length - 1) && (searchResult.length == size))
			return true;
		presentMonths = createTimelineEntry(value, presentMonths);
	});

	if(debug)
		console.log(presentMonths)

	if(!($.isEmptyObject(searchResult)))
		$(".paginationContainer").show();
}