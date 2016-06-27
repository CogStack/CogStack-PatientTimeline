/* 
 * TODO: 
 *
*/

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

}

function startSearch() {
	// testCollapse();
	prepareSearchData();
}


function prepareSearchData()
{
	var startDate = $('#datePickerFrom').data('date');
	var endDate = $('#datePickerTo').data('date');
	var resultsPerPage = $('#numberResults').val();

	var containingKeywords = "";
	if(debug)
		console.log(containingKeywords);

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

	if(debug)
		console.log(startDate);
	if(debug)
		console.log(endDate);

	prepareSearchJSON(resultsPerPage, startDate, endDate, containingKeywords)
}


function prepareSearchJSON(resultsPerPage, startDate, endDate, containingKeywords) {
	startDate = new Date(startDate).getTime();
	endDate = new Date(endDate).getTime();
	if(debug) {
		console.log(startDate);
		console.log(endDate);
	}
	var searchParams = {
		size : resultsPerPage, // temp
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

function processResults(searchResult) {
	if(debug) 
		console.log(searchResult);
	searchResult = searchResult.sort(resultsCompararison)

	$.each(searchResult, function(index, value){
		var exactDate = new Date(value._source.created);
		var timelineEntry = "<dt>"+getShortMonth(exactDate.getMonth())+" "+exactDate.getFullYear()+"</dt>"; // Month-Year Tag
		timelineEntry += '<div class="collapse in">';   //TODO: INSERT id=something
		timelineEntry += '<dd class="pos-right clearfix"><div class="circ"></div><div class="time">'+getShortMonth(exactDate.getMonth())+' '+exactDate.getDate()+'</div>'; // circle with exact date on the side
		timelineEntry += '<div class="events"><div class="pull-left"><img class="events-object img-rounded" src="img/Icon-Placeholder.png"></div>'; // TODO: REPLACE PLACEHOLDER IMAGE
		timelineEntry += '<div class="events-body"><h4 class="events-heading">Sample Document</h4>'; // heading
		timelineEntry += '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean felis elit, imperdiet id tortor quis, luctus ultricies quam.</p>'; // BODY
		timelineEntry += '</div></div></div></dd>'; // closing tags

		$("#timelineList").append(timelineEntry);
	});

}


function getSnippet(text, length) {
    var rx = new RegExp("^.{" + length + "}[^ ]*");
    return rx.exec(text)[0]+"...";
}


function testCollapse() {
		$("#test_collapse").collapse("toggle");
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

getDummyData()
*/
/*
var searchParams = {
	//size : 2,
	index : "mock",
	type : "patient",
	//query : {match}
	body : {
		query : {
			bool : {
				must : [
					{term : {gender : "male"} },
					{range: 
						{dob : {"gte" : "2000-01-01"} }	}
				]
			}
		}
	}
}
*/