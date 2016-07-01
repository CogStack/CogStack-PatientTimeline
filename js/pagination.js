


//TESTING STUFF:
$(document).ready(function() {

	// $(".pagination").find(".page-item.active").removeClass("active").next().addClass("active");

	//  var currentActiveHandle = $(".pagination").find(".page-item.active");
	//  window.alert(currentActiveHandle.text());


	// $(".pagination li.page-item.active").on("click",function(){

	// 	window.alert($(".pagination li.page-item.active sr-only").text());
	// });


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

//TODO: make sure page doesnt go negative/above limit; handle "next/prev" buttons
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