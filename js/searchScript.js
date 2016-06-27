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
		// minDate : new Date("1-1-1970"),
		maxDate : new Date()
	});
	$('#datePickerTo').datetimepicker({
		viewMode: 'years',
		format: 'YYYY-MM-DD',
	    defaultDate : new Date(),
		// minDate : new Date("1-1-1970"),
	    maxDate: new Date() 
	});
	$("#containingKeywords").on("keydown", function(e){
		if (e.keyCode == 13) {
			e.preventDefault();
			$("#searchButton").click();
		}
	});
}

$("#datePickerFrom").on("dp.change", function (e) {
    $('#datePickerTo').data("DateTimePicker").minDate(e.date);
});

$("#datePickerTo").on("dp.change", function (e) {
    $('#datePickerFrom').data("DateTimePicker").maxDate(e.date);
});



function startSearch() {
	testCollapse();
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

function parseResult(searchResult) {
	if(debug) 
		console.log(searchResult);

	$.each(searchResult, function(index, value){
 		var testString = "<h3>"+new Date(value._source.created).toISOString().substring(0, 10)+"</h3> <p>"+value._source.text+"</p>"; 
 		$("#test_collapse2").append(testString);
	});


}

function testCollapse() {
		$("#test_collapse").collapse("toggle");
}


function searchData(searchParams) {
	client.search(searchParams).then(function(response) {
		parseResult(response.hits.hits);
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