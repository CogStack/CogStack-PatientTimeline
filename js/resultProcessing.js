/**
 * @file Script file responsible for processing the search results
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev 
 */


/**
 * Creates entry for on the timeline for given parameter object
 * @param {Object} value given object that needs to be put on the timeline
 * @param {Object} presentMonths very simple HashMap-like structure to check if given month-year is already present
 * @returns {Object} returns presentMonths to be used in the next call
 */
var createTimelineEntry = function(value, presentMonths) {
	var timelineEntry = "";

	var exactDate = new Date(value._source.documenttimestamp);
	var monthYear = getShortMonth(exactDate.getMonth()) + " " + exactDate.getFullYear();
	var monthYearNoSpaces = monthYear.replace(/ /g,"");
	var pdfTimestamp = exactDate.getDate()+monthYearNoSpaces;

	var shortTextSnippet = "Placeholder for snippet of the content once OCR quality is improved"; //getSnippet(value._source.html,SHORT_SNIPPET_LENGTH);
	var longTextSnippet = "Longer version of the snippet of the content once OCR quality is improved"; //getSnippet(value._source.html,LONG_SNIPPET_LENGTH);

	if(!(presentMonths[monthYearNoSpaces])) {
		timelineEntry += "<dt id=" + monthYearNoSpaces + ">" + monthYear + "</dt>"; // Month-Year Tag
		presentMonths[monthYearNoSpaces] = true;
	}

	var imageSource = "";
	var PDFSource = "#";
	if(true) { //value._source.thumbnail) { // used to check if thumbnail source was present in the ES index
		var fileName = value._source.tlsrctablename + "_" + value._source.tlsrccolumnfieldname + "_" + value._source.documentid;
		imageSource = thumbnailSource + "thumbnail/" + fileName + ".png";
		PDFSource = thumbnailSource + "binary/" + fileName + ".pdf";
	}
	else
		imageSource = "img/Icon-Placeholder.png";

	timelineEntry += "<div class='collapse in' aria-expanded=true id=collapsableEntry" + value._id + ">";   
	timelineEntry += "<dd class='pos-right clearfix'><div class='circ'></div><div class='time'>" + getShortMonth(exactDate.getMonth()) + " " + exactDate.getDate() + "</div><div class='events'>"; // circle with exact date on the side
	timelineEntry += "<div class='pull-left'><div class='thumbIcon'><a href=" + imageSource + " data-toggle='lightbox'>";
	timelineEntry += "<img class='events-object img-rounded' id=thumbIcon" + value._id + " src=" + imageSource + "></a></div>";
	timelineEntry += "<div class='downloadButton'><a href='" + PDFSource + "' class='btn btn-info' role='button' target='_blank' id=PDF" + value._id + ">Download Full PDF</a></div></div>";
	timelineEntry += "<div class='events-body' id='entry" + value._id + "''>"; 
	timelineEntry += "<div class='help-tip'><p>Double click to expand/minimize the text</p></div>";
    //timelineEntry += '<h4 class="events-heading">Sample Document</h4>'; // heading
	timelineEntry += "<p style='width:90%' id=text" + value._id + ">" + shortTextSnippet + "</p>"; // BODY
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
var createTimelineListeners = function(value, shortTextSnippet, longTextSnippet, pdfTimestamp, monthYearNoSpaces) {
	
	// when month-year element is clicked, given set of entries are collapsed/expanded
	$("#"+monthYearNoSpaces).on("click", function() {
		var collapsableEntryHandle = $("#collapsableEntry" + value._id);
		collapsableEntryHandle.collapse("toggle");
	});

	// when the text of the entry is double clicked, it is changed between short and longer version
	$("#entry"+value._id).on("dblclick",function() {
		var textHandle = "#text" + value._id;
		if($(textHandle).text().length > shortTextSnippet.length)
			$(textHandle).text(shortTextSnippet);
		else
			$(textHandle).text(longTextSnippet);
	});

	$("#PDF"+value._id).on("click",function() {
		logDocumentDownload(value._source.documentid);
	});

	$("#thumbIcon"+value._id).on("click", function() {
		logThumbnailView(value._source.documentid);
	});

	// download pdf when the link is clicked
/*	if(!value._source.thumbnail) {
		$("#PDF"+value._id).on("click",function(e) {
			window.alert("If you see this window, contact the developer saying which entry you tried to view.");
			e.preventDefault();
			// createPDF(value._source.docId, pdfTimestamp, value._source.html); // in the current pipeline this won't be neccessary
			return false; 
		});
	}
*/

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
var processResults = function(searchResult, size) {
	$("#collapseButton").text("Collapse all");
	
	if(debug) {
		console.log("#####");
		console.log("Search results: ");
		console.log(searchResult);
		console.log("#####");
	}
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

	if(debug){
		console.log("#####");
		console.log("Present Months: ");
		console.log(presentMonths)
		console.log("#####");
	}
	if(!($.isEmptyObject(searchResult)))
		$(".paginationContainer").show();
}
