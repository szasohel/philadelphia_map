(function($){
    var hide = $('#hide');
    var list = $("#marker_list");

    hide.click(function(){
        list.slideToggle();
        hide.text(function(i,text){
            return text === "Hide Listing" ? "Show Listing" : "Hide Listing";
        })
    });


}($))