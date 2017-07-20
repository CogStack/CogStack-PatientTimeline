/**
 * @file Script file responsible for controlling the pagination
 * @author Jedrzej Stuczynski
 * @author Ali Aliyev 
 */

/**
 * Wrapper for getting the index (counting from 1) of the currently active page
 * @returns {Integer} currently active page
 */
var getCurrentActivePage = function() {
	return parseInt($(".pagination").find("li.page-item.active").text());
};

/**
 * Changes currently active page
 * @param {Integer} page currently active page
 */
var setNewActivePage = function(page) {
	getCurrentActivePage().removeClass("active");
	$("#page"+page).addClass("active");
};

/**
 * Removes the first visible page (excluding 'prev' button which technically also belongs to the same class)
 */
var removeFirstPage = function() {
	var firstPageHandle = $(".pagination li.page-item").first().next();
	$(firstPageHandle).remove();
};

/**
 * Removes the last visible page (excluding 'next' button which technically also belongs to the same class)
 */
var removeLastPage = function() {
	var lastPageHandle = $(".pagination li.page-item").last().prev();
	$(lastPageHandle).remove();
};

/**
 * Adds new page with appropriate index at the end of the pagination
 */
var addNewPageEnd = function() {
	var lastPageHandle = $(".pagination li.page-item").last().prev();
	var pageNumber = parseInt(lastPageHandle.text()) + 1;

	var pageElement = "<li class='page-item' id='page" + pageNumber + "'><a class='page-link' href='#' onClick='return false;'>" + pageNumber + "</a></li>";

	$(lastPageHandle).after(pageElement);	

	$("#page"+pageNumber).on("click", function() {
		changePage.gotoPage(this);
	});

	if(($(".pagination li.page-item").length - 2) > MAX_VISIBLE_PAGES)
		removeFirstPage();
};

/**
 * Adds new page with appropriate index at the beginning of the pagination
 */
var addNewPageStart = function() {
	var firstPageHandle = $(".pagination li.page-item").first();
	var pageNumber;

	//Checks if the currently displayed pagination isn't: " << 1 >> "
	if(firstPageHandle.next()[0].id != "nextPage")
		pageNumber = parseInt(firstPageHandle.next().text()) - 1;
	else
		pageNumber = 1;

	var pageElement = "<li class='page-item' id='page" + pageNumber + "'><a class='page-link' href='#' onClick='return false;'>" + pageNumber + "</a></li>";
	$(firstPageHandle).after(pageElement);	

	$("#page"+pageNumber).on("click", function() {
		changePage.gotoPage(this);
	});

	if(($(".pagination li.page-item").length - 2) > MAX_VISIBLE_PAGES)
		removeLastPage();
};

/**
 * Checks the status of the "prev-button" (if it is disabled or enabled) and sets it appropriately
 * @param {Integer} targetPage page to which the pagination is going to be set
 */
var checkPrevButton = function(targetPage) {
	var prevPageHandle = $("#prevPage");
	if($(prevPageHandle).hasClass("disabled") && targetPage > 1) {
		$(prevPageHandle).removeClass("disabled");
		return;
	}

	if(!($(prevPageHandle).hasClass("disabled")) && targetPage == 1) {
		$(prevPageHandle).addClass("disabled");
		return;
	}
};

/**
 * Checks the status of the "next-button" (if it is disabled or enabled) and sets it appropriately
 * @param {Integer} targetPage page to which the pagination is going to be set
 */
var checkNextButton = function(targetPage) {
	var nextPageHandle = $("#nextPage");
	var lastPageValue = $(".pagination li.page-item").last().prev().text();

	if($(nextPageHandle).hasClass("disabled") && targetPage <= lastPageValue) {
		$(nextPageHandle).removeClass("disabled");
		return;
	}

	if(!($(nextPageHandle).hasClass("disabled")) && targetPage == lastPageValue) {
		$(nextPageHandle).addClass("disabled");
		return;
	}

};

