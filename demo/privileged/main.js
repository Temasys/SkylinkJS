$(document).ready(function(){

	$('#auto-pr').click(function(){
		window.open("http://localhost:8081/demo/privileged/auto-priv","_blank");
	});

	$('#auto-unpr').click(function(){
		window.open("http://localhost:8081/demo/privileged/auto-unpriv","_blank");
	});

	$('#unauto-pr').click(function(){
		window.open("http://localhost:8081/demo/privileged/unauto-priv","_blank");
	});

	$('#unauto-unpr').click(function(){
		window.open("http://localhost:8081/demo/privileged/unauto-unpriv","_blank");
	});

});