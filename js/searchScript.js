$(document).ready(function() {
	doSetup();
});

function doSetup() {
	$('#datePickerFrom').datetimepicker({
		viewMode: 'years',
		format: 'DD/MM/YYYY',
		useCurrent: false,
		maxDate : new Date()
	});
	$('#datePickerTo').datetimepicker({
		viewMode: 'years',
		format: 'DD/MM/YYYY',
	    defaultDate : new Date(),
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



function startSearch()
{
	prepareSearchData();
}


function prepareSearchData()
{
	var startDate = $('#datePickerFrom').data('date');
	var endDate = $('#datePickerTo').data('date');
	var numberOfResults = $('#numberResults').val();

	var containingKeywords = "";
	console.log(containingKeywords);

	if(startDate) {
		var splitStartDate = startDate.split("/");
		startDate = splitStartDate[2]+"-"+splitStartDate[1]+"-"+splitStartDate[0];
	}
	else
		return;

	if(endDate) {
		var splitEndDate = endDate.split("/");
		endDate = splitEndDate[2]+"-"+splitEndDate[1]+"-"+splitEndDate[0];
	}
	else
		return;

	if($('#containingKeywords').val())
		containingKeywords = $('#containingKeywords').val();


	console.log(startDate);
	console.log(endDate);

	var searchParams = {
		size : numberOfResults, // temp
		index : "mock", // temp
		type : "patient", //temp
		body : {
			query : {
				bool : {
					must : [{
						//{term : {gender : "male"} },
						range:	{
							dob : {
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

	var results = searchData(searchParams);
	console.log(results)
}



var url = "http://timeline-silverash.rhcloud.com";

var client = new $.es.Client({
	host: url,
	log: "info"
});



function searchData(searchParams) {
	// $("#test_collapse").collapse("hide");
	client.search(searchParams).then(function(response) {
		console.log(response.hits.hits)
		return response.hits.hits;
	}, function(jqXHR, textStatus, errorThrown) {
		console.log(textStatus);
		console.log(errorThrown);
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