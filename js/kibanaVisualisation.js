var insertKibanaGraph = function(sourceQuery) {
	
	var	patientId = sourceQuery.body.query.bool.must[0].term.patientid;
	var	startDate = new Date(sourceQuery.body.query.bool.must[1].range.documenttimestamp.gte).toISOString();
	var	endDate = new Date(sourceQuery.body.query.bool.must[1].range.documenttimestamp.lte).toISOString();


	var indexPattern = "templog*";
	var toggleStatus = $("#kibanaVisualisationSwitch").bootstrapSwitch("state");

	if(!toggleStatus) { //todo remove?
		$("#kibanaVisualisationSwitch").bootstrapSwitch("disabled", true) // once it was disabled you can't enable it by mistake
	}

	console.log(toggleStatus)
	$("#kibanaGraph").html("<p><h1>"+toggleStatus+"</h1></p>");
	// Embeded:

	var searchQuery = "patientid:" + patientId;

	var dynamicGraph = '<iframe src ="http://localhost:5601/app/kibana#/visualize/create?embed=true&type=histogram&indexPattern=turbolaser*&_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:';
	dynamicGraph += "'" + startDate + "'"
	dynamicGraph += ",mode:absolute,to:"
	dynamicGraph += "'" + endDate + "'";
	dynamicGraph += "))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'";
	dynamicGraph += searchQuery + "')),uiState:(vis:(legendOpen:!f)),vis:(aggs:!((id:'1',params:(),schema:metric,type:count),(id:'2',params:(customInterval:'2h',extended_bounds:(),field:documenttimestamp,interval:auto,min_doc_count:1),schema:segment,type:date_histogram)),listeners:(),params:(addLegend:!t,addTimeMarker:!f,addTooltip:!t,defaultYExtents:!f,mode:stacked,scale:linear,setYExtents:!f,shareYAxis:!t,times:!(),yAxis:()),title:'New%20Visualization',type:histogram))";
	dynamicGraph += '" height="300" width="800"></iframe>';

	console.log(dynamicGraph)
	windowWidth = $(window).width()
	console.log(windowWidth)
	if(toggleStatus && windowWidth >= 900) { // no point in embeding kibana while it would have been hidden + not enough space
		$("#kibanaGraph").html(dynamicGraph);
	}

}
