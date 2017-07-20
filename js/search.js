/**
 * @file Script file responsible for controlling search behaviour of the application
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev
 */

/**ElasticSearch client definition*/
var client = new $.es.Client({
    host: elasticSearchURL,
    log: "info",
    apiVersion: ES_VERSION

    // For SSL this object has to be modified according to https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/configuration.html


});

/**
 * Function responsible for querying the ElasticSearch server. It uses the provided ElasticSearch library for JavaScript to wrap AJAX functionalities
 * @param {Object} searchParams Object specifying query properties formatted in a way required by the ElasticSearch engine.
 * @param {boolean} isFirstSearch boolean specifying whether
 */
var searchForEntries = function (searchParams, isFirstSearch) {
    isFirstSearch = typeof isFirstSearch !== "undefined" ? isFirstSearch : false; // to prevent undefined behaviour

    console.log("search", searchParams);
    showLoading();
    logQueryData(searchParams);
    client.search(searchParams).then(function (response) {
        setPagination(parseInt(searchParams.size) - 1, searchParams.from, response.hits.hits.length);
        processResults(response.hits.hits, searchParams.size);
        if (isFirstSearch) { // so after page change it wouldn't reload the graph
            insertKibanaGraph(searchParams);
        }
    }, function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
        if (debug) {
            console.log("#####");
            console.log("Search error: ");
            console.log(textStatus);
            console.log(errorThrown);
            console.log("#####");
        }
    });
    hideLoading();
};

/**
 * Function initialising the search. If there are no valid search parameters, it does not commence the actual search.
 */
var startSearch = function (startingIndex, isFirstSearch) {
    startingIndex = typeof startingIndex !== "undefined" ? startingIndex : 0;
    clearTimeline();
    var searchParams = prepareSearchData(startingIndex);
    if (searchParams) {
        $(".paginationContainer").show();
        searchForEntries(searchParams, isFirstSearch);
    }
};

/**
 * Wrapper for getting the ID of the patient which is inputted in the appropriate box.
 * If its value is empty, it displays an error in the box
 * @returns {Boolean|String} patientID (String) or false (Boolean) if it is empty
 */

    //TO BE UPDATED WHEN APP IS LAUNCHED FROM EPJS
var getPatientID = function () {
        var patientID = $("#patientID").val();
        if (!patientID) {
            $("#patientIDBox").removeClass("form-group").addClass("form-group has-error has-feedback");
            $("#patientIDSpan").addClass("glyphicon glyphicon-remove form-control-feedback");
            return false;
        }
        else {
            $("#patientIDBox").removeClass("form-group has-error has-feedback").addClass("form-group");
            $("#patientIDSpan").removeClass("glyphicon glyphicon-remove form-control-feedback");
        }
        return patientID;
    };

/**
 * Gets all the information from the form regarding the search conditions and passes it to prepareESObject function to create the related object
 * @returns {Boolean|Object} Object with search properties (Object) or false (Boolean) if getPatientID() failed to get any data
 */
var prepareSearchData = function (startingIndex) {
    startingIndex = typeof startingIndex !== "undefined" ? startingIndex : 0;
    var patientID = getPatientID();
    if (!patientID)
        return false;

    var startDate = $("#datePickerFrom").data("date");
    var endDate = $("#datePickerTo").data("date");
    var resultsPerPage = $("#numberResults").val();

    var containingKeywords = "";
    var containingKeywordsHandle = $("#containingKeywords");
    if (containingKeywordsHandle.val()) {
        containingKeywords = containingKeywordsHandle.val();
        if (containingKeywords.charAt(0) !== '"') {
            containingKeywords = '"' + containingKeywords;
        }

        if (containingKeywords.substr(-1) !== '"') {
            containingKeywords = containingKeywords + '"';
        }
    }
    return prepareESObject(patientID, resultsPerPage, startingIndex, startDate, endDate, containingKeywords);
};