/** 
 * Handles going to previous page, next page and to a specific page.
 * @namespace changePage
 */
var changePage = {

	/**Index of the first visible page*/
	startingIndex : 0,

	resultsPerPage : 0,

	/**
	 * Goes to the previous page (if available) and sends an appropriate query
	 */
	previousPage : function() {
		var currentPageHandle = $(".pagination").find("li.page-item.active");
		if(currentPageHandle.text() == 1)
			return;
		
		checkPrevButton(parseInt($(currentPageHandle).text()) - 1);
		checkNextButton(parseInt($(currentPageHandle).text()) - 1);

		if($(currentPageHandle).prev()[0].id != "prevPage")
			currentPageHandle.removeClass("active").prev().addClass("active");
		var edgePage = Math.floor(MAX_VISIBLE_PAGES/2);
		if(($("#page"+edgePage).length) == 0)
			addNewPageStart();

		startSearch(this.startingIndex - this.resultsPerPage);

	},

	/**
	 * Goes to the next page (if available) and sends an appropriate query
	 */
	nextPage : function() {
		var currentPageHandle = $(".pagination").find("li.page-item.active");

		checkPrevButton(parseInt($(currentPageHandle).text()) + 1);
		checkNextButton(parseInt($(currentPageHandle).text()) + 1);

		if(currentPageHandle.text() == $(".pagination li.page-item").last().prev().text()) //temp: last item is "next", so we look for the 2nd from the end
			return;

		currentPageHandle.removeClass("active").next().addClass("active");

		startSearch(this.startingIndex + this.resultsPerPage);
	},

	/**
	 * Goes to a specific page (if available) and sends an appropriate query
	 * @param {Integer} targetPage page to which the pagination is going to be set
	 */
	gotoPage : function(targetPage) {
		if($(targetPage).hasClass("active"))
			return;
		var currentPageHandle = $(".pagination").find("li.page-item.active");
		currentPageHandle.removeClass("active");
		$(targetPage).addClass("active");
		checkPrevButton($(targetPage).text());
		checkNextButton($(targetPage).text());

		var pageDifference = parseInt($(targetPage).text()) - parseInt(currentPageHandle.text());
		startSearch(this.startingIndex + (pageDifference * this.resultsPerPage));

	}
};

/**
 * Recreates the whole pagination by removing every page apart from the starting page that should be visible and "next" + "prev" button as well as page 1
 * @param {Integer} startingPage
 */
var recreatePagination = function(startingPage) {
	startingPage = typeof startingPage !== "undefined" ? startingPage : 1;	
	var exists = false;
	$.each($(".pagination li.page-item"), function(index, value) {
		if($(value)[0].id != "nextPage" && $(value)[0].id != "prevPage")
			if($(value)[0].id == startingPage) {
				exists = true;
				return true;
			}
			else
				$(value).remove();
	});

	checkPrevButton(startingPage);

	if(!exists){
		var firstPage = "<li class='page-item active' id='page" + startingPage + "'><a class='page-link' href='#' onClick='return false;'>" + startingPage +"</a></li>";
		$("#prevPage").after(firstPage);
		$("#page"+startingPage).on("click", function() {
			changePage.gotoPage(this);
		});
	}

	if(startingPage > 1)
		addNewPageStart();
};

/**
 * Set the pagination appropriately to the query sent
 * @param {Integer} resultsPerPage number of results per page to display
 * @param {Integer} startingIndex starting index of the querry, i.e. "from" field in the elasticSearch query
 * @param {Integer} numberOfEntriesFound number of entries the query has returned
 */
var setPagination = function(resultsPerPage, startingIndex, numberOfEntriesFound) {
	var startingPage = Math.ceil((startingIndex + 1) / resultsPerPage);
	recreatePagination(startingPage);
	changePage.startingIndex = startingIndex;
	changePage.resultsPerPage = resultsPerPage;
	if(resultsPerPage < numberOfEntriesFound) {
		addNewPageEnd();
		$("#nextPage").removeClass("disabled");
	}
};