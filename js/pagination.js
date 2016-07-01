


//TESTING STUFF:
$(document).ready(function() {

	$.each($(".pagination li.page-item"), function(index, value) {
		$(this).on("click", function() {
			if($(this)[0].id != "nextPage" && $(this)[0].id != "prevPage")
				gotoPage(this);
		});
	});

	$("#nextPage").on("click", function(){
		nextPage();
	});

	$("#prevPage").on("click", function(){
		if(!($(this).hasClass("disabled")))
			previousPage();
	});

//KINDA WORKS:
	// $(".page-item.active").on("click",function(){
	// 	window.alert("yup, active");

	// 	$(this).removeClass("active").next().addClass("active");
	// 	$(this).off("click");
	// });



});

function addPage() {
	var lastPageHandle = $(".pagination li.page-item").last().prev();
	var pageNumber = parseInt(lastPageHandle.text()) + 1;

	var pageElement = "<li class='page-item' id='page" + pageNumber + "'><a class='page-link' href='#' onClick='return false;'>" + pageNumber + "</a></li>"

	$(lastPageHandle).after(pageElement);	

	$("#page"+pageNumber).on("click", function() {
		gotoPage(this);
	});
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

function setPagination(resultsPerPage, entriesFound) {
	if(resultsPerPage < entriesFound) {

		if(debug)
			console.log("need more than 1 page");
	}

	console.log(resultsPerPage);
	console.log(entriesFound);
}

function previousPage() {
	var currentPageHandle = $(".pagination").find("li.page-item.active");
	if(currentPageHandle.text() == 1)
		return;
	
	checkPrevButton(($(currentPageHandle).text()) - 1);

	currentPageHandle.removeClass("active").prev().addClass("active");
}

function nextPage() {
	var currentPageHandle = $(".pagination").find("li.page-item.active");

	checkPrevButton(($(currentPageHandle).text()) + 1);


	if(currentPageHandle.text() == $(".pagination li.page-item").last().prev().text()) {//temp: last item is "next", so we look for the 2nd from the end
		console.log("todo: put new");
		return;
	}

	currentPageHandle.removeClass("active").next().addClass("active");
}

function gotoPage(targetPage) {
	if($(targetPage).hasClass("active"))
		return;
	var currentPageHandle = $(".pagination").find("li.page-item.active");
	currentPageHandle.removeClass("active");
	$(targetPage).addClass("active");
	checkPrevButton($(targetPage).text());
}