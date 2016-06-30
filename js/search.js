
var url = "http://timeline-silverash.rhcloud.com";

var client = new $.es.Client({
	host: url,
	log: "info"
});


function searchForEntries(searchParams) {
	showLoading();
	client.search(searchParams).then(function(response) {
		processResults(response.hits.hits);
		hideLoading();
	}, function(jqXHR, textStatus, errorThrown) {
		if(debug) {
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
}

function startSearch() {
	clearTimeline();
	var searchParams = prepareSearchData();
	if(searchParams) {
		$(".timelineContainer").show();
		searchForEntries(searchParams);	
	}
}

function getPatientID() {
	var patientID = $('#patientID').val();
	if(!patientID){
		$("#patientIDBox").removeClass("form-group").addClass("form-group has-error has-feedback");
    	$("#patientIDSpan").addClass("glyphicon glyphicon-remove form-control-feedback");
		return false;
	}
	else {
		$("#patientIDBox").removeClass("form-group has-error has-feedback").addClass("form-group");
		$('#patientIDSpan').removeClass("glyphicon glyphicon-remove form-control-feedback");
    }
    return patientID;
}

function prepareSearchData() {
	var patientID = getPatientID();
	if(!patientID)
		return false;

	var startDate = $('#datePickerFrom').data('date');
	var endDate = $('#datePickerTo').data('date');
	var resultsPerPage = $('#numberResults').val();

	var containingKeywords = "";
	if($('#containingKeywords').val())
		containingKeywords = $('#containingKeywords').val();

	var searchProperties = prepareSearchJSON(patientID, resultsPerPage, startDate, endDate, containingKeywords)
	return searchProperties;
}


function prepareSearchJSON(patientID, resultsPerPage, startDate, endDate, containingKeywords) {
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
			sort : {"created" : {order : "desc"}},
			query : {
				bool : {
					must : [
						{term : {brcid : patientID} },
						{range:	{
							created : {
								"gte" : startDate,
								"lte" : endDate
							}
						 }	
					   },
					],
				}
			}
		}
	}

	if(containingKeywords)
		searchParams.body.query.bool.must.push({ match: {"_all" : containingKeywords}})

	return searchParams;
}