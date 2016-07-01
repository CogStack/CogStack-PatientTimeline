
const MAX_VISIBLE_PAGES = 3;

//TEMP!!!!! TODO: MOVE TO MAIN SCRIPT FILE:
$(document).ready(function() {

	$.each($(".pagination li.page-item"), function(index, value) {
		$(this).on("click", function() {
			if($(this)[0].id != "nextPage" && $(this)[0].id != "prevPage")
				changePage.gotoPage(this);
		});
	});

	$("#nextPage").on("click", function(e){
		e.preventDefault();
		if(!($(this).hasClass("disabled")))
			changePage.nextPage();
	});

	$("#prevPage").on("click", function(e){
		e.preventDefault();
		if(!($(this).hasClass("disabled")))
			changePage.previousPage();
	});

	recreatePagination();
});

function getCurrentActivePage() {
	return parseInt($(".pagination").find("li.page-item.active").text());
}

function setNewActivePage(page) {
	getCurrentActivePage().removeClass("active");
	$("#page"+page).addClass("active");
}

function removeFirstPage() {
	var firstPageHandle = $(".pagination li.page-item").first().next();
	$(firstPageHandle).remove();
}

function removeLastPage() {
	var lastPageHandle = $(".pagination li.page-item").last().prev();
	$(lastPageHandle).remove();
}

function addNewPageEnd() {
	var lastPageHandle = $(".pagination li.page-item").last().prev();
	var pageNumber = parseInt(lastPageHandle.text()) + 1;

	var pageElement = "<li class='page-item' id='page" + pageNumber + "'><a class='page-link' href='#' onClick='return false;'>" + pageNumber + "</a></li>"

	$(lastPageHandle).after(pageElement);	

	$("#page"+pageNumber).on("click", function() {
		changePage.gotoPage(this);
	});

	if(($(".pagination li.page-item").length - 2) > MAX_VISIBLE_PAGES)
		removeFirstPage();
}

function addNewPageStart() {
	var firstPageHandle = $(".pagination li.page-item").first();
	var pageNumber;
	if(firstPageHandle.next()[0].id != "nextPage")
		pageNumber = parseInt(firstPageHandle.next().text()) - 1;
	else
		pageNumber = 1;

	var pageElement = "<li class='page-item' id='page" + pageNumber + "'><a class='page-link' href='#' onClick='return false;'>" + pageNumber + "</a></li>"
	$(firstPageHandle).after(pageElement);	

	$("#page"+pageNumber).on("click", function() {
		changePage.gotoPage(this);
	});

	if(($(".pagination li.page-item").length - 2) > MAX_VISIBLE_PAGES)
		removeLastPage();
}


function checkPrevButton(targetPage) {
	var prevPageHandle = $("#prevPage");
	if($(prevPageHandle).hasClass("disabled") && targetPage > 1) {
		$(prevPageHandle).removeClass("disabled");
		return;
	}

	if(!($(prevPageHandle).hasClass("disabled")) && targetPage == 1) {
		$(prevPageHandle).addClass("disabled");
		return;
	}
}

function checkNextButton(targetPage) {
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

}

var changePage = {

	startingIndex : 0,
	resultsPerPage : 0,

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

	nextPage : function() {
		var currentPageHandle = $(".pagination").find("li.page-item.active");

		checkPrevButton(parseInt($(currentPageHandle).text()) + 1);
		checkNextButton(parseInt($(currentPageHandle).text()) + 1);

		if(currentPageHandle.text() == $(".pagination li.page-item").last().prev().text()) //temp: last item is "next", so we look for the 2nd from the end
			return;

		currentPageHandle.removeClass("active").next().addClass("active");

		startSearch(this.startingIndex + this.resultsPerPage);
	},

	gotoPage : function(targetPage) {
		if($(targetPage).hasClass("active"))
			return;
		var currentPageHandle = $(".pagination").find("li.page-item.active");
		currentPageHandle.removeClass("active");
		$(targetPage).addClass("active");
		checkPrevButton($(targetPage).text());
		checkNextButton($(targetPage).text());

		var pageDifference = parseInt($(targetPage).text()) - parseInt(currentPageHandle.text())
		startSearch(this.startingIndex + (pageDifference * this.resultsPerPage));

	}
}

function recreatePagination(startingPage = 1) {
	var exists = false;
	$.each($(".pagination li.page-item"), function(index, value) {
		if($(value)[0].id != "nextPage" && $(value)[0].id != "prevPage")
			if($(value)[0].id == startingPage) {
				exists = true
				return true;
			}
			else
				$(value).remove();
	});

	checkPrevButton(startingPage);

	if(!exists){
		var firstPage = "<li class='page-item active' id='page" + startingPage + "'><a class='page-link' href='#' onClick='return false;'>" + startingPage +"</a></li>"
		$("#prevPage").after(firstPage);
		$("#page"+startingPage).on("click", function() {
			changePage.gotoPage(this);
		});
	}

	if(startingPage > 1)
		addNewPageStart();
}

function setPagination(resultsPerPage, startingIndex, numberOfEntriesFound) {
	var startingPage = Math.ceil((startingIndex + 1) / resultsPerPage)
	recreatePagination(startingPage);
	changePage.startingIndex = startingIndex;
	changePage.resultsPerPage = resultsPerPage;
	if(resultsPerPage < numberOfEntriesFound) {
		addNewPageEnd();
		$("#nextPage").removeClass("disabled");
	}

	console.log(resultsPerPage);
	console.log(numberOfEntriesFound);
}