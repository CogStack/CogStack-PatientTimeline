
var tempLogESClient = new $.es.Client({
	host: "http://localhost:9200",
	log: "info"
});


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

	if (sourceQuery.body.query.bool.must[2] !== undefined && sourceQuery.body.query.bool.must[2] !== null) 
		queryData.keywords = sourceQuery.body.query.bool.must[2].match._all;

	tempLogESClient.create({
		index : 'templogindex',
		type: 'temp_log',
		queryData
	}, function (error, response) {
		console.log(error);
		console.log(response);
	});
}

var logSessionInfo = function() {
	console.log("test")
}

var logDocumentDownload = function() {

}

var logThumbnailView = function() {
	
}