/**
 * @file Script file controlling all features related to data logging or feedback mechanisms
 * @author Jedrzej Stuczynski
 */


/**
 * Definition of a new ElasticSearch client; This ES instance is going to be used for receiving all log data
 */
var logESClient = new $.es.Client({
    host: elasticSearchLogURL,
    log: "info"
});

/**
 * Wrapper method for that given JSON data and index type, sends it the ES instance
 * @param {String} estype defines the ES type inside the index to which the data is sent
 * @param {Object} data JSON Object containing the log data for ES instance
 */
var sendLogToElasticSearch = function (estype, data) {
    if (!logging) {
        return;
    }
    logESClient.create({
        index: 'templogindex',
        type: estype,
        id: generateGUID(), // after updating the elasticsearch api library, this field became mandatory
        body: data
    }, function (error, response) {
        console.log(error);
        console.log(response);
    });
};

/**
 * Method that logs the data regarding query (as well as its timestamp) that was sent to the main ES instance
 * @param {Object} sourceQuery JSON Object containing query that was sent to the main ES instance
 */
var logQueryData = function (sourceQuery) {
    if (!logging) {
        return;
    }

    // TODO: UPDATE WITH VARIABLE FIELD NAMES
    queryData = {
        date: new Date().getTime(),
        patientId: sourceQuery.body.query.bool.must[0].term.patientid,
        startDate: sourceQuery.body.query.bool.must[1].range.documenttimestamp.gte,
        endDate: sourceQuery.body.query.bool.must[1].range.documenttimestamp.lte,
        resultsPerPage: sourceQuery.size - 1,
        keywords: null,
    };

    // checks if any search keywords exist in the original query data


    if (sourceQuery.body.query.bool.must[2] !== undefined && sourceQuery.body.query.bool.must[2] !== null) {
        queryData.keywords = sourceQuery.body.query.bool.must[2].query_string.query;
    }

    sendLogToElasticSearch('query_log', queryData);
};

/**
 * Method that is fired upon application start. It logs all information regarding browser as well as OS used.
 * In many cases the result will be the same, however, this might be useful in the future.
 */
var logSessionInfo = function () {
    if (!logging) {
        return;
    }
    var sysInfo = $.pgwBrowser();
    sessionInfo = {
        date: new Date().getTime(),
        browser: sysInfo.browser,
        OS: sysInfo.os,
    };
    sendLogToElasticSearch('session_log', sessionInfo);
};


/**
 * Wrapper method for logging data regarding viewing documents or thumbnails
 * @param {String} estype defines the ES type inside the index to which the data is sent
 * @param {Number} documentId specifies the id of given document/thumbnail that was viewed
 */
var logContentView = function (estype, documentId) {
    if (!logging) {
        return;
    }
    viewInfo = {
        date: new Date().getTime(),
        documentid: documentId
    };
    sendLogToElasticSearch(estype, viewInfo);
};

/**
 * Method that logs the data regarding document downloads
 * @param {Number} documentId specifies the id of given document that was downloaded
 */
var logDocumentDownload = function (documentId) {
    logContentView('doc_download_log', documentId);
};

/**
 * Method that logs the data regarding thumbnail views
 * @param {Number} documentId specifies the id of given thumbnail that was viewed
 */
var logThumbnailView = function (documentId) {
    logContentView('thumbnail_view_log', documentId);
};

/**
 * Setups listeners on the 'Report problem' and 'send feedback' buttons to act appropriately.
 * Code for that part was adapted from the previous version written by Ismail Kartoglu;
 * The original implementation was left untouched, i.e. it still uses jqmWindow, but structure of data was adjusted
 */
var setupFeedbackMechanism = function () {
    $("#feedback-button").click(function () {
        var $feedbackDialog = $("#feedback-dialog");
        $feedbackDialog.jqm({
            modal: true
        });
        $feedbackDialog.jqmShow();
        $("#send-feedback-button").prop("disabled", false);
        $("#feedback-response").html("");
    });

    // Close the window on escape button
    $(".jqmWindow").on("keydown", function (e) {
        if (e.keyCode == 27) {
            e.preventDefault();
            $(".jqmWindow").jqmHide();
        }
    });


    $("#send-feedback-button").click(function () {
        var request = [];

        var containingKeywords = $("#containingKeywords").val();
        var patientId = $("#patientID").val();
        var startDate = $("#datePickerFrom").data("date");
        var endDate = $("#datePickerTo").data("date");

        request.push({
            "feedbackTimestamp": new Date().getTime(),
            "patientId": patientId,
            "startDate": startDate,
            "endDate": endDate,
            "containingKeywords": containingKeywords,
        });

        var $questions = $(".questionnaire");
        $questions.each(function () {
            var $question = $(this);
            var $p = $question.find("p");
            var question = $p.html();
            var $textarea = $question.find("textarea");
            var answer = $textarea.val();

            request.push({
                "question": question,
                "answer": answer,
            });
        });

        $("#feedback-response").html("<b>Please wait...</b>");
        $("#send-feedback-button").prop("disabled", true);

        if (debug) {
            console.log("#####");
            console.log("Feedback request: ");
            console.log(request);
            console.log("#####");
        }

        // "converts" to a proper JSON
        request = {
            "feedback": request
        };

        //TODO: send to ES instance instead?
        $.ajax({
            type: "POST",
            url: feedbackURL, // specified in config.js
            dataType: "text/plain",
            contentType: 'application/json',
            data: request,

        })
            .complete(function (response) {
                if (response.status === 200) {
                    $("#feedback-response").html('<b>We have received your feedback, thank you!</b>');
                }
                else {
                    $("#feedback-response").html('<b>There was an issue when sending your request. If this problem persists, please contact us via email.</b>');
                }
            });
    });
};
