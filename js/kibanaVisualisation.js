var prepareKibanaGraph = function (patientId, freeTextSearch, startDate, endDate) {
    var indexPattern = KIBANA_INDEX_PATTERN;

    var dateFieldName = ES_TIME_FIELD;
    var searchQuery = ES_PATIENT_ID_FIELD + ":" + patientId; // possibly search by more fields

    if (freeTextSearch) {
        searchQuery += encodeURI(' AND ' + freeTextSearch);
    }

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
    dynamicGraph += ",interval:auto,min_doc_count:1),schema:segment,type:date_histogram)),listeners:(),params:(addLegend:!t,addTimeMarker:!f,addTooltip:!t,defaultYExtents:!f,mode:stacked,scale:linear,setYExtents:!f,shareYAxis:!t,times:!(),yAxis:()),title:'Document%20Distribution',type:histogram))";
    dynamicGraph += '" height="300" width="600"></iframe>';

    return dynamicGraph;
};

var insertKibanaGraph = function (sourceQuery) {
    var patientId = sourceQuery.body.query.bool.must[0].term[ES_PATIENT_ID_FIELD];
    var startDate = new Date(sourceQuery.body.query.bool.must[1].range[ES_TIME_FIELD].gte).toISOString();
    var endDate = new Date(sourceQuery.body.query.bool.must[1].range[ES_TIME_FIELD].lte).toISOString();

    var freeTextSearch = null;
    // it has to have patientId, and date range, if it has extra attribute it means there is a free text search
    if (sourceQuery.body.query.bool.must.length === 3) {
        freeTextSearch = sourceQuery.body.query.bool.must[2].query_string.query;
    }

    var toggleStatus = $("#kibanaVisualisationSwitch").bootstrapSwitch("state");

    var windowWidth = $(window).width();
    if (toggleStatus && windowWidth >= MAX_KIBANA_WIDTH) { // no point in embedding kibana while it would have been hidden -> won't be displayed on most mobile phones but should be displayed on most of tablets
        var dynamicGraph = prepareKibanaGraph(patientId, freeTextSearch, startDate, endDate);
        $("#kibanaGraph").html(dynamicGraph);
    }
};