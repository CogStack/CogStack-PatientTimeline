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
var createTimelineEntry = function (value, presentMonths) {
    var timelineEntry = "";

    // those labels are used regardless of whether processing have failed or not
    var exactDate = new Date(value._source[ES_TIME_FIELD]);

    var monthYear = getShortMonth(exactDate.getMonth()) + " " + exactDate.getFullYear();
    var monthYearNoSpaces = monthYear.replace(/ /g, "");
    var dateLabel = getShortMonth(exactDate.getMonth()) + " " + exactDate.getDate();


    if (!(presentMonths[monthYearNoSpaces])) {
        timelineEntry += "<dt id=" + monthYearNoSpaces + ">" + monthYear + "</dt>"; // Month-Year Tag
        presentMonths[monthYearNoSpaces] = true;
    }

    var imageSource = "";
    var PDFSource = "";
    var pageCount = "Unavailable";
    var shortTextSnippet = "";
    var longTextSnippet = "";
    var headerName = "";

    var fileName = value._source.tlsrctablename + "_" + value._source.tlsrccolumnfieldname + "_" + value._source.documentid;

    thumbnailSource = thumbnailSource.substr(-1) === "/" ? thumbnailSource : thumbnailSource + "/";

    imageSource = thumbnailSource + value._source.tlsrctablename + "/thumbnail/" + fileName + ".png";
    PDFSource = thumbnailSource + value._source.tlsrctablename + "/pdf/" + fileName + ".pdf";

    headerName = value._source.documentname;
    extension = headerName.slice((headerName.lastIndexOf(".") - 1 >>> 0) + 2);
    if (extension.length) {
        headerName = headerName.slice(0, -(extension.length + 1));
    }

    // turns out that the fields in elasticsearch (X-TL-PDF-GENERATION and X-TL-THUMBNAIL-GENERATION )
    // are insufficient as sometimes they said processing succeeded, yet documents are missing
    // so we explicitly check if the resources are available beforehand
    var doesThumbnailExist = checkIfResourceExists(imageSource);
    if (!doesThumbnailExist) {
        imageSource = "img/thumbnail_placeholder.png";
    }

    var doesPDFExist = checkIfResourceExists(PDFSource);

    if (!doesPDFExist) {
        PDFSource = "";
    }

    // check if there exists anything meaningful in tika output
    if (value._source.tikaOutput.length > 10) {
        shortTextSnippet = getSnippet(value._source.tikaOutput, SHORT_SNIPPET_LENGTH);

        // there are cases where pdf and thumbnail don't exist, but there is a sensible Tika output;
        // in that case, make longer snippet much longer to give the ability to read the document content
        if(doesPDFExist) {
            longTextSnippet = getSnippet(value._source.tikaOutput, LONG_SNIPPET_LENGTH);
        }
        else {
            longTextSnippet = getSnippet(value._source.tikaOutput, 2.5 * LONG_SNIPPET_LENGTH);
        }

        pageCount = value._source["X-TL-PAGE-COUNT"];
    }

    else {
        shortTextSnippet = PROCESSING_ERROR_TEXT;
        longTextSnippet = PROCESSING_ERROR_TEXT;
    }

    var disabled = PDFSource ? "" : "disabled";

    var pageCountDiv = (pageCount === "TL_PAGE_COUNT_UNKNOWN" || pageCount == null) ? "" :
                        "<div class='pageCount'>\
    					    <h6><b>Page Count: " + pageCount + "</b></h6>\
    				    </div>";

    var helpTipDiv = "<div class='help-tip'>\
					    <p>Double click to expand/minimize the text</p>\
				    </div>";

    var entryHeaderName = "<h4 class='events-heading'>\
						    " + headerName + "\
						   </h4>";

    var downloadPDFButtonDiv = "";

    // there exists the pdf file hence we can have normal Download pdf button
    if (PDFSource) {
        downloadPDFButtonDiv = "<div class='downloadButton'>\
                                    <a href='" + PDFSource + "' class='btn btn-info' role='button' target='_blank' id=PDF" + value._id + ">\
									    Download PDF\
								    </a>\
							    </div>";
    }

    else {
        downloadPDFButtonDiv = "<div class='downloadButton'>\
                                    <a class='btn btn-info' role='button' target='_blank' id=PDF" + value._id + " disabled>\
									    PDF Unavailable\
								    </a>\
							    </div>";
    }


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

    createTimelineListeners(value, shortTextSnippet, longTextSnippet, monthYearNoSpaces, doesThumbnailExist);
    return presentMonths
};

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
var createTimelineListeners = function (value, shortTextSnippet, longTextSnippet, monthYearNoSpaces, doesThumbnailExist) {

    // when month-year element is clicked, given set of entries are collapsed/expanded
    $("#" + monthYearNoSpaces).on("click", function () {
        var collapsableEntrySetHandle = $("#collapsableEntrySet" + value._id);
        collapsableEntrySetHandle.collapse("toggle");
    });


    // when the text of the entry is double clicked, it is changed between short and longer version
    $("#collapsableEntrySet" + value._id).on("dblclick", function () {
        var textHandle = "#text" + value._id;
        if ($(textHandle).html().length > 1.2 * shortTextSnippet.length) { // to compensate for any overhead added by changing newlines to <br>
            $(textHandle).html(shortTextSnippet);
        }
        else {
            $(textHandle).html(longTextSnippet);
        }
    });

    // if logging is disabled there's no point in assigning the listeners
    if (logging) {
        $("#PDF" + value._id).on("click", function () {
            logDocumentDownload(value._source.documentid);
        });
    }


    // when thumbnails are loaded, they are resized to target size
    $("#thumbIcon" + value._id).load(function () {
        if (logging) {
            logThumbnailView(value._source.documentid);
        }

        // to prevent placeholders resizing if there is no actual document there (otherwise it is rather annoying)
        if (!doesThumbnailExist) {
            return;
        }

        var imageHeight = $(this).height();
        var imageWidth = $(this).width();
        var targetThumbnailHeight = getThumbnailHeight();
        var finalWidth = getThumbnailWidth(targetThumbnailHeight, imageHeight, imageWidth);
        $(this).attr("style", "width:" + finalWidth + "px;height:" + targetThumbnailHeight + "px");
    });
};


/**
 * Using the search results it generates and populates timeline entries
 * @param {Object} searchResult results of the ElasticSearch query
 */
var processResults = function (searchResult, size) {
    $("#collapseButton").text("Collapse all");

    if (debug) {
        console.log("#####");
        console.log("Search results: ");
        console.log(searchResult);
        console.log("#####");
    }
    // do not continue of the searchResult is empty
    if ($.isEmptyObject(searchResult)) {
        return
    }

    // very simple HashMap-like structure to check if given month-year is already present
    var presentMonths = {};

    $.each(searchResult, function (index, value) {
        if ((index == searchResult.length - 1) && (searchResult.length == size)) {
            return true;
        }
        presentMonths = createTimelineEntry(value, presentMonths);
    });

    if (debug) {
        console.log("#####");
        console.log("Present Months: ");
        console.log(presentMonths);
        console.log("#####");
    }
    if (!($.isEmptyObject(searchResult))) {
        $(".paginationContainer").show();
    }

};

var checkIfResourceExists = function (url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status != 404;
};