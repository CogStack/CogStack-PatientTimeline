var prepareKibanaGraph = function (patientId, startDate, endDate) {
    //TODO: UPDATE THOSE WHEN ON TARGET MACHINE/SERVER
    var indexPattern = ES_INDEX + "*";

    // special case for mimic data
    indexPattern = "mim*";

    var dateFieldName = ES_TIME_FIELD;
    var searchQuery = ES_PATIENT_ID_FIELD + ":" + patientId; // possibly search by more fields

    //TODO: insert into search query keywords

    var dynamicGraph = '<iframe src ="';
    dynamicGraph += kibanaURL;
    dynamicGraph += '/app/kibana#/visualize/create?embed=true&type=histogram&indexPattern=';
    dynamicGraph += indexPattern;
    dynamicGraph += '&_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:';
    dynamicGraph += "'" + startDate + "'";
    dynamicGraph += ",mode:absolute,to:";
    dynamicGraph += "'" + endDate + "'";
    dynamicGraph += "))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:";
    dynamicGraph += "'" + searchQuery + "'";
    dynamicGraph += ")),uiState:(vis:(legendOpen:!f)),vis:(aggs:!((id:'1',params:(),schema:metric,type:count),(id:'2',params:(customInterval:'2h',customLabel:'Start%20of%20Interval',extended_bounds:(),field:";
    dynamicGraph += dateFieldName;

    //todo: possibly unique name for each graph, not sure if needed at this point
    dynamicGraph += ",interval:auto,min_doc_count:1),schema:segment,type:date_histogram)),listeners:(),params:(addLegend:!t,addTimeMarker:!f,addTooltip:!t,defaultYExtents:!f,mode:stacked,scale:linear,setYExtents:!f,shareYAxis:!t,times:!(),yAxis:()),title:'Document%20Distribution',type:histogram))";
    dynamicGraph += '" height="300" width="600"></iframe>';

    console.log(dynamicGraph);
    return dynamicGraph;
};

var insertKibanaGraph = function (sourceQuery) {
    var patientId = sourceQuery.body.query.bool.must[0].term[ES_PATIENT_ID_FIELD];
    var startDate = new Date(sourceQuery.body.query.bool.must[1].range[ES_TIME_FIELD].gte).toISOString();
    var endDate = new Date(sourceQuery.body.query.bool.must[1].range[ES_TIME_FIELD].lte).toISOString();

    var toggleStatus = $("#kibanaVisualisationSwitch").bootstrapSwitch("state");

    var windowWidth = $(window).width();
    if (toggleStatus && windowWidth >= MAX_KIBANA_WIDTH) { // no point in embeding kibana while it would have been hidden -> won't be displayed on most mobile phones but should be displayed on most of tablets
        var dynamicGraph = prepareKibanaGraph(patientId, startDate, endDate);
        $("#kibanaGraph").html(dynamicGraph);
    }
};