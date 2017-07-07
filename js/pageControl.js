/**
 * @file Script file responsible for controlling main behaviour of the application
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev
 */

/**
 * Fired when the document is finished loading.
 * Responsible for settng initial components, such as hiding the timeline, collapse button, etc.
 * @function "$(document).ready"
 */
$(document).ready(function () {
    // Doesn't complete load if user uses IE8 or older
    var checkIE = checkBrowser();
    if (checkIE)
        return;

    $("#waitMessage").delay(100).fadeOut();

    $.support.cors = true;
    setFormProperties();
    $(".paginationContainer").hide();

    // Listener required by the lightbox library
    $(document).delegate("*[data-toggle='lightbox']", "click", function (event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });

    // Resizes all thumbnails on slider change
    $("#thumbnailSizeSlider").on("change", function () {
        var thumbIconHandles = $("[id^=" + "thumbIcon" + "]");
        $.each(thumbIconHandles, function (index, img) {
            $(img).load();
        });
    });

    $("#kibanaVisualisationSwitch").on("switchChange.bootstrapSwitch", function (event, state) {
        if (state) {
            $("#kibanaGraph").show();
        }
        else {
            $("#kibanaGraph").hide();
        }
    });

    // Starts search on button click
    $("#searchButton").on("click", function (e) {
        e.preventDefault();
        startSearch(void 0, true);
    });

    // Collapses all entries on button click
    $("#collapseButton").on("click", function (e) {
        e.preventDefault();
        toggleCollapse();
    });

    // Listener for the next-page button
    $("#nextPage").on("click", function (e) {
        e.preventDefault();
        if (!($(this).hasClass("disabled")))
            changePage.nextPage();
    });

    // Listener for the next-page button
    $("#prevPage").on("click", function (e) {
        e.preventDefault();
        if (!($(this).hasClass("disabled")))
            changePage.previousPage();
    });

    // Moves between documents on arrow up and arrow down
    $(document).on("keyup", function (e) {
        if (e.which == 38) {
            e.preventDefault();
            scrollOneUp();
        }
        if (e.which == 40) {
            e.preventDefault();
            scrollOneDown()
        }
    });


    setupFeedbackMechanism(); //In logging.js
    $('[data-toggle="tooltip"]').tooltip();

    logSessionInfo();
});

/**
 * Checks if user is using old version of Internet Explorer
 * @returns {Boolean} determines if user is using Internet Explorer
 */
var checkBrowser = function () {

    /**Code for checking if IE 11 or below: */
        // var ms_ie = false;
        // var ua = window.navigator.userAgent;
        // var old_ie = ua.indexOf('MSIE '); FOR IE10 and less
        // var new_ie = ua.indexOf('Trident/'); // FOR IE11

        // if((old_ie > -1) || (new_ie > -1)) {
        // 	ms_ie = true;
        // }
    var ms_ie = !-[1,]; // this hack detects if browser is IE5, 6, 7 or 8. It was fixed in IE9 and above. Explanation on how it works: http://stackoverflow.com/questions/5574842/

    if (ms_ie) {
        $(".pwmodal-container").text("Sorry, this application does not support Microsoft Internet Explorer 8 or below. This application is best viewed on Chrome, Firefox, MS Edge or Safari.");
        $(".uil-default-css").remove();
        showLoading();
        return true;
    }
};

/**
 * Function called by $(document).ready. It is responsible for setting properties of the form,
 * such as formatting of the input calendars as well as listeners for changes in them or return key press.
 * @listens event:"keydown" on patientID (listens for return key press)
 * @listens event:"keydown" on containingKeywords (listens for return key press)
 * @listens event:"dp.change" on datePickerFrom (listens for changes in datePickerTo)
 * @listens event:"dp.change" on datePickerTo (listens for changes in datePickerFrom)
 */
var setFormProperties = function () {
    // Properties for the calendar for "from" date
    var datePickerFromHandle = $('#datePickerFrom');
    var datePickerToHandle = $('#datePickerTo');

    datePickerFromHandle.datetimepicker({
        viewMode: 'years',
        format: 'YYYY-MM-DD',
        useCurrent: false,
        defaultDate: new Date("1960-1-1"), // default displayed date: 1-1-2000 (user can still manually choose date before that)
        maxDate: new Date(), // default maximum date: todays date
        allowInputToggle: true // allows for displaying the calendar when the text box is clicked
    });

    // Properties for the calendar for "to" date
    datePickerToHandle.datetimepicker({
        viewMode: 'years',
        format: 'YYYY-MM-DD',
        defaultDate: new Date(), // default displayed date: todays date
        maxDate: new Date(), // default maximum date: todays date
        allowInputToggle: true // allows for displaying the calendar when the text box is clicked
    });

    // When return key is pressed in the "containing" box, initialise search
    $("#containingKeywords").on("keydown", function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            $("#searchButton").click();
        }
    });

    // When return key is pressed in the "patient ID" box, initialise search
    $("#patientID").on("keydown", function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            $("#searchButton").click();
        }
    });

    // Ensures you can't set end date which is before the start date
    datePickerFromHandle.on("dp.change", function (e) {
        datePickerToHandle.data("DateTimePicker").minDate(e.date);
    });

    // Ensures you can't set start date which is after the end date
    datePickerToHandle.on("dp.change", function (e) {
        datePickerFromHandle.data("DateTimePicker").maxDate(e.date);
    });

    // Properties of the thumbnail size selector slider
    $("#thumbnailSizeSlider").slider({
        ticks: scalingTicks, // specified in config.js
        ticks_labels: ["Tiny", "Small", "Medium", "Big"],
        ticks_snap_bounds: 0.05,
        step: 0.025,
        value: 0.5,
        tooltip: "hide"
    });

    // var kibanaToggleHandle = $("#kibanaVisualisationSwitch");
    // kibanaToggleHandle.attr({
    // 	"data-size" : "small",
    // 	"onText" : "Yes",
    // 	"offText" : "No",
    // 	"checked" : true
    // })

    var kibanaSwitchOptions = {
        onText: "Yes",
        offText: "No",
        size: "mini",
        animate: true,
        // state : true,

    };

    $("#kibanaVisualisationSwitch").bootstrapSwitch(kibanaSwitchOptions);
};

/**
 * Cleans up the timeline before the search is initialiased; empties its content (if it contained any data) and hides unnecessary elements
 */
var clearTimeline = function () {
    $("#timelineList").empty();
    $(".paginationContainer").hide();
};

/**
 * Collapses or expands all populated timeline entries
 */
var toggleCollapse = function () {
    var buttonHandle = $("#collapseButton");
    var collapsableHandle = $("[id^=" + "collapsableEntry" + "]"); // looks for all elements with id beginning with "collapsableEntry"
    var numberOfVisibleEntries = 0;

    // calculates current number of expanded entries
    $.each(collapsableHandle, function (index, value) {
        if ($(value).attr("aria-expanded") == "true")
            numberOfVisibleEntries += 1;
    });

    if (buttonHandle.text() == "Collapse all" && numberOfVisibleEntries > 0) { // numberOfVisibleEntries ensures it won't try to collapse entries while there are no entries to collapse
        collapsableHandle.collapse("hide");
        buttonHandle.text('Expand all');
    }
    else {
        collapsableHandle.collapse("show");
        buttonHandle.text("Collapse all");
    }
};

/**
 * Displays the loading message when the results are being fetched
 */
var showLoading = function () {
    $('#waitMessage').fadeIn(300);
};

/**
 * Hides the loading messages after results are fetched
 */
var hideLoading = function () {
    $("#waitMessage").fadeOut(300);
};