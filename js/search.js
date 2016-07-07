/**
 * @file Script file responsible for controlling search behaviour of the application
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev 
 */

/**Variable specifying the address of the ElasticSearch server*/
//var url = "http://timeline-silverash.rhcloud.com";
var url = "http://192.168.99.47:9200";

/**ElasticSearch client definition*/
var client = new $.es.Client({
	host: url,
	log: "info"
});

/**
 * Function responsible for querying the ElasticSearch server. It uses the provided ElasticSearch library for JavaScript to wrap AJAX functionalities
 * @param {Object} searchParams Object specifying query properties formatted in a way required by the ElasticSearch engine.
 */
var searchForEntries = function(searchParams) {
	showLoading();
	client.search(searchParams).then(function(response) {
		setPagination(parseInt(searchParams.size) - 1, searchParams.from, response.hits.hits.length)
		processResults(response.hits.hits, searchParams.size);
	}, function(jqXHR, textStatus, errorThrown) {
		if(debug) {
			console.log(textStatus);
			console.log(errorThrown);
		}
	});
	hideLoading();
}

/** 
 * Function initialising the search. If there are no valid search parameters, it does not commence the actual search.
 */
var startSearch = function(startingIndex) {
	startingIndex = typeof startingIndex !== "undefined" ? startingIndex : 0;
	clearTimeline();
	var searchParams = prepareSearchData(startingIndex);
	if(searchParams) {
		$(".paginationContainer").show();
		searchForEntries(searchParams);	
	}
}

/** 
 * Wrapper for getting the ID of the patient which is inputted in the appropriate box.
 * If its value is empty, it displays an error in the box
 * @returns {Boolean|String} patientID (String) or false (Boolean) if it is empty
 */
var getPatientID = function() {
	var patientID = $("#patientID").val();
	if(!patientID){
		$("#patientIDBox").removeClass("form-group").addClass("form-group has-error has-feedback");
    	$("#patientIDSpan").addClass("glyphicon glyphicon-remove form-control-feedback");
		return false;
	}
	else {
		$("#patientIDBox").removeClass("form-group has-error has-feedback").addClass("form-group");
		$("#patientIDSpan").removeClass("glyphicon glyphicon-remove form-control-feedback");
    }
    return patientID;
}

/**
 * Gets all the information from the form regarding the search conditions and passes it to prepareESObject function to create the related object
 * @returns {Boolean|Object} Object with search properties (Object) or false (Boolean) if getPatientID() failed to get any data
 */
var prepareSearchData = function(startingIndex) {
	startingIndex = typeof startingIndex !== "undefined" ? startingIndex : 0;
	var patientID = getPatientID();
	if(!patientID)
		return false;

	var startDate = $("#datePickerFrom").data("date");
	var endDate = $("#datePickerTo").data("date");
	var resultsPerPage = $("#numberResults").val();

	var containingKeywords = "";
	if($("#containingKeywords").val())
		containingKeywords = $("#containingKeywords").val();

	var searchProperties = prepareESObject(patientID, resultsPerPage, startingIndex, startDate, endDate, containingKeywords)
	return searchProperties;
}


/**
 * Creates query Object that is understood by the ElasticSearch Engine to query for the related data
 * @param {String} patientID ID of the patient being querried 
 * @param {Number} resultsPerPage number of results to display per page
 * @param {String} startDate starting date from which the documents should be fetched
 * @param {String} endDate finishing date until which the documents should be fetched
 * @param {String} containingKeywords keywords that must be included in any field in the documents
 * @returns {Object} Object specyfing query properties
 */
var prepareESObject = function(patientID, resultsPerPage, startingIndex, startDate, endDate, containingKeywords) {
	startDate = new Date(startDate).getTime();
	endDate = new Date(endDate).getTime();

	if(debug) {
		console.log(startDate);
		console.log(endDate);
		console.log(containingKeywords);
	}

	var searchParams = {
		size : parseInt(resultsPerPage) + 1, // temp
		from : startingIndex,
		index : "time2016", //temp
		type : "doc", //temp
		body : {
			sort : {"timestamp" : {order : "desc"}},
			query : {
				bool : {
					must : [
						//{term : {patientId : patientID} },
						{range:	{
							timestamp : {
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

	// adds to the search conditions match for the keywords if the user inputted any. Otherwise this field is ignored
	if(containingKeywords)
		searchParams.body.query.bool.must.push({ match: {"_all" : containingKeywords}})

	return searchParams;
}