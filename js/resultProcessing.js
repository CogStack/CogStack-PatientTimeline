//TODO: indicate document was OCR'd

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


	// those labels are used regardless of whether processing have failed or not
	var exactDate = new Date(value._source.documenttimestamp);
	var monthYear = getShortMonth(exactDate.getMonth()) + " " + exactDate.getFullYear();
	var monthYearNoSpaces = monthYear.replace(/ /g,"");
	var dateLabel = getShortMonth(exactDate.getMonth()) + " " + exactDate.getDate();


	if(!(presentMonths[monthYearNoSpaces])) {
		timelineEntry += "<dt id=" + monthYearNoSpaces + ">" + monthYear + "</dt>"; // Month-Year Tag
		presentMonths[monthYearNoSpaces] = true;
	}

	var imageSource = "";
	var PDFSource = "#";
	var pageCount = "";
	var shortTextSnippet = "";
	var longTextSnippet = "";""
	var headerName = "";


	//TODO: replace with the flag in ES about whether the document was successfully processed

	if(true) { // was processed successfully; there is all required metadata
		var fileName = value._source.tlsrctablename + "_" + value._source.tlsrccolumnfieldname + "_" + value._source.documentid;
		imageSource = thumbnailSource + "thumbnail/" + fileName + ".png";
		PDFSource = thumbnailSource + "pdf/" + fileName + ".pdf";
		shortTextSnippet = getSnippet(value._source.tikaOutput, SHORT_SNIPPET_LENGTH);
		longTextSnippet = getSnippet(value._source.tikaOutput, LONG_SNIPPET_LENGTH);
		pageCount = value._source["X-TL-PAGE-COUNT"];
	}

	//TODO: log failure?
	else { // processing have failed
		imageSource = "img/Icon-Placeholder.png";
		shortTextSnippet = PROCESSING_ERROR_TEXT;
		longTextSnippet = PROCESSING_ERROR_TEXT;

		// TODO when metadata available:
		// headerName = fileName
	}

	var pageCountDiv = "<div class='pageCount'>\
						<h6><b>Page Count: " + pageCount + "</b></h6>\
					</div>";

	var helpTipDiv = "<div class='help-tip'>\
					<p>Double click to expand/minimize the text</p>\
				</div>";

	var entryHeaderName = "<h4 class='events-heading'>\
						" + headerName + "\
						</h4>";

	var downloadPDFButtonDiv = "<div class='downloadButton'>\
								<a href='" + PDFSource + "' class='btn btn-info' role='button' target='_blank' id=PDF" + value._id + ">\
									Download Full PDF\
								</a>\
							</div>";

	var snippetDiv = "<div class='textSnippet'>\
					<p id=text" + value._id + ">" + shortTextSnippet + "<p>\
				</div>";

	var thumbnailDiv = "<div class='thumbIcon'>\
						<a href=" + imageSource + " data-toggle='lightbox' data-footer='Total Number of Pages: " + pageCount + "'>\
							<img class='events-object img-rounded' id=thumbIcon" + value._id + " src=" + imageSource + ">\
						</a>\
					</div>";

	// circle with exact date on the side
	timelineEntry += "<div class='collapse in' aria-expanded=true id='collapsableEntrySet" + value._id + "'>\
						<dd class='pos-right clearfix'>\
							<div class='circ'></div>\
								<div class='time' id='time" + value._id + "'>\
									" + dateLabel + "\
								</div>\
							<div class='events'>\
								<div class='pull-left'>\
									<div class='entryThumbPDFContainer'>\
										" + thumbnailDiv + "\
										" + pageCountDiv + "\
										" + downloadPDFButtonDiv + "\
									</div>\
								</div>\
								<div class='events-body' id='entry" + value._id + "''>\
									" + helpTipDiv + "\
									" + entryHeaderName + "\
									" + snippetDiv + "\
								</div>\
							</div>\
						</dd>\
					</div>";


	$("#timelineList").append(timelineEntry);


	//TODO in listeners: if processing failed no point in having listener that changes the text on dbclick
	createTimelineListeners(value, shortTextSnippet, longTextSnippet, monthYearNoSpaces);
	return presentMonths
}

/** 
 * Creates listeners for appropriate elements for each created entry
 * @param {Object} value given object that needs to be put on the timeline
 * @param {String} shortTextSnippet short snippet of the text that is going to be put on the timeline
 * @param {String} longTextSnippet longer version of the snippet of the text that is going to be put on the timeline
 * @param {String} monthYearNoSpaces representation of given month and year
 * @listens event:"click" on month-Year element
 * @listens event:"dbclick" on entry
 * @listens event:"click" on 'Download PDF'
 */
var createTimelineListeners = function(value, shortTextSnippet, longTextSnippet, monthYearNoSpaces) {
	
	// when month-year element is clicked, given set of entries are collapsed/expanded
	$("#" + monthYearNoSpaces).on("click", function() {
		var collapsableEntrySetHandle = $("#collapsableEntrySet" + value._id);
		collapsableEntrySetHandle.collapse("toggle");
	});


//WIP
	// $("#time" + value._id).on("click", function() {
	// 	var collapsableEntrySetHandle = $("#collapsableEntrySet" + value._id);
	// 	console.log("CLICKED")
	// 	collapsableEntrySetHandle.collapse("toggle");
	// });


	// when the text of the entry is double clicked, it is changed between short and longer version
	$("#collapsableEntrySet" + value._id).on("dblclick",function() {
		var textHandle = "#text" + value._id;
		if($(textHandle).html().length > 1.2 * shortTextSnippet.length) { // to compensate for any ovehead added by changing newlines to <br>
			$(textHandle).html(shortTextSnippet);
		}
		else {
			$(textHandle).html(longTextSnippet);
		}
	});

	$("#PDF" + value._id).on("click",function() {
		logDocumentDownload(value._source.documentid);
	});

	$("#thumbIcon" + value._id).on("click", function() {
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
	$("#thumbIcon" + value._id).load(function(){
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
	if($.isEmptyObject(searchResult)) {
		return
	}

	// very simple HashMap-like structure to check if given month-year is already present
	var presentMonths = {};

	$.each(searchResult, function(index, value) {
		if((index == searchResult.length - 1) && (searchResult.length == size)) {
			return true;
		}
		presentMonths = createTimelineEntry(value, presentMonths);
	});

	if(debug){
		console.log("#####");
		console.log("Present Months: ");
		console.log(presentMonths)
		console.log("#####");
	}
	if(!($.isEmptyObject(searchResult))) {
		$(".paginationContainer").show();
	}

}
