$(document).ready(function() {
	doSetup();
});

function doSetup() {
	$('#datePickerFrom').datetimepicker({
		viewMode: 'years',
		format: 'DD/MM/YYYY',
		useCurrent: false
	});
	$('#datePickerTo').datetimepicker({
		viewMode: 'years',
		format: 'DD/MM/YYYY',
	    defaultDate : new Date(),
	    maxDate: new Date() 
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


	if(startDate) {
		var splitStartDate = startDate.split("/");
		startDate = splitStartDate[2]+"-"+splitStartDate[1]+"-"+splitStartDate[0];
	}
	if(endDate) {
		var splitEndDate = endDate.split("/");
		endDate = splitEndDate[2]+"-"+splitEndDate[1]+"-"+splitEndDate[0];
	}

	console.log(startDate);
	console.log(endDate);

	var searchParams = {
		size : numberOfResults,
		index : "mock",
		type : "patient",
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
					}]
				}
			}
		}
	}

	searchData(searchParams);

}





var url = "http://timeline-silverash.rhcloud.com";

var client = new $.es.Client({
	host: url,
	log: "info"
});

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

function searchData(searchParams) {
	client.search(searchParams).then(function(response) {
		console.log(response.hits.hits)
	}, function(jqXHR, textStatus, errorThrown) {
		console.log(textStatus);
		console.log(errorThrown);
	});
}



/*
client.ping({
  requestTimeout: 30000,

  // undocumented params are appended to the query string
  hello: "elasticsearch"
}, function (error) {
  if (error) {
    console.error('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});


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