/**
 * Creates query Object that is understood by the ElasticSearch Engine to query for the related data
 * @param {String} patientID ID of the patient being querried
 * @param {Number} resultsPerPage number of results to display per page
 * @param {Number} startingIndex starting index of the search
 * @param {String} startDate starting date from which the documents should be fetched
 * @param {String} endDate finishing date until which the documents should be fetched
 * @param {String} containingKeywords keywords that must be included in any field in the documents
 * @returns {Object} Object specyfing query properties
 */
var prepareESObject = function (patientID, resultsPerPage, startingIndex, startDate, endDate, containingKeywords) {
    startDate = new Date(startDate).getTime();
    endDate = new Date(endDate).getTime();

    if (debug) {
        console.log("#####");
        console.log("Start Date: ");
        console.log(startDate);
        console.log("End Date: ");
        console.log(endDate);
        console.log("Containing Keywords: ");
        console.log(containingKeywords);
        console.log("#####");
    }

    var searchParams = {
        "size": parseInt(resultsPerPage) + 1, // temp
        "from": startingIndex,
        "index": ES_INDEX,
        "type": ES_TYPE,
        "body": {
            // 		"sort" : {ES_TIME_FIELD : {"order" : "desc"}},
            "query": {
                "bool": {
                    "must": [
                        // {"term" : {ES_PATIENT_ID_FIELD : patientID} },
                        // {"range":	{
                        //     ES_TIME_FIELD : {
                        //         "gte" : startDate,
                        //         "lte" : endDate
                        //     }
                        // }
                        // },
                        // {"query_string" : {
                        //     "query" : ""
                        // }
                        //
                        // }
                    ]
                }
            }
        }
    };


    var sortObject = {};
    sortObject[ES_TIME_FIELD] = {"order": "desc"};
    searchParams.body["sort"] = sortObject;

    var tmp_matchPatientIDObject = {};
    tmp_matchPatientIDObject[ES_PATIENT_ID_FIELD] = patientID;
    var matchPatientIDObject = {};
    matchPatientIDObject["term"] = tmp_matchPatientIDObject;
    searchParams.body.query.bool.must.push(matchPatientIDObject);

    var tmp_timeRangeObject = {};
    tmp_timeRangeObject[ES_TIME_FIELD] = {
        "gte": startDate,
        "lte": endDate
    };

    var timeRangeObject = {};
    timeRangeObject["range"] = tmp_timeRangeObject;
    searchParams.body.query.bool.must.push(timeRangeObject);

    //
    // var searchParams = {
    // 	"size" : parseInt(resultsPerPage) + 1, // temp
    // 	"from" : startingIndex,
    // 	"index" : ES_INDEX,
    // 	"type" : ES_TYPE,
    // 	"body" : {
    // 		"sort" : {ES_TIME_FIELD : {"order" : "desc"}},
    // 		"query" : {
    // 			"bool" : {
    // 				"must" : [
    // 					{"term" : {ES_PATIENT_ID_FIELD : patientID} },
    // 					{"range":	{
    //                        ES_TIME_FIELD : {
    // 							"gte" : startDate,
    // 							"lte" : endDate
    // 						}
    // 					 }
    // 				   },
    // 				   {"query_string" : {
    // 				   		"query" : ""
    // 				   	}
    //
    // 				   }
    // 				]
    // 			}
    // 		}
    // 	}
    // };

    // adds to the search conditions match for the keywords if the user inputted any. Otherwise this field is ignored
    if (containingKeywords) {
        var keywordsSearchObject = {"query_string": {"query": containingKeywords}};
        searchParams.body.query.bool.must.push(keywordsSearchObject);
    }
    // 	searchParams.body.query.bool.must[2].query_string.query = containingKeywords;
    // }
    // else {
    // 	searchParams.body.query.bool.must.splice(2,1);
    // 	// searchParams.body.query.bool.must.push({ match: {"query_string" : {"query" : containingKeywords}}})
    // }
    //
    return searchParams;
};
