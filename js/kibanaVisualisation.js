var prepareKibanaGraph = function(patientId, startDate, endDate) {
	//TODO: UPDATE THOSE WHEN ON TARGET MACHINE/SERVER
	var indexPattern = "turbolaser*"; 
	var dateFieldName = "documenttimestamp";
	var searchQuery = "patientid:" + patientId; // possibly search by more fields

	var dynamicGraph = '<iframe src ="'
	dynamicGraph += kibanaURL;
	dynamicGraph += '/app/kibana#/visualize/create?embed=true&type=histogram&indexPattern=';
	dynamicGraph += indexPattern;
	dynamicGraph += '&_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:';
	dynamicGraph += "'" + startDate + "'";
	dynamicGraph += ",mode:absolute,to:"
	dynamicGraph += "'" + endDate + "'";
	dynamicGraph += "))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:";
	dynamicGraph += "'" + searchQuery + "'";
	dynamicGraph += ")),uiState:(vis:(legendOpen:!f)),vis:(aggs:!((id:'1',params:(),schema:metric,type:count),(id:'2',params:(customInterval:'2h',extended_bounds:(),field:";
	dynamicGraph += dateFieldName;

	// TODO: CHANGE NAME(make it unique somehow) IF WON'T WORK CONCURRENTLY, I.E. ANOTHER SESSION OVERWRITES PREVIOUS GRAPH (use guid generation):
	dynamicGraph += ",interval:auto,min_doc_count:1),schema:segment,type:date_histogram)),listeners:(),params:(addLegend:!t,addTimeMarker:!f,addTooltip:!t,defaultYExtents:!f,mode:stacked,scale:linear,setYExtents:!f,shareYAxis:!t,times:!(),yAxis:()),title:'Document%20Distribution',type:histogram))";
	dynamicGraph += '" height="300" width="600"></iframe>';

	return dynamicGraph;
}

var insertKibanaGraph = function(sourceQuery) {
	
	var	patientId = sourceQuery.body.query.bool.must[0].term.patientid;
	var	startDate = new Date(sourceQuery.body.query.bool.must[1].range.documenttimestamp.gte).toISOString();
	var	endDate = new Date(sourceQuery.body.query.bool.must[1].range.documenttimestamp.lte).toISOString();

	var toggleStatus = $("#kibanaVisualisationSwitch").bootstrapSwitch("state");

	windowWidth = $(window).width();
	if(toggleStatus && windowWidth >= MAX_KIBANA_WIDTH) { // no point in embeding kibana while it would have been hidden -> won't be displayed on most mobile phones but should be displayed on most of tablets
		var dynamicGraph = prepareKibanaGraph(patientId, startDate, endDate);
		$("#kibanaGraph").html(dynamicGraph);
	}
}