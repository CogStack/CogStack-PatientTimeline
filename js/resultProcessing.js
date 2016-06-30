/** 
 * Create PDF of given text/document 
 * @param {number} patientID - ID of patient
 * @param {number} timestamp - timestamp used to save (name) the PDF file with
 * @param {text} source - source of HTML string or DOM element reference
 */
function createPDF(patientID, timestamp, source) {
	var pdf = new jsPDF('p', 'pt', 'a4');  // create new jsPDF object
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
	  	source, // HTML string or DOM elem ref.
	  	margins.left, // x coord
	  	margins.top, // y coord
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
 * Process results on page with returned search results
 * @param {number} searchResult - results of elastic search query
 */
function processResults(searchResult) {
	$('#collapseButton').text("Collapse all");
	
	if(debug) 
		console.log(searchResult);

	if($.isEmptyObject(searchResult))
		return

	var presentMonths = {};
	$.each(searchResult, function(index, value) {
		var timelineEntry = "";

		var exactDate = new Date(value._source.created);
		var monthYear = getShortMonth(exactDate.getMonth())+" "+exactDate.getFullYear();
		var monthYearNoSpaces = monthYear.replace(/ /g,'');
		var pdfTimestamp = exactDate.getDate()+monthYearNoSpaces;

		var shortTextSnippet = getSnippet(value._source.text,SHORT_SNIPPET_LENGTH);
		var longTextSnippet = getSnippet(value._source.text,LONG_SNIPPET_LENGTH);

		var targetThumbnailHeight = getThumbnailHeight();

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
		timelineEntry += "<div class='pull-left'><a href=" + imageSource + " data-toggle='lightbox'><img class='events-object img-rounded' id=img" + value._id + " src=" + imageSource + "></a></div><div class='events-body' id='entry" + value._id + "''>"; // TODO: REPLACE PLACEHOLDER IMAGE
		timelineEntry += "<div class='help-tip'><p>Double click to expand/minimize the text</p></div>";   


	    //timelineEntry += '<h4 class="events-heading">Sample Document</h4>'; // heading
		timelineEntry += "<p style='width:90%' id=text" + value._id + ">" + shortTextSnippet + "</p>"; // BODY

		timelineEntry += "<a href='#' id=PDF" + value._id + ">Download Full PDF</a>";
		timelineEntry += "</div></div></div></dd>"; // closing tags

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
				$(textHandle).text(longTextSnippet);
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
			var finalWidth = getThumbnailWidth(targetThumbnailHeight, imageHeight, imageWidth);
			$(this).attr('style','width:'+finalWidth+'px;height:'+targetThumbnailHeight+'px');
		});
	});

	if(debug)
		console.log(presentMonths)

	if(!($.isEmptyObject(searchResult)))
		$('#collapseButton').show();
}