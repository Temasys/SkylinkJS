$(document).ready(function(){

	$('#auto-pr').click(function(){
		window.open("https://localhost:8082/demo/privileged/auto-priv","_blank");
	});

	$('#auto-unpr').click(function(){
		window.open("https://localhost:8082/demo/privileged/auto-unpriv","_blank");
	});

	$('#unauto-pr').click(function(){
		window.open("https://localhost:8082/demo/privileged/unauto-priv","_blank");
	});

	$('#unauto-unpr').click(function(){
		window.open("https://localhost:8082/demo/privileged/unauto-unpriv","_blank");
	});

});