
var logESClient = new $.es.Client({
	host: elasticSearchLogURL,
	log: "info"
});


var sendLogToElasticSearch = function(estype, data) {
	logESClient.create({
		index : 'templogindex',
		type : estype,
		body : data
	}, function (error, response) {
		console.log(error);
		console.log(response);
	});
}

// logs query information
var logQueryData = function(sourceQuery) {
	queryData = {
		queryTimestamp : new Date().getTime(),
		patientId : sourceQuery.body.query.bool.must[0].term.patientid,
		startDate : sourceQuery.body.query.bool.must[1].range.documenttimestamp.gte,
		endDate : sourceQuery.body.query.bool.must[1].range.documenttimestamp.lte,
		resultsPerPage : sourceQuery.size - 1,
		keywords : null,
	};

	// checks if any search keywords exist in the original query data
	if (sourceQuery.body.query.bool.must[2] !== undefined && sourceQuery.body.query.bool.must[2] !== null) 
		queryData.keywords = sourceQuery.body.query.bool.must[2].match._all;

	sendLogToElasticSearch('query_log', queryData);
}

// logs user browser and os details
var logSessionInfo = function() {
	var sysInfo = $.pgwBrowser();
	sessionInfo = {
		sessionTimestamp : new Date().getTime(),
		browser : sysInfo.browser,
		OS : sysInfo.os,
	}
	sendLogToElasticSearch('session_log', sessionInfo)
}

var logContentView = function(estype, documentId) {
	viewInfo = {
		viewTimestamp : new Date().getTime(),
		documentid : documentId
	}
	sendLogToElasticSearch(estype, viewInfo)
}

var logDocumentDownload = function(documentId) {
	logContentView('doc_download_log', documentId);
}


var logThumbnailView = function(documentId) {
	logContentView('thumbnail_view_log', documentId);
}



